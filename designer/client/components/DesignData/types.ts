import { InputType, FormatType } from "@xgovformbuilder/model";

export enum RenderTableType {
    INITIAL = "initial_render",
    CHANGE = "on_change_render",
}

export enum RenderTabsType {
    INITIAL = "initial_render",
    CHANGE = "on_change_render",
}

export enum Colors {
    Green = "#005A30",
    Blue = "#1D70B8",
    Cyan = "#B58840",
}

export type SelectedDataSet = {
    datasetId: string;
    keys: string[];
};

export type DynamicDataSet = {
    [key: string]: {
        type: InputType;
        value: string;
        bold: boolean;
        calc: boolean;
        checked: boolean;
        numeric: boolean;
        format?: FormatType;
    };
};

export type DynamicDataSetTabs = {
    [key: string]: {
        tabLabel: string;
        tabHeader: string;
        type: InputType;
        value: string;
    };
};

export type TempDataSetFormat = {
    row: number;
    column: number;
    numericIndex: number;
    index: string;
    type: InputType;
    value: string;
    bold: boolean;
};

export type TempDataSetFormatTabs = {
    tab: number;
    index: string;
    tabLabel: any;
    tabHeader: any;
    type: InputType;
    value: string;
};

export type TableDimension = {
    rows: number;
    columns: number;
};

export type TabsNumber = {
    tabs: number;
};
