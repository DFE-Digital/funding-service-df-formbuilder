import { ConditionRawData } from ".";
import {
    ComponentDef,
    NumberFieldComponent,
    ResultComponent,
} from "../components";

export interface Next {
    path: string;
    condition?: string;
}
export type Link = Next;

export interface Page {
    title: string;
    path: string;
    controller: string;
    components?: ComponentDef[];
    section: string; // the section ID
    pageSequence?: string;
    next?: { path: string; condition?: string }[];
}

export interface Section {
    name: string;
    title: string;
    repeatableSection?: boolean;
    numberComp?: string;
    conditionComp?: string;
    triggerCompValue?: string | number | undefined;
}

export interface Item {
    text: string;
    value: string | number | boolean;
    description?: string;
    condition?: string;
    links?: string;
    Order?: string;
}

export interface List {
    name: string;
    title: string;
    type: "string" | "number" | "boolean";
    items: Item[];
    id: string;
    dataset?: string;
}

export interface Blobresponse {
    establishment_URN: string | number;
    establishment_UKPRN: number;
    establishment_name: "string";
}

export interface Feedback {
    feedbackForm?: boolean;
    url?: string;
    emailAddress?: string;
}

export type PhaseBanner = {
    phase?: "alpha" | "beta";
    feedbackUrl?: string;
};

export type MultipleApiKeys = {
    test?: string;
    production?: string;
};

export enum OutputType {
    Email = "email",
    Notify = "notify",
    Webhook = "webhook",
}

export type EmailOutputConfiguration = {
    emailAddress: string;
};

export type NotifyOutputConfiguration = {
    apiKey: string;
    templateId: string;
    emailField: string;
    personalisation: string[];
    addReferencesToPersonalisation?: boolean;
};

export type WebhookOutputConfiguration = {
    url: string;
};

export type OutputConfiguration =
    | EmailOutputConfiguration
    | NotifyOutputConfiguration
    | WebhookOutputConfiguration;

export type Output = {
    name: string;
    title: string;
    type: OutputType;
    outputConfiguration: OutputConfiguration;
};

type Toggleable<T> = boolean | T;

type ConfirmationPage = {
    customText: {
        title: string;
        paymentSkipped: Toggleable<string>;
        nextSteps: Toggleable<string>;
    };
    components: ComponentDef[];
};

export type SpecialPages = {
    confirmationPage?: ConfirmationPage;
};

export function isMultipleApiKey(
    payApiKey: string | MultipleApiKeys | undefined
): payApiKey is MultipleApiKeys {
    let obj = payApiKey as MultipleApiKeys;
    return obj.test !== undefined || obj.production !== undefined;
}

export type Fee = {
    description: string;
    amount: number;
    multiplier?: string;
    condition?: string;
    prefix?: string;
};
export enum FormStatus {
    InDevelopment = "In development",
    UAT = "UAT",
    Published = "Published",
    Closed = "Closed",
}

interface ModelComputeBase<T extends string> {
    id: string;
    type: T;
    order: number;
}

export type ModelComputeComponentUnit = ModelComputeBase<"component"> & {
    entity: string;
    value: string;
};

export type ModelComputeCalculationUnit = ModelComputeBase<"calculation"> & {
    entity: string;
    value: string;
};

export type ModelComputeNumberUnit = ModelComputeBase<"number"> & {
    value: number | null;
    entity: "";
};

export type ModelComputeOperatorUnit = ModelComputeBase<"operator"> & {
    value: "+" | "-" | "*" | "/" | null;
    entity: "";
};

export type ModelComputeUnit =
    | ModelComputeComponentUnit
    | ModelComputeNumberUnit
    | ModelComputeCalculationUnit
    | ModelComputeOperatorUnit;

export type ModelComputeList = ModelComputeUnit[];
export interface Calculation {
    displayName: string;
    name: string;
    pageLocation: string;
    hint?: string;
    type: string;
    expression: string;
    title: string;
    hideResult: boolean;
    components: (NumberFieldComponent | ResultComponent)[];
    datasets: (DataSet & { designedDataSetId: string })[];
    calculationsMapped?: string[];
    computeList?: ModelComputeList;
    prefixValue: string;
    suffixValue: string;
    precision: number;
}

export interface ImportedDataSet {
    fileTitle: string;
    fileId: string;
    uploadedDate: Date;
    fileName: string;
}

export enum InputType {
    CUSTOM = "custom_text",
    SELECT = "select_value",
    FILLED = "filled_empty",
}

export enum FormatType {
    INTEGER = "integer",
    DECIMAL = "decimal",
}

export enum TabInputType {
    SELECT_DATASET = "select_dataset",
    PARAGRAPH = "paragraph_text",
}

export interface DataSet {
    index: string;
    type: InputType;
    value: string;
    bold: boolean;
    calc: boolean;
    checked: boolean;
    numeric: boolean;
    format?: FormatType;
}

export interface SectionDetails {
    name: string;
    numberComp: string;
    repeatableSection: boolean;
}
export interface TabData {
    tabLabel: string;
    tabHeader: string;
    type: TabInputType;
    value: string;
}

export interface DesignedDataSet {
    id: string;
    title: string;
    csvUsed: string;
    keyIdentifier: string;
    uploadedDate: Date;
    data: DataSet[][];
}

export interface Documents {
    id: string;
    title: string;
    uploadedDate: Date;
    type: string;
    fileName: string;
    path: string;
}

export interface Tabs {
    id: string;
    tabData: TabData[];
}

export enum FormAccessType {
    Public = "Public",
    DFESignIn = "DFE SignIn",
}

export interface ParentDetails {
    parentId: string;
    parentName: string;
}

export enum DependentFormStatus {
    InProgress = "in_progress",
    Completed = "completed",
}

export type DependentForm = {
    id: string;
    status: DependentFormStatus | null;
    name: string;
    title: string;
};
export interface ChildConfig {
    childId: string;
    childFormName: string;
    childFormTitle: string;
    cardOrder: number;
    dependentforms: DependentForm[];
    dateComponent: string;
    helpText: string;
    parentId: string;
    condition: string;
    conditionName: string;
    isMainChild: boolean;
}

export type parentChildEntity = {
    id: string | undefined;
    isMainParent: boolean;
    parentChildConfig: {
        description: string;
        childHeading: string;
        childConfigs: ChildConfig[];
    };
};
/**
 * `FormDefinition` is a typescript representation of `Schema`
 */

export type FormDefinition = {
    id: string;
    key: string;
    displayName: string;
    userId?: string;
    createdBy?: string;
    lastUpdatedByName?: string;
    lastUpdatedById?: string;
    formStatus?: FormStatus;
    formAccessTypes?: FormAccessType;
    lastModified: string;
    lastDownloaded: string;
    feedbackForm?: boolean;
    pages: Page[];
    conditions: ConditionRawData[];
    lists: List[];
    sections: Section[];
    startPage?: Page["path"] | undefined;
    name?: string | undefined;
    feedback?: Feedback;
    phaseBanner?: PhaseBanner;
    confirmationMsg: string | undefined;
    fees: Fee[];
    skipSummary?: boolean | undefined;
    outputs?: Output[] | OutputType | undefined;
    declaration?: string | undefined;
    customSummaryMessage?: string | undefined;
    metadata?: Record<string, any>;
    payApiKey?: string | MultipleApiKeys | undefined;
    specialPages?: SpecialPages;
    paymentReferenceFormat?: string;
    calculations: Calculation[];
    signInRequired?: boolean;
    file?: string | undefined;
    ukprn?: number | string | undefined;
    importedDataSets?: ImportedDataSet[];
    designedDataSets?: DesignedDataSet[];
    documents?: Documents[];
    Blobresponse?: Blobresponse;
    tabs?: Tabs[];
    Fid?: number;
    parentDetails?: ParentDetails;
    parentChild?: parentChildEntity;
    currentPath?: string | undefined;
};

interface provider {
    UKPRN: number;
    URN: number;
}

export type ProviderMapping = {
    id: string;
    providers: provider;
};

interface FieldMapping {
    file?: string;
    formStatus: string;
    signInRequired: boolean;
}

interface MultipleFormsEntity {
    formId: string;
    tableName: string;
    FieldChanges: FieldMapping;
}

export type updateMultileForms = MultipleFormsEntity[];
