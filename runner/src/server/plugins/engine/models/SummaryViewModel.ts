import { clone, reach } from "hoek";
import config from "server/config";
import { FormModel } from "./FormModel";
import {
    feedbackReturnInfoKey,
    getNumberAfterLastHyphen,
    redirectUrl,
} from "../helpers";
import { decodeFeedbackContextInfo } from "../feedback";
import { formSchema } from "server/schemas/formSchema";
import { SummaryPageController } from "../pageControllers";
import { FormSubmissionState } from "../types";
import { FEEDBACK_CONTEXT_ITEMS, WebhookData } from "./types";
import {
    EmailModel,
    FeesModel,
    NotifyModel,
    WebhookModel,
} from "server/plugins/engine/models/submission";
import { FormDefinition, isMultipleApiKey } from "@xgovformbuilder/model";
import { HapiRequest } from "src/server/types";
import moment from "moment";
import { trackEvent } from "./../../../logging/customTracker";
const { isDebugging } = config;
import { debugConsoleLog } from "src/server/utils/commonUtils";
import { numberWithCommas } from "../pageControllers/utils";
/**
 * TODO - extract submission behaviour dependencies from the viewmodel
 * skipSummary (replace with reference to this.def.skipSummary?)
 * _payApiKey
 * replace result with errors?
 * remove state and value?
 *
 * TODO - Pull out summary behaviours into separate service classes?
 */

export class SummaryViewModel {
    /**
     * Responsible for parsing state values to the govuk-frontend summary list template and parsing data for outputs
     * The plain object is also used to generate data for outputs
     */

    pageTitle: string;
    declaration: any; // TODO
    customSummaryMessage: any;
    skipSummary: boolean;
    endPage: any; // TODO
    result: any;
    details: any;
    state: any;
    value: any;
    fees: FeesModel | undefined;
    name: string | undefined;
    feedbackLink: string | undefined;
    phaseTag: string | undefined;
    declarationError: any; // TODO
    customSummaryMessageError: any;
    errors:
        | {
            path: string;
            name: string;
            message: string;
        }[]
        | undefined;
    referenceNumber: string | undefined;
    currentTimeString: string | undefined;
    pdfPrintStatus: string | undefined;

    _outputs: FormDefinition["outputs"]; // TODO
    _payApiKey: FormDefinition["payApiKey"];
    _webhookData: WebhookData | undefined;
    accessibilityLink?: string;
    cookiesLink?: string;
    privacyLink?: string;
    email: string | undefined;
    outputType: FormDefinition["outputs"];
    constructor(
        pageTitle: string,
        model: FormModel,
        state: FormSubmissionState,
        request: HapiRequest
    ) {
        this.pageTitle = pageTitle;
        const { relevantPages, endPage } = this.getRelevantPages(model, state);
        const details = this.summaryDetails(
            request,
            model,
            state,
            relevantPages
        );
        const { def } = model;
        // @ts-ignore
        this.declaration = def.declaration;
        this.customSummaryMessage = def.customSummaryMessage;
        // @ts-ignore
        this.skipSummary = def.skipSummary;
        this._payApiKey = def.payApiKey;
        this._outputs = def.outputs;
        this.endPage = endPage;
        (this.name = model.name),
            (this.feedbackLink =
                def.feedback?.url ??
                ((def.feedback?.emailAddress &&
                    `mailto:${def.feedback?.emailAddress}`) ||
                    config.feedbackLink));

        const schema = model.makeFilteredSchema(state, relevantPages);
        const collatedRepeatPagesState = gatherRepeatPages(state);

        const result = schema.validate(collatedRepeatPagesState, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (result.error) {
            this.processErrors(result, details);
        } else {
            this.fees = FeesModel(model, state);
            this._webhookData = WebhookModel(
                relevantPages,
                details,
                model,
                this.fees
            );
            this._webhookData = this.addFeedbackSourceDataToWebhook(
                this._webhookData,
                model,
                request
            );

            /**
             * If there outputs defined, parse the state data for the appropriate outputs
             */
            trackEvent(
                `Application Insights:output check in summary view model1`,
                {
                    outputs: def?.outputs,
                }
            );
            if (def.outputs) {
                this._outputs = def.outputs.map((output) => {
                    switch (output.type) {
                        case "notify":
                            return {
                                type: "notify",
                                outputData: NotifyModel(
                                    model,
                                    output.outputConfiguration,
                                    state
                                ),
                            };
                        case "email":
                            return {
                                type: "email",
                                outputData: EmailModel(
                                    model,
                                    output.outputConfiguration,
                                    this._webhookData
                                ),
                            };
                        case "webhook":
                            return {
                                type: "webhook",
                                outputData: {
                                    url: output.outputConfiguration.url,
                                },
                            };
                        default:
                            return {};
                    }
                });
            }
        }
        this.result = result;
        this.details = details;
        this.state = state;
        this.value = result.value;
        this.referenceNumber = state.reference;
        this.currentTimeString = moment().format("YYYY-MM-DD, hh:mm A");
        let email = "";
        let notifyEmail = "";
        let emailId = "";
        isDebugging &&
            trackEvent(
                `Application Insights:output check in summary view model2`,
                {
                    outputs: model?.def?.outputs,
                    model,
                }
            );
        model.def.outputs?.forEach((data: any) => {
            emailId = data?.outputConfiguration.emailField
                ? data.outputConfiguration.emailField
                : "";
        });
        if (emailId in state) {
            notifyEmail = state[emailId];
        }
        details?.forEach((detail: any) =>
            detail.items.filter((item) => {
                if (item?.type === "EmailAddressField") {
                    email = notifyEmail !== "" ? notifyEmail : item.value;
                }
            })
        );
        this.email =
            this.state.dsiSignInEmail && notifyEmail === ""
                ? this.state.dsiSignInEmail
                : email;
        // trackEvent(`pdf printing email`, {
        //     email: this.email,
        //     sessionEmail: request.yar?.get("id_token").email,
        // });
        // checking pdf print status
        this.referenceNumber
            ? (this.pdfPrintStatus = "NOT SUBMITTED")
            : (this.pdfPrintStatus = "SUBMITTED");
        this.outputType = model.def.outputs;
        isDebugging &&
            trackEvent(
                `Application Insights:output check in summary view model3`,
                {
                    outputs: model?.def?.outputs,
                    model,
                }
            );
    }

    private processErrors(result, details) {
        this.errors = result.error.details.map((err) => {
            const name = err.path[err.path.length - 1];

            return {
                path: err.path.join("."),
                name: name,
                message: err.message,
            };
        });

        details?.forEach((detail) => {
            const sectionErr = this.errors?.find(
                (err) => err.path === detail.name
            );

            detail.items?.forEach((item) => {
                if (sectionErr) {
                    item.inError = true;
                    return;
                }

                const err = this.errors?.find(
                    (err) =>
                        err.path ===
                        (detail.name
                            ? detail.name + "." + item.name
                            : item.name)
                );
                if (err) {
                    item.inError = true;
                }
            });
        });
    }

    private summaryDetails(
        request,
        model: FormModel,
        state: FormSubmissionState,
        relevantPages
    ) {
        const details: object[] = [];

        const orderedSections: any[][] = [];

        relevantPages.forEach((page) => {
            if (orderedSections.length === 0) {
                orderedSections.push([page]);
            } else {
                if (
                    orderedSections[orderedSections.length - 1][0].section ===
                    page.section
                ) {
                    orderedSections[orderedSections.length - 1].push(page);
                } else {
                    orderedSections.push([page]);
                }
            }
        });

        orderedSections?.forEach((sectionPages) => {
            const section = sectionPages[0].section;
            const items: any[] = [];
            let sectionState = section ? state[section.name] || {} : state;

            const repeatablePage = sectionPages.find(
                (page) => !!page.repeatField
            );
            // Currently can't handle repeatable page outside a section.
            // In fact currently if any page in a section is repeatable it's expected that all pages in that section will be
            // repeatable
            if (section && repeatablePage) {
                if (!state[section.name]) {
                    state[section.name] = sectionState = [];
                }
                // Make sure the right number of items
                const requiredIterations = reach(
                    state,
                    repeatablePage.repeatField
                );
                if (requiredIterations < sectionState.length) {
                    state[section.name] = sectionState.slice(
                        0,
                        requiredIterations
                    );
                } else {
                    for (
                        let i = sectionState.length;
                        i < requiredIterations;
                        i++
                    ) {
                        sectionState.push({});
                    }
                }
            }

            if (
                section?.repeatableSection &&
                (section.numberComp || section.conditionComp)
            ) {
                const numCompValue =
                    parseInt(state[section.numberComp], 10) || 0;

                const conditionCompId = section.conditionComp;
                let conditionCompValue = 0;
                Object.entries(sectionState).forEach(([key, value]) => {
                    const compId = key.split("-")[0];
                    if (compId === conditionCompId && value) {
                        conditionCompValue = conditionCompValue + 1;
                    }
                });

                const totalIterations = numCompValue + conditionCompValue;
                if (!isNaN(totalIterations) && totalIterations > 0) {
                    // Expand the section into repeated sections
                    try {
                        const repeatableSectionPages = groupBySectionNumber(
                            sectionPages
                        );
                        repeatableSectionPages?.forEach(
                            (sectionPage, index) => {
                                const subItems: any[] = [];

                                sectionPage?.forEach((page) => {
                                    subItems.push(
                                        ...this.processFormItems(
                                            page,
                                            sectionState,
                                            request,
                                            model
                                        )
                                    );
                                });
                                // If section has both numberComp and conditionComp,
                                // then hide all conditionComps in summary where value is true, i.e. not the last conditionComp
                                if (
                                    section.numberComp &&
                                    section.conditionComp
                                ) {
                                    subItems.forEach((comp, index) => {
                                        const compId = comp.name.split("-")[0];
                                        if (
                                            compId === conditionCompId &&
                                            comp.rawValue == true
                                        ) {
                                            subItems.splice(index, 1);
                                        } else if (
                                            compId === conditionCompId &&
                                            (comp.rawValue == false ||
                                                comp.rawValue === undefined)
                                        ) {
                                            comp.value = "No";
                                            comp.rawValue = false;
                                            if (state[section.name]) {
                                                if (
                                                    !state[section.name][
                                                    comp.name
                                                    ]
                                                ) {
                                                    state[section.name][
                                                        comp.name
                                                    ] = false;
                                                }
                                            }
                                        }
                                    });
                                }
                                this.addSectionDetails(
                                    details,
                                    section,
                                    subItems,
                                    repeatablePage,
                                    state,
                                    sectionState,
                                    index + 1
                                );
                            }
                        );
                    } catch (e: any) {
                        debugConsoleLog(e);
                    }
                } else {
                    // No valid numComp value; keep the section as-is
                    try {
                        sectionPages?.forEach((page) => {
                            items.push(
                                ...this.processFormItems(
                                    page,
                                    sectionState,
                                    request,
                                    model
                                )
                            );
                        });
                        this.addSectionDetails(
                            details,
                            section,
                            items,
                            repeatablePage,
                            state,
                            sectionState
                        );
                    } catch (e: any) {
                        debugConsoleLog(e);
                    }
                }
            } else {
                // Section is not repeatable; keep the section as-is
                try {
                    sectionPages?.forEach((page) => {
                        items.push(
                            ...this.processFormItems(
                                page,
                                sectionState,
                                request,
                                model
                            )
                        );
                    });
                    this.addSectionDetails(
                        details,
                        section,
                        items,
                        repeatablePage,
                        state,
                        sectionState
                    );
                } catch (e: any) {
                    debugConsoleLog(e);
                }
            }
        });

        return details;
    }

    private getRelevantPages(model: FormModel, state: FormSubmissionState) {
        let nextPage = model.startPage;
        const relevantPages: any[] = [];
        let endPage = null;

        while (nextPage != null) {
            if (nextPage.hasFormComponents) {
                relevantPages.push(nextPage);
            } else if (
                !nextPage.hasNext &&
                !(nextPage instanceof SummaryPageController)
            ) {
                endPage = nextPage;
            }
            nextPage = nextPage.getNextPage(state, true);
        }

        return { relevantPages, endPage };
    }

    get validatedWebhookData() {
        const result = formSchema.validate(this._webhookData, {
            abortEarly: false,
            stripUnknown: true,
        });
        return result.value;
    }

    get webhookDataPaymentReference() {
        const fees = this._webhookData?.fees;

        if (fees && fees.paymentReference) {
            return fees.paymentReference;
        }

        return "";
    }

    set webhookDataPaymentReference(paymentReference: string) {
        const fees = this._webhookData?.fees;
        if (fees) {
            fees.paymentReference = paymentReference;
        }
    }

    get outputs() {
        return this._outputs;
    }

    set outputs(value) {
        this._outputs = value;
    }

    get payApiKey() {
        if (isMultipleApiKey(this._payApiKey)) {
            return config.apiEnv === "production"
                ? this._payApiKey.production ?? this._payApiKey.test
                : this._payApiKey.test ?? this._payApiKey.production;
        }
        return this._payApiKey;
    }

    /**
     * If a declaration is defined, add this to {@link this._webhookData} as a question has answered `true` to
     */
    addDeclarationAsQuestion() {
        this._webhookData?.questions?.push({
            category: null,
            question: "Declaration",
            fields: [
                {
                    key: "declaration",
                    title: "Declaration",
                    type: "boolean",
                    answer: true,
                },
            ],
        });
    }

    private addFeedbackSourceDataToWebhook(
        webhookData,
        model: FormModel,
        request
    ) {
        if (model.def.feedback?.feedbackForm) {
            const feedbackContextInfo = decodeFeedbackContextInfo(
                request.url.searchParams.get(feedbackReturnInfoKey)
            );

            if (feedbackContextInfo) {
                webhookData.questions.push(
                    ...FEEDBACK_CONTEXT_ITEMS.map((item) => ({
                        category: null,
                        question: item.display,
                        fields: [
                            {
                                key: item.key,
                                title: item.display,
                                type: "string",
                                answer: item.get(feedbackContextInfo),
                            },
                        ],
                    }))
                );
            }
        }
        return webhookData;
    }

    private processFormItems(
        page,
        sectionState,
        request,
        model: FormModel,
        items: any[] = []
    ): any[] {
        for (const component of page.components.formItems) {
            const item = Item(request, component, sectionState, page, model);

            if (items.find((cbItem) => cbItem.name === item.name)) continue;
            items.push(item);

            if (component.items) {
                const selectedValue = sectionState[component.name];
                const selectedItem = component.items.filter(
                    (i) => i.value === selectedValue
                )[0];
                if (selectedItem && selectedItem.childrenCollection) {
                    for (const cc of selectedItem.childrenCollection
                        .formItems) {
                        const cItem = Item(
                            request,
                            cc,
                            sectionState,
                            page,
                            model
                        );
                        items.push(cItem);
                    }
                }
            }
        }
        return items;
    }

    private addSectionDetails(
        details: object[],
        section,
        items: any[],
        repeatablePage,
        state: FormSubmissionState,
        sectionState,
        index?: number
    ) {
        const sectionName = index ? `${section.name}-${index}` : section?.name;
        const sectionTitle = index
            ? `${section.title} ${index}`
            : section?.title;

        if (items.length > 0) {
            if (Array.isArray(sectionState)) {
                details.push({
                    name: sectionName,
                    title: sectionTitle,
                    items: [
                        ...Array(reach(state, repeatablePage.repeatField)),
                    ].map((_x, i) => items.map((item) => item[i])),
                });
            } else {
                details.push({
                    name: sectionName,
                    title: sectionTitle,
                    items,
                });
            }
        }
    }
}

function gatherRepeatPages(state) {
    if (!!Object.values(state).find((section) => Array.isArray(section))) {
        return state;
    }
    const clonedState = clone(state);
    Object.entries(state)?.forEach(([key, section]) => {
        if (key === "progress") {
            return;
        }
        if (Array.isArray(section)) {
            clonedState[key] = section.map((pages) =>
                Object.values(pages).reduce(
                    (acc: {}, p: any) => ({ ...acc, ...p }),
                    {}
                )
            );
        }
    });
}

function groupBySectionNumber(arr) {
    return arr.reduce((result, page) => {
        const path = page["path"];
        let sectionNumber = getNumberAfterLastHyphen(path);
        if (sectionNumber === null) {
            sectionNumber = 1;
        }
        const sectionIndex = sectionNumber - 1;
        if (!result[sectionIndex]) {
            result[sectionIndex] = [];
        }
        result[sectionIndex].push(page);
        return result;
    }, []);
}

/**
 * Creates an Item object for Details
 */
function Item(
    request,
    component,
    sectionState,
    page,
    model: FormModel,
    params: { num?: number; returnUrl: string } = {
        returnUrl: redirectUrl(request, `${request.path}`),
    }
) {
    const isRepeatable = !!page.repeatField;

    if (isRepeatable && Array.isArray(sectionState)) {
        return sectionState.map((state, i) => {
            const collated = Object.values(state).reduce(
                (acc: {}, p: any) => ({ ...acc, ...p }),
                {}
            );
            return Item(request, component, collated, page, model, {
                ...params,
                num: i + 1,
            });
        });
    }

    const tempsectionState = {
        ...sectionState,
        model,
    };

    const displayValue = component.getDisplayStringFromState(tempsectionState);
    let formattedDisplayValue = displayValue;

    if (
        (component?.type === "Result" || component?.type === "NumberField") &&
        displayValue
    ) {
        if (
            component?.prefixValue === "£" ||
            component?.prefixValue === "€" ||
            component?.options?.prefixValue === "£" ||
            component?.options?.prefixValue === "€"
        ) {
            formattedDisplayValue = numberWithCommas(displayValue);
        }
    }

    return {
        name: component.name,
        path: page.path,
        label: component.localisedString(component.title),
        value: component.getDisplayStringFromState(tempsectionState),
        displayValue: formattedDisplayValue,
        rawValue: sectionState[component.name],
        url: redirectUrl(request, `/${model.basePath}${page.path}`, params),
        pageId: `/${model.basePath}${page.path}`,
        type: component?.type,
        title: component.title,
        dataType: component.dataType,
        result: sectionState.result,
        options:
            component?.type === "NumberField"
                ? {
                    ...component.options,
                    prefixValue: component.prefixValue,
                    suffixValue: component.suffixValue,
                }
                : component.options,
        // If this is the DSI data access component, include the organisation name from section state
        organizationName:
            // Only include organisation name when component.title is present (not null/undefined/empty)
            typeof component.title === "string" && component.title.trim() !== ""
                ? sectionState?.organisationDetails?.name ||
                request.yar.get("state")?.organisationDetails?.name
                : undefined,
    };
}
