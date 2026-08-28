import { merge, reach } from "@hapi/hoek";
import * as querystring from "querystring";
import { messages } from "server/plugins/engine/pageControllers/validationOptions";

import {
    feedbackReturnInfoKey,
    getNumberAfterLastHyphen,
    proceed,
    redirectTo,
} from "../helpers";
import { ComponentCollection } from "../components/ComponentCollection";
import {
    decodeFeedbackContextInfo,
    FeedbackContextInfo,
    RelativeUrl,
} from "../feedback";
import {
    HapiRequest,
    HapiResponseObject,
    HapiResponseToolkit,
} from "server/types";
import { FormModel } from "../models";
import {
    FormData,
    FormPayload,
    FormSubmissionErrors,
    FormSubmissionState,
} from "../types";
import { ComponentCollectionViewModel } from "../components/types";
import { format, parseISO } from "date-fns";
import { trackEvent } from "../../../logging/customTracker";
import _ from "lodash";
import {
    downloadBlobToString,
    downloadBlobDocToJSON,
} from "../../../utils/blobService";
import fs from "fs";
import moment from "moment";
// import { object, string } from "joi";
// import CircularJSON from "circular-json";
import { initializeTableData } from "src/server/utils/tableTabService";
import { setExpressionDataAndConditionEvaluation } from "src/server/utils/calculationService";
import { ComponentTypeEnum, DataImportStatus } from "@xgovformbuilder/model";
import {
    assignFileErrors,
    checkDataImportValidation,
    initializeDataImportStatus,
    lastElementIsNumber,
} from "./utils";
import { debugConsoleLog } from "src/server/utils/commonUtils";

const FORM_SCHEMA = Symbol("FORM_SCHEMA");
const STATE_SCHEMA = Symbol("STATE_SCHEMA");

export class PageControllerBase {
    /**
     * The base class for all page controllers. Page controllers are responsible for generating the get and post route handlers when a user navigates to `/{id}/{path*}`.
     */
    def: {
        name: string;
        feedback?: {
            url?: string;
            feedbackForm?: boolean;
            emailAddress?: string;
        };
        phaseBanner?: {
            phase?: string;
        };
    };
    name: string;
    model: FormModel;
    pageDef: any; // TODO
    path: string;
    title: string;
    condition: any; // TODO
    repeatField: any; // TODO
    section: any; // TODO
    components: ComponentCollection;
    hasFormComponents: boolean;
    hasConditionalFormComponents: boolean;

    // TODO: pageDef type
    constructor(model: FormModel, pageDef: { [prop: string]: any } = {}) {
        const { def } = model;

        // @ts-ignore
        this.def = def;
        // @ts-ignore
        this.name = def.name;
        this.model = model;
        this.pageDef = pageDef;
        this.path = pageDef.path;
        this.title = pageDef.title;
        this.condition = pageDef.condition;
        this.repeatField = pageDef.repeatField;

        // Resolve section
        this.section =
            pageDef.section &&
            model.sections.find((section) => section.name === pageDef.section);

        // Components collection
        const components = new ComponentCollection(pageDef.components, model);
        const conditionalFormComponents = components?.formItems?.filter(
            (c: any) => c.conditionalComponents
        );

        this.components = components;
        this.hasFormComponents = !!components.formItems?.length;
        this.hasConditionalFormComponents = !!conditionalFormComponents?.length;

        this[FORM_SCHEMA] = this.components.formSchema;
        this[STATE_SCHEMA] = this.components.stateSchema;
    }

    containsAnyLetter(str: any) {
        return /[a-zA-Z]/.test(str);
    }
    /**
     * Used for mapping FormData and errors to govuk-frontend's template api, so a page can be rendered
     * @param formData - contains a user's form payload, and any validation errors that may have occurred
     */
    getViewModel(
        formData: FormData | FormSubmissionState,
        iteration?: any, // TODO
        errors?: any // TODO
    ): {
        page: PageControllerBase;
        name: string;
        pageTitle: string;
        sectionTitle: string;
        showTitle: boolean;
        components: ComponentCollectionViewModel;
        errors: FormSubmissionErrors;
        isStartPage: boolean;
        isAuthenticated: boolean;
        startPage?: HapiResponseObject;
        backLink?: string;
        phaseTag?: string | undefined;
        accessibilityLink?: string;
        cookiesLink?: string;
        privacyLink?: string;
    } {
        let showTitle = true;
        let pageTitle = this.title;
        let sectionTitle = this.section?.title;
        if (sectionTitle && iteration !== undefined) {
            sectionTitle = `${sectionTitle} ${iteration}`;
        }
        if (sectionTitle) {
            const pageSequence = Number(this.pageDef.pageSequence);
            if (!isNaN(pageSequence) && pageSequence > 0) {
                sectionTitle = `${sectionTitle} ${pageSequence}`;
            }
        }
        let isAuthenticated;
        /* if UKPRN available then update isAuthenticated flag */
        if (formData?.ukprn) {
            isAuthenticated = true;
        }
        const components = this.components.getViewModel(
            formData,
            errors
            // this.model.conditions
        );
        trackEvent("PageControllerBase:components list", {
            formData,
            errors,
            components,
        });
        const formComponents = components?.filter((c) => {
            if (c?.isFormComponent) return c.isFormComponent;
            return [];
        });
        const hasSingleFormComponent = formComponents?.length === 1;
        const singleFormComponent = hasSingleFormComponent
            ? formComponents[0]
            : null;
        const singleFormComponentIsFirst =
            singleFormComponent && singleFormComponent === components[0];

        if (singleFormComponent && singleFormComponentIsFirst) {
            let label: any = {
                text: singleFormComponent?.model?.summaryHtml,
                isPageHeading: true,
                classes: "govuk-label--xl",
            };
            if (pageTitle) label.text = pageTitle;

            label.isPageHeading = true;
            label.classes = "govuk-label--xl";
            pageTitle = pageTitle || label.text;
            showTitle = false;
        }

        return {
            page: this,
            name: this.name,
            pageTitle,
            sectionTitle,
            showTitle,
            components,
            errors,
            isAuthenticated,
            isStartPage: false,
        };
    }

    /**
     * utility function that checks if this page has any items in the {@link Page.next} object.
     */
    get hasNext() {
        return (
            Array.isArray(this.pageDef.next) && this.pageDef.next?.length > 0
        );
    }

    get next() {
        return (this.pageDef.next || [])
            .map((next: { path: string }) => {
                const { path } = next;
                const page = this.model.pages.find(
                    (page: PageControllerBase) => {
                        return path === page.path;
                    }
                );

                if (!page) {
                    return null;
                }

                return {
                    ...next,
                    page,
                };
            })
            ?.filter((v: {} | null) => !!v);
    }

    /**
     * @param state - the values currently stored in a users session
     * @param suppressRepetition - cancels repetition logic
     */
    getNextPage(state: FormSubmissionState, suppressRepetition = false) {
        if (this.repeatField && !suppressRepetition) {
            const requiredCount = reach(state, this.repeatField);
            const otherRepeatPagesInSection = this.model.pages?.filter(
                (page) => page.section === this.section && page.repeatField
            );
            const sectionState = state[this.section.name] || {};
            if (
                Object.keys(sectionState[sectionState?.length - 1])?.length ===
                otherRepeatPagesInSection?.length
            ) {
                // iterated all pages at least once
                const lastIteration = sectionState[sectionState?.length - 1];
                if (
                    otherRepeatPagesInSection?.length ===
                    this.objLength(lastIteration)
                ) {
                    // this iteration is 'complete'
                    if (sectionState?.length < requiredCount) {
                        return this.findPageByPath(
                            Object.keys(lastIteration)[0]
                        );
                    }
                }
            }
        }

        this.model.def.pages?.forEach((page) => {
            const sectionName = page?.section;
            const components = page?.components;
            components?.forEach((comp) => {
                if (comp?.type === "DSIAccess") {
                    state[comp.name] = state.orgUKPRN;
                    state[sectionName] = {
                        ...state[sectionName],
                        [comp.name]: state.orgUKPRN,
                    };
                }

                // Ensure NumberField values in state are numbers (not strings)
                if (comp?.type === "NumberField") {
                    const toNumber = (val: any) => {
                        if (val === null || val === undefined) return val;
                        if (typeof val === "object") return val;
                        const s = String(val).trim();
                        // preserve blank values as undefined so validation treats them as missing
                        if (s === "") return undefined;
                        // strip common thousands separators then try to convert
                        const cleaned = s.replace(/,/g, "");
                        const n = Number(cleaned);
                        return Number.isNaN(n) ? undefined : n;
                    };

                    // Root-level value
                    if (state && state[comp.name] !== undefined) {
                        state[comp.name] = toNumber(state[comp.name]);
                    }

                    // Sectioned value (could be object or array for repeatable sections)
                    if (sectionName && state[sectionName] !== undefined) {
                        const sec = state[sectionName];
                        if (Array.isArray(sec)) {
                            state[sectionName] = sec.map((entry: any) => {
                                if (!entry) return entry;
                                // entry might be a direct map of component names or an object of pages
                                if (entry[comp.name] !== undefined) {
                                    entry[comp.name] = toNumber(
                                        entry[comp.name]
                                    );
                                } else {
                                    // check nested page objects inside the entry
                                    Object.keys(entry).forEach((k) => {
                                        if (
                                            entry[k] &&
                                            typeof entry[k] === "object" &&
                                            entry[k][comp.name] !== undefined
                                        ) {
                                            entry[k][comp.name] = toNumber(
                                                entry[k][comp.name]
                                            );
                                        }
                                    });
                                }
                                return entry;
                            });
                        } else if (typeof sec === "object" && sec !== null) {
                            if (sec[comp.name] !== undefined) {
                                state[sectionName][comp.name] = toNumber(
                                    sec[comp.name]
                                );
                            } else {
                                // check nested page objects inside the section object
                                Object.keys(sec).forEach((k) => {
                                    if (
                                        sec[k] &&
                                        typeof sec[k] === "object" &&
                                        sec[k][comp.name] !== undefined
                                    ) {
                                        sec[k][comp.name] = toNumber(
                                            sec[k][comp.name]
                                        );
                                    }
                                });
                            }
                        }
                    }
                }
            });
        });

        /**
         * Bug No. [141761]
         * Pull values from section state to the root of state, to ensure
         * proper execution of condition. This, in turn, ensures proper page navigation
         */
        let sectionState = {};
        const sections = this.def.sections ?? [];
        sections?.forEach((section: { name: string; title: string }) => {
            const tempState = state[section.name] ?? {};
            sectionState = { ...sectionState, ...tempState };
        });

        let defaultLink;
        const nextLink = this.next.find((link) => {
            let { condition }: { condition: string } = link;
            const selectedCondition = this.model.conditions[condition];
            const path = this.path;
            let sectionComponents = {};
            for (const compId in sectionState) {
                const compIdPart = compId.includes("-")
                    ? Number(compId.split("-")[1])
                    : null;

                if (
                    compIdPart === getNumberAfterLastHyphen(path) ||
                    (compIdPart === 1 &&
                        getNumberAfterLastHyphen(path) === null)
                ) {
                    const compName = compId.split("-")[0];
                    const compValue = sectionState[compId];
                    sectionComponents = {
                        ...sectionComponents,
                        [compName]: compValue,
                    };
                }
            }
            // trackEvent(
            //     "conditionEvaluation",
            //     {
            //         sectionComponents,
            //         condition,
            //     },
            //     false
            // );

            if (condition && condition !== "") {
                if (selectedCondition && selectedCondition.fn) {
                    const result = selectedCondition.fn({
                        ...state,
                        ...sectionState,
                        ...sectionComponents,
                    });
                    return result;
                }
            }
            defaultLink = link;
            return false;
        });
        return nextLink?.page ?? defaultLink?.page;
    }

    // TODO: type
    /**
     * returns the path to the next page
     */
    getNext(state: any) {
        const nextPage = this.getNextPage(state);
        const query = { num: 0 };
        let queryString = "";
        if (nextPage?.repeatField) {
            const requiredCount = reach(state, nextPage.repeatField);
            const otherRepeatPagesInSection = this.model.pages?.filter(
                (page) => page.section === this.section && page.repeatField
            );
            const sectionState = state[nextPage.section.name];
            const lastInSection =
                sectionState?.[sectionState?.length - 1] ?? {};
            const isLastComplete =
                Object.keys(lastInSection)?.length ===
                otherRepeatPagesInSection?.length;
            query.num = sectionState
                ? isLastComplete
                    ? this.objLength(sectionState) + 1
                    : this.objLength(sectionState)
                : 1;

            if (query.num <= requiredCount) {
                queryString = `?${querystring.encode(query)}`;
            }
        }

        if (nextPage) {
            let newPath;
            let condName = false;
            const currentPath = this.path;
            let condGiven;
            this.components.formItems?.forEach((item) => {
                nextPage.def.pages.find((x, index) => {
                    if (x.path === currentPath) {
                        let currentIndex = index;
                        Object.entries(this.model?.conditions)?.forEach(
                            ([key, value]) => {
                                const v = value.value.conditions;
                                v?.forEach((sub) => {
                                    if (sub.value && !Number(sub.value.value)) {
                                        x.next.find((next, i) => {
                                            currentIndex = i;
                                            let toBool = (string) => {
                                                if (
                                                    string === "true" ||
                                                    string === "Yes" ||
                                                    string === true
                                                ) {
                                                    return true;
                                                } else if (
                                                    string === "false" ||
                                                    string === "No" ||
                                                    string === false
                                                ) {
                                                    return false;
                                                }
                                                return string;
                                            };
                                            let subValue = toBool(
                                                sub.value.value
                                            );
                                            // Look for the field value in the entire state
                                            condName = toBool(
                                                state[sub.field.name] !==
                                                    undefined
                                                    ? state[sub.field.name]
                                                    : Object.values(state).find(
                                                          (section) =>
                                                              section &&
                                                              section[
                                                                  sub.field.name
                                                              ] !== undefined
                                                      )?.[sub.field.name]
                                            );

                                            // Only update newPath if either:
                                            // 1. This is the first subcondition (no coordinator)
                                            // 2. This is an 'or' condition and it evaluates to true
                                            // 3. This is an 'and' condition and previous condition was true
                                            if (
                                                (!sub.coordinator &&
                                                    subValue === condName) ||
                                                (sub.coordinator === "or" &&
                                                    subValue === condName) ||
                                                (sub.coordinator === "and" &&
                                                    subValue === condName &&
                                                    newPath === next.path)
                                            ) {
                                                if (
                                                    value.name ===
                                                    next.condition
                                                ) {
                                                    newPath = next.path;
                                                }
                                            } else if (
                                                sub.coordinator === "and"
                                            ) {
                                                // Reset path if 'and' condition fails
                                                newPath = null;
                                            }
                                        });
                                    }
                                });
                            }
                        );
                        condGiven = x.next[currentIndex]?.condition;

                        if (!condName && !condGiven) {
                            return this.defaultNextPath;
                        }
                    }
                });
            });
            if (newPath) {
                return `/${this.model.basePath || ""}${newPath}${queryString}`;
            }
            return `/${this.model.basePath || ""}${
                nextPage.path
            }${queryString}`;
        }
        return this.defaultNextPath;
    }

    // TODO: types
    /**
     * gets the state for the values that can be entered on just this page
     */
    getFormDataFromState(state: any, atIndex: number): FormData {
        let pageState = state;

        if (this.section) {
            pageState = state[this.section.name] ?? state;
            if (state.dataImportStatus) {
                pageState.dataImportStatus = state.dataImportStatus;
            }
        }

        if (this.repeatField) {
            const repeatedPageState =
                pageState?.[atIndex ?? (pageState?.length - 1 || 0)] ?? {};
            const values = Object.values(repeatedPageState);

            const newState = values?.length
                ? values.reduce(
                      (acc: any, page: any) => ({ ...acc, ...page }),
                      {}
                  )
                : {};

            return this.components.getFormDataFromState(
                newState as FormSubmissionState
            );
        }

        return this.components.getFormDataFromState(pageState || {});
    }

    getStateFromValidForm(formData: FormPayload) {
        return this.components.getStateFromValidForm(formData);
    }

    /**
     * Parses the errors from joi.validate so they can be rendered by govuk-frontend templates
     * @param validationResult - provided by joi.validate
     */
    getErrors(validationResult): FormSubmissionErrors | undefined {
        if (validationResult && validationResult.error) {
            const isoRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

            return {
                titleText: this.errorSummaryTitle,
                errorList: validationResult.error.details.map((err) => {
                    const name = err.path
                        .map((name: string, index: number) =>
                            index > 0 ? `__${name}` : name
                        )
                        .join("");

                    return {
                        path: err.path.join("."),
                        href: `#${name}`,
                        name: name,

                        text: err.message.replace(isoRegex, (text) => {
                            return format(parseISO(text), "d MMMM yyyy");
                        }),
                    };
                }),
            };
        }

        return undefined;
    }

    /**
     * Runs {@link joi.validate}
     * @param value - user's answers
     * @param schema - which schema to validate against
     */
    validate(value, schema) {
        const result = schema.validate(value, this.validationOptions);
        const errors = result.error ? this.getErrors(result) : null;
        trackEvent("makePostRouteHandler:ValidationError", {
            errors: errors,
            result: result,
        });
        return { value: result.value, errors };
    }

    validateForm(payload) {
        return this.validate(payload, this.formSchema);
    }

    validateState(newState) {
        return this.validate(newState, this.stateSchema);
    }

    /**
     * returns the language set in a user's browser. Can be used for localisable strings
     */
    langFromRequest(request: HapiRequest) {
        const lang = request.query.lang || request.yar.get("lang") || "en";
        if (lang !== request.yar.get("lang")) {
            request.i18n.setLocale(lang);
            request.yar.set("lang", lang);
        }
        return request.yar.get("lang");
    }

    /**
     * Returns an async function. This is called in plugin.ts when there is a GET request at `/{id}/{path*}`
     */
    getConditionEvaluationContext(
        model: FormModel,
        state: FormSubmissionState
    ) {
        //Note: This function does not support repeatFields right now

        let relevantState: FormSubmissionState = {};
        //Start at our startPage
        let nextPage = model.startPage;

        //While the current page isn't null
        while (nextPage != null) {
            //Either get the current state or the current state of the section if this page belongs to a section
            const currentState =
                (nextPage.section ? state[nextPage.section.name] : state) ?? {};
            let newValue = {};
            newValue["result"] = state.result;
            newValue["previousPage"] = state.previousPage;
            newValue["orgUKPRN"] = state?.orgUKPRN;
            //Iterate all components on this page and pull out the saved values from the state
            for (const component of nextPage?.components?.items) {
                newValue[component?.name] = currentState[component.name];
                if (component?.type === "Result" && state.result) {
                    component.expression = state.result[`${component.name}`];
                }
            }

            debugConsoleLog("inside getConditionEvaluationContext");

            if (nextPage.section) {
                newValue = {
                    [nextPage.section.name]: newValue,
                    result: state.result,
                };
            }
            //Combine our stored values with the existing relevantState that we've been building up
            relevantState = merge(relevantState, newValue);

            //By passing our current relevantState to getNextPage, we will check if we can navigate to this next page (including doing any condition checks if applicable)
            nextPage = nextPage.getNextPage(relevantState);
            //If a nextPage is returned, we must have taken that route through the form so continue our iteration with the new page
        }

        return relevantState;
    }

    getFileId(currentpage) {
        let selectedDataset = {
            fileId: null,
            dataset: null,
        };
        currentpage?.components?.filter((component) => {
            if (component?.type === ComponentTypeEnum.TableDataset) {
                //@ts-ignore
                const dataset = this.def.designedDataSets.find(
                    (data) => data.id === component.content
                );
                selectedDataset = {
                    fileId: dataset?.csvUsed ?? "",
                    dataset: component.content ?? "",
                };
                trackEvent(
                    "pageController:getFileId:foundTableDataset",
                    {
                        pagePath: currentpage?.path,
                        componentName: component?.name,
                        componentContent: component?.content,
                        datasetCsvUsed: dataset?.csvUsed,
                        selectedDataset,
                    },
                    false
                );
            }
        });
        trackEvent(
            "1.5a_pageController:getFileId:completed",
            {
                pagePath: currentpage?.path,
                selectedDataset,
                hasTableDataset: !!selectedDataset.dataset,
            },
            false
        );
        debugConsoleLog("getFileId");
        return selectedDataset;
    }

    /**
     * Cleans special characters from blob data string
     * Handles whitespace anomalies (&nbsp;, non-breaking spaces, etc.) and applies Unicode normalization
     * Preserves legitimate special characters in organization names (e.g., &, -, (, ), etc.)
     */
    private cleanBlobDataString(blobDataString: string): string {
        if (!blobDataString) return blobDataString;
        try {
            return blobDataString
                .replace(/^\uFEFF/, "") // Remove UTF-8 BOM at start of file
                .replace(/&nbsp;/gi, " ") // Replace HTML &nbsp; entity with space
                .replace(/\u00A0/g, " ") // Replace non-breaking space Unicode (&nbsp;) with space
                .replace(/\u200B/g, "") // Remove zero-width space
                .replace(/\u200C/g, " ") // Replace zero-width non-joiner with space
                .replace(/\u200D/g, " ") // Replace zero-width joiner with space
                .normalize("NFKC") // Apply NFKC normalization for deterministic handling
                .trim(); // Remove leading/trailing whitespace
        } catch (e) {
            debugConsoleLog("Error cleaning blob data string:", e);
            return blobDataString;
        }
    }
    /**
     * Sanitizes data values for safe HTML display/rendering
     *
     * ⚠️ IMPORTANT: Use this method ONLY when rendering to HTML templates, NOT on stored data
     *
     * This method escapes HTML special characters to prevent XSS attacks:
     * - & becomes &amp;
     * - < becomes &lt;
     * - > becomes &gt;
     * - " becomes &quot;
     * - ' becomes &#x27;
     *
     * The original data (with unescaped special characters) should be preserved in storage.
     * Database queries MUST use parameterized queries/prepared statements.
     *
     * @param data - The data to escape for HTML rendering
     * @returns HTML-escaped data safe for template rendering
     */
    private sanitizeForDisplay(data: any): any {
        if (typeof data === "string") {
            // HTML escape for display safety only
            return data
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#x27;");
        } else if (Array.isArray(data)) {
            return data.map((item) => this.sanitizeForDisplay(item));
        } else if (data !== null && typeof data === "object") {
            const sanitized = {};
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    sanitized[key] = this.sanitizeForDisplay(data[key]);
                }
            }
            return sanitized;
        }
        return data;
    }

    async getBlobContent(fileId, type, fileName = "", filePath = "") {
        try {
            let blobDataString;
            if (type === "Table") {
                blobDataString = await downloadBlobToString(fileId);
                // Clean whitespace anomalies before parsing
                blobDataString = this.cleanBlobDataString(blobDataString);
                let responseJson;
                try {
                    responseJson = JSON.parse(blobDataString);
                } catch (parseError: any) {
                    const blobDataStringNoBOM = blobDataString.replace(
                        /^\uFEFF/,
                        ""
                    );
                    if (blobDataStringNoBOM !== blobDataString) {
                        responseJson = JSON.parse(blobDataStringNoBOM);
                    } else {
                        trackEvent(
                            "getBlobContent:JSONParseFailed",
                            {
                                fileId,
                                error: parseError?.message || parseError,
                                rawLength: blobDataString?.length,
                                rawPreview: blobDataString?.slice(0, 300),
                            },
                            true
                        );
                        trackEvent(
                            "getBlobContent:JSONParseError",
                            {
                                fileId,
                                fileName,
                                error: parseError?.message,
                            },
                            true
                        );
                        throw parseError;
                    }
                }
                trackEvent(
                    "blobDataRetrieved",
                    { fileId, fileName, blobDataString },
                    false
                );
                debugConsoleLog(
                    "getBlobContent inside function responseJson",
                    responseJson
                );
                return responseJson;
            } else {
                blobDataString = await downloadBlobDocToJSON(
                    fileId,
                    fileName,
                    filePath
                );
                debugConsoleLog(
                    "getBlobContent inside function blobDataString",
                    blobDataString
                );
                return blobDataString;
            }
        } catch (e) {
            trackEvent(
                "1.6_pageController:getBlobContent:error",
                {
                    error: e?.message || e,
                },
                true
            );
            throw e; // Re-throw to allow caller to handle
        }
    }

    getCurrentPage(currentPath, pages) {
        return pages?.filter((page) => page.path === currentPath);
    }

    makeGetRouteHandler() {
        return async (request: HapiRequest, h: HapiResponseToolkit) => {
            try {
                trackEvent(
                    "1.0_pageController:makeGetRouteHandler:start",
                    {
                        path: this.path,
                        formId: this.model?.def?.id,
                        id: request.params.id,
                    },
                    false
                );
                const { cacheService } = request.services([]);
                const lang = this.langFromRequest(request);

                let state = request.yar.get("state");
                const numberComponents = this.def?.pages?.map((page) => {
                    const numberPages = page.components.filter((comp) => {
                        if (comp.type === "NumberField") {
                            return comp.name;
                        }
                    });
                    if (numberPages?.length !== 0) {
                        return numberPages[0];
                    }
                });
                const numberComponentNames = numberComponents
                    .map(function (comp) {
                        return comp?.name;
                    })
                    .filter((el) => el != undefined);
                if (state && numberComponentNames.length > 0) {
                    numberComponentNames.map((comp) => {
                        if (comp in state && state[comp] !== undefined) {
                            state[comp] = isNaN(parseFloat(state[comp]))
                                ? undefined
                                : parseFloat(state[comp]);
                        }
                    });
                }

                const organizationDetails =
                    !state?.organisationDetails &&
                    request.yar.get("organisation")
                        ? request.yar.get("organisation")
                        : state?.organisationDetails;
                trackEvent(
                    "1.1_pageController:makeGetRouteHandler:organizationDetails",
                    {
                        organizationDetailsPresent: !!organizationDetails,
                    },
                    false
                );
                const getUKPRN =
                    request.yar.get("organisation")?.ukprn ??
                    request.yar.get("organisation")
                        ?.DistrictAdministrative_code;

                const progress = [...(state.progress || [])];
                const { num } = request.query;
                const currentPath = `/${this.model.basePath}${this.path}${request.url.search}`;
                const startPage = this.model.def.startPage;
                const formData = this.getFormDataFromState(state, num - 1);
                trackEvent(
                    "1.2_pageController:getFormDataFromState",
                    {
                        currentPath,
                        startPage,
                        crumbValue: formData.value?.crumb,
                        tableDataPresent: !!formData.tableData,
                    },
                    false
                );
                request.server.logger.debug(
                    {
                        data: JSON.stringify({
                            currentPath: currentPath,
                            startPage: startPage,
                            data: formData.value?.crumb,
                        }),
                    },
                    "makeGetRouteHandler-props"
                );
                if (
                    !this.model.options.previewMode &&
                    progress?.length === 0 &&
                    this.path !== `${startPage}`
                ) {
                    // @ts-ignore
                    return startPage!.startsWith("http")
                        ? redirectTo(request, h, startPage!)
                        : redirectTo(
                              request,
                              h,
                              `/${this.model.basePath}${startPage!}`
                          );
                }
                formData.lang = lang;

                const currentPage = this.getCurrentPage(
                    this.path,
                    this.model.def.pages
                );
                trackEvent(
                    "1.3_pageController:getRoute:currentPage",
                    {
                        currentPath: this.path,
                        currentPageCount: currentPage?.length,
                        currentPagePaths: currentPage?.map((p) => p?.path),
                        currentPageComponents: currentPage?.[0]?.components?.map(
                            (c) => ({
                                type: c?.type,
                                name: c?.name,
                                content: c?.content,
                            })
                        ),
                    },
                    false
                );

                /** Initialises table data for tab component in the current page */
                await initializeTableData(
                    request,
                    cacheService,
                    organizationDetails,
                    currentPage,
                    this.def,
                    formData
                );
                trackEvent(
                    "1.4_pageController:initializeTableDataCompleted",
                    {
                        currentPagePath: this.path,
                        organizationDetailsPresent: !!organizationDetails,
                        currentPageComponents: currentPage?.length,
                    },
                    false
                );
                const { fileId, dataset } = this.getFileId(currentPage[0]);
                trackEvent(
                    "1.5_pageController:getRoute:fileIdLookup",
                    {
                        currentPath: this.path,
                        fileId,
                        dataset,
                        currentPageItems: currentPage?.[0]?.components?.length,
                    },
                    false
                );

                if (organizationDetails && fileId) {
                    const blobresponse = await this.getBlobContent(
                        fileId,
                        "Table"
                    );
                    trackEvent(
                        "1.6_pageController:getRoute:blobLoaded",
                        {
                            fileId,
                            dataset,
                            blobSize: JSON.stringify(blobresponse).length,
                            organizationDetailsPresent: !!organizationDetails,
                        },
                        false
                    );
                    formData.tableData = {
                        orgData: organizationDetails ?? {},
                        blobData: blobresponse ?? {},
                        fileId: fileId ?? "",
                        dataset: dataset ?? "",
                    };
                    trackEvent(
                        "1.7_pageController:tableDataLoaded",
                        {
                            fileId,
                            dataset,
                            blobDataPresent: !!blobresponse,
                            orgDataPresent: !!organizationDetails,
                        },
                        false
                    );
                    state = await cacheService.mergeState(
                        request,
                        {
                            formData,
                        },
                        state
                    );
                } else {
                    formData.tableData = {
                        orgData: {},
                        blobData: "",
                        fileId: "",
                        dataset: dataset,
                    };
                    trackEvent(
                        "1.7_pageController:tableDataEmpty",
                        {
                            dataset,
                            currentPagePath: this.path,
                        },
                        false
                    );
                    state = await cacheService.mergeState(
                        request,
                        {
                            formData,
                        },
                        state
                    );
                }
                if (getUKPRN) {
                    formData.ukprn = getUKPRN;
                }
                trackEvent(
                    "1.8_pageController:getBlobContent:tableData",
                    {
                        tableData: {
                            fileId: formData.tableData?.fileId,
                            dataset: formData.tableData?.dataset,
                            blobDataPresent: !!formData.tableData?.blobData,
                        },
                    },
                    false
                );
                /**
                 * We store the original filename for the user in a separate object (`originalFileNames`), however they are not used for any of the outputs. The S3 url is stored in the state.
                 */
                const { originalFilenames } = state;
                if (originalFilenames) {
                    Object.entries(formData)?.forEach(([key, value]) => {
                        if (
                            value &&
                            value === (originalFilenames[key] || {}).location
                        ) {
                            formData[key] =
                                originalFilenames[key].originalFilename;
                        }
                    });
                }

                //Calculate our relevantState, which will filter out previously input answers that are no longer relevant to this user journey
                let relevantState = this.getConditionEvaluationContext(
                    this.model,
                    state
                );
                trackEvent(
                    "1.9_pageController:getRoute:before getViewModel",
                    {
                        relevantStateKeys: Object.keys(
                            relevantState.result || {}
                        ),
                        formDataKeys: Object.keys(formData || {}),
                        formDataOrgData: formData?.tableData?.orgData,
                        formDataBlobData: formData?.tableData?.blobData,
                        formDataFileId: formData?.tableData?.fileId,
                        formDataDataset: formData?.tableData?.dataset,
                        num: num,
                    },
                    false
                );

                let viewModel: any = this.getViewModel(formData, num);
                trackEvent(
                    "1.10_pageController:getRoute:viewModelCreated",
                    {
                        componentCount: viewModel.components?.length,
                        hasTableData: !!formData.tableData,
                    },
                    false
                );

                await initializeDataImportStatus(
                    request,
                    viewModel,
                    state,
                    cacheService
                );
                request.server.logger.debug(
                    {
                        "state-result": JSON.stringify(relevantState.result),
                    },
                    "makeGetRouteHandler-resultComp"
                );
                viewModel.startPage = startPage!.startsWith("http")
                    ? redirectTo(request, h, startPage!)
                    : redirectTo(
                          request,
                          h,
                          `/${this.model.basePath}${startPage!}`
                      );

                this.setPhaseTag(viewModel);
                this.setFeedbackDetails(viewModel, request);

                /**
                 * Content components can be hidden based on a condition. If the condition evaluates to true, it is safe to be kept, otherwise discard it
                 * Filter our components based on their conditions using our calculated state
                 */
                await setExpressionDataAndConditionEvaluation(
                    relevantState,
                    this.containsAnyLetter,
                    viewModel,
                    this.model.def,
                    this.model,
                    organizationDetails
                );

                debugConsoleLog("filtering components in viewModel");

                /**
                 * used for when a user clicks the "back" link. Progress is stored in the state. This is a safer alternative to running javascript that pops the history `onclick`.
                 */
                const lastVisited = progress[progress?.length - 1];
                const repeatSectionCondition =
                    lastVisited?.startsWith(currentPath) &&
                    lastElementIsNumber(lastVisited);
                if (
                    !lastVisited ||
                    !(lastVisited === currentPath) ||
                    repeatSectionCondition
                ) {
                    if (progress[progress?.length - 2] === currentPath) {
                        progress.pop();
                    } else {
                        progress.push(currentPath);
                    }
                }

                state = await cacheService.mergeState(
                    request,
                    { progress },
                    state
                );
                state = await cacheService.setState(state);

                viewModel.backLink = progress[progress?.length - 2];
                viewModel.accessibilityLink = "/accessibility-statement";
                viewModel.cookiesLink = `/cookies`;
                viewModel.privacyLink =
                    "https://www.gov.uk/government/publications/privacy-information-education-providers-workforce-including-teachers/privacy-information-education-providers-workforce-including-teachers";
                let email = "";
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
                viewModel.components?.forEach((item: any) => {
                    if (item?.type === "EmailAddressField") {
                        email =
                            notifyEmail !== "" ? notifyEmail : item.model.value;
                    }
                });
                viewModel.email =
                    state.dsiSignInEmail && notifyEmail === ""
                        ? state.dsiSignInEmail
                        : email;

                debugConsoleLog("getRoute - success");
                return h.view(this.viewName, viewModel);
            } catch (error) {
                debugConsoleLog("getRouteHandler - error");
                trackEvent(
                    "makeGetRouteHandler:Error",
                    {
                        error: error?.message,
                    },
                    true
                );
                request.server.logger.error(
                    {
                        appError: JSON.stringify(error.message),
                    },
                    "makeGetRouteHandler-error"
                );
            }
        };
    }

    /**
     * Returns an async function. This is called in plugin.ts when there is a POST request at `/{id}/{path*}`
     */
    makePostRouteHandler() {
        return async (request: HapiRequest, h: HapiResponseToolkit) => {
            trackEvent(
                "2.0_pageController:makePostRouteHandler:start",
                {
                    path: this.path,
                    formId: this.model?.def?.id,
                    payload: request.payload,
                    components: this.components,
                    state: request.yar.get("state"),
                    id: request.params.id,
                },
                false
            );
            const { cacheService } = request.services([]);
            const hasFilesizeError = request.payload === null;
            const preHandlerErrors = request.pre.errors;
            // This is for when we need to exlude Yes/No Comp when used
            // along with number trigger component for Repeatable Sections
            const ignorePayloadComp = this.model.ignorePayloadComp;
            const payloadPreProcess = {
                ...((request.payload || {}) as FormData),
            };
            delete payloadPreProcess[ignorePayloadComp];
            const payload = !!ignorePayloadComp
                ? { ...payloadPreProcess }
                : ((request.payload || {}) as FormData);
            const numberComponent = this.components.formItems?.filter(
                (form) => {
                    return form?.type === "NumberField";
                }
            );
            const numberComponentNames = numberComponent.map(function (comp) {
                return comp.name;
            });
            /* Convert currency values to number(22,333.00 to 22333) */
            numberComponentNames.map((name) => {
                if (Object.keys(request.payload).includes(name)) {
                    Object.entries(request.payload)?.forEach(([key, value]) => {
                        const pattern = /^[0-9,.-]*$/g;
                        if (pattern.test(value) && key === name) {
                            value = value.replace(/\,/g, "");
                            payload[key] = value;
                        }
                    });
                }
            });
            debugConsoleLog("number component mapping done");

            const formResult: any = this.validateForm(payload);
            trackEvent(
                "2.1_pageController:validateForm",
                {
                    payloadKeys: Object.keys(payload || {}),
                    validationErrorCount:
                        formResult.errors?.errorList?.length ?? 0,
                    hasFilesizeError,
                    preHandlerErrorsCount: preHandlerErrors?.length ?? 0,
                    formResultErrorKeys: formResult.errors,
                },
                false
            );

            trackEvent(
                "2.2_pageController:validationAndGetState",
                {
                    payloadKeys: Object.keys(payload || {}),
                    statePresent: !!request.yar.get("state"),
                    tableData: request.yar.get("state")?.formData?.tableData,
                    formData: request.yar.get("state")?.formData,
                },
                false
            );
            let state = request.yar.get("state");
            trackEvent(
                "2.3_pageController:state details",
                {
                    requestState: state,
                    cacheState: await cacheService.getState(request),
                },
                false
            );
            if (!state) {
                state = await cacheService.getState(request);
                request.yar.set("state", state);
            }
            const { orgUKPRN } = state;
            const { num } = request.query;
            if (state?.dataImportStatus) {
                payload.dataImportStatus = state.dataImportStatus;
                formResult.dataImportStatus = state.dataImportStatus;
            }
            const formData = this.getFormDataFromState(payload, num - 1);
            trackEvent(
                "2.3_pageController:getFormDataFromState:post",
                {
                    formData,
                    state,
                },
                false
            );
            trackEvent(
                "2.4_pageController:postRouteHandler:stateLoaded",
                {
                    statePresent: !!state,
                    formDataPresent: !!state?.formData,
                    tableDataInState: state?.formData?.tableData,
                    path: this.path,
                    queryNum: num,
                },
                false
            );
            if (orgUKPRN) {
                formData.ukprn = orgUKPRN;
            }
            if (state?.formData) {
                formData.tableData = state.formData.tableData;
            } else {
                formData.tableData = {
                    orgData: {},
                    blobData: "",
                    fileId: "",
                    dataset: "",
                };
            }
            trackEvent(
                "2.5_pageController:postRouteHandler:tableDataAssigned",
                {
                    formDataTableData: formData.tableData,
                    stateTableData: state?.formData?.tableData,
                    payloadKeys: Object.keys(payload || {}),
                },
                false
            );
            trackEvent(
                "2.6_pageController:makePostRouteHandler:tableDataset",
                {
                    tableData: {
                        fileId: formData.tableData?.fileId,
                        dataset: formData.tableData?.dataset,
                        blobDataPresent: !!formData.tableData?.blobData,
                    },
                    payloadKeys: Object.keys(payload || {}),
                },
                false
            );

            const originalFilenames = (state || {}).originalFilenames || {};
            let previousPage = "";
            formResult.tableData = formData.tableData;
            const debugFormData = { ...payload, ...formData };
            trackEvent(
                "2.6a_pageController:makePostRouteHandler:before getViewModel",
                {
                    debugFormData,
                    num,
                    formResultErrors: formResult.errors,
                    formDataOrgData: formData?.tableData?.orgData,
                    formDataBlobData: formData?.tableData?.blobData,
                    formDataFileId: formData?.tableData?.fileId,
                    formDataDataset: formData?.tableData?.dataset,
                }
            );
            const viewModel = this.getViewModel(
                debugFormData,
                num,
                formResult.errors
            );
            const undefinedComponents = viewModel.components?.filter(
                (component) => component == null
            );
            const allComponents = viewModel.components?.map(
                (component) => component?.name
            );
            trackEvent(
                "2.7_pageController:makePostRouteHandler:viewModelCreated",
                {
                    componentCount: viewModel.components?.length,
                    undefinedComponentCount: undefinedComponents?.length,
                    undefinedComponents,
                    allComponents,
                },
                false
            );
            const fileAndDataImportFields = viewModel.components
                ?.filter((component) => {
                    return (
                        component?.type === ComponentTypeEnum.FileUploadField ||
                        component?.type === ComponentTypeEnum.DataImport
                    );
                })
                // .filter(Boolean)
                .map((component) => component.model);
            debugConsoleLog("fileAndDataImportFields");
            const progress = state.progress || [];
            request.server.logger.debug(
                { state: JSON.stringify(state) },
                "makepostRouteHandler-1"
            );

            if (typeof payload?.filextensionerror === "object") {
                payload?.filextensionerror?.forEach((item) => {
                    this.validateFileextensionerror(
                        item,
                        formResult,
                        fileAndDataImportFields
                    );
                });
            } else if (typeof payload?.filextensionerror === "string") {
                this.validateFileextensionerror(
                    payload?.filextensionerror,
                    formResult,
                    fileAndDataImportFields
                );
            }

            assignFileErrors(payload, formResult, fileAndDataImportFields);

            // TODO:- Refactor this into a validation method
            if (hasFilesizeError) {
                const reformattedErrors = fileAndDataImportFields.map(
                    (field) => {
                        return {
                            path: field.name,
                            href: `#${field.name}`,
                            name: field.name,
                            text: "The selected file must be smaller than 5MB",
                        };
                    }
                );

                formResult.errors = Object.is(formResult.errors, null)
                    ? { titleText: "Fix the following errors" }
                    : formResult.errors;
                formResult.errors.errorList = reformattedErrors;
            }
            checkDataImportValidation(viewModel, formResult);
            debugConsoleLog("data import validation done");
            /**
             * other file related errors.. assuming file fields will be on their own page. This will replace all other errors from the page if not..
             */
            if (preHandlerErrors) {
                trackEvent(
                    "2.8_pageController:makePostRouteHandler:PreHandlerValidationError",
                    {
                        errors: preHandlerErrors,
                    },
                    false
                );
                const reformattedErrors: any[] = [];
                preHandlerErrors?.forEach((error) => {
                    const reformatted = error;
                    const fieldMeta = fileAndDataImportFields.find(
                        (field) => field.id === error.name
                    );

                    if (typeof reformatted?.text === "string") {
                        /**
                         * if it's not a string it's probably going to be a stack trace.. don't want to show that to the user. A problem for another day.
                         */
                        reformatted.text = reformatted?.text.replace(
                            /%s/,
                            fieldMeta?.label?.text.trim() ?? "the file"
                        );
                        reformattedErrors.push(reformatted);
                    }
                });

                formResult.errors = Object.is(formResult.errors, null)
                    ? { titleText: "Fix the following errors" }
                    : formResult.errors;
                formResult.errors.errorList = reformattedErrors;
            }

            Object.entries(payload)?.forEach(([key, value]) => {
                if (
                    value &&
                    value === (originalFilenames[key] || {}).location
                ) {
                    payload[key] = originalFilenames[key].originalFilename;
                }
            });
            /**
             * If there are any errors, render the page with the parsed errors
             */
            if (formResult.errors) {
                if (
                    formData?.tableData?.fileId ||
                    formData?.tableData?.blobData
                ) {
                    trackEvent(
                        "2.9_pageController:makePostRouteHandler:tableDataValidationError",
                        {
                            fileId: formData?.tableData?.fileId,
                            dataset: formData?.tableData?.dataset,
                            validationErrorCount:
                                formResult.errors?.errorList?.length ?? 0,
                            payloadKeys: Object.keys(payload || {}),
                        },
                        false
                    );
                }
                trackEvent(
                    "2.10_pageController:makePostRouteHandler:formResult ValidationError",
                    {
                        errors: formResult.errors,
                    },
                    false
                );
                trackEvent(
                    "2.11_pageController:makePostRouteHandler:renderWithErrors:formResultErrors",
                    {
                        path: this.path,
                        formId: this.model?.def?.id,
                        payloadKeys: Object.keys(payload || {}),
                        errors: formResult.errors,
                        tableData: formData?.tableData,
                        stateKeys: state ? Object.keys(state) : [],
                    },
                    false
                );
                return await this.renderWithErrors(
                    request,
                    h,
                    payload,
                    num,
                    progress,
                    formResult.errors,
                    formData,
                    state
                );
            }

            const newState = this.getStateFromValidForm(formResult.value);
            const stateResult = this.validateState(newState);
            const oldFullState = structuredClone(state);
            const oldState = {
                value: Object.keys(stateResult.value).reduce((acc, key) => {
                    acc[key] = state.formData[key];
                    return acc;
                }, {}),
                errors: null,
            };
            debugConsoleLog("state validation");

            if (stateResult.errors) {
                trackEvent(
                    "2.12_pageController:makePostRouteHandler:renderWithErrors:stateResultErrors",
                    {
                        path: this.path,
                        formId: this.model?.def?.id,
                        payloadKeys: Object.keys(payload || {}),
                        errors: stateResult.errors,
                        tableData: formData?.tableData,
                        stateKeys: state ? Object.keys(state) : [],
                    },
                    false
                );
                return await this.renderWithErrors(
                    request,
                    h,
                    payload,
                    num,
                    progress,
                    stateResult.errors,
                    formData,
                    state
                );
            }
            if (state?.progress?.length > 0) {
                for (const [index, value] of state?.progress.entries()) {
                    let stringPath = `/${this.model.basePath}${this.path}`;
                    if (value === `/${this.model.basePath}${this.path}`) {
                        previousPage = state?.progress[index];
                    }
                }
            }

            let update = this.section
                ? { [this.section.name]: stateResult.value }
                : stateResult.value;
            update["previousPage"] = previousPage;

            if (this.repeatField) {
                const updateValue = { [this.path]: update[this.section.name] };
                const sectionState = state[this.section.name];
                if (!sectionState) {
                    update = { [this.section.name]: [updateValue] };
                } else if (!sectionState[num - 1]) {
                    sectionState.push(updateValue);
                    update = { [this.section.name]: sectionState };
                } else {
                    sectionState[num - 1] = merge(
                        sectionState[num - 1] ?? {},
                        updateValue
                    );
                    update = { [this.section.name]: sectionState };
                }
            }

            state = await cacheService.mergeState(request, update, state);

            const dateParts = [
                "__day",
                "__month",
                "__year",
                "__ampm",
                "__hour",
                "__minute",
            ];

            const dateComponent = this.components.formItems?.filter((form) => {
                return form?.type === "DateAndTimeField";
            });
            Object.keys(state || {}).forEach((key) => {
                dateComponent?.forEach((component) => {
                    if (component.name === key) {
                        Object.keys(state[key] || {}).forEach((nestedKey) => {
                            const isDatePart = dateParts.some((part) =>
                                nestedKey.endsWith(part)
                            );

                            if (isDatePart && !(nestedKey in payload)) {
                                delete state[key][nestedKey];
                            }
                        });
                    }
                });
            });
            const fileDownloadState = request.yar.get("file-download");

            if (
                fileDownloadState &&
                Object.keys(fileDownloadState).length > 0
            ) {
                for (const [key, value] of Object.entries(fileDownloadState)) {
                    const pageWithComponent = (
                        this.model?.def?.pages || []
                    ).find((page) =>
                        (page.components || []).some((cmp) => cmp.name === key)
                    );
                    if (pageWithComponent?.section) {
                        const sectionName = pageWithComponent.section;

                        if (state[sectionName] === undefined) {
                            state[sectionName] = { [key]: value };
                        } else {
                            state[sectionName][key] = value;
                        }
                    } else {
                        state[key] = value;
                    }
                }
            }

            request.yar.clear("file-download");

            //Calculate our relevantState, which will filter out previously input answers that are no longer relevant to this user journey
            //This is required to ensure we don't navigate to an incorrect page based on stale state values
            let relevantState = this.getConditionEvaluationContext(
                this.model,
                state,
                formData
            );
            request.server.logger.debug(
                { relevantState: JSON.stringify(relevantState) },
                "makepostRouteHandler-2"
            );
            trackEvent(
                "2.13_pageController:makePostRouteHandler:success",
                {
                    path: this.path,
                    stateKeys: Object.keys(state || {}),
                },
                false
            );
            state = await cacheService.setState(state);
            return this.proceed(
                request,
                h,
                relevantState,
                oldState.value,
                oldFullState
            );
        };
    }

    validateFileextensionerror(
        fileextensionerror: string,
        formResult: {},
        fileFields: any
    ) {
        if (fileextensionerror.split("_")[0] === "true") {
            const reformattedErrors = fileFields.map((field) => {
                if (field.name === fileextensionerror.split("_")[1]) {
                    return {
                        path: field.name,
                        href: `#${field.name}`,
                        name: field.name,
                        text:
                            "Incorrect file type. Choose a file type as mentioned in the help text",
                    };
                }
            });
            formResult.errors = {
                titleText: "Fix the following errors",
            };
            formResult.errors.errorList = reformattedErrors?.filter(function (
                value,
                index,
                arr
            ) {
                return value !== undefined;
            });
        } else if (
            fileextensionerror === "default value" &&
            formResult.errors?.errorList?.length === 1 &&
            formResult.errors?.errorList[0]?.text ===
                '"filextensionerror" is not allowed'
        ) {
            formResult.errors = null;
        }
        let isThereFileExtensionError = false;
        formResult.errors?.errorList?.forEach((item) => {
            if (item.name === "filextensionerror") {
                isThereFileExtensionError = true;
            }
        });
        if (
            formResult.errors?.errorList?.length > 1 &&
            isThereFileExtensionError &&
            fileextensionerror === "default value"
        ) {
            formResult.errors?.errorList.forEach((item, index) => {
                if (item.name === "filextensionerror") {
                    formResult.errors?.errorList.splice(index, 1);
                }
            });
        }
    }

    setFeedbackDetails(viewModel, request) {
        const feedbackContextInfo = this.getFeedbackContextInfo(request);
        if (feedbackContextInfo) {
            viewModel.name = feedbackContextInfo.formTitle;
        }
        // setting the feedbackLink to undefined here for feedback forms prevents the feedback link from being shown
        if (this.def.feedback?.url) {
            viewModel.feedbackLink = this.feedbackUrlFromRequest(request);
        }
        if (this.def.feedback?.emailAddress) {
            viewModel.feedbackLink = `mailto:${this.def.feedback.emailAddress}`;
        }
    }

    getFeedbackContextInfo(request: HapiRequest) {
        if (this.def.feedback?.feedbackForm) {
            return decodeFeedbackContextInfo(
                request.url.searchParams.get(feedbackReturnInfoKey)
            );
        }
    }

    feedbackUrlFromRequest(request: HapiRequest): string | void {
        if (this.def.feedback?.url) {
            let feedbackLink = new RelativeUrl(this.def.feedback.url);
            const returnInfo = new FeedbackContextInfo(
                this.model.name,
                this.pageDef.title,
                `${request.url.pathname}${request.url.search}`
            );
            feedbackLink.setParam(feedbackReturnInfoKey, returnInfo.toString());
            return feedbackLink.toString();
        }
    }

    makeGetRoute() {
        return {
            method: "get",
            path: this.path,
            options: this.getRouteOptions,
            handler: this.makeGetRouteHandler(),
        };
    }

    makePostRoute() {
        return {
            method: "post",
            path: this.path,
            options: this.postRouteOptions,
            handler: this.makePostRouteHandler(),
        };
    }

    findPageByPath(path: string) {
        return this.model.pages.find((page) => page.path === path);
    }

    /**
     * Controls navigation after a form page is submitted.
     * - If repeat count increases, redirects to the first page of the new repeat iteration.
     * - If repeat count decreases, redirects to the last page of the current iteration.
     * - If repeat count increased/decreased and any number component utilised in calculation then user has to navigate through all pages of the form.
     * - Otherwise, redirects to summary page if on last page of section or not in a section.
     * - If none of the above, proceeds to the next page in the form flow.
     */
    proceed(
        request: HapiRequest,
        h: HapiResponseToolkit,
        state,
        oldstate?: any,
        oldfullstate?: any
    ) {
        const returnUrl = request.query.returnUrl;
        let iteration;

        // Detect repeat count change (increase)
        let previousRepeatCount = 0;
        let currentRepeatCount = 0;
        let repeatSectionName = this.section ? this.section.name : null;
        let repeatSectionObj = this.section;
        let repeatFieldValue = null;
        let iterationthroughRQ = false;

        // If section is null, try to find the section by matching page components to numberComp/conditionComp
        if (
            !this.section &&
            this.components &&
            this.components.formItems &&
            this.components.formItems.length > 0
        ) {
            const pageComponentNames = this.components.formItems.map(
                (c) => c.name
            );
            // Search all sections for a match
            for (const section of this.model.sections) {
                if (
                    (section.numberComp &&
                        pageComponentNames.includes(section.numberComp)) ||
                    (section.conditionComp &&
                        pageComponentNames.includes(section.conditionComp))
                ) {
                    repeatSectionName = section.name;
                    repeatSectionObj = section;
                    break;
                }
            }
        }

        const orderedPaths: string[] = [];
        const visitedPaths = new Set<string>();
        let currentPath: string | null = this.path;

        while (currentPath && !visitedPaths.has(currentPath)) {
            visitedPaths.add(currentPath);
            orderedPaths.push(currentPath);

            const currentPage = this.model.pages.find(
                (p) => p.path === currentPath
            );
            if (!currentPage || !Array.isArray(currentPage.next)) break;

            let nextPath: string | null = null;

            for (const next of currentPage.next) {
                if (!next.condition) {
                    nextPath = next.path; // fallback / else path
                    break;
                }

                const cond = this.model.conditions[next.condition];
                if (cond && cond.fn && cond.fn({ ...state })) {
                    nextPath = next.path; // first satisfied condition wins
                    break;
                }
            }

            currentPath = nextPath;
        }
        const sectionPages = this.model.pages.filter(
            (p) =>
                p.section &&
                p.section.name ===
                    (this.section ? this.section.name : repeatSectionName)
        );
        const orderedSectionPages = [...sectionPages]
            .filter((page) => orderedPaths.includes(page.path))
            .sort(
                (a, b) =>
                    orderedPaths.indexOf(a.path) - orderedPaths.indexOf(b.path)
            );
        // Only handle returnUrl if it's a relative path (starts with "/")
        if (typeof returnUrl === "string" && returnUrl.startsWith("/")) {
            // If in a section or identified repeatSectionObj, handle repeat logic
            if (this.section || repeatSectionObj) {
                const isRepeatableOrConditionalSection =
                    !!repeatSectionObj?.repeatableSection ||
                    !!repeatSectionObj?.numberComp ||
                    !!repeatSectionObj?.conditionComp;

                if (!isRepeatableOrConditionalSection) {
                    // When editing from summary in a normal non-repeatable section,
                    // check for changes and jump to affected result pages
                    const prevState = oldstate
                        ? oldstate
                        : request.yar.get("state");
                    return this.CustomRedirecttoResultpage(
                        returnUrl,
                        h,
                        repeatSectionObj,
                        false,
                        null,
                        request,
                        state,
                        prevState,
                        oldfullstate
                    );
                }
                let sectionParams = request.yar.get(
                    "previous_" + repeatSectionObj.numberComp
                );

                if (sectionParams) {
                    previousRepeatCount = Number(sectionParams) || 0;
                }

                if (
                    repeatSectionObj.numberComp &&
                    state[repeatSectionObj.numberComp] !== undefined
                ) {
                    repeatFieldValue = state[repeatSectionObj.numberComp];
                } else if (
                    repeatSectionObj.conditionComp &&
                    state[repeatSectionObj.conditionComp] !== undefined
                ) {
                    repeatFieldValue = state[repeatSectionObj.conditionComp];
                }
                if (repeatFieldValue) {
                    currentRepeatCount = Number(repeatFieldValue) || 0;
                }

                // Determine iteration based on repeat count changes
                if (previousRepeatCount < currentRepeatCount) {
                    iteration = previousRepeatCount + 1;
                } else if (previousRepeatCount > currentRepeatCount) {
                    iteration = currentRepeatCount;
                } else {
                    //iteration = previousRepeatCount;
                    if (
                        repeatSectionObj.conditionComp &&
                        repeatSectionObj.triggerCompValue
                    ) {
                        iteration = Number(repeatSectionObj.triggerCompValue);
                    } else {
                        const pathParts = this.path.split("-");
                        const lastPart = pathParts[pathParts.length - 1];
                        if (/^\d+$/.test(lastPart)) {
                            iteration = Number(lastPart);
                        } else if (
                            repeatSectionObj &&
                            repeatSectionObj.repeatableSection &&
                            !/^\d+$/.test(lastPart)
                        ) {
                            iteration = 1;
                        } else {
                            iteration = previousRepeatCount ?? 0;
                        }
                    }
                }

                // Find all pages for the current iteration
                let sectionPagesForIteration;
                if (iteration === 1) {
                    sectionPagesForIteration = sectionPages.filter(
                        (p) => !/-\d+$/.test(p.path)
                    );
                } else {
                    const currentIterationSuffix = `-${iteration}`;
                    sectionPagesForIteration = sectionPages.filter((p) =>
                        p.path.endsWith(currentIterationSuffix)
                    );
                }
                const relevantPages =
                    sectionPagesForIteration.length > 0
                        ? sectionPagesForIteration
                        : sectionPages;
                const condnflowinsectiondetected = relevantPages.some(
                    (p) =>
                        Array.isArray(p.next) &&
                        p.next.length > 1 &&
                        p.next.some((n) => n.condition)
                );
                const isLastPageInSection =
                    relevantPages[relevantPages.length - 1]?.path === this.path;
                // If repeatable section, check for repeat count increase
                if (
                    (this.section && this.section.repeatableSection) ||
                    (repeatSectionName &&
                        repeatSectionObj &&
                        repeatSectionObj.repeatableSection)
                ) {
                    const firstPageOfSection = sectionPages[0]?.path;
                    if (firstPageOfSection) {
                        const baseFirstPage = firstPageOfSection.replace(
                            /-\d+$/,
                            ""
                        );
                        const newRepeatPath = `/${
                            this.model.basePath || ""
                        }${baseFirstPage}-${iteration}`;
                        const urlWithReturn = `${newRepeatPath}?returnUrl=${encodeURIComponent(
                            returnUrl
                        )}`;

                        if (
                            previousRepeatCount !== null &&
                            currentRepeatCount !== null &&
                            currentRepeatCount > previousRepeatCount
                        ) {
                            return h.redirect(urlWithReturn);
                        } else if (
                            previousRepeatCount !== null &&
                            currentRepeatCount !== null &&
                            currentRepeatCount < previousRepeatCount
                        ) {
                            this.pageDef =
                                this.findPageByPath(
                                    relevantPages[relevantPages.length - 1]
                                        ?.path
                                ) || this.pageDef;

                            // Capture previous state for conditional flow re-evaluation
                            const prevState = request.yar.get("state");

                            return this.CustomRedirecttoResultpage(
                                returnUrl,
                                h,
                                repeatSectionObj,
                                false,
                                null,
                                request,
                                state,
                                prevState,
                                oldfullstate
                            );
                        } else if (
                            previousRepeatCount !== null &&
                            currentRepeatCount !== null &&
                            currentRepeatCount === previousRepeatCount
                        ) {
                            iterationthroughRQ = true;
                        }
                    }
                }
                // If last page in section for current iteration, check for result page and redirect to summary
                if (isLastPageInSection && !condnflowinsectiondetected) {
                    // Capture previous state for conditional flow re-evaluation
                    const prevState = request.yar.get("state");

                    return this.CustomRedirecttoResultpage(
                        returnUrl,
                        h,
                        repeatSectionObj,
                        false,
                        null,
                        request,
                        state,
                        prevState,
                        oldfullstate
                    );
                } else if (!condnflowinsectiondetected && iterationthroughRQ) {
                    // iterating through RQ pages only - check for changes and jump to affected pages
                    const prevState = request.yar.get("state");
                    return this.CustomRedirecttoResultpage(
                        returnUrl,
                        h,
                        repeatSectionObj,
                        false,
                        null,
                        request,
                        state,
                        prevState,
                        oldfullstate
                    );
                } else {
                    // Not last page - check for changes and jump to affected result pages instead of going sequentially
                    const prevState = request.yar.get("state");
                    return this.CustomRedirecttoResultpage(
                        returnUrl,
                        h,
                        repeatSectionObj,
                        false,
                        null,
                        request,
                        state,
                        prevState,
                        oldfullstate
                    );
                }
            } else {
                //check whether the page initiated has a conditional flow
                // if (
                //     Array.isArray(this.pageDef.next) &&
                //     this.pageDef.next.length > 1 &&
                //     this.pageDef.next.some((n) => n.condition)
                // ) {
                //     // proceed as conditional flow normal
                //     return proceed(
                //         request,
                //         h,
                //         this.getNext(state),
                //         state.previousPage ?? this.path
                //     );
                // } else {
                // Not in a section and not part of a conditional flow, check result comps and redirect immediately
                // Capture previous state for conditional flow re-evaluation
                const prevState = oldstate
                    ? oldstate
                    : request.yar.get("state");
                return this.CustomRedirecttoResultpage(
                    returnUrl,
                    h,
                    null,
                    true,
                    this,
                    request,
                    state,
                    prevState,
                    oldfullstate
                );
                // }
            }
        }
        //no return url, proceed as normal
        return proceed(request, h, this.getNext(state), state.previousPage);
    }
    async CustomRedirecttoResultpage(
        returnurl: any,
        h: any,
        section: any,
        nonsection: boolean = false,
        page: any,
        request: any,
        state: any,
        newState: any = {},
        oldState: any = {}
    ) {
        // --------------------------------------------------
        // Calculation → Number dependencies
        // Needed to detect Result components that rely on calculations or number components,
        // including nested calculation chains
        // --------------------------------------------------
        const calculationToNumberDeps = this.getCalculationToNumberDeps();

        // --------------------------------------------------
        // State & setup
        // --------------------------------------------------
        // Collect all numberComp names in the section
        const numberCompNames: Set<string> = new Set();
        const resultComponentNames: Set<string> = new Set();
        const { cacheService } = request.services([]);
        let resultPagePath = "";
        let numberCompChanged = false;
        let resultCompChanged = false;
        let branchFullyAnswered = false;

        // --------------------------------------------------
        // Helper: recursively find value by key
        // --------------------------------------------------
        const findValueByKey = (obj: any, targetKey: string): any => {
            if (obj == null || typeof obj !== "object") {
                return undefined;
            }

            // own property only
            if (Object.prototype.hasOwnProperty.call(obj, targetKey)) {
                return obj[targetKey];
            }

            for (const key in obj) {
                const child = obj[key];

                // recurse only into objects
                if (child && typeof child === "object") {
                    const value = findValueByKey(child, targetKey);

                    if (value !== undefined) {
                        return value;
                    }
                }
            }

            return undefined;
        };

        // --------------------------------------------------
        // Helper: Get changed fields between old and new state
        // Supports nested component values
        // --------------------------------------------------
        const getChangedFields = (
            newState: any,
            oldState: any,
            componentNames?: Set<string>
        ): Set<string> => {
            const changedFields = new Set<string>();

            // --------------------------------------------------
            // If componentNames provided,
            // only track component changes
            // --------------------------------------------------
            if (componentNames) {
                for (const key of componentNames) {
                    const oldValue = findValueByKey(oldState, key);
                    const newValue = findValueByKey(newState, key);

                    if (oldValue !== newValue) {
                        changedFields.add(key);
                    }
                }
            } else {
                // Fallback: track all changes if no component names provided
                for (const key in newState) {
                    if (oldState[key] !== newState[key]) {
                        changedFields.add(key);
                    }
                }

                for (const key in oldState) {
                    if (!(key in newState)) {
                        changedFields.add(key);
                    }
                }
            }

            return changedFields;
        };
        // --------------------------------------------------
        // Helper: Evaluate conditional route with old vs new state
        // Returns: { oldRoute, newRoute, changed, mustNavigateAllPages }
        // --------------------------------------------------
        const evaluateConditionalRoutes = (
            page: any,
            newState: any,
            oldState: any,
            alreadyTraversedPaths: Set<string>
        ): any => {
            if (!Array.isArray(page.next) || page.next.length === 0) {
                return {
                    oldRoute: null,
                    newRoute: null,
                    changed: false,
                    mustNavigateAllPages: false,
                };
            }

            const evaluateRoute = (stateToUse: any): string | null => {
                let selectedRoute: string | null = null;

                // Move each section's values up to the root so conditions
                // can find them by their plain field name.
                let sectionState = {};
                const sections = this.model.sections ?? [];
                sections.forEach((sec: { name: string }) => {
                    sectionState = {
                        ...sectionState,
                        ...(stateToUse?.[sec.name] ?? {}),
                    };
                });

                // Map this page's own iteration values (e.g. hmqWgQ-2) onto
                // their plain field name so the right iteration is used.
                const path = page.path;
                let sectionComponents = {};
                for (const compId in sectionState) {
                    const compIdPart = compId.includes("-")
                        ? Number(compId.split("-")[1])
                        : null;

                    if (
                        compIdPart === getNumberAfterLastHyphen(path) ||
                        (compIdPart === 1 &&
                            getNumberAfterLastHyphen(path) === null)
                    ) {
                        const compName = compId.split("-")[0];
                        sectionComponents = {
                            ...sectionComponents,
                            [compName]: sectionState[compId],
                        };
                    }
                }

                for (const next of page.next) {
                    if (!next.condition) {
                        selectedRoute = next.path;
                        break;
                    }

                    const cond = this.model.conditions[next.condition];
                    if (
                        cond &&
                        cond.fn &&
                        cond.fn({
                            ...stateToUse,
                            ...sectionState,
                            ...sectionComponents,
                        })
                    ) {
                        selectedRoute = next.path;
                        break;
                    }
                }

                return selectedRoute;
            };

            const oldRoute = evaluateRoute(oldState);
            const newRoute = evaluateRoute(newState);
            const routeChanged = oldRoute !== newRoute;

            // Determine if all pages in new route must be navigated
            const mustNavigateAllPages =
                routeChanged &&
                newRoute &&
                !alreadyTraversedPaths.has(newRoute);

            return {
                oldRoute,
                newRoute,
                changed: routeChanged,
                mustNavigateAllPages,
            };
        };

        // --------------------------------------------------
        // Helper: Find result components used in conditions
        // --------------------------------------------------
        const getResultComponentsUsedInConditions = (
            allResultComps: any[]
        ): Set<string> => {
            const resultCompsUsed = new Set<string>();

            for (const page of this.model.pages) {
                if (Array.isArray(page.next)) {
                    for (const next of page.next) {
                        if (next.condition) {
                            const cond = this.model.conditions[next.condition];
                            if (cond && cond.expression) {
                                // Find all result component references in the condition
                                for (const resultComp of allResultComps) {
                                    if (
                                        cond.expression.includes(
                                            resultComp.name
                                        )
                                    ) {
                                        resultCompsUsed.add(resultComp.name);
                                    }
                                }
                            }
                        } else if (next.condition === undefined) {
                            for (const resultComp of allResultComps) {
                                resultCompsUsed.add(resultComp.name);
                            }
                        }
                    }
                }
            }

            return resultCompsUsed;
        };

        // --------------------------------------------------
        // Helper: Get all result components
        // --------------------------------------------------
        const getAllResultComponents = (): any[] => {
            const results: any[] = [];
            for (const pg of this.model.pages) {
                if (pg.components && pg.components.items) {
                    for (const comp of pg.components.items) {
                        if (comp.type === "Result") {
                            results.push({
                                name: comp.name,
                                page: pg,
                                component: comp,
                            });
                        }
                    }
                }
            }
            return results;
        };
        function findValue(state, sectionState, key, baseKey) {
            if (sectionState?.[key] != null) return sectionState[key];

            if (state?.[key] != null) return state[key];

            if (baseKey && state?.[baseKey] != null) return state[baseKey];

            for (const obj of Object.values(state ?? {})) {
                if (obj && typeof obj === "object" && !Array.isArray(obj)) {
                    if (obj[key] != null) return obj[key];
                    if (baseKey && obj[baseKey] != null) return obj[baseKey];
                }
            }

            return undefined;
        }

        function areAllPageValuesUndefined(path, state, model) {
            const page = model.pages.find((p) => p.path === path);

            const sectionName = page?.section?.name;

            const fields = page?.components.items.map((c) => c.name) ?? [];

            const sectionState = sectionName ? state?.[sectionName] : state;

            const existingFields = fields.filter((field) =>
                Object.prototype.hasOwnProperty.call(sectionState ?? {}, field)
            );

            return (
                existingFields.length > 0 &&
                existingFields.every(
                    (field) => sectionState[field] === undefined
                )
            );
        }

        function isCalculationValid(state, section, model, compname, path) {
            const sectionState = state?.[section.name];
            if (!sectionState) return false;

            const calculations = model?.def?.calculations?.filter((c) =>
                c.components?.some((comp) =>
                    comp.name.includes("-")
                        ? comp.name.split("-")[0] === compname
                        : comp.name === compname
                )
            );

            if (!calculations?.length) return false;

            const currentIndex = path?.split("-").at(-1);

            return calculations.some((calc) => {
                const baseKeys = calc.computeList
                    .filter((i) => i.type === "component")
                    .map((i) => i.entity);

                return baseKeys.some((base) => {
                    const keyToCheck =
                        currentIndex && !isNaN(currentIndex)
                            ? `${base}-${currentIndex}`
                            : base;

                    const value = findValue(
                        state,
                        sectionState,
                        keyToCheck,
                        base
                    );

                    return value !== undefined && value !== null;
                });
            });
        }
        const thispage = this.model.pages.filter((f) => f.path == this.path)[0];
        const pageComponents = new Set<string>();
        if (thispage && thispage.components && thispage.components.items) {
            for (const comp of thispage.components.items) {
                pageComponents.add(comp.name);
            }
        }
        const changedFieldsinpage = getChangedFields(
            state,
            oldState || {},
            pageComponents
        );
        const changedConditions = Object.keys(this.model.conditions).filter(
            (key) => {
                const conditionName = this.model.conditions[key].name;

                const conditionUsedInList = this.model.lists.some((list) =>
                    list.items?.some((item) => item.condition === conditionName)
                );

                if (!conditionUsedInList) {
                    return false;
                }

                const fieldName =
                    this.model.conditions[key].value?.conditions?.[0]?.field
                        ?.name || "";

                const actualField = fieldName.split(".").pop();

                return changedFieldsinpage.has(actualField);
            }
        );

        if (changedConditions.length > 0) {
            return h.redirect(this.getNext(state));
        }

        if (!nonsection) {
            // Use sectionobj if provided, otherwise filter all pages (for backward compatibility)
            let sectionPages: any[] = [];
            if (section) {
                // Efficient: use passed sectionobj to get pages
                sectionPages = this.model.pages.filter(
                    (p) => p.section && p.section.name === section.name
                );
            }
            // Get component names in this section to track only relevant changes
            const componentNamesInSection = new Set<string>();
            for (const page of sectionPages) {
                if (page.components && page.components.items) {
                    for (const comp of page.components.items) {
                        componentNamesInSection.add(comp.name);
                    }
                }
            }
            if (section.numberComp) {
                componentNamesInSection.add(section.numberComp);
            }

            // Detect changed fields in section (only for components)
            const changedFields = getChangedFields(
                state,
                oldState || {},
                componentNamesInSection
            );
            const changedFieldParts = new Set(
                [...changedFields].map((field) =>
                    field.includes("-") ? field.split("-")[0] : field
                )
            );
            const sectionResultPages: Set<string> = new Set();
            const findNestedValue = (obj, key) => {
                if (obj?.[key] !== undefined) return obj[key];

                for (const value of Object.values(obj || {})) {
                    if (typeof value === "object" && value !== null) {
                        const found = findNestedValue(value, key);

                        if (found !== undefined) {
                            return found;
                        }
                    }
                }

                return undefined;
            };
            // --------------------------------------------------
            // REQUIREMENT 1: Detect changed number components in section
            // --------------------------------------------------
            for (const page of sectionPages) {
                if (page.components?.items) {
                    const hasChangedField = page.components.items.some((comp) =>
                        changedFields.has(comp.name)
                    );
                    if (hasChangedField) {
                        let yesNoFieldChangedValue = null;
                        for (const comp of page.components.items) {
                            if (
                                comp.type === "YesNoField" &&
                                changedFields.has(comp.name)
                            ) {
                                yesNoFieldChangedValue = findNestedValue(
                                    newState,
                                    comp.name
                                );
                            }
                        }
                        if (yesNoFieldChangedValue === true) {
                            const conditionalRoutes = evaluateConditionalRoutes(
                                page,
                                state,
                                oldState || {},
                                new Set<string>()
                            );
                            if (
                                conditionalRoutes.changed &&
                                conditionalRoutes.newRoute
                            ) {
                                // Navigate to new conditional route
                                const urlWithReturn = `/${
                                    this.model.basePath || ""
                                }${
                                    conditionalRoutes.newRoute
                                }?returnUrl=${encodeURIComponent(returnurl)}`;
                                return h.redirect(urlWithReturn);
                            }
                        } else {
                            const hasNumberField = page.components.items.some(
                                (comp) => comp.type === "NumberField"
                            );

                            if (hasChangedField && hasNumberField) {
                                numberCompChanged = true;
                                page.components.items.forEach((comp) => {
                                    if (comp.type === "NumberField") {
                                        const compIdPart = comp.name.includes(
                                            "-"
                                        )
                                            ? comp.name.split("-")[0]
                                            : comp.name;
                                        let validcalc = isCalculationValid(
                                            state,
                                            section,
                                            this.model,
                                            compIdPart,
                                            this.path
                                        );
                                        if (validcalc) {
                                            numberCompNames.add(compIdPart);
                                        }
                                    }
                                });
                            }
                        }
                    } else if (
                        section.numberComp &&
                        changedFields.has(section.numberComp)
                    ) {
                        const hasNumberField = page.components.items.some(
                            (comp) => comp.type === "NumberField"
                        );
                        if (hasNumberField) {
                            numberCompChanged = true;
                            page.components.items.forEach((comp) => {
                                if (comp.type === "NumberField") {
                                    const compIdPart = comp.name.includes("-")
                                        ? comp.name.split("-")[0]
                                        : comp.name;

                                    numberCompNames.add(compIdPart);
                                }
                            });
                        }
                    }
                }
            }
            const currentGroup = this.path.match(/-(\d+)$/)?.[1] ?? "1";

            const allowedPaths = new Set();
            const notAllowedPaths = new Set();
            function findValueByKey(obj, targetKey) {
                if (!obj || typeof obj !== "object") {
                    return undefined;
                }

                if (Object.prototype.hasOwnProperty.call(obj, targetKey)) {
                    return obj[targetKey];
                }

                for (const value of Object.values(obj)) {
                    if (value && typeof value === "object") {
                        const result = findValueByKey(value, targetKey);

                        if (result !== undefined) {
                            return result;
                        }
                    }
                }

                return undefined;
            }
            sectionPages.forEach((page) => {
                const pageGroup = Number(
                    page.path.match(/-(\d+)$/)?.[1] ?? "1"
                );
                const currentGroupNum = Number(currentGroup);

                if (pageGroup === currentGroupNum) {
                    const componentNames =
                        page.components?.items?.map((item) => item.name) ?? [];

                    const allUndefined = componentNames.every((name) => {
                        const value = findValueByKey(state, name);
                        return value === undefined;
                    });
                    const anynumberorcalc = page.components?.items?.some(
                        (item) =>
                            item.type === "NumberField" ||
                            item.type === "Result"
                    );

                    if (allUndefined || anynumberorcalc) {
                        allowedPaths.add(page.path);
                    } else {
                        notAllowedPaths.add(page.path);
                    }
                    return;
                }

                if (pageGroup > currentGroupNum) {
                    const componentNames =
                        page.components?.items?.map((item) => item.name) ?? [];

                    const allUndefined = componentNames.every((name) => {
                        const value = findValueByKey(state, name);
                        return value === undefined;
                    });

                    if (allUndefined) {
                        allowedPaths.add(page.path);
                    } else {
                        notAllowedPaths.add(page.path);
                    }

                    return;
                }

                // pageGroup < currentGroup
                notAllowedPaths.add(page.path);
            });
            const matchingPages = this.model.pages.filter((page) => {
                const pageSectionName = page.section?.name;

                return (
                    (!pageSectionName || pageSectionName === section?.name) &&
                    !notAllowedPaths.has(page.path)
                );
            });
            // --------------------------------------------------
            // REQUIREMENT 2: Find result components depending on changed numbers
            // --------------------------------------------------
            if (numberCompChanged) {
                for (const page of matchingPages) {
                    if (page.components && page.components.items) {
                        for (const comp of page.components.items) {
                            if (comp.type === "Result") {
                                // Direct reference to changed number
                                if (
                                    comp.expression &&
                                    Array.from(numberCompNames).some((name) =>
                                        comp.expression.includes(name)
                                    )
                                ) {
                                    const compIdPart = comp.name.includes("-")
                                        ? comp.name.split("-")[0]
                                        : comp.name;

                                    if (!changedFieldParts.has(compIdPart)) {
                                        resultComponentNames.add(comp.name);
                                        sectionResultPages.add(page.path);
                                    }
                                }
                                // Indirect via calculation
                                else if (
                                    comp.calculationName &&
                                    this.calculationDependsOnChangedNumber(
                                        comp.calculationName,
                                        numberCompNames,
                                        calculationToNumberDeps
                                    )
                                ) {
                                    resultComponentNames.add(comp.name);
                                    sectionResultPages.add(page.path);
                                }
                            }
                        }
                    }
                }
            }
            const allResultComps = getAllResultComponents();

            // --------------------------------------------------
            // REQUIREMENT 3: Check for result components where data changed (by formula/number)
            // --------------------------------------------------
            for (const page of matchingPages) {
                if (page.components && page.components.items) {
                    for (const comp of page.components.items) {
                        const hasUndefinedValue = Object.values(state).some(
                            (obj) =>
                                obj &&
                                typeof obj === "object" &&
                                comp.name in obj &&
                                obj[comp.name] === undefined
                        );
                        const resultDependsOnChangedResult = this.ResultDependsOnChangedResult(
                            comp.calculationName,
                            changedFieldParts,
                            allResultComps
                        );

                        if (
                            comp.type === "Result" &&
                            (changedFields.has(comp.name) ||
                                hasUndefinedValue ||
                                resultDependsOnChangedResult)
                        ) {
                            const compIdPart = comp.name.includes("-")
                                ? comp.name.split("-")[0]
                                : comp.name;
                            if (
                                changedFieldParts.has(compIdPart) ||
                                resultDependsOnChangedResult
                            ) {
                                resultComponentNames.add(comp.name);
                                sectionResultPages.add(page.path);
                            }
                        }
                    }
                }
            }

            // --------------------------------------------------
            // REQUIREMENT 4: Check where result components are used (in other result components)
            // --------------------------------------------------
            const resultCompsUsedInConditions = getResultComponentsUsedInConditions(
                allResultComps
            );

            for (const resultCompName of resultComponentNames) {
                if (resultCompsUsedInConditions.has(resultCompName)) {
                    // Current result component
                    const currentResultComp = allResultComps.find(
                        (s) => s.name === resultCompName
                    );

                    // Current calculation
                    const currentCalculation = this.model.def.calculations.find(
                        (s) =>
                            s.name ===
                            currentResultComp?.component?.calculationName
                    );

                    // Current calculation components
                    const currentCalcComponents =
                        currentCalculation?.components || [];

                    const currentCalcComponentname =
                        currentCalculation?.name || "";

                    // Find pages using this result component
                    for (const page of matchingPages) {
                        if (page.components && page.components.items) {
                            for (const comp of page.components.items) {
                                // Check shared components with other result components
                                const hasSharedComponent = allResultComps.some(
                                    (otherResultComp) => {
                                        // Skip same result component
                                        if (
                                            otherResultComp.name ===
                                            resultCompName
                                        ) {
                                            return false;
                                        }

                                        // Other calculation
                                        const otherCalculation = this.model.def.calculations.find(
                                            (s) =>
                                                s.name ===
                                                otherResultComp.component
                                                    ?.calculationName
                                        );
                                        const otherCalculationMapped =
                                            otherCalculation?.calculationsMapped ||
                                            [];

                                        const otherCalcComponents =
                                            otherCalculation?.components || [];

                                        // Compare component names
                                        return currentCalcComponents.some(
                                            (currComp) =>
                                                otherCalcComponents.some(
                                                    (otherComp) =>
                                                        otherComp.name ===
                                                        currComp.name
                                                ) ||
                                                (otherCalculationMapped &&
                                                    otherCalculationMapped.includes(
                                                        currentCalcComponentname
                                                    ))
                                        );
                                    }
                                );

                                if (
                                    comp.type === "Result" &&
                                    comp.expression &&
                                    (comp.expression.includes(resultCompName) ||
                                        hasSharedComponent)
                                ) {
                                    const compIdPart = comp.name.includes("-")
                                        ? comp.name.split("-")[0]
                                        : comp.name;
                                    if (!changedFieldParts.has(compIdPart)) {
                                        sectionResultPages.add(page.path);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            const conditionalRoutes = evaluateConditionalRoutes(
                this.pageDef,
                state,
                oldState || {},
                new Set<string>()
            );
            // --------------------------------------------------
            // REQUIREMENT 5: Check conditions for number and result component changes
            // --------------------------------------------------
            if (
                (this.pageDef &&
                    Array.isArray(this.pageDef.next) &&
                    this.pageDef.next.length > 1) ||
                (conditionalRoutes && this.pageDef.next.length > 0)
            ) {
                const allUndefined = areAllPageValuesUndefined(
                    conditionalRoutes.newRoute,
                    state,
                    this.model
                );

                if (
                    conditionalRoutes &&
                    (conditionalRoutes.changed || allUndefined) &&
                    (numberCompChanged || resultComponentNames.size > 0)
                ) {
                    debugConsoleLog(
                        `CustomRedirecttoResultpage (section): Conditional route changed due to number/result changes from ${conditionalRoutes.oldRoute} to ${conditionalRoutes.newRoute}`
                    );

                    if (conditionalRoutes.newRoute) {
                        // Navigate to new conditional route
                        const urlWithReturn = `/${this.model.basePath || ""}${
                            conditionalRoutes.newRoute
                        }?returnUrl=${encodeURIComponent(returnurl)}`;
                        return h.redirect(urlWithReturn);
                    }
                }
            }

            // --------------------------------------------------
            // REQUIREMENT 6: Navigate to result pages in order, then to summary
            // --------------------------------------------------

            let actualstate = await cacheService.getState(request);
            const orderedPaths: string[] = [];
            const visitedPaths = new Set<string>();
            let currentPath: string | null = this.path;

            while (currentPath && !visitedPaths.has(currentPath)) {
                visitedPaths.add(currentPath);
                orderedPaths.push(currentPath);

                const currentPage = this.model.pages.find(
                    (p) => p.path === currentPath
                );
                if (!currentPage || !Array.isArray(currentPage.next)) break;

                let nextPath: string | null = null;

                for (const next of currentPage.next) {
                    if (!next.condition) {
                        nextPath = next.path; // fallback / else path
                        break;
                    }
                    const currentPage = this.model.pages.filter(
                        (s) => s.path === next.path
                    );
                    const pathSection = currentPage[0]?.section;

                    const cond = this.model.conditions[next.condition];

                    const conditionData = pathSection
                        ? { ...actualstate[pathSection.name] }
                        : { ...actualstate };
                    if (cond && cond.fn && cond.fn(conditionData)) {
                        nextPath = next.path; // first satisfied condition wins
                        break;
                    }
                }

                currentPath = nextPath;
            }

            // If there are result pages to navigate to, go to first one
            if (
                sectionResultPages.size > 0 &&
                (numberCompChanged || resultComponentNames.size > 0)
            ) {
                const missingAllowedPages = this.model.pages
                    .filter((page) => allowedPaths.has(page.path))
                    .filter((page) => {
                        const items = page.components?.items || [];

                        return items.some((item) => {
                            const componentName = item.name;

                            const hasUndefinedValue = (obj: any): boolean => {
                                if (!obj || typeof obj !== "object") {
                                    return false;
                                }

                                if (
                                    Object.prototype.hasOwnProperty.call(
                                        obj,
                                        componentName
                                    ) &&
                                    obj[componentName] === undefined
                                ) {
                                    return true;
                                }

                                return Object.values(obj).some(
                                    hasUndefinedValue
                                );
                            };

                            return hasUndefinedValue(state);
                        });
                    })
                    .map((page) => page.path);

                const orderedSectionPages = [
                    ...new Set([...sectionResultPages, ...missingAllowedPages]),
                ]
                    .filter((path) => orderedPaths.includes(path))
                    // A candidate page can be wrongly matched just because
                    // another iteration reuses its component names.
                    // Restrict to the same iteration, but not for pages
                    // outside this section - they have no iteration.
                    .filter((path) => {
                        const candidatePage = this.model.pages.find(
                            (p) => p.path === path
                        );
                        if (candidatePage?.section?.name !== section?.name) {
                            return true;
                        }
                        return (
                            (path.match(/-(\d+)$/)?.[1] ?? "1") === currentGroup
                        );
                    })
                    .sort(
                        (a, b) =>
                            orderedPaths.indexOf(a) - orderedPaths.indexOf(b)
                    );
                const resultPageArray = Array.from(orderedSectionPages);
                const currentIndex = resultPageArray.indexOf(this.path);

                const firstResultPage =
                    currentIndex >= 0
                        ? resultPageArray.slice(currentIndex + 1)[0]
                        : resultPageArray[0];
                debugConsoleLog(
                    `CustomRedirecttoResultpage (section): Found ${resultPageArray.length} result pages to navigate to`
                );

                if (
                    this.path === firstResultPage ||
                    firstResultPage === undefined
                ) {
                    // Already on result page, go to summary
                    return h.redirect(returnurl);
                } else {
                    // Navigate to first result page with returnUrl to continue to summary
                    const urlWithReturn = `/${
                        this.model.basePath || ""
                    }${firstResultPage}?returnUrl=${encodeURIComponent(
                        returnurl
                    )}`;
                    return h.redirect(urlWithReturn);
                }
            }

            // No changes detected or no result pages to navigate to, redirect to summary
            return h.redirect(returnurl);
        } else {
            let actualstate = await cacheService.getState(request);

            // Ensure arrays exist
            if (!Array.isArray(actualstate.updatedNumbercomp)) {
                actualstate.updatedNumbercomp = [];
            }

            if (!Array.isArray(actualstate.completedResultPages)) {
                actualstate.completedResultPages = [];
            }

            if (!Array.isArray(actualstate.traversedPaths)) {
                actualstate.traversedPaths = [];
            }

            if (!Array.isArray(actualstate.updatedResultComps)) {
                actualstate.updatedResultComps = [];
            }

            const completedResultPages = new Set<string>(
                actualstate.completedResultPages
            );
            const traversedPaths = new Set<string>(actualstate.traversedPaths);

            // Get component names from current page
            const pageComponentNames = new Set<string>();
            if (page && page.components && page.components.items) {
                for (const comp of page.components.items) {
                    pageComponentNames.add(comp.name);
                }
            }

            // Detect changed fields in page (only for components)
            const changedFields = getChangedFields(
                state,
                oldState || {},
                pageComponentNames
            );

            const conditionalRoutes = evaluateConditionalRoutes(
                this.pageDef,
                state,
                oldState || {},
                traversedPaths
            );
            // --------------------------------------------------
            // REQUIREMENT 1: Check for conditional flow re-evaluation
            // --------------------------------------------------
            if (
                (this.pageDef &&
                    Array.isArray(this.pageDef.next) &&
                    this.pageDef.next.length > 1) ||
                (conditionalRoutes && this.pageDef.next.length > 0)
            ) {
                if (conditionalRoutes.changed) {
                    debugConsoleLog(
                        `CustomRedirecttoResultpage: Conditional route changed from ${conditionalRoutes.oldRoute} to ${conditionalRoutes.newRoute}`
                    );

                    if (
                        conditionalRoutes.mustNavigateAllPages &&
                        conditionalRoutes.newRoute
                    ) {
                        // New route detected - must navigate through all pages in new route
                        debugConsoleLog(
                            `CustomRedirecttoResultpage: New route detected, navigating through all pages`
                        );
                        traversedPaths.add(conditionalRoutes.newRoute);
                        actualstate.traversedPaths = Array.from(traversedPaths);
                        actualstate = await cacheService.mergeState(
                            request,
                            {},
                            actualstate
                        );
                        actualstate = await cacheService.setState(actualstate);

                        const urlWithReturn = `/${this.model.basePath || ""}${
                            conditionalRoutes.newRoute
                        }?returnUrl=${encodeURIComponent(returnurl)}`;
                        return h.redirect(urlWithReturn);
                    } else if (
                        conditionalRoutes.oldRoute &&
                        !conditionalRoutes.changed &&
                        conditionalRoutes.oldRoute
                    ) {
                        // Route not satisfied anymore, redirect to summary
                        debugConsoleLog(
                            `CustomRedirecttoResultpage: Condition no longer satisfied, redirecting to summary`
                        );
                        return h.redirect(returnurl);
                    }
                }
            }

            if (page.components && page.components.items) {
                // --------------------------------------------------
                // REQUIREMENT 2: Detect changed number components
                // --------------------------------------------------
                for (const comp of page.components.items) {
                    if (
                        comp.type === "NumberField" &&
                        changedFields.has(comp.name)
                    ) {
                        numberCompNames.add(comp.name);
                        numberCompChanged = true;
                    } else if (
                        comp.type === "Result" &&
                        comp.name &&
                        changedFields.has(comp.name) &&
                        !numberCompChanged
                    ) {
                        resultCompChanged = true;
                        const targetPage = this.model.pages.find(
                            (p: any) => p.path === page.path
                        );

                        const targetComp = targetPage?.components.items.find(
                            (c: any) => c.name === comp.name
                        );

                        const compCalculationName = targetComp?.calculationName;
                        this.model.def.calculations.forEach((calc: any) => {
                            if (calc.name === compCalculationName) {
                                calc.components.forEach((c: any) => {
                                    if (c.type === "NumberField") {
                                        numberCompNames.add(c.name);
                                    }
                                });
                            }
                        });
                    }
                }

                // Also track previously updated number components
                for (const name of actualstate.updatedNumbercomp) {
                    if (changedFields.has(name)) {
                        numberCompNames.add(name);
                        numberCompChanged = true;
                    }
                }
                // Merge updated numbers safely
                actualstate.updatedNumbercomp = [
                    ...new Set([
                        ...actualstate.updatedNumbercomp,
                        ...Array.from(numberCompNames),
                    ]),
                ];
            }

            // --------------------------------------------------
            // Determine navigation order by following `next`
            // Mirrors normal routing: ordered conditions with fallback (else)
            // --------------------------------------------------
            const orderedPaths: string[] = [];
            const visitedPaths = new Set<string>();
            let currentPath: string | null = this.path;

            while (currentPath && !visitedPaths.has(currentPath)) {
                visitedPaths.add(currentPath);
                orderedPaths.push(currentPath);

                const currentPage = this.model.pages.find(
                    (p) => p.path === currentPath
                );
                if (!currentPage || !Array.isArray(currentPage.next)) break;

                let nextPath: string | null = null;

                for (const next of currentPage.next) {
                    if (!next.condition) {
                        nextPath = next.path; // fallback / else path
                        break;
                    }

                    const cond = this.model.conditions[next.condition];
                    if (cond && cond.fn && cond.fn({ ...actualstate })) {
                        nextPath = next.path; // first satisfied condition wins
                        break;
                    }
                }

                currentPath = nextPath;
            }

            // --------------------------------------------------
            // REQUIREMENT 3: Find result components depending on changed numbers
            // --------------------------------------------------
            if (numberCompChanged || resultCompChanged) {
                for (const path of orderedPaths) {
                    const pg = this.model.pages.find((p) => p.path === path);
                    if (!pg) continue;

                    if (pg.components && pg.components.items) {
                        for (const comp of pg.components.items) {
                            if (comp.type === "Result") {
                                // Direct reference
                                if (
                                    comp.expression &&
                                    Array.from(numberCompNames).some((name) =>
                                        comp.expression.includes(name)
                                    )
                                ) {
                                    resultComponentNames.add(comp.name);
                                }
                                // Indirect via calculation
                                else if (
                                    comp.calculationName &&
                                    this.calculationDependsOnChangedNumber(
                                        comp.calculationName,
                                        numberCompNames,
                                        calculationToNumberDeps
                                    )
                                ) {
                                    resultComponentNames.add(comp.name);
                                } else if (resultCompChanged) {
                                    resultComponentNames.add(comp.name);
                                }
                            }
                        }
                    }
                }
            }

            const allResultComps = getAllResultComponents();
            // --------------------------------------------------
            // REQUIREMENT 4: Select next Result page to navigate to
            // --------------------------------------------------
            for (const path of orderedPaths) {
                const pg = this.model.pages.find((p) => p.path === path);
                if (!pg) continue;
                if (
                    pg.path !== this.path && // skip current page
                    pg.components &&
                    pg.components.items &&
                    pg.components.items.some(
                        (comp) =>
                            comp.type === "Result" &&
                            // Direct NumberField reference in expression
                            ((comp.expression &&
                                Array.from(numberCompNames).some((name) =>
                                    comp.expression.includes(name)
                                )) ||
                                // Indirect dependency via calculation graph
                                (comp.calculationName &&
                                    this.calculationDependsOnChangedNumber(
                                        comp.calculationName,
                                        numberCompNames,
                                        calculationToNumberDeps
                                    )) ||
                                (resultCompChanged &&
                                    this.ResultDependsOnChangedResult(
                                        comp.calculationName,
                                        changedFields,
                                        allResultComps
                                    )))
                    ) &&
                    !completedResultPages.has(pg.path)
                ) {
                    resultPagePath = pg.path;

                    // Mark page as completed
                    completedResultPages.add(pg.path);

                    break;
                }
            }

            branchFullyAnswered = resultPagePath
                ? this.isBranchComplete(
                      orderedPaths,
                      resultPagePath,
                      actualstate
                  )
                : false;

            // --------------------------------------------------
            // REQUIREMENT 5: Check if result components are used in conditions
            // --------------------------------------------------
            const resultCompsUsedInConditions = getResultComponentsUsedInConditions(
                allResultComps
            );
            const updatedResultCompsUsedInConditions = new Set(
                Array.from(resultComponentNames).filter((r) =>
                    resultCompsUsedInConditions.has(r)
                )
            );

            if (updatedResultCompsUsedInConditions.size > 0) {
                actualstate.updatedResultComps = [
                    ...new Set([
                        ...(actualstate.updatedResultComps || []),
                        ...Array.from(updatedResultCompsUsedInConditions),
                    ]),
                ];
            }

            // --------------------------------------------------
            // Persist traversal state across redirects
            // --------------------------------------------------

            actualstate.completedResultPages = Array.from(completedResultPages);
            actualstate.traversedPaths = Array.from(traversedPaths);

            actualstate = await cacheService.mergeState(
                request,
                {},
                actualstate
            );

            actualstate = await cacheService.setState(actualstate);
        }
        // --------------------------------------------------
        // Redirect logic
        // --------------------------------------------------

        if ((numberCompChanged || resultCompChanged) && resultPagePath) {
            if (this.path === resultPagePath) {
                return h.redirect(returnurl);
            } else {
                // Append returnUrl so after result page, summary is next
                const urlWithReturn =
                    `/${this.model.basePath || ""}${resultPagePath}` +
                    `?returnUrl=${encodeURIComponent(
                        returnurl ? returnurl : request.query.returnurl
                    )}`;

                return h.redirect(urlWithReturn);
            }
        } else {
            return proceed(request, h, this.getNext(state), "");
        }
    }

    private isBranchComplete(
        orderedPaths: string[],
        resultPagePath: string,
        state: any
    ): boolean {
        const resultIndex = orderedPaths.indexOf(resultPagePath);
        if (resultIndex <= 0) {
            return true;
        }

        const branchPaths = orderedPaths.slice(0, resultIndex);
        return !branchPaths.some((path) => {
            const page = this.model.pages.find((p) => p.path === path);
            return page ? this.pageHasUnfilledInputs(page, state) : false;
        });
    }

    private pageHasUnfilledInputs(page: any, state: any): boolean {
        if (!page?.components?.items?.length) {
            return false;
        }

        return page.components.items.some((comp: any) => {
            if (!comp?.name || !this.isInteractiveComponent(comp)) {
                return false;
            }

            return !this.isValuePresent(state[comp.name]);
        });
    }

    private isInteractiveComponent(comp: any): boolean {
        return [
            ComponentTypeEnum.NumberField,
            ComponentTypeEnum.TextField,
            ComponentTypeEnum.RadiosField,
            ComponentTypeEnum.CheckboxesField,
            ComponentTypeEnum.MultilineTextField,
            ComponentTypeEnum.EmailAddressField,
            ComponentTypeEnum.AutocompleteField,
            ComponentTypeEnum.TelephoneNumberField,
            ComponentTypeEnum.DateAndTimeField,
            ComponentTypeEnum.YesNoField,
            ComponentTypeEnum.SelectField,
            ComponentTypeEnum.FileUploadField,
            ComponentTypeEnum.DataImport,
            ComponentTypeEnum.UkAddressField,
        ].includes(comp.type);
    }

    private isValuePresent(value: any): boolean {
        if (value === undefined || value === null) {
            return false;
        }

        if (typeof value === "string") {
            return value.trim().length > 0;
        }

        if (Array.isArray(value)) {
            return value.length > 0;
        }

        if (typeof value === "object") {
            return Object.keys(value).length > 0;
        }

        return true;
    }

    private getCalculationToNumberDeps(): Map<string, string[]> {
        const calculationToNumberDeps = new Map<string, string[]>();

        for (const calc of this.model.def.calculations || []) {
            calculationToNumberDeps.set(
                calc.name,
                calc.components?.map((c: any) => c.name) ?? []
            );
        }

        return calculationToNumberDeps;
    }

    private calculationDependsOnChangedNumber(
        calcName: string,
        changedNumberNames: Set<string>,
        calculationToNumberDeps: Map<string, string[]>,
        visited = new Set<string>()
    ): boolean {
        if (visited.has(calcName)) return false;
        visited.add(calcName);

        const directDeps = calculationToNumberDeps.get(calcName) ?? [];
        if (directDeps.some((n) => changedNumberNames.has(n))) {
            return true;
        }

        const calcDef = this.model.def.calculations.find(
            (c: any) => c.name === calcName
        );

        if (!calcDef?.calculationsMapped) return false;

        return calcDef.calculationsMapped.some((parentCalc: string) =>
            this.calculationDependsOnChangedNumber(
                parentCalc,
                changedNumberNames,
                calculationToNumberDeps,
                visited
            )
        );
    }
    private ResultDependsOnChangedResult(
        calcName: string,
        changedNumberNames: Set<string>,
        allResultComps: any[]
    ): boolean {
        const currentCalculation = this.model.def.calculations.find(
            (s) => s.name === calcName
        );

        // Current calculation components
        const currentCalcComponents = currentCalculation?.components || [];
        const changedResults = allResultComps.filter((comp) =>
            changedNumberNames.has(comp.name)
        );
        return changedResults.some((resultComp) => {
            const exists = currentCalcComponents.some(
                (c: any) => c.name === resultComp.component.name
            );

            return resultComp.component.calculationName === calcName || exists;
        });
    }

    localisedString(description, lang: string) {
        let string;
        if (typeof description === "string") {
            string = description;
        } else {
            string = description[lang] ? description[lang] : description.en;
        }
        return string;
    }

    get viewName() {
        return "index";
    }

    get defaultNextPath() {
        return `/${this.model.basePath || ""}/summary`;
    }

    get validationOptions() {
        return { abortEarly: false, messages, dateFormat: "iso" };
    }

    get conditionOptions() {
        return this.model.conditionOptions;
    }

    get errorSummaryTitle() {
        return "There is a problem";
    }

    /**
     * {@link https://hapi.dev/api/?v=20.1.2#route-options}
     */
    get getRouteOptions() {
        return {};
    }

    /**
     * {@link https://hapi.dev/api/?v=20.1.2#route-options}
     */
    get postRouteOptions() {
        return {};
    }

    get formSchema() {
        return this[FORM_SCHEMA];
    }

    set formSchema(value) {
        this[FORM_SCHEMA] = value;
    }

    get stateSchema() {
        return this[STATE_SCHEMA];
    }

    set stateSchema(value) {
        this[STATE_SCHEMA] = value;
    }

    private objLength(object: {}) {
        return Object.keys(object)?.length;
    }

    private setPhaseTag(viewModel) {
        // Set phase tag if it exists in form definition (even if empty for 'None'),
        // otherwise the template context will simply return server config
        if (this.def.phaseBanner) {
            viewModel.phaseTag = this.def.phaseBanner.phase;
        }
    }

    private async renderWithErrors(
        request,
        h,
        payload,
        num,
        progress,
        errors,
        formData,
        state?: any
    ) {
        try {
            trackEvent(
                "2.11a_renderWithErrors:start",
                {
                    path: this.path,
                    formId: this.model?.def?.id,
                    payloadKeys: Object.keys(payload || {}),
                    errors,
                    tableData: formData?.tableData,
                    stateKeys: state ? Object.keys(state) : [],
                    progressLength: progress?.length,
                },
                false
            );
            const { cacheService } = request.services([]);
            if (!state) {
                state =
                    request.yar.get("state") ||
                    (await cacheService.getState(request));
                if (state && !request.yar.get("state")) {
                    request.yar.set("state", state);
                }
            }
            if (
                (!formData?.tableData?.fileId ||
                    !formData?.tableData?.dataset) &&
                state?.formData?.tableData
            ) {
                formData.tableData = state.formData.tableData;
            }
            // spreading payload obj with formdata to retain preentered value
            const renderFormData = {
                ...payload,
                ...formData,
                tableData: formData?.tableData ??
                    state?.formData?.tableData ?? {
                        orgData: {},
                        blobData: "",
                        fileId: "",
                        dataset: "",
                    },
            };
            trackEvent(
                "2.11b_renderWithErrors:before getViewModel",
                {
                    formData: renderFormData,
                    num: num,
                    errors: errors,
                    formDataOrgData: formData?.tableData?.orgData,
                    formDataBlobData: formData?.tableData?.blobData,
                    formDataFileId: formData?.tableData?.fileId,
                    formDataDataset: formData?.tableData?.dataset,
                },
                false
            );
            let viewModel = this.getViewModel(renderFormData, num, errors);
            trackEvent(
                "2.11b_renderWithErrors:viewModelBuilt",
                {
                    componentCount: viewModel?.components?.length,
                    undefinedComponentCount: viewModel?.components?.filter(
                        (component) => component == null
                    )?.length,
                    hasTableData: !!formData?.tableData,
                },
                false
            );
            viewModel.backLink = progress[progress?.length - 2];
            this.setPhaseTag(viewModel);
            this.setFeedbackDetails(viewModel, request);
            const organizationDetails =
                !state?.organisationDetails && request.yar.get("organisation")
                    ? request.yar.get("organisation")
                    : state?.organisationDetails;

            await setExpressionDataAndConditionEvaluation(
                state,
                this.containsAnyLetter,
                viewModel,
                this.model.def,
                this.model,
                organizationDetails
            );

            return h.view(this.viewName, viewModel);
        } catch (e: any) {
            trackEvent(
                "2.11c_renderWithErrors:failure",
                {
                    error: e?.message,
                    stack: e?.stack?.slice(0, 300),
                    path: this.path,
                    formId: this.model?.def?.id,
                    payloadKeys: Object.keys(payload || {}),
                    errors,
                    tableData: formData?.tableData,
                    stateKeys: state ? Object.keys(state) : [],
                    progressLength: progress?.length,
                },
                true
            );
            console.error(`Unable to getById renderWithErrors`, e.message);
            throw e;
        }
    }

    numberToCol(num) {
        let str = "",
            q,
            r;
        while (num > 0) {
            q = (num - 1) / 26;
            r = (num - 1) % 26;
            num = Math.floor(q);
            str = String.fromCharCode(65 + r) + str;
        }
        return str;
    }

    ValidateFile() {
        return async (request: HapiRequest, h: HapiResponseToolkit) => {
            const currentPage = this.getCurrentPage(
                this.path,
                this.model.def.pages
            );

            let fileId: any, fileName: any;
            var columns, result;
            result = {
                columnmiss: "",
                datamiss: "",
                datavalid: "",
                status: "",
                msg: "",
            };
            result.status = "success";
            const { cacheService } = request.services([]);

            currentPage[0]?.components?.filter(
                (pagetype: { type: string; fileId: any }) => {
                    debugConsoleLog("ValidateFile", pagetype);
                    if (pagetype?.type === "DataImport") {
                        fileId = pagetype.selectedDocument;
                        columns = pagetype.columns;
                        fileName = pagetype.documentName;
                    }
                }
            );
            var getDocumentDetails = this.model.def.documents?.filter(
                (doc) => doc.fileName === fileName
            );
            var filePath =
                getDocumentDetails[getDocumentDetails?.length - 1] &&
                getDocumentDetails[getDocumentDetails?.length - 1]?.path;
            var filecolumndata = await this.getBlobContent(
                fileId,
                "DataImport",
                fileName,
                filePath
            );
            debugConsoleLog("filecolumndata", filecolumndata);
            if (filecolumndata) {
                var filedata = request.payload.filedata;
                const columnarray = Object.keys(filecolumndata);
                const filePath = filedata.path;
                var buffer = fs.readFileSync(filePath);
                var data = buffer.toString();
                var dataarray = data.split("\r\n");
                const datacolumnarray = dataarray[0]?.split(",");
                if (
                    columnarray?.length !== dataarray[0]?.split(",")?.length ||
                    columnarray?.length !== columns?.length
                ) {
                    result.columnmiss = `column header missing. ~`;
                    result.msg = `column header missing`;
                    result.status = "error";
                    return result;
                }

                if (datacolumnarray?.length === columns?.length) {
                    const columnHeaders = columns.map(
                        (col) => col.selectedColumnHeaderValue
                    );
                    const isSchemaDataSame = columnHeaders.every(function (
                        element,
                        index
                    ) {
                        return element.trim() === datacolumnarray[index].trim();
                    });
                    if (!isSchemaDataSame) {
                        result.columnreorder = `columns order mismatch ~`;
                        result.msg = `columns order mismatch`;
                        result.status = "error";
                        return result;
                    }
                }

                for (var i = 1; i <= dataarray?.length - 1; i++) {
                    for (
                        var j = 0;
                        j <= dataarray[i]?.split(",")?.length - 1;
                        j++
                    ) {
                        const columndata = dataarray[i]?.split(",")[j].trim();
                        const schemadata = columns[j]?.columnSchema;
                        if (
                            dataarray[i]?.split(",")?.length === 1 &&
                            i === dataarray?.length - 1
                        )
                            continue;
                        if (columndata === "") {
                            if (!schemadata?.addressRequired) {
                                result.datamiss += `Data is empty at row ${
                                    i + 1
                                }, column ${this.numberToCol(j + 1)} ~`;
                                result.status = `error`;
                            }
                        }
                        if (!_.isEmpty(schemadata)) {
                            if (
                                columns[j].columnType === "Number" &&
                                isNaN(columndata)
                            ) {
                                result.datavalid += `Row ${
                                    i + 1
                                }, Column ${this.numberToCol(
                                    j + 1
                                )}: Not a number ~`;
                                result.status = "error";
                            } else if (
                                columns[j].columnType === "Number" &&
                                (parseInt(columndata) <
                                    parseInt(schemadata?.minNumber) ||
                                    parseInt(columndata) >
                                        parseInt(schemadata?.maxNumber) ||
                                    columndata.split(".")[1]?.length >
                                        schemadata?.precisionNumber)
                            ) {
                                result.datavalid += `Row ${
                                    i + 1
                                }, Column ${this.numberToCol(
                                    j + 1
                                )} : Number is not in allowed range of Min ${
                                    schemadata?.minNumber
                                } and Max ${schemadata?.maxNumber} ~`;
                                result.status = "error";
                            } else if (
                                columns[j].columnType === "Text" &&
                                columndata?.length > schemadata?.maxLength
                            ) {
                                result.datavalid += `Row ${
                                    i + 1
                                }, Column ${this.numberToCol(
                                    j + 1
                                )} : Text length more than allowed range of ${
                                    schemadata?.maxLength
                                } chars ~`;
                                result.status = "error";
                            } else if (columns[j].columnType === "Date") {
                                const tempdate = moment(columndata, [
                                    "MM-DD-YYYY",
                                    "DD-MM-YYYY",
                                    "YYYY-MM-DD",
                                    "DD-MMM-YYYY",
                                    "MMM-DD-YYYY",
                                    "YYYY-MMM-DD",
                                    "DD MMM YYYY",
                                    "MMM DD YYYY",
                                    "YYYY MMM DD",
                                    "DD/MM/YYYY",
                                    "MM/DD/YYYY",
                                    "YYYY/MM/DD",
                                ]).format("YYYY-MM-DD");
                                const minschema = moment()
                                    .subtract(schemadata?.maxDaysInPast, "days")
                                    .format("YYYY-MM-DD");
                                const maxschema = moment()
                                    .add(schemadata?.maxDaysInFuture, "days")
                                    .format("YYYY-MM-DD");

                                if (
                                    tempdate < minschema ||
                                    tempdate > maxschema
                                ) {
                                    result.datavalid += `Row ${
                                        i + 1
                                    }, Column ${this.numberToCol(
                                        j + 1
                                    )} : Date is not in allowed range between ${minschema} and ${maxschema} ~`;
                                    result.status = "error";
                                }
                            }
                        }
                    }
                }

                if (result.status === "error") {
                    if (result.datamiss !== "")
                        result.msg += `Data is empty | `;

                    if (result.datavalid !== "")
                        result.msg += `Data is not in allowed range`;

                    return result;
                } else if (result.status === "success") {
                    let state = await cacheService.getState(request);
                    const dataImportStatuses = state.dataImportStatus ?? {};
                    state = await cacheService.mergeState(
                        request,
                        {
                            dataImportStatus: {
                                ...dataImportStatuses,
                                [request.payload.compName]:
                                    DataImportStatus.VALIDATED,
                            },
                        },
                        state
                    );
                    state = await cacheService.setState(state);
                    result.status = "success";
                    return result;
                }
            }
        };
    }
}
