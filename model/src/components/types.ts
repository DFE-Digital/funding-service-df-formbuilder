export enum ComponentTypeEnum {
    TextField = "TextField",
    MultilineTextField = "MultilineTextField",
    YesNoField = "YesNoField",
    // DateField = "DateField",
    // TimeField = "TimeField",
    // DateTimeField = "DateTimeField",
    // DatePartsField = "DatePartsField",
    // MonthYearField = "MonthYearField",
    // DateTimePartsField = "DateTimePartsField",
    DateAndTimeField = "DateAndTimeField",
    SelectField = "SelectField",
    AutocompleteField = "AutocompleteField",
    RadiosField = "RadiosField",
    CheckboxesField = "CheckboxesField",
    NumberField = "NumberField",
    UkAddressField = "UkAddressField",
    TelephoneNumberField = "TelephoneNumberField",
    EmailAddressField = "EmailAddressField",
    FileUploadField = "FileUploadField",
    Para = "Para",
    Result = "Result",
    Html = "Html",
    InsetText = "InsetText",
    Details = "Details",
    FlashCard = "FlashCard",
    List = "List",
    TableDataset = "TableDataset",
    Tabs = "Tabs",
    Filedownload = "Filedownload",
    DataImport = "DataImport",
    DSIAccess = "DSIAccess",
}

export type ComponentType =
    | "TextField"
    | "MultilineTextField"
    | "YesNoField"
    | "DateAndTimeField"
    // | "DateField"
    // | "TimeField"
    // | "DateTimeField"
    // | "MonthYearField"
    // | "DatePartsField"
    // | "DateTimePartsField"
    | "SelectField"
    | "AutocompleteField"
    | "RadiosField"
    | "CheckboxesField"
    | "NumberField"
    | "UkAddressField"
    | "TelephoneNumberField"
    | "EmailAddressField"
    | "FileUploadField"
    | "Para"
    | "Result"
    | "Html"
    | "InsetText"
    | "Details"
    | "FlashCard"
    | "List"
    | "WebsiteField"
    | "TableDataset"
    | "Tabs"
    | "Filedownload"
    | "DataImport"
    | "DSIAccess";

export type ComponentSubType = "field" | "content";

export type ConditionalComponent = {
    name: "TextField" | "NumberField" | "DSIAccess";
    title: string;
    subType: "field";
};

export type ContentOptions = {
    condition?: string;
};

/**
 * Types for Components JSON structure which are expected by engine and turned into actual form input/content/lists
 */
interface TextFieldBase {
    subType?: "field";
    type: string;
    name: string;
    title: string;
    hint?: string;
    options: {
        hideTitle?: boolean;
        required?: boolean;
        optionalText?: boolean;
        classes?: string;
        allow?: string;
        autocomplete?: string;
    };
    schema: {
        max?: number;
        min?: number;
        length?: number;
        regex?: string;
        error?: any; // TODO: in same cases this is a function e.g. addressLine1 in ukaddress
    };
}

interface NumberFieldBase {
    subType?: "field";
    type: string;
    name: string;
    title: string;
    hint: string;
    options: {};
    prefixType: string;
    prefixValue: string;
    suffixValue: string;
    precision: number;
    schema: {
        min?: number;
        max?: number;
        precision?: number;
    };
}

interface DataImportFieldBase {
    subType?: "field";
    type: string;
    name: string;
    title: string;
    hint: string;
    options: {};
    schema: {};
    selectedDocument: string;
    addedFileTypes?: string[];
    documentName: string;
    columns: [];
    columnNames: [];
}

interface ListFieldBase {
    subType?: "field" | "content";
    type: string;
    name: string;
    title: string;
    options: {
        type?: string;
        hideTitle?: boolean;
        required?: boolean;
        optionalText?: boolean;
        classes?: string;
        bold?: boolean;
        format?: string;
    };
    list: string;
    schema: {};
}

interface ContentFieldBase {
    subType?: "content";
    type: string;
    name: string;
    title: string;
    content: string;
    options: ContentOptions;
    schema: {};
}

// interface ResultFieldBase {
//     subType?: "content";
//     type: string;
//     name: string;
//     displayName: string;
//     title: string;
//     content: string;
//     expression: string;
//     options: {
//         hideResult?: boolean;
//         prefixType?: string;
//         prefixValue?: string;
//         suffixValue?: string;
//         condition?: string;
//     };
//     schema: {
//         precision?: number;
//     };
// }

interface ResultFieldBase {
    subType?: "content";
    type: string;
    name: string;
    title: string;
    content: string;
    calculationName: string;
    expression: string;
    hint?: string;
    options: {
        hideTitle?: boolean;
        hideResultOnPage?: boolean;
        hideResultOnSummary?: boolean;
        prefixType?: string;
        prefixValue?: string;
        suffixValue?: string;
        condition?: string;
        bold?: boolean;
    };
    schema: {
        precision?: number;
    };
}

interface FiledownloadFieldBase {
    subType?: "content";
    type: string;
    name: string;
    displayName: string;
    title: string;
    content: string;
    expression: string;
    selectedDocument: string;
    options: ContentOptions;
    schema: {};
}

// interface DateFieldBase {
//     subType?: "field";
//     type: string;
//     name: string;
//     title: string;
//     hint?: string;
//     options: {
//         hideTitle?: boolean;
//         required?: boolean;
//         optionalText?: boolean;
//         maxDaysInFuture?: number;
//         maxDaysInPast?: number;
//     };
//     schema: {};
// }

interface DateAndTimeFieldBase {
    subType?: "field";
    type: "DateAndTimeField";
    name: string;
    title: string;
    hint?: string;
    options?: {
        hideTitle?: boolean;
        required?: boolean;
        dateRangeStart?: string;
        dateRangeEnd?: string;
        maxDaysInFuture?: boolean;
        maxDaysInPast?: boolean;
        classes?: string;
    };
    date?: {
        hideDay?: boolean;
        hideMonth?: boolean;
        hideYear?: boolean;
    };
    addTime?: boolean;
    schema: {};
}

// Text Fields
export interface TextFieldComponent extends TextFieldBase {
    type: "TextField";
}

export interface EmailAddressFieldComponent extends TextFieldBase {
    type: "EmailAddressField";
}

export interface NumberFieldComponent extends NumberFieldBase {
    type: "NumberField";
    options: {
        hideTitle?: boolean;
        required?: boolean;
        optionalText?: boolean;
        rows?: number;
        classes?: string;
    };
}

export interface WebsiteFieldComponent extends TextFieldBase {
    type: "WebsiteField";
    options: TextFieldBase["options"] & {
        customValidationMessage?: string;
    };
}

export interface MultilineTextFieldComponent {
    type: "MultilineTextField";
}

export interface TelephoneNumberFieldComponent extends TextFieldBase {
    type: "TelephoneNumberField";
    options: TextFieldBase["options"] & {
        customValidationMessage?: string;
    };
}

export interface YesNoFieldComponent extends TextFieldBase {
    type: "YesNoField";
}

export interface DataImportComponent extends DataImportFieldBase {
    type: "DataImport";
}

export interface MultilineTextFieldComponent {
    subType?: "field";
    type: "MultilineTextField";
    name: string;
    title: string;
    hint: string;
    options: {
        hideTitle?: boolean;
        required?: boolean;
        optionalText?: boolean;
        rows?: number;
        classes?: string;
    };
    schema: {
        max?: number;
        min?: number;
    };
}

export interface FileUploadFieldComponent {
    subType?: "field";
    type: "FileUploadField";
    name: string;
    title: string;
    hint: string;
    options: {
        required?: boolean;
        hideTitle?: boolean;
        multiple?: boolean;
        classes?: string;
    };
    addedFileTypes?: string[];
    schema: {};
}

export interface UkAddressFieldComponent extends TextFieldBase {
    type: "UkAddressField";
    options: {
        required?: boolean;
        hideTitle?: boolean;
        multiple?: boolean;
        classes?: string;
    };
}

export interface DateAndTimeFieldComponent {
    subType?: "field";
    type: "DateAndTimeField";
    name: string;
    title: string;
    hint?: string;
    options?: {
        hideTitle?: boolean;
        required?: boolean;
        dateRangeStart?: string;
        dateRangeEnd?: string;
        maxDaysInFuture?: boolean;
        maxDaysInPast?: boolean;
        classes?: string;
    };
    date?: {
        hideDay?: boolean;
        hideMonth?: boolean;
        hideYear?: boolean;
    };
    addTime?: boolean;
    schema: {};
}

export interface DateAndTimeFieldComponent extends DateAndTimeFieldBase {
    type: "DateAndTimeField";
}

// Date Fields
// export interface DateFieldComponent extends DateFieldBase {
//     type: "DateField";
// }

// export interface DateTimeFieldComponent extends DateFieldBase {
//     type: "DateTimeField";
// }

// export interface DatePartsFieldFieldComponent extends DateFieldBase {
//     type: "DatePartsField";
// }

// export interface MonthYearFieldComponent extends DateFieldBase {
//     type: "MonthYearField";
// }

// export interface DateTimePartsFieldComponent extends DateFieldBase {
//     type: "DateTimePartsField";
// }

// export interface TimeFieldComponent extends DateFieldBase {
//     type: "TimeField";
// }

// Content Fields
export interface ParaComponent extends ContentFieldBase {
    type: "Para";
}

export interface ResultComponent extends ResultFieldBase {
    type: "Result";
}

export interface FiledownloadComponent extends FiledownloadFieldBase {
    type: "Filedownload";
}

export interface DetailsComponent extends ContentFieldBase {
    type: "Details";
}

export interface HtmlComponent extends ContentFieldBase {
    type: "Html";
}

export interface InsetTextComponent extends ContentFieldBase {
    type: "InsetText";
}

// List Fields
export interface ListComponent extends ListFieldBase {
    type: "List";
}

export interface AutocompleteFieldComponent extends ListFieldBase {
    type: "AutocompleteField";
}

export interface CheckboxesFieldComponent extends ListFieldBase {
    type: "CheckboxesField";
}

// export interface FlashCardComponent extends ListFieldBase {
//     type: "FlashCard";
// }

export interface RadiosFieldComponent extends ListFieldBase {
    type: "RadiosField";
}

export interface DataImportComponent extends DataImportFieldBase {
    type: "DataImport";
}

export interface SelectFieldComponent extends ListFieldBase {
    type: "SelectField";
    options: ListFieldBase["options"] & { autocomplete?: string };
}

export interface TableDatasetComponent extends ContentFieldBase {
    type: "TableDataset";
    hint?: string;
}
export interface TabsComponent {
    type: "Tabs";
    subType?: "content";
    name: string;
    displayName: string;
    hint: string;
    title: string;
    options: {};
    schema: {};
}

export interface DSIAccessComponent {
    subType?: "field";
    type: "DSIAccess";
    name: string;
    title: string;
    hint: string;
    options: { required?: boolean | undefined };
    schema: {};
}

export type ComponentDef =
    | InsetTextComponent
    | AutocompleteFieldComponent
    | CheckboxesFieldComponent
    | DateAndTimeFieldComponent
    // | DateFieldComponent
    // | DatePartsFieldFieldComponent
    // | MonthYearFieldComponent
    // | DateTimeFieldComponent
    // | DateTimePartsFieldComponent
    | DetailsComponent
    | EmailAddressFieldComponent
    | FileUploadFieldComponent
    // | FlashCardComponent
    | HtmlComponent
    | ListComponent
    | MultilineTextFieldComponent
    | NumberFieldComponent
    | ParaComponent
    | ResultComponent
    | RadiosFieldComponent
    | SelectFieldComponent
    | TelephoneNumberFieldComponent
    | TextFieldComponent
    // | TimeFieldComponent
    | UkAddressFieldComponent
    | YesNoFieldComponent
    | WebsiteFieldComponent
    | TableDatasetComponent
    | TabsComponent
    | FiledownloadComponent
    | DataImportComponent
    | DSIAccessComponent;

// Components that render inputs.
export type InputFieldsComponentsDef =
    | TextFieldComponent
    | EmailAddressFieldComponent
    | NumberFieldComponent
    | MultilineTextFieldComponent
    | TelephoneNumberFieldComponent
    | YesNoFieldComponent
    | FileUploadFieldComponent
    | DateAndTimeFieldComponent
    // | DateFieldComponent
    // | DateTimeFieldComponent
    // | DateTimePartsFieldComponent
    // | MonthYearFieldComponent
    // | TimeFieldComponent
    | UkAddressFieldComponent
    | WebsiteFieldComponent
    | TableDatasetComponent
    | TabsComponent
    | DataImportComponent
    | DSIAccessComponent;

// Components that render content.
export type ContentComponentsDef =
    | ParaComponent
    | ResultComponent
    | DetailsComponent
    | HtmlComponent
    | InsetTextComponent
    | TableDatasetComponent
    | TabsComponent
    | FiledownloadComponent;

// Components that render Lists
export type ListComponentsDef =
    | ListComponent
    | AutocompleteFieldComponent
    | CheckboxesFieldComponent
    // | FlashCardComponent
    | RadiosFieldComponent
    | SelectFieldComponent;

// Components that support certain functionality in runner
//export type SupportComponentDef = DSIAccessComponent;
