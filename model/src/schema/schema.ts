import joi from "joi";
import { FormatType, InputType, TabInputType } from "../data-model/types";

/**
 * If an optional key is added, CURRENT_VERSION does not need to be incremented.
 * Only breaking changes will require an increment, as well as a migration script.
 */
export const CURRENT_VERSION = 3;
const sectionsSchema = joi.object().keys({
    name: joi.string().required(),
    title: joi.string().required(),
    repeatableSection: joi.boolean().optional(),
    numberComp: joi.string().allow("").optional(),
    conditionComp: joi.string().allow("").optional(),
});

const conditionFieldSchema = joi.object().keys({
    name: joi.string().required(),
    type: joi.string().required(),
    display: joi.string().required(),
});

const conditionValueSchema = joi.object().keys({
    type: joi.string().required(),
    value: joi.string().required(),
    display: joi.string().required(),
});

const relativeTimeValueSchema = joi.object().keys({
    type: joi.string().required(),
    timePeriod: joi.string().required(),
    timeUnit: joi.string().required(),
    direction: joi.string().required(),
    timeOnly: joi.boolean().required(),
});

const conditionRefSchema = joi.object().keys({
    conditionName: joi.string().required(),
    conditionDisplayName: joi.string().required(),
    coordinator: joi.string().optional(),
});

const conditionSchema = joi.object().keys({
    field: conditionFieldSchema,
    operator: joi.string().required(),
    value: joi
        .alternatives()
        .try(conditionValueSchema, relativeTimeValueSchema),
    conditionType: joi.string().optional(),
    coordinator: joi.string().optional(),
    datasetId: joi.string().optional(),
});

const conditionGroupSchema = joi.object().keys({
    conditions: joi
        .array()
        .items(
            joi
                .alternatives()
                .try(
                    conditionSchema,
                    conditionRefSchema,
                    joi.any() /** Should be a joi.link('#conditionGroupSchema') */
                )
        ),
});

const conditionsModelSchema = joi.object().keys({
    name: joi.string().required(),
    conditions: joi
        .array()
        .items(
            joi
                .alternatives()
                .try(conditionSchema, conditionRefSchema, conditionGroupSchema)
        ),
});

const conditionsSchema = joi.object().keys({
    name: joi.string().required(),
    displayName: joi.string(),
    value: joi
        .alternatives()
        .try(joi.string(), conditionsModelSchema)
        .required(),
});

const localisedString = joi
    .alternatives()
    .try(joi.object({ a: joi.any() }).unknown(), joi.string().allow(""));

const componentSchema = joi
    .object()
    .keys({
        type: joi.string().required(),
        name: joi.string(),
        title: localisedString,
        hint: localisedString.optional(),
        options: joi.object().default({}),
        schema: joi
            .object({ min: joi.number(), max: joi.number() })
            .unknown(true)
            .default({}),
        list: joi.string(),
    })
    .unknown(true);

const nextSchema = joi.object().keys({
    path: joi.string().required(),
    condition: joi.string().allow("").optional(),
});

/**
 * `/status` is a special route for providing a user's application status.
 *  It should not be configured via the designer.
 */
const pageSchema = joi.object().keys({
    path: joi.string().required().disallow("/status"),
    title: localisedString,
    section: joi.string(),
    controller: joi.string(),
    components: joi.array().items(componentSchema),
    next: joi.array().items(nextSchema),
    repeatField: joi.string().optional(),
    pageSequence: joi.string().optional(),
});

/* dataset schema */
const datasetSchema = joi.object().keys({
    index: joi.string().required(),
    type: joi.string().required(),
    value: joi.string(),
    bold: joi.boolean(),
    calc: joi.boolean(),
    checked: joi.boolean(),
});

const computeListSchema = joi.object().keys({
    id: joi.string(),
    type: joi.string(),
    order: joi.number(),
    entity: joi.string().allow(""),
    value: joi.string(),
});

/* Calculation Schema */
const calculationSchema = joi.object().keys({
    name: joi.string().required(),
    displayName: joi.string(),
    pageLocation: joi.string(),
    expression: joi.string(),
    title: joi.string(),
    hint: joi.string().allow("").optional(),
    type: joi.string(),
    hideResult: joi.boolean(),
    components: joi.array().items(componentSchema),
    datasets: joi
        .array()
        .items(
            datasetSchema.keys({ designedDataSetId: joi.string().optional() })
        ),
    calculationsMapped: joi.array().items(joi.string()).optional(),
    computeList: joi.array().items(computeListSchema).optional(),
    repeatable: joi.boolean().optional(),
});

const toggleableString = joi.alternatives().try(joi.boolean(), joi.string());

const confirmationPageSchema = joi.object({
    customText: joi
        .object({
            title: joi.string().default("Application complete"),
            paymentSkipped: toggleableString.default(
                "Someone will be in touch to make a payment."
            ),
            nextSteps: toggleableString.default(
                "You will receive an email with details with the next steps."
            ),
        })
        .default(),
    components: joi.array().items(componentSchema),
});

const specialPagesSchema = joi.object().keys({
    confirmationPage: confirmationPageSchema,
});

const listItemSchema = joi.object().keys({
    text: localisedString,
    value: joi.alternatives().try(joi.number(), joi.string()),
    description: localisedString.optional(),
    conditional: joi
        .object()
        .keys({
            components: joi
                .array()
                .required()
                .items(componentSchema.unknown(true))
                .unique("name"),
        })
        .allow(null)
        .optional(),
    condition: joi.string().allow(null, "").optional(),
    links: joi.string().allow(null, "").optional(),
    Order: joi.string().allow(null, "").optional(),
});

const listSchema = joi.object().keys({
    name: joi.string().required(),
    title: localisedString,
    type: joi.string().required().valid("string", "number"),
    dataset: joi.string().allow(null, "").optional(),
    items: joi.array().items(listItemSchema),
});

const feeSchema = joi.object().keys({
    description: joi.string().required(),
    amount: joi.number().required(),
    multiplier: joi.string().optional(),
    condition: joi.string().optional(),
    prefix: joi.string().optional(),
});

const multiApiKeySchema = joi.object({
    test: joi.string().optional(),
    production: joi.string().optional(),
});

const notifySchema = joi.object().keys({
    apiKey: [joi.string().allow("").optional(), multiApiKeySchema],
    templateId: joi.string(),
    emailField: joi.string(),
    personalisation: joi.array().items(joi.string()),
    addReferencesToPersonalisation: joi.boolean().optional(),
});

const emailSchema = joi.object().keys({
    emailAddress: joi.string(),
});

const webhookSchema = joi.object().keys({
    url: joi.string(),
});

const outputSchema = joi.object().keys({
    name: joi.string(),
    title: joi.string().optional(),
    type: joi.string().allow("notify", "email", "webhook", "sheets"),
    outputConfiguration: joi
        .alternatives()
        .try(notifySchema, emailSchema, webhookSchema),
});

const feedbackSchema = joi.object().keys({
    feedbackForm: joi.boolean().default(false),
    url: joi.when("feedbackForm", {
        is: joi.boolean().valid(false),
        then: joi.string().optional().allow(""),
    }),
    emailAddress: joi
        .string()
        .email({
            tlds: {
                allow: false,
            },
        })
        .optional(),
});

const phaseBannerSchema = joi.object().keys({
    phase: joi.string().valid("alpha", "beta"),
});

const importedDataSetSchema = joi.object().keys({
    fileTitle: joi.string(),
    fileName: joi.string(),
    uploadedDate: joi.string(),
    fileId: joi.string(),
});

const dataSetSchema = joi.object().keys({
    index: joi.string(),
    type: joi
        .string()
        .valid(InputType.CUSTOM, InputType.FILLED, InputType.SELECT),
    value: joi.alternatives().conditional("type", {
        is: InputType.FILLED,
        then: joi.string().allow(""),
        otherwise: joi.string(),
    }),
    bold: joi.boolean(),
    calc: joi.boolean(),
    checked: joi.boolean(),
    numeric: joi.boolean(),
    format: joi
        .string()
        .valid(FormatType.INTEGER, FormatType.DECIMAL)
        .optional(),
});

const designedDataSetSchema = joi.object().keys({
    id: joi.string(),
    title: joi.string(),
    uploadedDate: joi.string(),
    csvUsed: joi.string().allow("").optional(),
    keyIdentifier: joi.string().allow("").optional(),
    data: joi.array().items(joi.array().items(dataSetSchema)),
});

const childDependentSchema = joi.object().keys({
    id: joi.string(),
    status: joi.string(),
    name: joi.string(),
    title: joi.string().optional(),
});

const childConfigSchema = joi.object().keys({
    childId: joi.string(),
    childFormName: joi.string(),
    childFormTitle: joi.string(),
    cardOrder: joi.number(),
    dependentforms: joi.array().items(childDependentSchema).optional(),
    dateComponent: joi.string().allow("").optional(),
    helpText: joi.string().allow("").optional(),
    parentId: joi.string(),
    condition: joi.string().allow("").optional(),
    conditionName: joi.string().allow("").optional(),
    isMainChild: joi.boolean(),
});

const parentChildSchema = joi.object().keys({
    id: joi.string(),
    isMainParent: joi.boolean(),
    parentChildConfig: {
        description: joi.string(),
        childHeading: joi.string(),
        childConfigs: joi.array().items(childConfigSchema),
    },
});

const parentDetailsSchema = joi.object().keys({
    parentId: joi.string(),
    parentName: joi.string(),
});

const documentsSchema = joi.object().keys({
    id: joi.string(),
    title: joi.string(),
    uploadedDate: joi.string(),
    type: joi.string(),
    fileName: joi.string(),
    path: joi.string(),
});

const tabsSchema = joi.array().items({
    id: joi.string(),
    tabData: joi.array().items({
        tabLabel: joi.string(),
        tabHeader: joi.string(),
        type: joi
            .string()
            .valid(TabInputType.SELECT_DATASET, TabInputType.PARAGRAPH),
        value: joi.string(),
    }),
});

export const Schema = joi
    .object()
    .required()
    .keys({
        id: joi.string().optional(),
        key: joi.string().optional(),
        displayName: joi.string().optional(),
        confirmationMsg: joi.string().allow("").optional(),
        userId: joi.string().optional(),
        lastModified: joi.string().optional(),
        lastDownloaded: joi.string().optional(),
        createdBy: joi.string().optional(),
        lastUpdatedByName: joi.string().optional(),
        lastUpdatedById: joi.string().optional(),
        feedbackForm: joi.boolean().optional(),
        formStatus: joi.string().optional(),
        name: localisedString.optional(),
        feedback: feedbackSchema.optional(),
        startPage: joi.string().required(),
        pages: joi.array().required().items(pageSchema).unique("path"),
        sections: joi.array().items(sectionsSchema).unique("name").required(),
        conditions: joi.array().items(conditionsSchema).unique("name"),
        calculations: joi.array().items(calculationSchema).unique("name"),
        lists: joi.array().items(listSchema).unique("name"),
        fees: joi.array().items(feeSchema).optional(),
        paymentReferenceFormat: joi.string().optional(),
        metadata: joi.object({ a: joi.any() }).unknown().optional(),
        declaration: joi.string().allow("").optional(),
        customSummaryMessage: joi.string().allow("").optional(),
        outputs: joi.array().items(outputSchema),
        payApiKey: [joi.string().allow("").optional(), multiApiKeySchema],
        skipSummary: joi.boolean().default(false),
        version: joi.number().default(CURRENT_VERSION),
        phaseBanner: phaseBannerSchema.optional(),
        specialPages: specialPagesSchema.optional(),
        signInRequired: joi.boolean().default(false),
        file: joi.optional(),
        ukprn: joi.optional(),
        importedDataSets: joi.array().items(importedDataSetSchema).optional(),
        designedDataSets: joi.array().items(designedDataSetSchema).optional(),
        documents: joi.array().items(documentsSchema).optional(),
        tabs: tabsSchema.optional(),
        parentDetails: parentDetailsSchema.optional(),
        parentChild: parentChildSchema.optional(),
        // SQL specific
        Fid: joi.number().optional(),
        //Azure specific
        _rid: joi.optional(),
        _self: joi.optional(),
        _etag: joi.optional(),
        _attachments: joi.optional(),
        _ts: joi.optional(),
    });

/**
 *  Schema versions:
 *  Undefined / 0 - initial version as at 28/8/20. Conditions may be in object structure or string form.
 *  1 - Relevant components (radio, checkbox, select, autocomplete) now contain
 *      options as 'values' rather than referencing a data list
 *  2 - Reverse v1. Values populating radio, checkboxes, select, autocomplete are defined in Lists only.
 *  TODO:- merge fees and paymentReferenceFormat
 **/
