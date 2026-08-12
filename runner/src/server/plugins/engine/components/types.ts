import { DataSet, TabDataType } from "@xgovformbuilder/model";

export type Label = {
    text: string;
    classes: string;
    html?: string;
    isPageHeading?: boolean;
};

export type Content = {
    title?: string;
    text: string;
    condition?: any; // TODO
};

export type ListItemLabel = Omit<Label, "text" | "isPageHeading">;

export type ListItem = {
    text?: string;
    value: string | boolean | number;
    hint?: {
        html: string;
    };
    checked?: boolean;
    selected?: boolean;
    label?: ListItemLabel;
    condition?: string;
};

export type TableItem = {
    index: string;
    type: string;
    value: string;
    bold: boolean;
    calc: boolean;
    checked: boolean;
};

// TODO: Break this down for each component (Same as model/Component).
export type ViewModel = {
    label?: Label;
    type?: string;
    id?: string;
    name?: string;
    value?: any; // TODO
    displayValue?: string;
    hint?: {
        html: string;
    };
    classes?: string;
    condition?: any; // TODO
    options?: any;
    errorMessage?: {
        text: string;
    };
    summaryHtml?: string;
    html?: any; // TODO
    attributes: {
        autocomplete?: string;
        maxlength?: number;
        pattern?: string;
        title?: string;
        multiple?: string;
        accept?: string;
        step?: string;
        expression?: string;
        expressionData?: string;
        precision?: string;
    };
    content?: Content | Content[] | string;
    rows?: number;
    items?: ListItem[];
    disableLookup?: boolean;
    fieldset?: {
        legend?: Label;
    };
    children?: ComponentCollectionViewModel;
    autocomplete?: string;
    tableData?: TableItem[];
    tabData?: TabDataType[];
    initialTable?: DataSet[][];
    status?: string;
    format?: string;
    timeout?: number;
};

export type ComponentCollectionViewModel = {
    type: string;
    isFormComponent: boolean;
    model: ViewModel;
}[];

export type DataType =
    | "list"
    | "text"
    | "date"
    | "monthYear"
    | "number"
    | "file";
