import { TabInputType } from "@xgovformbuilder/model";

export enum RenderTabsType {
    INITIAL = "initial_render",
    CHANGE = "on_change_render",
}

export enum Colors {
    Green = "#005A30",
}

export type SelectedDataSet = {
    datasetId: string;
    keys: string[];
};

export type DynamicDataSetTabs = {
    [key: string]: {
        tabLabel: string;
        tabHeader: string;
        type: TabInputType;
        value: string;
    };
};

export type TempDataSetFormat = {
    row: number;
    column: number;
    numericIndex: number;
    index: string;
    type: TabInputType;
    value: string;
    bold: boolean;
};

export type TempDataSetFormatTabs = {
    tab: number;
    index: string;
    tabLabel: any;
    tabHeader: any;
    type: TabInputType;
    value: string;
};

export type TabsNumber = {
    tabs: number;
};
