import { SummaryViewModel } from "../models";
import { PageController } from "./PageController";
import { feedbackReturnInfoKey, redirectTo, redirectUrl } from "../helpers";
import { HapiRequest, HapiResponseToolkit } from "server/types";
import {
    decodeFeedbackContextInfo,
    FeedbackContextInfo,
    RelativeUrl,
} from "../feedback";
import config from "server/config";
import { trackEvent, trackTrace } from "./../../../logging/customTracker";
import { nanoid } from "nanoid";
import { NotifyClient } from "notifications-node-client";
import { CacheService } from "src/server/services";
import { ServiceBusMessage } from "@azure/service-bus";
import { sendSbMsg } from "server/plugins/engine/services/servicebusService";
import { validateMandatoryFields, getEmailBodyFromRedis } from "./utils";

const setSendEmailFlag = async (
    cacheService: CacheService,
    request: HapiRequest,
    flag: boolean,
    linkToFile?: string
) => {
    let state = await cacheService.getState(request);
    trackEvent(`Application Insights:linkToFile check1`, {
        linkToFile,
    });
    state = await cacheService.mergeState(
        request,
        {
            ...state,
            sendEmail: flag,
            linkToFile,
        },
        state
    );
};

export class SummaryPageController extends PageController {
    /**
     * The controller which is used when Page["controller"] is defined as "./pages/summary.js"
     */

    /**
     * Returns an async function. This is called in plugin.ts when there is a GET request at `/{id}/{path*}`,
     */
    makeGetRouteHandler() {
        return async (request: HapiRequest, h: HapiResponseToolkit) => {
            trackEvent(
                "Request params for form:summary get",
                {
                    path: request.params.path,
                    id: request.params.id,
                },
                false
            );
            this.langFromRequest(request);
            const { cacheService } = request.services([]);
            const model = this.model;
            const { isDebugging } = config;
            let state = await cacheService.getState(request);
            const newreference = nanoid(10);
            let EMAIL_KEY, templateId, API_KEY, notifyClient;
            let linkToFile;
            trackEvent(
                `Application Insights:model output check in summary page controller`,
                {
                    outputs: model?.def?.outputs,
                    model,
                    newreference,
                }
            );
            if (model.def.outputs?.length > 0) {
                EMAIL_KEY =
                    model.def.outputs?.[0].outputConfiguration.emailField;
                templateId =
                    model.def.outputs[0].outputConfiguration.templateId;
                API_KEY = model.def.outputs[0].outputConfiguration.apiKey;
                notifyClient = new NotifyClient(API_KEY);
                try {
                    const emailBody = await getEmailBodyFromRedis(
                        notifyClient,
                        templateId
                    );
                    linkToFile = emailBody.search(/link_to_file/);
                } catch (err) {
                    console.error(err);

                    trackTrace(`Notify Client - Error`, {
                        error: err,
                        linkToFile,
                    });
                }
            }
            state = await cacheService.mergeState(
                request,
                {
                    reference: newreference,
                    referenceIsStored: newreference,
                },
                state
            );
            state.completedResultPages =  [];
            state = await cacheService.setState(state);
            // @ts-ignore - ignoring so docs can be generated. Remove when properly typed
            if (this.model.def.skipSummary) {
                request.yar.set("state", state);
                return this.makePostRouteHandler()(request, h);
            }

            state = await cacheService.getState(request);
            const viewModel = new SummaryViewModel(
                this.title,
                model,
                state,
                request
            );
            const missingFields = validateMandatoryFields(
                model,
                viewModel,
                state
            );
            if (missingFields && missingFields?.length > 0) {
                return redirectTo(
                    request,
                    h,
                    `/${model.basePath}${missingFields[0].path}`
                );
            }

            if (viewModel.endPage) {
                return redirectTo(
                    request,
                    h,
                    `/${model.basePath}${viewModel.endPage.path}`
                );
            }

            /**
             * iterates through the errors. If there are errors, a user will be redirected to the page
             * with the error with returnUrl=`/${model.basePath}/summary` in the URL query parameter.
             */
            if (viewModel.errors) {
                const errorToFix = viewModel.errors[0];
                const { path } = errorToFix;
                const parts = path.split(".");
                const section = parts[0];
                const property =
                    parts.length > 1 ? parts[parts.length - 1] : null;
                const iteration =
                    parts[1].split("-").length === 2 ? Number( parts[1].split("-")[1]) : 1;
                const pageWithError = model.pages.filter((page) => {
                    if (page.section && page.section.name === section) {
                        let propertyMatches = true;
                        let conditionMatches = true;
                        if (property) {
                            propertyMatches =
                                page.components.formItems.filter(
                                    (item) => item.name === property
                                ).length > 0;
                        }
                        if (
                            propertyMatches &&
                            page.condition &&
                            model.conditions[page.condition]
                        ) {
                            conditionMatches = model.conditions[
                                page.condition
                            ].fn(state);
                        }
                        return propertyMatches && conditionMatches;
                    }
                    return false;
                })[0];
                if (pageWithError) {
                    const params = {
                        returnUrl: redirectUrl(request, `${request.path}`),
                        num:
                            iteration && pageWithError.repeatField
                                ? iteration
                                : '',
                    };
                    return redirectTo(
                        request,
                        h,
                        `/${model.basePath}${pageWithError.path}`,
                        params
                    );
                }
            }

            const declarationError = request.yar.flash("declarationError");
            if (declarationError.length) {
                viewModel.declarationError = declarationError[0];
            }
            const flatArr = viewModel.details.reduce((acc, arr, index) => {
                let titleIndex = 0;
                if (!arr.title) {
                    arr.title = "";
                }
                arr.items.map((subArr, idx) => {
                    if (arr.title !== "") {
                        Object.assign(subArr, {
                            subTitle: arr.title,
                            subTitleNum: titleIndex,
                        });
                        titleIndex++;
                    }
                    return acc.push(subArr);
                });
                return acc;
            }, []);
            let checkboxSum = 0;
            const flatArrCheckboxes = flatArr.reduce((acc, arr, index) => {
                if (arr?.type === "CheckboxesField") {
                    //for (let i = 0; i < arr.rawValue.length; i++) {
                    acc.push({
                        ...arr,
                        value: arr.value,
                        rawValue: arr.rawValue,
                    });
                    //}
                    return acc;
                } else {
                    acc.push({ ...arr });
                    return acc;
                }
            }, []);
            function splitString(str, N) {
                const arr = [];
                for (let i: number = 0; i < str.length; i += N) {
                    arr.push(str.substring(i, i + N));
                }
                return arr;
            }
            const flatArrFinal = flatArrCheckboxes.reduce((acc, arr, index) => {
                if (arr.value?.length > 500) {
                    const chunkSize = 500;
                    let chunk = splitString(arr.value, chunkSize);
                    for (const paragraph in chunk) {
                        acc.push({
                            ...arr,
                            value: chunk[paragraph],
                            rawValue: [chunk[paragraph]],
                        });
                    }
                    return acc;
                } else {
                    acc.push({ ...arr });
                    return acc;
                }
            }, []);
            let pages: any = [];
            let colunmLeftLength = 0;
            let colunmRightLength = 0;
            let pageItemArr: any = [];
            let linesNumRight = 0;
            let linesNumLeft = 0;
            let finalLinesNumber = 0;
            let first = 0;
            for (let i = 0; i < flatArrFinal.length; i++) {
                colunmLeftLength += flatArrFinal[i]?.title?.length;

                if (flatArrFinal[i]?.value === null) {
                    colunmRightLength += 12;
                } else {
                    colunmRightLength += flatArrFinal[i]?.value?.length;
                }

                // right colunm
                if (colunmRightLength > 0 && colunmRightLength < 62) {
                    colunmRightLength = 0;
                    linesNumRight++;
                }
                if (colunmRightLength > 61 && colunmRightLength < 124) {
                    colunmRightLength = 0;
                    linesNumRight += 2;
                }
                if (colunmRightLength > 123 && colunmRightLength < 197) {
                    colunmRightLength = 0;
                    linesNumRight += 3;
                }
                if (colunmRightLength > 196 && colunmRightLength < 263) {
                    colunmRightLength = 0;
                    linesNumRight += 4;
                }
                if (colunmRightLength > 262 && colunmRightLength < 313) {
                    colunmRightLength = 0;
                    linesNumRight += 5;
                }
                if (colunmRightLength > 312 && colunmRightLength < 377) {
                    colunmRightLength = 0;
                    linesNumRight += 6;
                }
                if (colunmRightLength > 376 && colunmRightLength < 438) {
                    colunmRightLength = 0;
                    linesNumRight += 7;
                }
                if (colunmRightLength > 437 && colunmRightLength < 501) {
                    colunmRightLength = 0;
                    linesNumRight += 8;
                }
                //left column
                if (colunmLeftLength > 0 && colunmLeftLength < 29) {
                    colunmLeftLength = 0;
                    linesNumLeft++;
                }
                if (colunmLeftLength > 28 && colunmLeftLength < 60) {
                    colunmLeftLength = 0;
                    linesNumLeft += 2;
                }
                if (colunmLeftLength > 59 && colunmLeftLength < 90) {
                    colunmLeftLength = 0;
                    linesNumLeft += 3;
                }
                if (colunmLeftLength > 89 && colunmLeftLength < 120) {
                    colunmLeftLength = 0;
                    linesNumLeft += 4;
                }
                if (colunmLeftLength > 119 && colunmLeftLength < 150) {
                    colunmLeftLength = 0;
                    linesNumLeft += 5;
                }
                if (colunmLeftLength > 149 && colunmLeftLength < 180) {
                    colunmLeftLength = 0;
                    linesNumLeft += 6;
                }
                if (colunmLeftLength > 179 && colunmLeftLength < 210) {
                    colunmLeftLength = 0;
                    linesNumLeft += 7;
                }
                if (colunmLeftLength > 209 && colunmLeftLength < 240) {
                    colunmLeftLength = 0;
                    linesNumLeft += 8;
                }
                if (first === 0) {
                    if (linesNumLeft > 8 || linesNumRight > 8) {
                        if (linesNumLeft > linesNumRight) {
                            finalLinesNumber = linesNumLeft;
                        } else {
                            finalLinesNumber = linesNumRight;
                        }
                        pageItemArr.push(i);
                        linesNumLeft = 0;
                        linesNumRight = 0;
                        finalLinesNumber = 0;
                        first++;
                    }
                } else {
                    if (linesNumLeft > 13 || linesNumRight > 13) {
                        if (linesNumLeft > linesNumRight) {
                            finalLinesNumber = linesNumLeft;
                        } else {
                            finalLinesNumber = linesNumRight;
                        }
                        pageItemArr.push(i);
                        linesNumLeft = 0;
                        linesNumRight = 0;
                        finalLinesNumber = 0;
                    }
                }
                // last page
                if (flatArrFinal.length === i + 1) {
                    if (
                        flatArrFinal.length !==
                        pageItemArr[pageItemArr.length - 1]
                    ) {
                        pageItemArr.push(flatArrFinal.length);
                    }
                }
            }
            let init = 0;
            for (let j = 0; j < pageItemArr.length; j++) {
                for (let k = 0; k < flatArrFinal.length; pageItemArr[j]) {
                    if (init === 0) {
                        if (flatArrFinal.length < 5) {
                            pages.push({
                                items: flatArrFinal,
                            });
                        } else {
                            // one single page
                            if (pageItemArr[0] === 0) {
                                pages.push({
                                    items: flatArrFinal.slice(
                                        0,
                                        pageItemArr[1]
                                    ),
                                });
                            } else {
                                pages.push({
                                    items: flatArrFinal.slice(
                                        0,
                                        pageItemArr[0]
                                    ),
                                });
                            }
                        }
                        init++;
                        break;
                    } else {
                        for (let l = 0; l < flatArrFinal.length; l++) {
                            pages.push({
                                items: flatArrFinal.slice(
                                    pageItemArr[j - 1],
                                    pageItemArr[j]
                                ),
                            });
                            break;
                        }
                    }
                    break;
                }
            }
            viewModel.accessibilityLink = "/accessibility-statement";
            // const id = this.model.def.id;
            viewModel.cookiesLink = `/cookies`;
            viewModel.privacyLink =
                "https://www.gov.uk/government/publications/privacy-information-education-providers-workforce-including-teachers/privacy-information-education-providers-workforce-including-teachers";
            let email = "";
            let notifyEmail = "";
            let emailId = "";
            let outputs = this.model.def.outputs;
            this.model.def.outputs?.forEach((data: any) => {
                emailId = data?.outputConfiguration.emailField
                    ? data.outputConfiguration.emailField
                    : "";
            });
            if (emailId in state) {
                notifyEmail = state[emailId];
            }
            viewModel.details?.forEach((detail: any) =>
                detail.items.filter((item) => {
                    if (item?.type === "EmailAddressField") {
                        email = notifyEmail !== "" ? notifyEmail : item.value;
                    }
                })
            );
            viewModel.email =
                state.dsiSignInEmail && notifyEmail === ""
                    ? state.dsiSignInEmail
                    : email;
            trackEvent(`Application Insights:linkToFile check 3`, {
                linkToFile,
            });
            return h.view("summary", {
                ...viewModel,
                linkToFile,
                pages,
                reference: newreference,
            });
        };
    }
    /**
     * Returns an async function. This is called in plugin.ts when there is a POST request at `/{id}/{path*}`.
     * If a form is incomplete, a user will be redirected to the start page.
     */
    makePostRouteHandler() {
        return async (request: HapiRequest, h: HapiResponseToolkit) => {
            trackEvent(
                "Request params for form:summary post",
                {
                    path: request.params.path,
                    id: request.params.id,
                },
                false
            );
            const { payService, cacheService } = request.services([]);
            const model = this.model;
            let EMAIL_KEY, templateId, API_KEY, notifyClient, email;
            let state = request.yar.get("state");
            if (request?.params?.id !== request?.yar?.get("formId")) {
                request?.yar?.set("formId", request?.params?.id);
                state = await cacheService.getState(request);
            }
            // await cacheService.getState(request);
            let pdfContent = request?.payload?.pdfContent;
            let linkToFile;
            let props: ServiceBusMessage["applicationProperties"] = {};
            trackEvent(`Application Insights:step1`, {
                state: state,
                pdfContent,
                outputs: model?.def?.outputs,
            });
            if (model.def.outputs.length > 0) {
                EMAIL_KEY =
                    model.def.outputs?.[0].outputConfiguration.emailField;
                templateId =
                    model.def.outputs[0].outputConfiguration.templateId;
                API_KEY = model.def.outputs[0].outputConfiguration.apiKey;
                notifyClient = new NotifyClient(API_KEY);
                trackEvent(`Application Insights:step2 output is configured`, {
                    emailKey: EMAIL_KEY,
                    templateId: templateId,
                    notifyClient: notifyClient,
                });
                try {
                    const emailBody = await getEmailBodyFromRedis(
                        notifyClient,
                        templateId
                    );
                    linkToFile = emailBody.search(/link_to_file/);
                } catch (err) {
                    console.error(err);
                    trackEvent(
                        `Notify Client - Error`,
                        {
                            error: err,
                            linkToFile,
                        },
                        true
                    );
                }
                trackEvent(`Application Insights:linkToFile check 4`, {
                    linkToFile,
                });
                props.link_to_file = linkToFile;
                props.API_KEY = API_KEY;
                props.templateId = templateId;
                props.EMAIL_KEY = EMAIL_KEY;
                props.IS_UAT = request.url.hostname
                    .toLocaleLowerCase()
                    .includes("uat");

                if (EMAIL_KEY === "notify_dsi_signin_email") {
                    let notifyEmail = "";
                    let emailId = "";
                    this.model.def.outputs?.forEach((data: any) => {
                        emailId = data?.outputConfiguration.emailField
                            ? data.outputConfiguration.emailField
                            : "";
                    });
                    if (emailId in state) {
                        notifyEmail = state[emailId];
                    }
                    model.values.pages?.forEach((page: any) => {
                        page.components?.forEach((item: any) => {
                            if (item?.type === "EmailAddressField") {
                                email =
                                    notifyEmail !== ""
                                        ? notifyEmail
                                        : item.value;
                            }
                        });
                    });
                    const session = request.yar;
                    email =
                        state.dsiSignInEmail && notifyEmail === ""
                            ? state.dsiSignInEmail
                            : session.get("id_token")?.email;
                    trackEvent(
                        `Application Insights:step3 notify DSI SIGN IN email`,
                        {
                            email: email,
                            linkToFile,
                        }
                    );
                } else {
                    let splitId = EMAIL_KEY.includes(".")
                        ? EMAIL_KEY.split(".")[1]
                        : EMAIL_KEY.split(".")[0];
                    let pgid = EMAIL_KEY.includes(".")
                        ? EMAIL_KEY.split(".")[0]
                        : "";
                    if (pgid in state) {
                        email = state[pgid][splitId];
                    } else {
                        email = state[splitId];
                    }
                    trackEvent(
                        `Application Insights: step3 output mapped email component`,
                        {
                            email: email,
                            linkToFile,
                        }
                    );
                }
                props.emailId = email;
            }

            const summaryViewModel = new SummaryViewModel(
                this.title,
                model,
                state,
                request
            );
            this.setFeedbackDetails(summaryViewModel, request);

            // redirect user to start page if there are incomplete form errors
            if (summaryViewModel.result.error) {
                trackEvent(
                    `SummarypostRouteHandler:Error`,
                    {
                        error: summaryViewModel.result.error,
                    },
                    true
                );
                request.logger.error(
                    `SummaryPage Error`,
                    summaryViewModel.result.error
                );
                /** defaults to the first page */
                // @ts-ignore - tsc reports an error here, ignoring so docs can be generated (does not cause eslint errors otherwise). Remove when properly typed
                let startPageRedirect = redirectTo(
                    request,
                    h,
                    `/${model.basePath}${model.def.pages[0].path}`
                );
                const startPage = model.def.startPage;

                // @ts-ignore - tsc reports an error here, ignoring so docs can be generated (does not cause eslint errors otherwise). Remove when properly typed
                if (startPage.startsWith("http")) {
                    // @ts-ignore - tsc reports an error here, ignoring so docs can be generated (does not cause eslint errors otherwise). Remove when properly typed
                    startPageRedirect = redirectTo(request, h, startPage);
                } else if (
                    model.def.pages.find((page) => page.path === startPage)
                ) {
                    // @ts-ignore - tsc reports an error here, ignoring so docs can be generated (does not cause eslint errors otherwise). Remove when properly typed
                    startPageRedirect = redirectTo(
                        request,
                        h,
                        `/${model.basePath}${startPage}`
                    );
                }

                return startPageRedirect;
            }

            /**
             * If a form is configured with a declaration, a checkbox will be rendered with the configured declaration text.
             * If the user does not agree to the declaration, the page will be rerendered with a warning.
             */
            if (
                summaryViewModel.declaration &&
                request.payload &&
                !summaryViewModel.skipSummary
            ) {
                const { declaration } = request.payload as {
                    declaration?: any;
                };

                if (!declaration) {
                    request.yar.flash(
                        "declarationError",
                        "Declaration is a required field"
                    );
                    if (config.default !== undefined) {
                        trackEvent(
                            `Declaration:Error`,
                            {
                                msg: "Declaration is a required field",
                            },
                            true
                        );
                    }
                    return redirectTo(
                        request,
                        h,
                        `${request.headers.referer}#declaration`
                    );
                }
                summaryViewModel.addDeclarationAsQuestion();
            }

            state = await cacheService.mergeState(
                request,
                {
                    outputs: summaryViewModel.outputs,
                    userCompletedSummary: true,
                },
                state
            );
            state = await cacheService.mergeState(
                request,
                {
                    webhookData: summaryViewModel.validatedWebhookData,
                },
                state
            );
            state = await cacheService.setState(state);
            trackEvent(
                `Application Insights: summarypagecontroller email check`,
                {
                    email,
                    linkToFile,
                }
            );
            if (email && email !== "") {
                const {
                    result,
                    state,
                    value,
                    _webhookData,
                    ...sbdata
                } = summaryViewModel;
                trackEvent(`Application Insights: before service bus push`, {
                    result,
                    submissionID: sbdata?.referenceNumber ?? "",
                    // state,
                    value,
                    _webhookData,
                    sbdata,
                });
                // Filter out Result fields with hideResultOnSummary flag before sending to service bus
                this.filterHiddenResults(sbdata);
                await sendSbMsg(sbdata, "PdfPrintq", props);
            }
            let res;
            /**
             * If a user does not need to pay, redirect them to /status
             */
            if (
                !summaryViewModel.fees ||
                (summaryViewModel.fees?.details ?? []).length === 0
            ) {
                return redirectTo(request, h, `/${request.params.id}/status`);
            }

            // user must pay for service
            const description = payService.descriptionFromFees(
                summaryViewModel.fees
            );
            const url = new URL(
                `${config.payReturnUrl}/${request.params.id}/status`
            ).toString();
            res = await payService.payRequest(
                summaryViewModel?.fees,
                summaryViewModel.payApiKey || "",
                url
            );

            request.yar.set("basePath", model.basePath);
            state = await cacheService.mergeState(
                request,
                {
                    pay: {
                        payId: res.payment_id,
                        reference: res.reference,
                        self: res._links.self.href,
                        returnUrl: new URL(
                            `${config.payReturnUrl}/${request.params.id}/status`
                        ).toString(),
                        meta: {
                            amount: summaryViewModel.fees.total,
                            description,
                            attempts: 1,
                            payApiKey: summaryViewModel.payApiKey,
                        },
                    },
                },
                state
            );

            summaryViewModel.webhookDataPaymentReference = res.reference;
            state = await cacheService.mergeState(
                request,
                {
                    webhookData: summaryViewModel.validatedWebhookData,
                },
                state
            );

            state = await cacheService.setState(state);
            return redirectTo(request, h, res._links.next_url.href);
        };
    }

    setFeedbackDetails(viewModel: SummaryViewModel, request: HapiRequest) {
        const feedbackContextInfo = this.getFeedbackContextInfo(request);

        if (feedbackContextInfo) {
            // set the form name to the source form name if this is a feedback form
            viewModel.name = feedbackContextInfo.formTitle;
        }

        // setting the feedbackLink to undefined here for feedback forms prevents the feedback link from being shown
        viewModel.feedbackLink = this.feedbackUrlFromRequest(request);
    }

    getFeedbackContextInfo(request: HapiRequest) {
        if (this.model.def.feedback?.feedbackForm) {
            if (request.url.searchParams.get(feedbackReturnInfoKey)) {
                return decodeFeedbackContextInfo(
                    request.url.searchParams.get(feedbackReturnInfoKey)
                );
            }
        }
    }

    feedbackUrlFromRequest(request: HapiRequest) {
        if (this.model.def.feedback?.url) {
            let feedbackLink = new RelativeUrl(this.model.def.feedback.url);
            const returnInfo = new FeedbackContextInfo(
                this.model.name,
                "Summary",
                `${request.url.pathname}${request.url.search}`
            );
            feedbackLink.setParam(feedbackReturnInfoKey, returnInfo.toString());
            return feedbackLink.toString();
        }

        return undefined;
    }

    /**
     * Filters out Result type fields with hideResultOnSummary enabled from the details array.
     * This prevents hidden result fields from being sent to the service bus for post PDF submission.
     * Now post submission PDF will not contain hidden result fields.
     * @param sbdata - The summary view model data to be filtered
     */
    private filterHiddenResults(sbdata: any) {
        if (sbdata.details && Array.isArray(sbdata.details)) {
            sbdata.details = sbdata.details.map((detail: any) => {
                if (detail.items && Array.isArray(detail.items)) {
                    detail.items = detail.items.filter((item: any) => {
                        // Remove items where type is "Result" AND hideResultOnSummary is true
                        return !(
                            item.type === "Result" &&
                            item.options?.hideResultOnSummary === true
                        );
                    });
                }
                return detail;
            });
        }
    }

    get postRouteOptions() {
        return {
            ext: {
                onPreHandler: {
                    method: async (
                        _request: HapiRequest,
                        h: HapiResponseToolkit
                    ) => {
                        return h.continue;
                    },
                },
            },
        };
    }
}
