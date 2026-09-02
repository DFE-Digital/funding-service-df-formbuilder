import path from "path";
import { configure } from "nunjucks";
import {
    extractConditionCompValue,
    generateRedisKey,
    isRepeatableSectionForm,
    redirectTo,
} from "./helpers";
import { HapiRequest, HapiResponseToolkit, HapiServer } from "server/types";

import { FormModel } from "./models";
import Boom from "boom";
import { PluginSpecificConfiguration } from "@hapi/hapi";
import { shouldLogin, verifyValidTokenExist } from "server/plugins/auth";
import {
    getFormById,
    pagesMatchTriggerCompValue,
} from "server/plugins/engine/services/formService";
import { FormDefinition, FormStatus, Section } from "@xgovformbuilder/model";
import appconfig from "server/config";
import { trackEvent, trackTrace } from "../../logging/customTracker";
import FormAuthorization from "../authorize";
import store from "store2";
import { getRepeatableSectionsData } from "server/plugins/engine/services/formService";
import { FormPayload, FormSubmissionState } from "./types";
import { debugConsoleLog, setExpiry } from "src/server/utils/commonUtils";
import { CacheService, RedisService } from "src/server/services";
import config from "../../config";


configure([
    // Configure Nunjucks to allow rendering of content that is revealed conditionally.
    path.resolve(__dirname, "/views"),
    path.resolve(__dirname, "/views/partials"),
    "node_modules/govuk-frontend/dist/govuk/",
    "node_modules/govuk-frontend/dist/govuk/components/",
    "node_modules/@xgovformbuilder/designer/views",
    "node_modules/hmpo-components/components",
]);

const { fetchFromRedis, isDebugging } = appconfig;

// Universal request timeout: 300 seconds (300000ms)
// Hapi route options expect an object with server/socket values, not a raw number.
const REQUEST_TIMEOUT_MS = Number(config.globalTimeout);
const REQUEST_TIMEOUT = { server: REQUEST_TIMEOUT_MS };

function normalisePath(path: string) {
    return path.replace(/^\//, "").replace(/\/$/, "");
}

function getStartPageRedirect(
    request: HapiRequest,
    h: HapiResponseToolkit,
    id: string,
    model: FormModel
) {
    const startPage = normalisePath(model.def.startPage ?? "");
    let startPageRedirect: any;

    if (startPage.startsWith("http")) {
        startPageRedirect = redirectTo(request, h, startPage);
    } else {
        startPageRedirect = redirectTo(request, h, `/${id}/${startPage}`);
    }

    return startPageRedirect;
}

function doSectionParamsMatchSections(
    sectionParams: Record<string, any>,
    sectionResponse: FormDefinition | null
): boolean {
    if (!sectionResponse?.sections || !Array.isArray(sectionResponse.sections))
        return false;
    return Object.entries(sectionParams).every(([key, value]) =>
        sectionResponse.sections.some(
            (section) =>
                section.numberComp === key &&
                String(section.triggerCompValue) === String(value)
        )
    );
}
function isUATLink(request: HapiRequest) {
    return request.url.hostname.toLocaleLowerCase().includes("uat");
}

export function getTabId(request: HapiRequest) {
    const tabId = request.query?.tabId;
    return typeof tabId === "string" && tabId.length > 0 ? tabId : undefined;
}
export function getNavigationToken(request: HapiRequest) {
    const navToken = request.query?.navToken;
    return typeof navToken === "string" && navToken.length > 0 ? navToken : undefined;
}
export function isTrustedNavigation(request: HapiRequest, session: any) {
    const tabId = getTabId(request);
    const navToken = getNavigationToken(request);
    if (!tabId || !navToken) return false;
    const expectedToken = session.get(`navToken:${tabId}`);
    return expectedToken === navToken;
}

export function getSectionParams(
    sections: Section[],
    formPayload: FormPayload,
    state: any,
    fromPost: boolean = false,
    request: HapiRequest
) {
    const sectionParams: Record<string, any> = {};
    sections.forEach((section) => {
        if (section?.numberComp) {
            if (
                section?.numberComp &&
                (formPayload?.hasOwnProperty(section.numberComp) ||
                    state?.hasOwnProperty(section.numberComp))
            ) {
                sectionParams[section?.numberComp] =
                    formPayload && formPayload[section?.numberComp]
                        ? formPayload[section?.numberComp]
                        : state[section?.numberComp];
                request.yar.set("previous_" + section?.numberComp, state[section?.numberComp]);
                request.yar.set("current_" + section?.numberComp, formPayload && formPayload[section?.numberComp] ? formPayload[section?.numberComp] : state[section?.numberComp]);

            }
        } else if (section?.conditionComp && !section?.numberComp) {
            if (
                section?.conditionComp &&
                (formPayload?.hasOwnProperty(section.conditionComp) ||
                    state?.hasOwnProperty(section.name)) &&
                state?.[section.name]?.hasOwnProperty(section.conditionComp)
            ) {
                let conditionCompValue = extractConditionCompValue(
                    formPayload,
                    section,
                    state,
                    undefined,
                    false
                );

                const matchingKey = Object.keys(formPayload || {}).find(
                    (key) =>
                        key === section.conditionComp ||
                        key.match(new RegExp(`^${section.conditionComp}-\\d+$`))
                );

                const isConditionCompTrue =
                    matchingKey && formPayload[matchingKey] === "true";

                if (
                    fromPost &&
                    isConditionCompTrue &&
                    !(state?.[section.name]?.[matchingKey] === true)
                ) {
                    // If posting and the condition component is "true" in payload,
                    // but NOT already true in state, decrement the value.
                    conditionCompValue = conditionCompValue - 1;
                }
                // Otherwise, leave the value unchanged.
                sectionParams[section?.conditionComp] = conditionCompValue;
            }
        }
    });
    return sectionParams;
}

export const plugin = {
    name: "@xgovformbuilder/runner/engine",
    dependencies: "vision",
    multiple: true,
    register: async (server: HapiServer) => {
        let getModel: FormModel | null;
        server.route({
            method: "get",
            path: "/",
            options: {
                timeout: REQUEST_TIMEOUT,
            },
            handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
                // const forms = await getAllForms();
                // const keys = Object.keys(forms);
                // let id = "";
                // if (keys.length === 1) {
                //     id = keys[0];
                // }
                // const model = forms[id];
                // if (model) {
                //     return getStartPageRedirect(request, h, id, model);
                // }
                const userAgent: string =
                    request.headers["user-agent"]?.toLowerCase() || "";

                if (userAgent.includes("alwayson")) {
                    // Custom logic for Always On ping
                    return h
                        .response({ status: "Always On ping received" })
                        .code(200);
                }
                throw Boom.notFound("No default form found");
            },
        });

        server.route({
            method: "get",
            path: "/{id}",
            options: {
                timeout: REQUEST_TIMEOUT,
            },
            handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
                // if id is not provided in the path, fallback to session value saved in yar
                let id = request.params.id ?? request.yar.get("formId");
                store.set("formId", id);
                trackEvent("Request params for form", {
                    path,
                    id,
                });
                const config = await getFormById(id);
                trackEvent("config object after getFormById", {
                    config,
                });
                let model = config
                    ? new FormModel(config, {
                        basePath: id,
                    })
                    : null;
                if (model) {
                    await model.init();
                }

                trackEvent(
                    `Start page : ${id}`,
                    {
                        model: model != null,
                    },
                    false
                );
                if (config?.formStatus === "Closed" && !isUATLink(request)) {
                    return h.redirect(
                        `/service-unavailable?displayName=${config.displayName}&lastModified=${config.lastModified}`
                    );
                } else if (
                    appconfig.appEnv == "production" &&
                    config?.formStatus != FormStatus.Published
                ) {
                    throw Boom.notFound("plugin get No form found for id");
                }

                if (model) {
                    return getStartPageRedirect(request, h, id, model);
                }
                throw Boom.notFound(
                    "plugin get->no model: No form found for id"
                );
            },
        });
        server.route({
            method: "get",
            path: "/{id}/{path*}",
            options: {
                timeout: REQUEST_TIMEOUT,
            },
            handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
                const session = request.yar;
                const tabId = getTabId(request);
                const trustedNavigation = isTrustedNavigation(request, session);
                const currentPage = tabId
                    ? session.get(`currentPage:${tabId}`)
                    : session.get("currentPage");
                const requestedPage = request.params.path || "";
                // const designerPreview = request.query?.fromDesigner === "preview";
                const isAuthLandingRoute = request.path === "/user-information";

                if (
                    currentPage &&
                    requestedPage !== currentPage &&
                    !trustedNavigation &&
                    // !designerPreview &&
                    !isAuthLandingRoute &&
                    request.headers.referer &&
                    !request.headers.referer.includes(request.info.host)
                ) {
                    const redirectToken = tabId
                        ? session.get(`navToken:${tabId}`)
                        : undefined;
                    const redirectPath = tabId
                        ? `/${
                              request.params.id
                          }/${currentPage}?tabId=${encodeURIComponent(tabId)}${
                              redirectToken
                                  ? `&navToken=${encodeURIComponent(
                                        redirectToken
                                    )}`
                                  : ""
                          }`
                        : `/${request.params.id}/${currentPage}`;
                    return h.redirect(redirectPath);
                }
                let { path, id } = request.params;
                store.set("formId", id);
                id = id ?? request.yar.get("formId")
                const sessionId = request.yar.get("formId");
                const storeId = store.get("formId");
                if (!sessionId && storeId) {
                    request.yar.set("formId", storeId);
                    trackEvent("!sessionId && storeId", {
                        storeId,
                    });
                } else if (sessionId && storeId && sessionId !== storeId) {
                    request.yar.set("formId", storeId);
                    trackEvent(
                        "sessionId && storeId && sessionId !== storeId",
                        {
                            storeId,
                            sessionId,
                        }
                    );
                } else {
                    request.yar.set("formId", id);
                    trackEvent("last else case", {
                        id,
                    });
                }
                trackEvent("Request params for form", {
                    path,
                    id,
                });
                let config = await getFormById(id);
                let sectionData: FormDefinition | null = null;
                if (!config) {
                    throw Boom.notFound(
                        "plugin get id path, no config: No form found for id"
                    );
                }
                const ukprn = request.yar?._store?.organisation?.ukprn;
                const districtAdminCode =
                    request.yar?._store?.organisation
                        ?.DistrictAdministrative_code;
                const orgId = ukprn ?? districtAdminCode;
                const isUAT = config?.formStatus === "Published" ? "" : "UAT";
                const { cacheService } = request.services([]);
                let state = await cacheService.getState(request);
                request.yar.set("state", state);

                const hasRepeatableSections = isRepeatableSectionForm(config);

                const formPayload = request.payload as FormPayload;
                const formSections = config?.sections || [];
                const sectionParams:
                    | Record<string, any>
                    | undefined = getSectionParams(
                        formSections,
                        formPayload,
                        state,
                        false,
                        request
                    );

                // If the form is a repeatable section form, get the section data
                const repeatableId = config?.id + orgId + isUAT;
                if (hasRepeatableSections && orgId) {
                    const sectionResponse = await getRepeatableSectionsData(
                        repeatableId,
                        request,
                        sectionParams,
                        config,
                        id
                    );
                    if (sectionParams && sectionResponse?.sections) {
                        const isTriggerCompsSame = doSectionParamsMatchSections(
                            sectionParams,
                            sectionResponse
                        );
                        const createRedisID = generateRedisKey(
                            id,
                            sectionResponse?.sections,
                            request
                        );
                        let findIdFromRedis: string | null = null;
                        try {
                            findIdFromRedis = await RedisService.getCache(
                                `${createRedisID}`
                            );
                        } catch (redisErr: any) {
                            trackEvent(`⚠️ Failed to fetch from Redis cache: ${redisErr?.message}`, { redisErr }, true);
                            // Continue - treat as cache miss
                        }

                        const allMatches = pagesMatchTriggerCompValue(
                            sectionResponse
                        );
                        if (
                            isTriggerCompsSame &&
                            !findIdFromRedis &&
                            fetchFromRedis &&
                            allMatches
                        ) {
                            request?.yar.set("redisID", createRedisID);
                            // add record to redis
                            const seconds = setExpiry();
                            if (CacheService && createRedisID) {
                                try {
                                    await RedisService.setCache(
                                        `${createRedisID}`,
                                        JSON.stringify(sectionResponse),
                                        "EX",
                                        seconds
                                    );
                                    trackEvent(
                                        `set redis Id for repeatable questions`,
                                        {
                                            createRedisID,
                                        }
                                    );
                                } catch (redisErr: any) {
                                    trackEvent(
                                        `Failed to cache repeatable section data in Redis`,
                                        {
                                            createRedisID,
                                            error: redisErr?.message || "Unknown error",
                                            errorType: redisErr?.name || "Error",
                                        },
                                        true
                                    );
                                    console.error(`❌ Failed to cache repeatable section data for redisID: ${createRedisID}`, redisErr?.message);
                                    // Continue processing - form should still work without Redis cache
                                }
                            }
                        }
                    }
                    trackEvent(
                        `plugin file get call hasRepeatableSections`,
                        {
                            sectionResponse,
                            currentPath: request.params.path,
                        },
                        false
                    );
                    if (sectionResponse?.id) {
                        sectionData = sectionResponse;
                        sectionData.currentPath = request.params.path;
                        debugConsoleLog(sectionData);
                    }
                }
                trackEvent("config object after getFormById", {
                    config,
                });
                const hasStartPage = config?.pages.some(
                    (page) => page?.controller === "./pages/start.js"
                );
                if (hasStartPage) {
                    request.yar.set("start-page-path", config?.startPage);
                }
                // request.yar.set("formId", id);
                request.yar.set("form-name", config?.name);
                request.yar.set("formStatus", config?.formStatus);

                trackTrace(`Get Form page : ${id}`, {
                    path: path,
                });
                debugConsoleLog(config);
                let model = config
                    ? new FormModel(
                        config,
                        {
                            basePath: id,
                        },
                        sectionData
                    )
                    : null;
                if (model) {
                    await model.init(sectionData,
                        formPayload,
                        state,
                        cacheService,
                        request,
                        sectionParams);
                }
                if (config?.formStatus === "Closed" && !isUATLink(request)) {
                    return h.redirect(
                        `/service-unavailable?displayName=${config.displayName}&lastModified=${config.lastModified}`
                    );
                } else if (
                    appconfig.appEnv == "production" &&
                    config?.formStatus != FormStatus.Published
                ) {
                    throw Boom.notFound(
                        "plugin get id path appconfig: No form found for id"
                    );
                }
                const page = model?.pages.find(
                    (page) => normalisePath(page.path) === normalisePath(path)
                );
                trackEvent(
                    `plugin get Page, model pages`,
                    {
                        page,
                        pages: model?.pages,
                    },
                    false
                );
                if (page) {
                    // NOTE: Start pages should live on gov.uk, but this allows prototypes to include signposting about having to log in.
                    const pagePath = normalisePath(path);

                    if (tabId) {
                        session.set(`currentPage:${tabId}`, pagePath);
                        if (request.query?.navToken) {
                            session.set(`navToken:${tabId}`, request.query.navToken);
                        }
                    } else {
                        session.set("currentPage", pagePath);
                    }
                    if (page.path === "/summary") {
                        process.env.SERVICE_NAME = page.name;
                    }
                    if (
                        page.pageDef.controller !== "./pages/start.js" &&
                        shouldLogin(model?.def.signInRequired) &&
                        (!verifyValidTokenExist(request) ||
                            !(await FormAuthorization(request, state)))
                    ) {
                        process.env.SERVICE_NAME = page.name;
                        return h.redirect(`/login?returnUrl=${request.path}`);
                    }

                    if (!model?.def.signInRequired) {
                        getModel = model;
                        request.auth.isAuthenticated = false;
                    }
                    return page.makeGetRouteHandler()(request, h);
                }
                if (model) {
                    if (normalisePath(path) === "") {
                        return getStartPageRedirect(request, h, id, model);
                    }
                }
                trackEvent(
                    `plugin get Page not found`,
                    {
                        page,
                        model,
                    },
                    false
                );
                throw Boom.notFound("No form or page found  UKPRN");
            },
        });

        const { uploadService } = server.services([]);

        const postHandler = async (
            request: HapiRequest,
            h: HapiResponseToolkit
        ) => {
            const { path, id } = request.params;
            trackEvent("Request params for form:posthandler", {
                path,
                id,
            });
            const { cacheService } = request.server.services([]);
            const state = await cacheService.getState(request);
            let config = await getFormById(id);
            if (!config) {
                throw Boom.notFound(
                    "plugin post no config, No form found for id"
                );
            }
            trackEvent(
                `plugin file post method config`,
                {
                    config,
                },
                false
            );
            const ukprn = request.yar?._store?.organisation?.ukprn;
            const districtAdminCode =
                request.yar?._store?.organisation?.DistrictAdministrative_code;
            const orgId = ukprn ?? districtAdminCode;
            const isUAT = config?.formStatus === "Published" ? "" : "UAT";
            let sectionData: FormDefinition | null = null;
            const hasRepeatableSections = isRepeatableSectionForm(config);
            const repeatableId = config?.id + orgId + isUAT;
            const formId = config?.id;
            trackEvent(
                `plugin file post method hasRepeatableSections, repeatableId`,
                {
                    hasRepeatableSections,
                    repeatableId,
                },
                false
            );

            const formPayload = request.payload as FormPayload;
            trackEvent(
                `plugin file post method formPayload`,
                {
                    formPayload,
                    state,
                },
                false
            );
            const formSections = config?.sections || [];
            let payloadKeyInSection, previousRepeatCount, currentRepeatCount, redirectedfromsummary
            let sectionParams: Record<string, any> | undefined = undefined;
            if (formPayload) {
                sectionParams = getSectionParams(
                    formSections,
                    formPayload,
                    state,
                    true,
                    request
                );
            }

            if (hasRepeatableSections && orgId) {
                if (formPayload) {

                    for (const section of formSections) {
                        if (section.numberComp && formPayload[section.numberComp] !== undefined) {
                            payloadKeyInSection = section.numberComp;
                            previousRepeatCount = Number(request?.yar.get("previous_" + payloadKeyInSection));
                            currentRepeatCount = Number(formPayload[section.numberComp]);
                            if (request?.yar.get("returnUrl") != null && request?.yar.get("returnUrl") != '' && state && state["reference"] && currentRepeatCount > previousRepeatCount) {
                                redirectedfromsummary = true;
                            }
                            break;
                        }
                    }
                }

                const sectionResponse = await getRepeatableSectionsData(
                    repeatableId,
                    request,
                    sectionParams,
                    config,
                    formId,
                    state,
                    redirectedfromsummary
                );
                trackEvent(
                    `plugin file post method hasRepeatableSections`,
                    {
                        sectionResponse,
                        currentPath: request.params.path,
                    },
                    false
                );
                if (sectionResponse?.id) {
                    sectionData = sectionResponse;
                    sectionData.currentPath = request.params.path;
                    debugConsoleLog(sectionData);
                }
            }

            request.yar.set("state", state);

            trackEvent(
                `Application Insights: post handler, get state and config`,
                {
                    state,
                    config,
                    pdfContent: request?.payload?.pdfContent,
                    payload: request?.payload,
                }
            );
            request.server.logger.debug(
                {
                    data: JSON.stringify({
                        id,
                        session: request.yar.id,
                        path,
                    }),
                },
                "PostRoute"
            );
            const newPayload = {
                ...(request.payload as FormPayload),
            };
            console.log("sectionParams", sectionParams);
            let model = config
                ? new FormModel(
                    config,
                    {
                        basePath: id,
                    },
                    sectionData
                )
                : null;
            if (model) {
                await model.init(
                    sectionData,
                    newPayload,
                    state,
                    cacheService,
                    request,
                    sectionParams
                );
            }
            trackEvent(`Application Insights: check model`, {
                config,
                model,
            });
            if (model) {
                const page = model?.pages.find(
                    (page) => page.path.replace(/^\//, "") === path
                );
                trackEvent(`Application Insights: check page, model`, {
                    config,
                    model,
                    page,
                });

                if (page) {
                    if (request?.payload?.pdfContent?._data) {
                        trackEvent(`Application Insights: pdf generated`, {
                            state: state,
                            pdfContent: request?.payload?.pdfContent,
                        });
                    }
                    if (request?.payload?.pdfContent === "pdf is above 2MB") {
                        trackEvent(
                            `Application Insights: plugin file pdf is above 2MB`,
                            {
                                state: state,
                                pdfContent: request?.payload?.pdfContent,
                            }
                        );
                    }
                    return page.makePostRouteHandler()(request, h);
                }
            }
            trackEvent(`plugin post handler No form of path found`, {
                model,
                pages: model?.pages,
            });
            throw Boom.notFound("No form of path found");
        };

        server.route({
            method: "post",
            path: "/{id}/{path*}",
            options: {
                timeout: REQUEST_TIMEOUT,
                plugins: <PluginSpecificConfiguration>{
                    "hapi-rate-limit": {
                        userPathLimit: 10,
                    },
                },
                payload: {
                    output: "stream",
                    parse: true,
                    multipart: { output: "stream" },
                    maxBytes: uploadService?.fileSizeLimit || 209715200,
                    timeout: REQUEST_TIMEOUT_MS,
                    failAction: async (
                        request: any,
                        h: HapiResponseToolkit,
                        err
                    ) => {
                        if (
                            request.server.plugins.crumb &&
                            request.server.plugins.crumb.generate
                        ) {
                            request.server.plugins.crumb.generate(request, h);
                        }
                        request.log("error", err);
                        throw err;
                        return h.continue;
                    },
                },
                handler: postHandler,
            },
        });
    },
};
