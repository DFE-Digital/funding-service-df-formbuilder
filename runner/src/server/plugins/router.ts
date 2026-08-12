// $lab:coverage:off$
import Joi from "joi";
import Url from "url-parse";
import { healthCheckRoute, publicRoutes } from "../routes";
import { HapiRequest, HapiResponseToolkit } from "../types";
import config from "../config";
import axios from "axios";
import axiosRetry from "axios-retry";
import FormData from "form-data";
import fs from "fs";
import { trackEvent } from "../logging/customTracker";
import { id } from "date-fns/locale";
import { FormModel } from "./engine/models";
import { getBlobContent, constructTableData } from "../utils/tableTabService";
import {
    getFormById,
    getRepeatableSectionsData,
} from "server/plugins/engine/services/formService";
import { DataImportStatus, FormDefinition } from "@xgovformbuilder/model";
import { isRepeatableSectionForm } from "./engine/helpers";
import { getSectionParams } from "./engine/plugin";

// Universal request timeout: 300 seconds (300000ms)
// Hapi route options expect an object with server/socket values, not a raw number.
// ensure numeric value (could be string from env)
const REQUEST_TIMEOUT_MS = Number(config.globalTimeout);
const REQUEST_TIMEOUT = { server: REQUEST_TIMEOUT_MS };

axiosRetry(axios, {
    retries: 1, // Number of retries
    // Exponential back-off retry delay for 70 seconds
    retryDelay: (...arg) => axiosRetry.exponentialDelay(...arg, 70000),
    retryCondition(error) {
        // Conditional check the error status code
        switch (error?.response?.status) {
            case 404:
            case 408:
                return true; // Retry request with response status code 404 or 408
            default:
                return false; // Do not retry the others
        }
    },
});

const routes = [...publicRoutes, healthCheckRoute];
const docApiUrl = config.docUploadApi;
const pdfApiUrl =config.pdfApiUrl;
const pdfApiKey = config.pdfApiKey;
const accessKey = config.docCaptureSubscriptionKey;
enum CookieValue {
    Accept = "accept",
    Reject = "reject",
}

// TODO: Replace with `type Cookies = `${CookieValue}`;` when Prettier is updated to a version later than 2.2
type Cookies = "accept" | "reject";

interface CookiePayload {
    cookies: Cookies;
    referrer: string;
}

export default {
    plugin: {
        name: "router",
        register: (server) => {
            server.route(routes);

            server.route([
                {
                    method: "get",
                    path: "/help/cookies",
                    options: {
                        timeout: REQUEST_TIMEOUT,
                    },
                    handler: async (
                        _request: HapiRequest,
                        h: HapiResponseToolkit
                    ) => {
                        return h.view("help/cookies");
                    },
                },
                {
                    method: "post",
                    options: {
                        timeout: REQUEST_TIMEOUT,
                        validate: {
                            payload: Joi.object({
                                cookies: Joi.string()
                                    .valid(
                                        CookieValue.Accept,
                                        CookieValue.Reject
                                    )
                                    .required(),
                                referrer: Joi.string().required(),
                            }).required(),
                        },
                    },
                    path: "/help/cookies",
                    handler: async (
                        request: HapiRequest,
                        h: HapiResponseToolkit
                    ) => {
                        const {
                            cookies,
                            referrer,
                        } = request.payload as CookiePayload;
                        const { href, origin } = new Url(referrer);
                        const redirect = href.replace(origin, ""); // Ensure you only redirect to a local path
                        const accept = cookies === "accept";

                        return h.redirect(redirect).state(
                            "cookies_policy",
                            {
                                isHttpOnly: false, // Set this to false so that Google tag manager can read cookie preferences
                                isSet: true,
                                essential: true,
                                analytics: accept ? "on" : "off",
                                usage: accept,
                            },
                            {
                                isHttpOnly: true,
                                path: "/",
                            }
                        );
                    },
                },
            ]);

            server.route({
                method: "get",
                path: "/help/terms-and-conditions",
                options: {
                    timeout: REQUEST_TIMEOUT,
                },
                handler: async (
                    _request: HapiRequest,
                    h: HapiResponseToolkit
                ) => {
                    return h.view("help/terms-and-conditions");
                },
            });

            server.route({
                method: "get",
                path: "/help/accessibility-statement",
                options: {
                    timeout: REQUEST_TIMEOUT,
                },
                handler: async (
                    _request: HapiRequest,
                    h: HapiResponseToolkit
                ) => {
                    return h.view("help/accessibility-statement");
                },
            });

            server.route({
                method: "post",
                path: "/file-upload-blob",
                options: {
                    timeout: REQUEST_TIMEOUT,
                    payload: {                        // numeric timeout for payload to satisfy Hapi
                        timeout: REQUEST_TIMEOUT_MS,
                        maxBytes: 209715200,
                        parse: true,
                        multipart: true,
                        output: "file",
                    },
                    handler: async (
                        _request: HapiRequest,
                        h: HapiResponseToolkit
                    ) => {
                        var session = _request.yar;
                        var ukprn =
                            session.get("organisation")?.ukprn ??
                            session.get("organisation")
                                ?.DistrictAdministrative_code;

                        const formData = new FormData();
                        const payload = _request.payload;
                        const fileType = payload?.fileType;
                        let fileName = payload.fileupload.filename;
                        fileName = fileName.replace(/\s+/g, "_");
                        const filePath = payload?.fileupload?.path;
                        const data = fs.createReadStream(filePath);
                        var blobPath = `${ukprn === undefined ? session.id : ukprn
                            }/${payload.compId}/${Date.now()}/${fileName}`;

                        formData.append("File", data);
                        formData.append("FileName", blobPath);
                        formData.append("FileType", fileType);
                        formData.append("SourceApplication", "DigitalForms");
                        formData.append("IsAllowed", "true");
                        try {
                            const response = await axios.post(
                                `${docApiUrl}api/FileUpload/UploadFile`,
                                formData,
                                {
                                    headers: {
                                        "Ocp-Apim-Subscription-Key": accessKey,
                                        connection: "keep-alive",
                                    },
                                    // If the request takes longer than 1200000ms (120 seconds), the request will be aborted.
                                    timeout: REQUEST_TIMEOUT_MS,
                                }
                            );
                            return h
                                .response({ data: response.data })
                                .type("application/json")
                                .code(200);
                        } catch (error) {
                            trackEvent(
                                `Upload File Error`,
                                {
                                    path: blobPath,
                                    error: JSON.stringify(error.message),
                                },
                                true
                            );
                            return h
                                .response({
                                    error: { status: "Upload Error" + error },
                                })
                                .type("application/json")
                                .code(500);
                        }
                    },
                },
            });
            server.route({
                method: "post",
                path: "/generate-pdf",
                options: {
                    timeout: REQUEST_TIMEOUT,
                    payload: {
                        maxBytes: 5242880, // 5MB JSON
                        parse: true,
                        allow: "application/json"
                    },
                    handler: async (_request: HapiRequest, h: HapiResponseToolkit) => {
                        try {
                            const response = await axios.post(
                                `${pdfApiUrl}/api/pdf/generate`,
                                _request.payload,
                                {
                                    params: {
                                        code: pdfApiKey
                                    },
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    timeout: REQUEST_TIMEOUT_MS
                                }
                            );
                             trackEvent(
                                "PDF Generate response",
                                { response: response },
                                true
                            );

                            return h
                                .response(response.data)
                                .type("application/json")
                                .code(200);

                        } catch (error: any) {
                            trackEvent(
                                "PDF Generate Error",
                                { error: error.message },
                                true
                            );

                            return h
                                .response({ error: "PDF generation failed" })
                                .type("application/json")
                                .code(500);
                        }
                    }
                }
            });


            server.route({
                method: "post",
                path: "/file-download",
                options: {
                    timeout: REQUEST_TIMEOUT,
                    handler: async (
                        _request: HapiRequest,
                        h: HapiResponseToolkit
                    ) => {
                        const formData = new FormData();
                        const payload = _request.payload;
                        const filePath = payload?.fileName;
                        const title = payload?.title;
                        const name = payload?.name;
                        formData.append("FilePath", filePath);
                        formData.append("SourceSystem", "DigitalForms");

                        try {
                            const response = await axios.post(
                                `${docApiUrl}api/FileDownload/downloadFile`,
                                formData,
                                {
                                    responseType: "arraybuffer",
                                    headers: {
                                        "Ocp-Apim-Subscription-Key": accessKey,
                                    },
                                    timeout: REQUEST_TIMEOUT_MS
                                }
                            );
                            if(response.data != null){ 
                                _request.yar.set("file-download", { [String(name)]: title });
                            }

                            return h
                                .response(response.data)
                                .type("application/octet-stream");
                        } catch (error) {
                            return h
                                .response({
                                    error: { status: "download Error" + error },
                                })
                                .type("application/json")
                                .code(500);
                        }
                    },
                },
            });

            server.route({
                method: "get",
                path: "/get-file-status",
                options: {
                    timeout: REQUEST_TIMEOUT,
                },
                handler: async (
                    _request: HapiRequest,
                    h: HapiResponseToolkit
                ) => {
                    try {
                        const { cacheService } = _request.services([]);
                        if (_request.query.compName.includes("_dataImport")) {
                            const componentName = _request.query.compName.replace(
                                "_dataImport",
                                ""
                            );
                            let state = await cacheService.getState(_request);
                            const dataImportStatuses =
                                state.dataImportStatus ?? {};
                            state = await cacheService.mergeState(
                                _request,
                                {
                                    ...state,
                                    dataImportStatus: {
                                        ...dataImportStatuses,
                                        [componentName]:
                                            DataImportStatus.UPLOADED,
                                    },
                                },
                                state
                            );
                        }
                        const response = await axios.get(
                            `${docApiUrl}api/FileUpload/${_request.query.fileId}/GetFileStatus`,
                            {
                                headers: {
                                    "Ocp-Apim-Subscription-Key": accessKey,
                                },
                                    timeout: REQUEST_TIMEOUT_MS
                            }
                        );
                        return h
                            .response({
                                scan: response.data,
                                status: "scan allowed",
                            })
                            .type("application/json")
                            .code(200);
                    } catch (error) {
                        trackEvent(
                            `GetStatus API Error`,
                            {
                                path: _request.query.fileId,
                                error: JSON.stringify(error.message),
                            },
                            true
                        );
                        return h
                            .response({
                                error: error,
                            })
                            .type("application/json")
                            .code(500);
                    }
                },
            });

            server.route({
                method: "post",
                path: "/get-Validatefile-status",
                options: {
                    timeout: REQUEST_TIMEOUT,
                    payload: {                        // ensure numeric payload timeout
                        timeout: REQUEST_TIMEOUT_MS,
                        maxBytes: 209715200,
                        parse: true,
                        multipart: true,
                        output: "file",
                    },
                    handler: async (
                        request: HapiRequest,
                        h: HapiResponseToolkit
                    ) => {
                        try {
                            const payload = request.payload;
                            const formid = payload?.formid;
                            const path = payload?.path;
                            const config = await getFormById(formid);
                            const formSections = config?.sections || [];
                            const { cacheService } = request.server.services([]);
                            const state = await cacheService.getState(request);
                            let sectionData: FormDefinition | null = null;
                            if (!config) {
                                throw Boom.notFound(
                                    "router: No form found for id"
                                );
                            }
                            const ukprn =
                                request.yar?._store?.organisation?.ukprn;
                            const isUAT =
                                config?.formStatus === "Published" ? "" : "UAT";

                            const hasRepeatableSections = isRepeatableSectionForm(
                                config
                            );

                            // If the form is a repeatable section form, get the section data
                            const repeatableId = config?.id + ukprn + isUAT;
                            let sectionParams: Record<string, any> | undefined = undefined;
                            if (payload) {
                                sectionParams = getSectionParams(
                                    formSections,
                                    payload as FormPayload,
                                    state,
                                    true,
                                    request
                                );
                            }

                            if (hasRepeatableSections && ukprn) {
                                const sectionResponse = await getRepeatableSectionsData(
                                    repeatableId,
                                    request,
                                    sectionParams,
                                    config,
                                    formid,
                                );
                                if (sectionResponse?.id) {
                                    sectionData = sectionResponse;
                                    sectionData.currentPath =
                                        request.params.path;
                                }
                            }
                            const model = config
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
                                    request,
                                );
                            }
                            if (model) {
                                const page = model.pages.find(
                                    (page) =>
                                        page.path.replace(/^\//, "") ===
                                        path.split("/")[2]
                                );

                                if (page) {
                                    var response = await page.ValidateFile()(
                                        request,
                                        h
                                    );
                                }
                                if (response.status === "success") {
                                    return h
                                        .response({
                                            status: "success",
                                            data: response,
                                        })
                                        .type("application/json")
                                        .code(200);
                                } else {
                                    return h
                                        .response({
                                            status: response.msg,
                                            data: response,
                                        })
                                        .type("application/json")
                                        .code(500);
                                }
                            }
                        } catch (error) {
                            trackEvent(
                                `Validate file Error`,
                                {
                                    path: request.query.fileId,
                                    error: JSON.stringify(error),
                                },
                                true
                            );
                            return h
                                .response({
                                    error: error,
                                })
                                .type("application/json")
                                .code(500);
                        }
                    },
                },
            });

            server.route({
                method: "get",
                path: "/user-information",
                options: {
                    timeout: REQUEST_TIMEOUT,
                },
                handler: async (
                    _request: HapiRequest,
                    h: HapiResponseToolkit
                ) => {
                    let session = _request.yar;
                    const tokenInfo = session.get("id_token");
                    const organizationInfo = session.get("organisation");
                    const returnUrl = session.get("returnUrl");
                    const startPagePath = session.get("start-page-path");
                    const formId = _request.yar.get("formId");
                    _request.auth.isAuthenticated = true;
                    const { cacheService } = _request.server.services([]);
                    let state = await cacheService.getState(_request);
                    state = await cacheService.mergeState(
                        _request,
                        {
                            //...state,
                            orgUKPRN:
                                organizationInfo?.ukprn ??
                                organizationInfo?.DistrictAdministrative_code,
                            organisationDetails: organizationInfo,
                            dsiSignInEmail: tokenInfo?.email,
                            // This is to ensure start page redirection does not occur after login
                            progress: startPagePath
                                ? [`/${formId}${startPagePath}`]
                                : [],
                        },
                        state
                    );
                    state = await cacheService.setState(state);

                    try {
                        return h.view("user-information", {
                            orgName: organizationInfo?.name,
                            orgURN: organizationInfo?.urn,
                            orgUKPRN: organizationInfo?.ukprn,
                            orgAdministrativeCode:
                                organizationInfo?.DistrictAdministrative_code,
                            userName: tokenInfo?.given_name ?? "",
                            userSurname: tokenInfo?.family_name ?? "",
                            email: tokenInfo?.email ?? "",
                            returnUrl: returnUrl,
                            backLink: `/login?returnUrl=${_request.path}`,
                            name: session.get("form-name"),
                            pageTitle: "User Information",
                            accessibilityLink: "/accessibility-statement",
                            cookiesLink: `/cookies`,
                            privacyLink:
                                "https://www.gov.uk/government/publications/privacy-information-education-providers-workforce-including-teachers/privacy-information-education-providers-workforce-including-teachers",
                        });
                    } catch (error: any) {
                        trackEvent(
                            `user-information route error`,
                            {
                                error: JSON.stringify(error),
                            },
                            true
                        );
                        throw new Error(`${error.message}`);
                    }
                },
            });
            server.route({
                method: "get",
                path: "/accessibility-statement",
                options: {
                    timeout: REQUEST_TIMEOUT,
                },
                handler: async (
                    _request: HapiRequest,
                    h: HapiResponseToolkit
                ) => {
                    const { cacheService } = _request.server.services([]);
                    const state = await cacheService.getState(_request);
                    try {
                        return h.view("accessibility-statement", {
                            pageTitle: "Accessibility Statement",
                            accessibilityLink: "/accessibility-statement",
                            cookiesLink: `/cookies`,
                            privacyLink:
                                "https://www.gov.uk/government/publications/privacy-information-education-providers-workforce-including-teachers/privacy-information-education-providers-workforce-including-teachers",
                        });
                    } catch (error: any) {
                        trackEvent(
                            `accessibility-statement route error`,
                            {
                                error: JSON.stringify(error),
                            },
                            true
                        );
                        throw new Error(`${error.message}`);
                    }
                },
            });

            server.route({
                method: "get",
                path: "/cookies",
                options: {
                    timeout: REQUEST_TIMEOUT,
                },
                handler: async (
                    _request: HapiRequest,
                    h: HapiResponseToolkit
                ) => {
                    let session = _request.yar;
                    const { cacheService } = _request.server.services([]);
                    const state = await cacheService.getState(_request);
                    try {
                        return h.view("cookies", {
                            name: session.get("form-name"),
                            pageTitle: "Cookies",
                            accessibilityLink: "/accessibility-statement",
                            cookiesLink: `/cookies`,
                            privacyLink:
                                "https://www.gov.uk/government/publications/privacy-information-education-providers-workforce-including-teachers/privacy-information-education-providers-workforce-including-teachers",
                        });
                    } catch (error: any) {
                        trackEvent(
                            `cookies route error`,
                            {
                                error: JSON.stringify(error),
                            },
                            true
                        );
                        throw new Error(`${error.message}`);
                    }
                },
            });

            server.route({
                method: "get",
                path: "/service-unavailable",
                options: {
                    timeout: REQUEST_TIMEOUT,
                },
                handler: async (
                    request: HapiRequest,
                    h: HapiResponseToolkit
                ) => {
                    const formatDate = (date) => {
                        const monthNames = [
                            "January",
                            "February",
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August",
                            "September",
                            "October",
                            "November",
                            "December",
                        ];
                        const dateArray = date.split(" ");

                        // Try to parse the input as a full ISO string or fallback to manual split
                        let d = new Date(dateArray[0]);
                        console.log("newdate:", d);
                        const time =
                            dateArray[1] ||
                            dateArray[0].split("T")[1] ||
                            "00:00:00";
                        const exactDate = d.getDate();
                        const month = monthNames[d.getMonth()];
                        const year = d.getFullYear();
                        let hour = parseInt(time.split(":")[0]) || 0;
                        const minute = time.split(":")[1] || "00";
                        const second = time.split(":")[2] || "00";
                        const ampm = hour >= 12 ? "pm" : "am";
                        let hour12 = hour % 12;
                        if (hour12 === 0) hour12 = 12;
                        console.log(
                            `Formatted date: ${exactDate} ${month} ${year} at ${hour12}:${minute}${second} ${ampm}`
                        );
                        // Remove space before AM/PM, no leading zero on hour
                        return `${exactDate} ${month} ${year} at ${hour12}:${minute}${ampm}`;
                    };
                    return h.view("service-unavailable", {
                        displayName: request.query.displayName,
                        lastModified: formatDate(request.query.lastModified),
                        name: request.yar.get("form-name"),
                    });
                },
            });

            server.route({
                method: "get",
                path: "/clear-session",
                options: {
                    timeout: REQUEST_TIMEOUT,
                },
                handler: async (
                    request: HapiRequest,
                    h: HapiResponseToolkit
                ) => {
                    var formId = request.yar.get("formId")
                        ? request.yar.get("formId")
                        : request.headers.referer
                            .split("/")
                            .slice(3, 4)
                            .join("/");
                    if (request.yar) {
                        request.yar.reset();
                    }
                    return h.view("signout", { formId: formId });
                },
            });

            server.route({
                method: "get",
                path: "/timeout",
                options: {
                    timeout: REQUEST_TIMEOUT,
                },
                handler: async (
                    request: HapiRequest,
                    h: HapiResponseToolkit
                ) => {
                    if (request.yar) {
                        request.yar.reset();
                    }

                    let serviceStartPage = "/";

                    const { referer } = request.headers;

                    if (referer) {
                        const match = referer.match(
                            /https?:\/\/[^/]+\/([^/]+).*/
                        );
                        if (match && match?.length > 1) {
                            serviceStartPage = `/${match[1]}`;
                        }
                    }

                    return h.view("timeout", {
                        serviceStartPage,
                        accessibilityLink: "/accessibility-statement",
                        cookiesLink: `/cookies`,
                        privacyLink:
                            "https://www.gov.uk/government/publications/privacy-information-education-providers-workforce-including-teachers/privacy-information-education-providers-workforce-including-teachers",
                    });
                },
            });

            // Used to update cache state with selected text from select fields
            server.route({
                method: "post",
                path: "/{id}/selected-text",
                options: {
                    timeout: REQUEST_TIMEOUT,
                    handler: async (
                        request: HapiRequest,
                        h: HapiResponseToolkit
                    ) => {
                        const payload = request.payload as {
                            id: string;
                            text: string;
                        };
                        const { cacheService } = request.server.services([]);
                        let state = await cacheService.getState(request);
                        state = await cacheService.mergeState(
                            request,
                            {
                                ...state,
                                selectField: {
                                    [payload.id]: payload.text,
                                },
                            },
                            state
                        );
                        return h.continue;
                    },
                },
            });

            server.route({
                method: "post",
                path: "/{id}/generate-table-for-tab",
                options: {
                    timeout: REQUEST_TIMEOUT,
                    handler: async (
                        request: HapiRequest,
                        h: HapiResponseToolkit
                    ) => {
                        try {
                            const { id } = request.params;
                            const { fileId, tableId } = request.payload as {
                                fileId: string;
                                tableId: string;
                            };
                            const { cacheService } = request.server.services(
                                []
                            );
                            let state = await cacheService.getState(request);
                            // Check cache
                            if (state?.tabTable?.[tableId]) {
                                return h.view("table", {
                                    tableData: state.tabTable[tableId],
                                });
                            }
                            const config: FormDefinition | null = await getFormById(
                                id
                            );
                            const ukprn: string =
                                request.yar.get("organisation")?.ukprn ??
                                request.yar.get("organisation")
                                    ?.DistrictAdministrative_code;
                            const urn: string =
                                request.yar.get("organisation")?.urn ??
                                request.yar.get("organisation")
                                    ?.DistrictAdministrative_code;
                            const tableData = config?.designedDataSets?.find(
                                (dts) => dts.id === tableId
                            );
                            if (fileId && tableData) {
                                const jsonData = await getBlobContent(fileId);
                                const parsedTableData = constructTableData(
                                    jsonData,
                                    ukprn,
                                    urn,
                                    tableData
                                );
                                state = await cacheService.mergeState(
                                    request,
                                    {
                                        ...state,
                                        tabTable: {
                                            [tableId]: parsedTableData,
                                        },
                                    },
                                    state
                                );
                                return h.view("table", {
                                    tableData: parsedTableData,
                                });
                            }
                            return h.continue;
                        } catch (err: any) {
                            return h.response(err);
                        }
                    },
                },
            });
        },
    },
};
// $lab:coverage:on$
