import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { FormComponent } from "./FormComponent";
import joi, { Schema } from "joi";
import { NumberFieldComponent } from "@xgovformbuilder/model";
import { numberWithCommas } from "../pageControllers/utils";

export class NumberField extends FormComponent {
    schemaOptions: NumberFieldComponent["schema"];
    formSchema;
    prefixValue: any;
    suffixValue: any;
    prefixType: any;
    precision: number;
    classes: any;
    constructor(def, model) {
        super(def, model);
        this.schemaOptions = def.schema;
        const { min, max, precision = -1 } = def.schema;
        this.prefixValue = def.prefixValue;
        this.prefixType = def.prefixType;
        this.suffixValue = def.suffixValue;
        this.classes = def.options.classes;
        this.precision = def.schema.precision === undefined ? -1 : precision;
        this.options = def.options;

        let schema = joi.number();
        schema = schema.label(def.title);

        if (def.schema?.min && def.schema?.max) {
            schema = schema.$;
        }
        if ((def.schema?.min || def.schema?.min === 0) ?? false) {
            schema = schema.min(min);
        }

        if ((def.schema?.max || def.schema?.max === 0) ?? false) {
            schema = schema.max(max);
        }

        if (def.schema?.precision ?? false) {
            schema = schema.precision(parseInt(precision));
        }

        if (this.options.customValidationMessage) {
            schema = schema.rule({
                message: this.options.customValidationMessage,
            });
        }

        if (this.options.required === false) {
            let optionalSchema = {};
            if (def.schema?.max && def.schema?.min) {
                optionalSchema = joi
                    .number()
                    .allow(null)
                    .allow("")
                    .default("")
                    .optional()
                    .min(def.schema?.min)
                    .max(def.schema?.max)
                    .label(def.title);
            } else if (def.schema?.max) {
                optionalSchema = joi
                    .number()
                    .allow(null)
                    .allow("")
                    .default("")
                    .optional()
                    .max(def.schema?.max)
                    .label(def.title);
            } else if (def.schema?.min) {
                optionalSchema = joi
                    .number()
                    .allow(null)
                    .allow("")
                    .default("")
                    .optional()
                    .min(def.schema?.min)
                    .label(def.title);
            } else {
                optionalSchema = joi
                    .number()
                    .allow(null)
                    .allow("")
                    .default("")
                    .optional()
                    .label(def.title);
            }
            this.schema = optionalSchema;
        } else {
            this.schema = schema;
        }
    }
    value: any = "";

    /** Fetches the value and text from state */
    getFormDataFromState(state: FormSubmissionState) {
        const name = this.name;
        this.value = this.getFormValueFromState(state);
        if (name in state) {
            return {
                [name]: this.getFormValueFromState(state),
            };
        }

        return undefined;
    }

    getFormSchemaKeys() {
        return { [this.name]: this.schema as Schema };
    }

    getStateSchemaKeys() {
        return { [this.name]: this.schema as Schema };
    }

    getViewModel(formData: FormData, errors: FormSubmissionErrors) {
        const prefix: any = this.prefixValue;
        const prefixType: any = this.prefixType;
        const suffix: any = this.suffixValue;
        const classes: any = this.classes;
        const precision: number = this.precision;
        const errorMessage: string = `Max allowed decimals are ${precision}`;
        const viewModel = {
            ...super.getViewModel(formData, errors),
            type: "number",
            prefixType: prefixType,
            prefixValue: prefix,
            suffixValue: suffix,
            classes: classes,
            precision: precision,
            patternErrorMsg: errorMessage,
            value: this.value,
        };

        if (this.prefixValue === "£" || this.prefixValue === "€") {
            if (this.value) {
                viewModel.displayValue = numberWithCommas(this.value);
            }
        }

        if (this.schemaOptions.precision) {
            viewModel.attributes.step =
                "0." + "1".padStart(this.schemaOptions.precision, "0");
        }
        if (this.schemaOptions.precision == 0 && this.schemaOptions.precision) {
            viewModel.attributes.step = "0".padStart(
                this.schemaOptions.precision,
                "0"
            );
        }
        if (!this.schemaOptions.precision) {
            viewModel.attributes.step = "any";
        }
        // Calculation related
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
            viewModel.classes = `${this.classes} result-input`;
        }
        return viewModel;
    }

    getDisplayStringFromState(state: FormSubmissionState) {
        return state[this.name] || state[this.name] === 0
            ? state[this.name].toString()
            : undefined;
    }
}
