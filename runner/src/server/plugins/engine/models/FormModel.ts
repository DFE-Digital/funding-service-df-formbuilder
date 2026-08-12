import joi from "joi";
import moment from "moment";
import { Parser } from "expr-eval";
import {
    Schema,
    clone,
    ConditionsModel,
    FormDefinition,
    Page,
    ConditionRawData,
    List,
    Section,
    ComponentTypeEnum,
} from "@xgovformbuilder/model";

import { FormPayload, FormSubmissionState } from "../types";
import { PageControllerBase, getPageController } from "../pageControllers";
import { PageController } from "../pageControllers/PageController";
import { ExecutableCondition } from "server/plugins/engine/models/types";
import {
    createRepeatableSectionsData,
    pagesMatchTriggerCompValue,
} from "server/plugins/engine/services/formService";
import {
    expandPages,
    getPagesGroupedBySection,
    getUsedRepeatableSections,
    hasMatchingDynamicPages,
    getNumberAfterLastHyphen,
    payloadHasConditionComp,
    hasSectionTriggerLowered,
    filterPages,
    invalidateCache,
    updateSectionTriggerCompValue,
    generateRedisKey,
    coerceNumericStringsForEligibleKeys,
    coerceDateToISO,
} from "../helpers";
import { CacheService } from "src/server/services";
import { HapiRequest } from "src/server/types";
import { trackEvent } from "src/server/logging/customTracker";

class EvaluationContext {
    constructor(conditions, value) {
        Object.assign(this, value);

        for (const key in conditions) {
            Object.defineProperty(this, key, {
                get() {
                    return conditions[key].fn(value);
                },
            });
        }
    }
}

export class FormModel {
    /**
     * Responsible for instantiating the {@link PageControllerBase} and {@link EvaluationContext} from a form JSON
     */

    /** the entire form JSON as an object */
    def: FormDefinition;
    tabs: FormDefinition["tabs"];
    lists: FormDefinition["lists"];
    sections: FormDefinition["sections"] = [];
    options: any;
    name: any;
    values: any;
    DefaultPageController: any = PageController;
    /** the id of the form used for the first url parameter eg localhost:3009/test */
    basePath: string;
    conditions: Record<string, ExecutableCondition> | {};
    pages: any;
    startPage: any;
    currentPath: string | undefined;
    ukprn: string | undefined;
    promises: Promise<void>[];
    ignorePayloadComp: string;

    constructor(def, options, sectionFormData?: FormDefinition | null) {
        const result = Schema.validate(def, { abortEarly: false });
        if (result.error) {
            throw result.error;
        }

        def = clone(result.value);
        this.def = def;
        this.currentPath = sectionFormData?.currentPath;
        this.promises = [];
        this.ignorePayloadComp = "";
        this.lists = def.lists;
        this.sections = def.sections;
        this.tabs = def.tabs;
        this.options = options;
        this.name = def.name;
        this.values = result.value;

        if (options.defaultPageController) {
            this.DefaultPageController = getPageController(
                options.defaultPageController
            );
        }

        this.basePath = options.basePath;

        this.conditions = {};
        def.conditions?.forEach((conditionDef) => {
            const condition = this.makeCondition(conditionDef);
            this.conditions[condition.name] = condition;
        });

        // Pages and startPage will be set in async init
        this.pages = [];
        this.startPage = undefined;
    }

    /**
     * Async initializer for FormModel. Call this after construction.
     */
    async init(
        sectionFormData?: FormDefinition | null,
        payload?: FormPayload,
        state?: FormSubmissionState,
        cacheService?: CacheService,
        request?: HapiRequest,
        sectionValueMap?: Record<string, any>
    ) {
        // Await the async page generation
        await this.generateRepeatableSectionPages(
            this.def,
            sectionFormData,
            payload,
            state,
            cacheService,
            request!,
            sectionValueMap ?? undefined
        );
        // After pages are generated, set pages and startPage
        // @ts-ignore
        this.pages = this.def.pages.map((pageDef) => this.makePage(pageDef));
        this.startPage = this.pages.find(
            (page) => page.path === this.def.startPage
        );
        return this;
    }

    /**
     * Generates additional form pages for repeatable sections based on user input.
     * This method handles the dynamic creation of duplicate form sections when users
     * need to fill out the same set of fields multiple times (e.g., adding multiple
     * qualifications or work experiences).
     *
     * Key behaviors:
     * - Identifies repeatable sections from form definition
     * - Creates new pages with unique identifiers based on user-specified count
     * - Maintains proper page navigation by updating "next" references
     * - Preserves section structure while creating unique component names
     *
     * @param def - The form definition containing sections, pages and components
     * @param payload - The form payload containing user input, including section repeat counts
     * @returns
     *
     * @example
     * // If a form has a repeatable section "qualifications" and user requests 3 copies:
     * // Original page: "qualifications-1"
     * // Generated pages: "qualifications-11", "qualifications-21", "qualifications-31"
     */
    generateRepeatableSectionPages = async (
        def: FormDefinition,
        sectionData?: FormDefinition | null,
        payload?: FormPayload,
        state?: FormSubmissionState,
        cacheService?: CacheService,
        request?: HapiRequest,
        sectionValueMap?: Record<string, any>
    ) => {
        const currentBatchIteration = request?.yar.get("iterationCount");
        trackEvent(
            `RQ currentBatchIteration`,
            {
                currentBatchIteration,
                state,
                payload,
                requestState: request?.yar.get("state"),
            },
            false
        );
        const currentPath = sectionData?.currentPath;

        // Validate the current page form before regenerating pages
        if (payload && sectionData && sectionData?.id) {
            // Find the current page definition by normalised path
            const pageDef = sectionData.pages.find(
                (page) => page.path.replace(/^\//, "") === currentPath
            );

            // Run page-level validation using the page controller
            const page = new PageControllerBase(this, pageDef);
            const formResult: any = page.validateForm(payload);

            
            const fileAndDataImportFields = page.components.items
                ?.filter((component) => {
                    return (
                        component?.type === ComponentTypeEnum.FileUploadField ||
                        component?.type === ComponentTypeEnum.DataImport
                    );
                })
                // .filter(Boolean)
                .map((component) => component.model);
                
            if (typeof payload?.filextensionerror === "object") {
                payload?.filextensionerror?.forEach((item) => {
                    page.validateFileextensionerror(
                        item,
                        formResult,
                        fileAndDataImportFields
                    );
                });
            } else if (typeof payload?.filextensionerror === "string") {
                page.validateFileextensionerror(
                    payload?.filextensionerror,
                    formResult,
                    fileAndDataImportFields
                );
            }
            // If validation fails, reuse existing generated pages and exit
            if (formResult?.errors?.errorList.length > 0) {
                def.pages = sectionData.pages;
                def.sections = sectionData.sections;
                return;
            }
        }

        let currentIteration = getNumberAfterLastHyphen(currentPath);
        let payloadKeyInSectionValueMap;
        if (payload && sectionValueMap) {
            payloadKeyInSectionValueMap = Object.keys(payload).filter((value) =>
                Object.keys(sectionValueMap).includes(value)
            );
        }
        currentIteration =
            currentIteration ??
            request?.yar.get("previous_" + payloadKeyInSectionValueMap);
        // When called through 'Get' RouteHandler, payload is unavailable
        const isIterationRepeatitionsWithBatchCount = Boolean(
            currentIteration &&
                currentBatchIteration &&
                currentIteration === currentBatchIteration
        );
        console.log(isIterationRepeatitionsWithBatchCount);
        // Check if we're NOT in a batch iteration scenario
        if (!isIterationRepeatitionsWithBatchCount) {
            // If there's no form payload (typically during GET requests)
            if (!payload) {
                // If we have section data with an ID (existing form section)
                if (sectionData && sectionData?.id) {
                    // Log the current state for debugging/tracking
                    trackEvent(
                        `RQ isIterationRepeatitionsWithBatchCount payload sectionData`,
                        {
                            isIterationRepeatitionsWithBatchCount,
                            payload,
                            sectionData,
                        },
                        false
                    );
                    // Use the existing section data instead of generating new pages
                    // This preserves the previous state of the form
                    def.pages = sectionData!.pages!;
                    def.sections = sectionData!.sections!;
                }
                return; // Exit early since we can't generate new pages without payload
            }
        }

        console.log(payloadKeyInSectionValueMap);

        /**
         * Checks if all sections' numberComp and triggerCompValue match the values in sectionValueMap.
         * @param sections Array of section objects (each with numberComp and triggerCompValue)
         * @param sectionValueMap Object mapping numberComp keys to their expected values
         * @returns true if all matches, false otherwise
         */
        function doSectionsMatchSectionValueMap(
            sections: Section[],
            sectionValueMap: Record<string, any>,
            payload: FormPayload
        ): boolean {
            return sections.every((section) => {
                if (
                    !section.numberComp ||
                    payloadHasConditionComp(payload, section)
                )
                    return false;
                const mapValue = sectionValueMap[section.numberComp];
                if (mapValue === undefined) return false;
                return Number(section.triggerCompValue) === Number(mapValue);
            });
        }

        // Check if sectionData?.sections match the sectionValueMap
        const isSectionCountSame = doSectionsMatchSectionValueMap(
            sectionData?.sections ?? [],
            sectionValueMap ?? {},
            payload!
        );

        const allMatches = pagesMatchTriggerCompValue(sectionData!);

        // Check if sectionValue is equal to sectionData?.triggerCompValue
        if (isSectionCountSame && sectionData?.id && allMatches) {
            // Use the existing section data instead of generating new pages
            // This preserves the previous state of the form
            def.pages = sectionData!.pages!;
            def.sections = sectionData!.sections!;
            return; // Exit early since we already fetched generated pages from Redis
        }

        trackEvent(`RQ generation logic execution started`, false);
        const usedRepeatableSections = getUsedRepeatableSections(def);
        if (usedRepeatableSections.length === 0) {
            return;
        }

        const getCurrentSectionTriggerName = request?.yar.get(
            "numberCompTriggerName"
        );
        const getSectionTriggerValue = request?.yar.get(
            "numberCompTriggerValue"
        );
        trackEvent(
            `RQ getCurrentSectionTriggerName - getSectionTriggerValue`,
            {
                getCurrentSectionTriggerName,
                getSectionTriggerValue,
            },
            false
        );

        // Recalculate only for sections with valid trigger values in payload
        const validSections = usedRepeatableSections.filter(
            (section) =>
                (payload != null &&
                    payload !== undefined &&
                    section?.numberComp != null &&
                    payload[section.numberComp]) ||
                (isIterationRepeatitionsWithBatchCount &&
                    getCurrentSectionTriggerName === section.numberComp) ||
                (payload != null &&
                    payload !== undefined &&
                    section?.conditionComp != null &&
                    payloadHasConditionComp(payload, section)) ||
                ""
        );

        const validWithStateSections = usedRepeatableSections.filter(
            (section) =>
                (payload != null &&
                    payload !== undefined &&
                    section?.numberComp != null &&
                    payload[section.numberComp]) ||
                (isIterationRepeatitionsWithBatchCount &&
                    getCurrentSectionTriggerName === section.numberComp) ||
                (payload != null &&
                    payload !== undefined &&
                    section?.conditionComp != null &&
                    payloadHasConditionComp(payload, section)) ||
                (state &&
                    !!section?.numberComp &&
                    !!state[section.numberComp]) ||
                (state &&
                    !!section?.conditionComp &&
                    !!state?.[section.name] &&
                    !!state?.[section.name]?.[section.conditionComp]) ||
                ""
        );

        if (validSections && validSections.length === 0) {
            if (sectionData && sectionData?.id) {
                trackEvent(
                    `RQ inside validSections sectionData`,
                    {
                        sectionData,
                    },
                    false
                );
                def.pages = sectionData!.pages!;
                def.sections = sectionData!.sections!;
            }
            return;
        }

        const groupedOriginalPages = getPagesGroupedBySection(
            def,
            validSections,
            isIterationRepeatitionsWithBatchCount
        );

        // Update trigger values for sections with number components
        for (const section of def.sections) {
            if (
                payload &&
                section.numberComp &&
                section.numberComp in payload
            ) {
                trackEvent(
                    `triggerCompValue for section`,
                    {
                        section,
                        payload,
                    },
                    false
                );
                // Store the numeric trigger value from payload
                section.triggerCompValue = Number(payload[section.numberComp]);

                request?.yar.set("numberCompTriggerName", section.numberComp);
                request?.yar.set(
                    "numberCompTriggerValue",
                    Number(payload[section.numberComp])
                );
            }
        }

        // Inside generateRepeatableSectionPages method
        // Check if the section trigger value has been lowered (e.g., user reduced number of repetitions
        trackEvent(`RQ groupedOriginalPages`, { groupedOriginalPages }, false);
        if (hasSectionTriggerLowered(sectionData?.sections, payload, state)) {
            // Filter out pages that are no longer needed based on new lower value
            trackEvent(
                `RQ hasSectionTriggerLowered`,
                { groupedOriginalPages },
                false
            );
            const filteredPages = filterPages(
                sectionData,
                payload,
                state,
                groupedOriginalPages,
                request
            );
            if (!!filteredPages) {
                // Update form definition with filtered pages
                def.pages = filteredPages;
                // Invalidate cache for removed pages to clean up state
                invalidateCache(
                    filteredPages,
                    def.sections ?? [],
                    state,
                    request
                );
                // Update organization data
                const orgData = request?.yar.get("organisation");
                trackEvent(
                    `RQ hasSectionTriggerLowered: orgData`,
                    {
                        orgData,
                    },
                    false
                );
                if (orgData) {
                    this.ukprn =
                        orgData?.ukprn ?? orgData?.DistrictAdministrative_code;
                }
                def.ukprn = this.ukprn;
                trackEvent(
                    `RQ hasSectionTriggerLowered: filteredPages`,
                    {
                        filteredPages,
                    },
                    false
                );
                const newState = request?.yar.get("state");
                updateSectionTriggerCompValue(
                    validWithStateSections,
                    def,
                    newState!,
                    payload!
                );
                // Update repeatable section data in store
                await this.postRepeatableSectionData(
                    def,
                    filteredPages,
                    request
                );
                trackEvent(
                    `RQ hasSectionTriggerLowered: postRepeatableSectionData API called inside generateRepeatableSectionPages`,
                    false
                );
                return;
            }
            return;
        }

        // Check and update form definition with any existing section data
        this.findPreviousSectionData(def, sectionData);

        // If dynamic pages already match the expected count, use existing pages
        // if (
        //     hasMatchingDynamicPages(
        //         def,
        //         usedRepeatableSections,
        //         payload!,
        //         state!,
        //         sectionData,
        //         isIterationRepeatitionsWithBatchCount,
        //         request
        //     )
        // ) {
        //     // Use existing pages and sections from sectionData
        //     trackEvent(
        //         `RQ inside hasMatchingDynamicPages sectionData`,
        //         {
        //             sectionData,
        //         },
        //         false
        //     );
        //     def.pages = sectionData!.pages!;
        //     def.sections = sectionData!.sections!;
        //     return;
        // }

        // Calculate how many iterations to generate
        let iterationCount;
        let redirectedfromsummary;
        if (
            request?.yar.get("returnUrl") != null &&
            request?.yar.get("returnUrl") != "" &&
            state &&
            state["reference"]
        ) {
            redirectedfromsummary = true;
        }
        if (!getSectionTriggerValue || !currentIteration) {
            // Default to 5 iterations if no trigger value or current iteration
            iterationCount = 5;
        } else if (redirectedfromsummary) {
            iterationCount = Number(request?.yar.get("numberCompTriggerValue"));
        } else {
            // Calculate remaining iterations needed
            // (total desired iterations minus current iteration)
            iterationCount = getSectionTriggerValue - (currentIteration ?? 0);
        }
        trackEvent(
            `RQ iterationCount inside generateRepeatableSectionPages`,
            {
                iterationCount,
            },
            false
        );
        // Group pages for the new iteration calculation
        const groupedNewPages = getPagesGroupedBySection(
            def,
            validSections,
            isIterationRepeatitionsWithBatchCount
        );

        trackEvent(
            `RQ groupedNewPages`,
            {
                groupedNewPages,
            },
            false
        );
        const [expandedPages, conditionCompIdToAvoid] = expandPages(
            iterationCount,
            groupedNewPages, // Pages to be duplicated
            groupedOriginalPages, // Original pages for reference
            validSections, // Sections that need duplication
            payload!,
            currentIteration!,
            state!,
            cacheService!,
            request!
        );
        // Store promises for later resolution
        this.ignorePayloadComp = conditionCompIdToAvoid;
        // Get and set organization data if available
        const orgData = request?.yar.get("organisation");
        trackEvent(
            `orgData`,
            {
                orgData,
            },
            false
        );
        if (orgData) {
            this.ukprn = orgData.ukprn ?? orgData?.DistrictAdministrative_code;
        }
        updateSectionTriggerCompValue(
            validWithStateSections,
            def,
            state!,
            payload!
        );
        def.ukprn = this.ukprn;
        trackEvent(
            `calling postRepeatableSectionData with expandedPages`,
            {
                expandedPages,
            },
            false
        );
        // Save the repeatable section data for persistence
        await this.postRepeatableSectionData(def, expandedPages, request);

        // Update form definition with expanded pages
        trackEvent(`postRepeatableSectionData API completed`, false);
        def.pages = expandedPages;
    };

    /**
     * Persists data for repeatable form sections to the store.
     * This method is called after generating new repeatable section pages
     * to maintain state between page loads.
     *
     * @param def - The form definition containing the repeatable section configuration
     */
    postRepeatableSectionData = async (
        def: FormDefinition,
        newPages: Page[],
        request?: HapiRequest
    ) => {
        const { id, sections } = def;
        const createRedisID = generateRedisKey(
            id,
            sections,
            request as HapiRequest
        );
        trackEvent(
            `postRepeatableSectionData called with createRedisID`,
            {
                createRedisID,
                newPages,
                sections,
                id,
            },
            false
        );
        request?.yar.set("redisID", createRedisID);
        // Create and store the data structure needed for repeatable sections
        await createRepeatableSectionsData(
            { ...def, pages: newPages },
            createRedisID
        );
    };

    findPreviousSectionData(def, sectionData) {
        if (sectionData && sectionData?.sections !== def?.sections) {
            def.pages = sectionData!.pages!;
            def.sections = sectionData!.sections!;
        } else {
            return;
        }
    }

    /**
     * build the entire model schema from individual pages/sections
     */
    makeSchema(state: FormSubmissionState) {
        return this.makeFilteredSchema(state, this.pages);
    }

    /**
     * build the entire model schema from individual pages/sections and filter out answers
     * for pages which are no longer accessible due to an answer that has been changed
     */
    makeFilteredSchema(_state: FormSubmissionState, relevantPages) {
        // Build the entire model schema
        // from the individual pages/sections
        let schema = joi.object().required();
        // @ts-ignore
        [undefined].concat(this.sections)?.forEach((section) => {
            const sectionPages = relevantPages?.filter(
                (page) => page.section === section
            );

            if (sectionPages.length > 0) {
                if (section) {
                    const isRepeatable = sectionPages.find(
                        (page) => page.pageDef.repeatField
                    );

                    let sectionSchema:
                        | joi.ObjectSchema<any>
                        | joi.ArraySchema = joi.object().required();

                    sectionPages?.forEach((sectionPage) => {
                        sectionSchema = sectionSchema.concat(
                            sectionPage.stateSchema
                        );
                    });

                    if (isRepeatable) {
                        sectionSchema = joi.array().items(sectionSchema);
                    }

                    schema = schema.append({
                        // @ts-ignore
                        [section.name]: sectionSchema,
                    });
                } else {
                    sectionPages?.forEach((sectionPage) => {
                        schema = schema.concat(sectionPage.stateSchema);
                    });
                }
            }
        });

        return schema;
    }

    /**
     * instantiates a Page based on {@link Page}
     */
    makePage(pageDef: Page) {
        if (pageDef.controller) {
            const PageController = getPageController(pageDef.controller);

            if (!PageController) {
                throw new Error(
                    `PageController for ${pageDef.controller} not found`
                );
            }

            return new PageController(this, pageDef);
        }

        if (this.DefaultPageController) {
            const DefaultPageController = this.DefaultPageController;
            return new DefaultPageController(this, pageDef);
        }

        return new PageControllerBase(this, pageDef);
    }

    /**
     * Instantiates a Condition based on {@link ConditionRawData}
     * @param condition
     */
    makeCondition(condition: ConditionRawData) {
        const parser = new Parser({
            operators: {
                logical: true,
            },
        });

        parser.functions.dateForComparison = function (timePeriod, timeUnit) {
            return moment().add(Number(timePeriod), timeUnit).toISOString();
        };

        parser.functions.timeForComparison = function (timePeriod, timeUnit) {
            const offsetTime = moment().add(Number(timePeriod), timeUnit);
            return `${offsetTime.hour()}:${offsetTime.minutes()}`;
        };

        const { name, value } = condition;
        const expr = this.toConditionExpression(value, parser);

        const fn = (value) => {
            // if value in state is a number with string type, coerce to number to number type
            const coerced = { ...value };
            const conds = this.conditions[name]?.value?.conditions ?? [];
            coerceNumericStringsForEligibleKeys(coerced, conds);
            coerceDateToISO(coerced);

            const ctx = new EvaluationContext(this.conditions, coerced);
            try {
                return expr.evaluate(ctx);
            } catch (err) {
                return false;
            }
        };

        return {
            name,
            value,
            expr,
            fn,
        };
    }

    toConditionExpression(value, parser) {
        if (typeof value === "string") {
            return parser.parse(value);
        }

        const conditions = ConditionsModel.from(value);
        return parser.parse(conditions.toExpression());
    }

    get conditionOptions() {
        return { allowUnknown: true, presence: "required" };
    }

    getList(name: string): List | [] {
        return this.lists.find((list) => list.name === name) ?? [];
    }
}
