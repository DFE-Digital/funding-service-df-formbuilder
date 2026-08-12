import {
    ComponentDef,
    FormAccessType,
    FormConfiguration,
    FormDefinition,
    FormStatus,
    NumberFieldComponent,
    ParentDetails,
    Section,
    YesNoFieldComponent,
    Calculation,
    DesignedDataSet,
    Page,
    DataSet,
    ResultComponent,
} from "@xgovformbuilder/model";
import { DependentFormStatus, FormConfigurationTabs } from "../utils";
import { SelectOptions } from "../ui";

/** Common */

export enum LoadingState {
    Idle = "idle",
    Pending = "pending",
    Succeeded = "succeeded",
    Failed = "failed",
}

export enum DateEnum {
    Day = "day",
    Month = "month",
    Year = "year",
}

/** Form Configurations */

export type FormConfigurationWithChild = FormConfiguration & {
    childs: FormConfigurationWithChild[];
};

export interface FormConfigurationState {
    loading: LoadingState;
    entities: FormConfigurationWithChild[];
}

/** Users */

export interface UsersState {
    currentUser: {
        loading: LoadingState;
        data: {
            id: string;
            name: string;
            isSessionActive: boolean;
            homeAccountId: string;
        };
    };
}

/** Dashboard */

export type SummaryDataType = {
    title: string;
    total: number;
    my_forms: number;
    col_forms: number;
};

export enum FilterTypes {
    FormStatus = "formStatus",
    FormAccessType = "formAccessType",
    ModifiedOn = "modifiedOn",
    CreatedBy = "createdBy",
    Search = "search",
}

export type DashboardFilters = {
    show: boolean;
    [FilterTypes.FormStatus]: {
        [FormStatus.InDevelopment]: boolean;
        [FormStatus.UAT]: boolean;
        [FormStatus.Published]: boolean;
        [FormStatus.Closed]: boolean;
    };
    [FilterTypes.FormAccessType]: {
        [FormAccessType.Public]: boolean;
        [FormAccessType.DFESignIn]: boolean;
    };
    [FilterTypes.ModifiedOn]: {
        from: {
            [DateEnum.Day]: number;
            [DateEnum.Month]: number;
            [DateEnum.Year]: number;
        };
        till: {
            [DateEnum.Day]: number;
            [DateEnum.Month]: number;
            [DateEnum.Year]: number;
        };
    };
    [FilterTypes.Search]: string;
    [FilterTypes.CreatedBy]: string[];
};

export interface DashboardState {
    loading: LoadingState;
    selectedTab: FormConfigurationTabs;
    selectedFormConfig: FormConfigurationWithChild | null;
    myForms: FormConfigurationWithChild[];
    filteredMyForms: FormConfigurationWithChild[];
    colForms: FormConfigurationWithChild[];
    filteredColForms: FormConfigurationWithChild[];
    createdBy: string[];
    summaryInfo: {
        total: SummaryDataType;
        [FormStatus.InDevelopment]: SummaryDataType;
        [FormStatus.UAT]: SummaryDataType;
        [FormStatus.Published]: SummaryDataType;
        [FormStatus.Closed]: SummaryDataType;
    };
    filter: DashboardFilters;
    details: {
        show: boolean;
        data: FormConfigurationWithChild | null;
    };
    isChild: boolean;
}

/** List Module */

export type ListState = {
    loading: LoadingState;
    datasetLoading: LoadingState;
    entities: ListEntity[];
    form: FormDefinition;
    selectedList: ListEntity;
    newList: ListEntity;
    newListItem: ListItem;
    selectedListItem: ListItem;
};

export type ListItem = {
    text: string;
    value: string;
    condition?: string;
    description?: string;
    links?: string;
};

export type ListEntity = {
    title: string;
    name: string;
    type: string; // TODO: can be removed?
    items: ListItem[];
    dataset?: string;
};

/** Parent & Child Module */

export type parentChildEntity = {
    id: string | undefined;
    isMainParent: boolean;
    parentChildConfig: {
        description: string;
        childHeading: string;
        childConfigs: ChildConfig[];
    };
};

export interface ParentChildState {
    loading: LoadingState;
    selectedParentForm: FormConfigurationWithChild | null;
    selectedFormData: FormDefinition | null;
    isEdit: boolean;
    originalParentChildDetails: parentChildEntity | null;
    markAsParent: "0" | "1";
    description: string;
    childHeading: string;
    childConfigs: ChildConfig[];
    newChildConfig: ChildConfig;
    isChildEdit: boolean;
    editChild: ChildConfig | null;
    editChildIndex: number | null;
    parentDetails: ParentDetails | null;
    selectedDependents: DependentForm[];
}

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

export type DependentForm = {
    id: string;
    status: DependentFormStatus | null;
    name: string;
    title: string;
};

/** Change Status Module */

export type ChangeStatusState = {
    loading: LoadingState;
    selectedFormConfig: FormConfigurationWithChild | null;
    selectedStatus: FormStatus | null;
    isParentSelected: string | null;
    selectedChildForms: string[];
    details: {
        show: boolean;
        data: FormConfigurationWithChild | null;
    };
};

/** Delete Form Module */

export type DeleteFormState = {
    loading: LoadingState;
    selectedFormConfig: FormConfigurationWithChild | null;
    isParentSelected: string | null;
    isChild: boolean;
    selectedChildForms: string[];
    details: {
        show: boolean;
        data: FormConfigurationWithChild | null;
    };
};

/** API Module */
export type ApiState = {
    status: LoadingState;
    message: string;
};

/** Duplicate Form Module */

export type childFormsDetails = {
    id: string;
    newName: string;
    isChecked: boolean;
    error: string;
};

export type DuplicateFormState = {
    loading: LoadingState;
    showRedirect: boolean;
    selectedFormConfig: FormConfigurationWithChild | null;
    parentForm: {
        newName: string;
        isChecked: boolean;
        error: string;
    };
    isChild: boolean;
    selectedChildForms: string[];
    childForms: childFormsDetails[];
    details: {
        show: boolean;
        data: FormConfigurationWithChild | null;
    };
};

/** Change Access Type Module */

export type ChangeAccessTypeState = {
    loading: LoadingState;
    selectedFormConfig: FormConfigurationWithChild | null;
    selectedAccessType: FormAccessType | null;
    isParentSelected: string | null;
    selectedChildForms: string[];
    details: {
        show: boolean;
        data: FormConfigurationWithChild | null;
    };
};

/** Form Section Module */

export type FormSectionState = {
    loading: LoadingState;
    entities: Section[];
    form: FormDefinition;
    selectedSection: Section | null;
    newSection: Section;
    numberComponents: SelectOptions[];
    conditionalComponents: SelectOptions[];
};

/** Calculation Builder Module */

export type NumberComponentEntity = NumberFieldComponent & {
    isComponent: true;
    isRepeatable: boolean;
};

export type ResultComponentEntity = ResultComponent & {
    isComponent: true;
    isRepeatable: boolean;
};

export type DataSetEntity = DataSet & {
    isComponent: false;
    designedDataSetId: string | null;
};
export type SelectedEntity =
    | NumberComponentEntity
    | DataSetEntity
    | ResultComponentEntity;

/* common base for compute units */
interface ComputeBase<T extends string> {
    id: string;
    type: T;
    order: number;
}

export type ComputeComponentUnit = ComputeBase<"component"> & {
    entity: SelectedEntity;
    value: string;
};

export type ComputeCalculationUnit = ComputeBase<"calculation"> & {
    entity: Calculation;
    value: string;
};

export type ComputeNumberUnit = ComputeBase<"number"> & {
    value: number | null;
};

export type ComputeOperatorUnit = ComputeBase<"operator"> & {
    value: "+" | "-" | "*" | "/" | null;
};

export type ComputeUnit =
    | ComputeComponentUnit
    | ComputeNumberUnit
    | ComputeCalculationUnit
    | ComputeOperatorUnit;
export type ComputeList = ComputeUnit[];

export type CalculationFormState = {
    title: string;
    selectedPageOrDataset: Page | DesignedDataSet | null;
    selectedCalculation: Calculation | null;
    isSelectedPage: boolean;
    selectedEntities: SelectedEntity[];
    selectAllEntity: string;
    computeList: ComputeList;
    addedCalculations: Calculation | null;
    repeatableSection: Section | null;
};

export type CalculationBuilderState = {
    loading: LoadingState;
    form: FormDefinition;
    entities: Calculation[];
    selectedCalculation: Calculation | null;
    newCalculation: CalculationFormState;
    editCalculation: CalculationFormState;
};
