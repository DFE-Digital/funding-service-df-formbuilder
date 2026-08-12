import joi, { Schema } from "joi";

import { ComponentBase } from "./ComponentBase";

import {
    FormSubmissionState,
    FormSubmissionErrors,
    FormData,
    FormPayload,
} from "../types";
import { ViewModel } from "./types";
import { FormModel } from "../models";
import { ComponentDef } from "@xgovformbuilder/model";
import { numberWithCommas } from "../pageControllers/utils";

export class ResultComponentBase extends ComponentBase {
    isFormComponent: boolean = true;
    __lang: string = "en";
    expression: string = "";
    calculationName: string = "";
    constructor(def: ComponentDef, model: FormModel) {
        super(def, model);
        this.expression = def.expression;
        this.calculationName = def.calculationName;
    }

    get lang() {
        return this.__lang;
    }

    set lang(lang) {
        if (lang) {
            this.__lang = lang;
        }
    }

    getViewModel(formData: FormData, errors: FormSubmissionErrors) {
        const options: any = this.options;
        const precision = Number.parseInt(this?.schema.precision ?? "0");
        this.lang = formData.lang;
        const label = `${this.localisedString(this.title)}`;
        const name = this.name;
        const value =
            (formData?.value && formData?.value[name]) ?? formData?.[name];

        const viewModel: ViewModel = {
            ...super.getViewModel(formData, errors),
            label: {
                text: label,
                classes: "govuk-label--s",
            },
            id: name,
            name: name,
            value: value,
            displayValue: value,
            options: options,
        };
        if (options.prefixValue === "£" || options.prefixValue === "€") {
            if (value) {
                viewModel.displayValue = numberWithCommas(value);
            }
        }
        if (this.hint) {
            viewModel.hint = {
                html: this.localisedString(this.hint),
            };
        }
        if (this.expression) {
            viewModel.attributes = { expression: this.expression };
        }

        if (this.options?.condition) {
            viewModel.condition = this.options.condition;
        }

        viewModel.attributes = {
            precision: precision,
            suffix: options.suffixValue ?? "",
            prefix: options.prefixValue ?? "",
            ...viewModel.attributes,
        };

        const page = this.model?.def?.pages.find((page) =>
            page.components?.find((comp) => comp.name == viewModel.id)
        );
        if (
            page?.components?.find(
                (comp) =>
                    comp?.type == "Result" &&
                    comp.expression.includes(viewModel.id!)
            )
        ) {
            viewModel.classes = "result-input";
        }

        if (options.classes) {
            viewModel.classes = options.classes;
        }
        return viewModel;
    }

    getFormDataFromState(state: FormSubmissionState) {
        const name = this.name;

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
            const value =
                state[name] === null
                    ? ""
                    : parseFloat(state[name]).toFixed(
                          Number.parseInt(this?.schema.precision ?? "0")
                      );
            return value;
        }
        return undefined;
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

    getFormSchemaKeys() {
        return {
            [this.name]: joi
                .number()
                .allow(null)
                .allow("")
                .default("")
                .optional(),
        };
    }

    getStateSchemaKeys(): { [k: string]: Schema } {
        return {
            [this.name]: joi
                .number()
                .allow(null)
                .allow("")
                .default("")
                .optional(),
        };
    }

    getDisplayStringFromState(state) {
        const value = state[this.name];
        return value;
    }
}
