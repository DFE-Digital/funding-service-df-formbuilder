import { FormDefinition } from "@xgovformbuilder/model";
import { FormSubmissionState } from "../types";
import config from "server/config";
import {
    CHECK_PROVIDER_MAPPING_URL,
    CREATE_DOCUMENT_URL,
    GET_ALL_FORMS_URL,
    GET_CONFIG_API_URL,
    addApiKeyToHeader,
    addProviderMappingToHeader,
    CHECK_SUBMISSION_STATUS_BY_PARENTID_URL,
    ADD_UPDATE_DRAFT_RESPONSE,
    GET_DRAFT_RESPONSE,
    POST_REPEATABLE_FORM_DATA,
    GET_REPEATABLE_FORM_DATA,
    GET_USER_DETAILS_API_URL,
    UPDATE_USER_DETAILS_API_URL,
} from "src/server/plugins/engine/services/utils";
import { trackEvent, trackTrace } from "src/server/logging/customTracker";
import { setExpiry } from "src/server/plugins/engine/services/utils";
import { CacheService, RedisService } from "src/server/services";
import { HapiRequest } from "src/server/types";
import {
    generateRedisKey,
    getUsedRepeatableSections,
    updateRedisSessionId,
} from "../helpers";
import { debugConsoleLog } from "src/server/utils/commonUtils";

const { fetchFromRedis, isDebugging } = config;

function sleep(ms: number = 1000): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

type FailedResult = {
    status: number;
    message: string;
};

const getFormByIdFromDB = async (
    id: string
): Promise<FormDefinition | null> => {
    try {
        const url = `${GET_CONFIG_API_URL}/${id}`;
        trackEvent(
            `getFormByIdFromDB: Fetching form ${id} from ${url}`,
            { id, url },
            false
        );

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(url, {
            method: "GET",
            headers: addApiKeyToHeader({
                Accept: "application/json",
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            trackEvent(
                `getFormByIdFromDB: API Error ${id}`,
                {
                    status: response.status,
                    statusText: response.statusText,
                    url,
                },
                true
            );
            return null;
        }

        const result = (await (response.json() as unknown)) as FormDefinition;
        trackEvent(
            `getFormByIdFromDB: Successfully fetched form ${id}`,
            { id, result },
            false
        );
        return result;
    } catch (error: any) {
        console.error(
            `❌ getFormByIdFromDB: Error fetching form ${id}:`,
            error.message
        );
        trackEvent(
            `getFormByIdFromDB: Error ${id}`,
            {
                error: error.message || "Unknown error",
                type: error.name || "Error",
            },
            true
        );
        return null;
    }
};

export const getFormById = async (
    id: string
): Promise<FormDefinition | null> => {
    try {
        // Validate input
        if (!id || typeof id !== "string" || id.trim() === "") {
            trackEvent(
                `getFormById: Invalid ID`,
                {
                    id: String(id),
                    type: typeof id,
                },
                true
            );
            return null;
        }

        let result: FormDefinition | null = null;

        if (fetchFromRedis) {
            try {
                console.log(
                    `⏳ getFormById: Attempting to fetch form ${id} from Redis cache`
                );
                const findIdFromRedis = await RedisService.getCache(`${id}`);

                if (findIdFromRedis) {
                    result = JSON.parse(findIdFromRedis) as FormDefinition;
                    trackEvent(
                        `getFormById: Found form ${id} in Redis cache`,
                        { id },
                        false
                    );
                    return result;
                }
            } catch (redisError: any) {
                trackEvent(
                    `getFormById: Redis cache fetch failed, falling back to API`,
                    { id, error: redisError.message },
                    true
                );
                // Continue to API fallback
            }

            // Redis miss or error: fetch from API
            trackEvent(
                `getFormById: Form ${id} not in Redis, fetching from API`,
                { id },
                false
            );
            const seconds = setExpiry();
            result = await getFormByIdFromDB(id);

            if (result) {
                try {
                    await RedisService.setCache(
                        `${id}`,
                        JSON.stringify(result),
                        "EX",
                        seconds
                    );
                    trackEvent(
                        `getFormById: Cached form ${id} in Redis`,
                        { id, seconds },
                        false
                    );
                } catch (cacheError: any) {
                    trackEvent(
                        `getFormById: Failed to cache form ${id} in Redis`,
                        { id, error: cacheError.message },
                        true
                    );
                    // Still return the result even if caching fails
                }
            }

            return result;
        } else {
            // Redis disabled: fetch directly from API
            trackEvent(
                `getFormById: Fetching form ${id} directly from API`,
                { id, redisDisabled: true },
                false
            );
            result = await getFormByIdFromDB(id);
            return result;
        }
    } catch (e: any) {
        trackEvent(
            `Unable to getById - getFormById ${id}`,
            {
                error: e.message || "Unknown error",
                type: e.name || "Error",
                stack: e.stack,
            },
            false
        );
        return null;
    }
};

export const getAllForms = async (): Promise<FormDefinition[]> => {
    let forms: FormDefinition[] = [];
    try {
        const response = await fetch(GET_ALL_FORMS_URL, {
            method: "GET",
            headers: addApiKeyToHeader({
                Accept: "application/json",
            }),
        });
        const result = (await (response.json() as unknown)) as FormDefinition[];
        return result;
    } catch (e: any) {
        trackEvent(
            `Unable to getAllForms`,
            { error: JSON.stringify(e.message) },
            true
        );
        return forms;
    }
};

export const createDocument = async (
    id: string,
    form: any,
    isUAT: boolean
): Promise<boolean> => {
    try {
        trackEvent(`Application Insights: createDocument called`, {
            form,
            isUAT,
        });
        const response = await fetch(CREATE_DOCUMENT_URL, {
            method: "POST",
            headers: addApiKeyToHeader({
                Accept: "application/json",
                ["Content-Type"]: "application/json",
            }),
            body: JSON.stringify({ ...form, isUAT }),
        });
        const result = (await (response.json() as unknown)) as
            | boolean
            | FailedResult;
        if (response.status === 409) {
            trackTrace(
                "Conflict in document creation",
                {
                    id: id,
                    payload: { ...form, isUAT },
                    timestamp: new Date().toISOString(),
                },
                true // mustLog
            );
        }
        if (typeof result !== "boolean" && result?.status !== 200) {
            console.error(
                `Unable to create document. ${form}`,
                result?.message
            );
            trackEvent(
                `Unable to create document. ${form}`,
                {
                    error: JSON.stringify(result?.message),
                    err: JSON.stringify(result),
                },
                true
            );
            return false;
        } else {
            trackEvent(`Application Insights: created document`, {
                result,
            });
            return result as boolean;
        }
    } catch (e: any) {
        console.error(`Unable to create document. ${form}`, e.message);
        trackTrace(
            "Error in document creation",
            {
                id: id,
                payload: { ...form, isUAT },
                error: JSON.stringify(e),
                timestamp: new Date().toISOString(),
            },
            true // mustLog
        );
        return false;
    }
};

export const CheckProvidersMappingById = async (
    id: string,
    ukprn?: number,
    urn?: number,
    admincode?: string
): Promise<boolean | false> => {
    try {
        const response = await fetch(CHECK_PROVIDER_MAPPING_URL, {
            method: "GET",
            headers: addProviderMappingToHeader(id, ukprn, urn, admincode),
        });
        const result = (await (response.json() as unknown)) as boolean;
        return result;
    } catch (e: any) {
        trackEvent(
            `CheckProviderMapping is failed - ${id}`,
            {
                error: JSON.stringify(e.message),
            },
            true
        );
        return false;
    }
};

export const checkSubmissionStatusByParentID = async (
    id: string,
    orgUKPRN: string,
    isUATVariable: boolean
) => {
    try {
        const response = await fetch(CHECK_SUBMISSION_STATUS_BY_PARENTID_URL, {
            method: "GET",
            headers: addApiKeyToHeader({
                formid: id,
                ukprn: orgUKPRN,
                isUAT: isUATVariable,
            }),
        });
        const result = await (response.json() as unknown);
        return result;
    } catch (e: any) {
        trackEvent(
            `check submission status by parent id is failed - ${id}`,
            {
                error: JSON.stringify(e.message),
            },
            true
        );
        return false;
    }
};

//Save and Resume changes start
export const getSqlCacheById = async (
    id: string
): Promise<FormDefinition | null> => {
    let response: any;
    try {
        response = await fetch(`${GET_DRAFT_RESPONSE}/${id}`, {
            method: "GET",
            headers: addApiKeyToHeader({
                Accept: "application/json",
            }),
        });
        return (await (response.json() as unknown)) as FormDefinition;
    } catch (e: any) {
        trackEvent(
            `Unable to getCacheById - ${id}`,
            {
                error: JSON.stringify(e.message),
            },
            true
        );
        if (e.message == "Response Error: 404 Not Found") {
            response = "Data not found";
        }
        return response;
    }
};

export const setSqlCacheById = async (
    id: string,
    state: FormSubmissionState
): Promise<any | null> => {
    let result: any;
    try {
        const stringifiedState = JSON.stringify(state);
        trackEvent(`Application Insights: setSqlCacheById called`, {
            id,
            stringifiedState,
        });
        const response = await fetch(ADD_UPDATE_DRAFT_RESPONSE, {
            method: "POST",
            headers: addApiKeyToHeader({
                Accept: "application/json",
                ["Content-Type"]: "application/json",
            }),
            body: JSON.stringify({ ...state }),
        });

        const text =
            typeof response.text === "function"
                ? await response.text()
                : undefined;
        let parsedResult: any = null;

        if (text) {
            try {
                parsedResult = JSON.parse(text) as any;
            } catch (parseError: any) {
                parsedResult = { error: text };
            }
        } else if (typeof response.json === "function") {
            parsedResult = await response.json();
        }

        const isOk =
            typeof response.ok === "boolean"
                ? response.ok
                : typeof response.status === "number"
                ? response.status >= 200 && response.status < 300
                : true;

        if (!isOk || parsedResult == null) {
            console.error(
                `Unable to save draft response document. ${state}`,
                parsedResult || text
            );
            trackEvent(
                `Unable to save draft response document. ${state}`,
                {
                    status: response.status,
                    statusText: response.statusText,
                    responseBody: parsedResult || text,
                },
                true
            );
            return {};
        }

        if (
            typeof parsedResult === "object" &&
            (parsedResult?.status !== undefined || parsedResult?.Error !== undefined)
        ) {
            if (parsedResult?.status !== 200 && response.status !== 200) {
                console.error(
                    `Unable to save draft response document. ${state}`,
                    parsedResult
                );
                trackEvent(
                    `Unable to save draft response document. ${state}`,
                    {
                        status: response.status,
                        statusText: response.statusText,
                        responseBody: parsedResult,
                    },
                    true
                );
                return {};
            }
        }

        result = parsedResult;
        trackEvent(
            `Application Insights: saved draft response document successfully`,
            {
                status: response.status,
                statusText: response.statusText,
                result,
            },
            false
        );
        return result;
    } catch (e: any) {
        trackEvent(
            `Unable to save draft response document. ${state}`,
            {
                error: JSON.stringify(e?.message),
                err: JSON.stringify(e),
            },
            true
        );
        return {};
    }
};
//Save and Resume changes end

/* Repeatable sections */

export const pagesMatchTriggerCompValue = (
    formData: FormDefinition | null
): boolean => {
    if (!formData || !formData.pages) {
        // Defensive: if formData or pages is null/undefined, treat as not matching
        return false;
    }
    const { pages } = formData;
    const usedRepeatableSection = getUsedRepeatableSections(formData);
    const sectionsHavingTriggerValue = usedRepeatableSection.filter(
        (section) => {
            const { triggerCompValue } = section;
            return triggerCompValue && triggerCompValue !== "";
        }
    );
    return sectionsHavingTriggerValue.every((section) => {
        const { triggerCompValue } = section;
        //@ts-ignore
        const parsedTriggerCompValue = parseInt(triggerCompValue, 10);
        const sectionPages = pages.filter(
            (page) => page.section === section.name
        );
        // Sort section pages by page sequence
        // page.pageSequence is a string, so we need to convert it to a number for comparison
        sectionPages.sort((a, b) => {
            return (
                parseInt(a.pageSequence ?? "1", 10) -
                parseInt(b.pageSequence ?? "1", 10)
            );
        });
        // Now the highest page sequence should match triggerCompValue
        const lastPage = sectionPages[sectionPages.length - 1];
        if (lastPage) {
            const lastPageCompValue = parseInt(
                lastPage.pageSequence ?? "1",
                10
            );
            if (lastPageCompValue) {
                return lastPageCompValue === parsedTriggerCompValue;
            } else {
                debugConsoleLog(
                    `Last page in section ${section.name} does not have a triggerCompValue`
                );
                return false;
            }
        } else {
            debugConsoleLog(
                `No pages found for section ${section.name} with triggerCompValue ${triggerCompValue}`
            );
            return false;
        }
    });
};

// Save newly generated pages to DB PostRepeatableFormsData
export const createRepeatableSectionsData = async (
    formData: FormDefinition,
    redisId?: string
): Promise<boolean> => {
    try {
        trackEvent(
            `Application Insights: createRepeatableSectionsData called`,
            {
                formData,
                POST_REPEATABLE_FORM_DATA,
            }
        );
        const response = await fetch(POST_REPEATABLE_FORM_DATA, {
            method: "POST",
            headers: addApiKeyToHeader({
                Accept: "application/json",
                ["Content-Type"]: "application/json",
            }),
            body: JSON.stringify({ ...formData }),
        });
        // Introduce redis cache to insert data into the store
        const seconds = setExpiry();
        const allMatches = pagesMatchTriggerCompValue(formData);
        if (CacheService && redisId && fetchFromRedis && allMatches) {
            try {
                await RedisService.setCache(
                    `${redisId}`,
                    JSON.stringify(formData),
                    "EX",
                    seconds
                );
                trackEvent(`set redis Id for repeatable questions`, {
                    redisId,
                });
            } catch (redisErr: any) {
                trackEvent(
                    `Failed to cache repeatable section data in Redis`,
                    {
                        redisId,
                        error: redisErr?.message || "Unknown error",
                        errorType: redisErr?.name || "Error",
                    },
                    true
                );
                console.error(
                    `❌ Failed to cache repeatable section data for redisId: ${redisId}`,
                    redisErr?.message
                );
                // Continue processing even if Redis fails - form should still work
            }
        }
        trackEvent(`POST_REPEATABLE_FORM_DATA: response`, {
            response,
        });
        const result = (await (response.json() as unknown)) as
            | boolean
            | FailedResult;
        trackEvent(`POST_REPEATABLE_FORM_DATA: result`, {
            result,
        });
        if (typeof result !== "boolean" && result?.status !== 200) {
            trackEvent(
                `Unable to create repeatable section data. ${JSON.stringify(
                    formData
                )}`,
                {
                    error: JSON.stringify(result?.message),
                    err: JSON.stringify(result),
                },
                true
            );
            return false;
        } else {
            trackEvent(
                `Application Insights: created repeatable section  data`,
                {
                    result,
                }
            );
            return result as boolean;
        }
    } catch (e: any) {
        trackEvent(
            `Unable to create repeatable section data. ${JSON.stringify(
                formData
            )}`,
            {
                error: JSON.stringify(e.message),
            },
            true
        );
        return false;
    }
};

/**
 * Converts an object into a dash-separated string representation.
 *
 * - If the object is empty, it returns an empty string.
 * - If the object contains a single key-value pair, it returns "key-value".
 * - If the object contains multiple key-value pairs, it concatenates all keys and values
 *   in sequence, separated by dashes (e.g., "key1-value1-key2-value2").
 *
 * @param inputObject - The object to be converted into a string.
 * @returns A dash-separated string representation of the object.
 */
function convertObjectToDashSeparatedString(
    inputObject: Record<string, any>
): string {
    const entries = Object.entries(inputObject);

    if (entries.length === 0) {
        // Return an empty string if the object has no entries
        return "";
    }

    if (entries.length === 1) {
        // Single key-value pair: "key-value"
        const [key, value] = entries[0];
        return `${key}-${value}`;
    }

    // Multiple pairs: join all keys and values with dashes in sequence
    return entries.flatMap(([key, value]) => [key, value]).join("-");
}

export const verifyInRedis = async (
    sectionTriggers: any,
    request?: HapiRequest,
    formId?: string
): Promise<FormDefinition | null> => {
    try {
        const params = sectionTriggers;
        // const formId = request?.yar.get("formId");
        let sectionsString;
        if (params) {
            sectionsString = convertObjectToDashSeparatedString(params);
        }
        if (fetchFromRedis && sectionsString) {
            let redisId: string | undefined;
            const parts = sectionsString.split("-");
            const lastTwo = parts.slice(-2); // ["ZcTedW", "3"]
            const [lastKey, lastValue] = lastTwo;
            if (request) {
                redisId = updateRedisSessionId(
                    `${formId}`,
                    `${lastKey}`,
                    `${lastValue}`,
                    request
                );
            }
            const findIdFromRedis = await RedisService.getCache(`${redisId}`);
            if (findIdFromRedis) {
                console.log("findIdFromRedis", findIdFromRedis);
                // request?.yar?.set("RedisFetch", true);
                return JSON.parse(findIdFromRedis) as FormDefinition;
            } else {
                return null;
            }
        }
        return null; // Ensure a return value if fetchFromRedis or sectionsString is falsy
    } catch (e: any) {
        console.error("Error in verifyInRedis:", e.message);
        return null; // Return a default value in case of an error
    }
};

export const getRepeatableSectionsData = async (
    id: string,
    request?: HapiRequest,
    sectionDetails?: any,
    def?: FormDefinition,
    formId?: string,
    state?: FormSubmissionState,
    includeAll?: boolean = false
): Promise<FormDefinition | null> => {
    try {
        const params = { ...sectionDetails };
        params.includeAll = includeAll;
        if (state && sectionDetails) {
            Object.keys(sectionDetails).forEach((key) => {
                // Use state value only if it is greater than sectionDetails value
                if (
                    state.hasOwnProperty(key) &&
                    Number(state[key]) > Number(sectionDetails[key])
                ) {
                    params[key] = state[key];
                } else {
                    params[key] = sectionDetails[key];
                }
            });
        }
        const baseUrl = `${GET_REPEATABLE_FORM_DATA}/${id}`;
        // Create query string
        const queryString = new URLSearchParams(params).toString();
        // Construct full URL with query parameters
        const urlWithParams = queryString
            ? `${baseUrl}?${queryString}`
            : baseUrl;

        const checkRecordInRedis = await verifyInRedis(
            sectionDetails,
            request,
            formId
        );
        if (checkRecordInRedis) {
            trackEvent(
                `checkRecordInRedis found`,
                {
                    checkRecordInRedis,
                },
                false
            );
            return checkRecordInRedis;
        }
        trackEvent(
            `getRepeatableSectionsData called`,
            {
                urlWithParams,
            },
            false
        );
        const response = await fetch(urlWithParams, {
            method: "GET",
            headers: addApiKeyToHeader({
                Accept: "application/json",
            }),
        });
        console.log("response", response);
        trackEvent(
            `getRepeatableSectionsData response received`,
            {
                response,
            },
            false
        );
        if (!response.ok) {
            throw new Error(
                `Response Error: ${response.status} ${response.statusText}`
            );
        }
        return (await (response.json() as unknown)) as FormDefinition;
    } catch (e: any) {
        trackEvent(
            `Unable to get section data - ${id}`,
            {
                error: JSON.stringify(e.message),
            },
            true
        );
        console.error(`Unable to get section data - ${id}`, e.message);
        return null;
    }
};

export type UserDetail = {
    uid: number;
    userId: string;
    name: string;
    email: string;
    status: string;
};

export const getUserDetail = async (userId: string) => {
    try {
        const response = await fetch(`${GET_USER_DETAILS_API_URL}/${userId}`, {
            method: "GET",
            headers: addApiKeyToHeader({
                Accept: "application/json",
                ["Content-Type"]: "application/json",
            }),
        });
        const result = (await (response.json() as unknown)) as UserDetail;
        return result;
    } catch (e: any) {
        trackEvent(
            `Unable to get user details - ${userId}`,
            {
                error: JSON.stringify(e.message),
            },
            true
        );
        console.error(`Unable to get user details - ${userId}`, e.message);
        return null;
    }
};

export const updateUserDetails = async (userDetail: UserDetail) => {
    try {
        const response = await fetch(UPDATE_USER_DETAILS_API_URL, {
            method: "PUT",
            headers: addApiKeyToHeader({
                Accept: "application/json",
                ["Content-Type"]: "application/json",
            }),
            body: JSON.stringify({ ...userDetail }),
        });
        const result = (await (response.json() as unknown)) as boolean;
        return result;
    } catch (e: any) {
        trackEvent(
            `Unable to update user details - ${userDetail.userId}`,
            {
                error: JSON.stringify(e.message),
            },
            true
        );
        console.error(
            `Unable to update user details - ${userDetail.userId}`,
            e.message
        );
        return false;
    }
};
