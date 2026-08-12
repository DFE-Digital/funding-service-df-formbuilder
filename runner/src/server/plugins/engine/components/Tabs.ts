import {
    FormData,
    FormPayload,
    FormSubmissionErrors,
    FormSubmissionState,
} from "../types";
import { ViewModel } from "./types";
import { ComponentBase } from "./ComponentBase";
import {
    ComponentTypeEnum,
    TabsComponent,
    Tabs as TabsType,
    TabData,
    TabInputType,
} from "@xgovformbuilder/model";
import { FormModel } from "../models";
import * as helpers from "./helpers";

export class Tabs extends ComponentBase {
    tabData: TabData[];
    tabDetail: TabsType;
    type = ComponentTypeEnum.Tabs;
    constructor(def: TabsComponent, model: FormModel) {
        super(def, model);
        this.tabDetail = model.tabs?.find(
            (tab) => tab.id === def.name.split("-")[0]
        )!;
        this.tabData = this.tabDetail.tabData;
        this.tabData = this.tabData.map((tab) => {
            let designedDataSet;
            if (tab?.type === TabInputType.SELECT_DATASET) {
                designedDataSet = model.def.designedDataSets?.find(
                    (dts) => dts.id === tab.value
                );
            } else if (tab?.type === TabInputType.PARAGRAPH) {
                return {
                    ...tab,
                    href: tab.tabLabel.split(" ").join("-"),
                };
            }
            return {
                ...tab,
                designedDataSet,
                href: tab.tabLabel.split(" ").join("-"),
            };
        });
    }
    getFormSchemaKeys() {
        return helpers.getFormSchemaKeys(this.name, "string", this);
    }

    getStateSchemaKeys() {
        return helpers.getStateSchemaKeys(this.name, "string", this);
    }
    localisedString(description) {
        let string;
        if (!description) {
            string = "";
        } else if (typeof description === "string") {
            string = description;
        } else {
            string = description?.[this.lang] ?? description.en;
        }
        return string;
    }

    getViewModel(formData: FormData, errors: FormSubmissionErrors) {
        const options: any = this.options;
        const label = this.title;
        const name = this.name;

        const viewModel: ViewModel = {
            ...super.getViewModel(formData, errors),
            label: {
                text: label,
                classes: "govuk-label--s",
            },
            id: name,
            name: name,
            value: formData[name],
            options: options,
        };
        if (this.hint) {
            viewModel.hint = {
                html: this.localisedString(this.hint),
            };
        }
        viewModel.tabData = this.tabData;
        viewModel.initialTable = formData?.initialTable;
        return viewModel;
    }

    getFormDataFromState(state: FormSubmissionState) {
        const name = this.name;

        if (state?.initialTabTable) {
            return {
                [name]: this.getFormValueFromState(state),
                initialTable: state.initialTabTable,
            };
        }

        if (name in state) {
            return {
                [name]: this.getFormValueFromState(state),
            };
        }

        return undefined;
    }

    getFormValueFromState(state: FormSubmissionState) {
        const name = this.name;

        if (name in state) {
            return state[name] === null ? "" : state[name].toString();
        }
    }

    getStateFromValidForm(payload: FormPayload) {
        const name = this.name;

        return {
            [name]: this.getStateValueFromValidForm(payload),
        };
    }

    getStateValueFromValidForm(payload: FormPayload): any {
        const name = this.name;

        return name in payload && payload[name] !== "" ? payload[name] : null;
    }

    getDisplayStringFromState(state) {
        return state[this.name];
    }
}
