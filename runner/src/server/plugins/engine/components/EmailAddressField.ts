import { InputFieldsComponentsDef } from "@xgovformbuilder/model";
import { FormModel } from "../models";
import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { FormComponent } from "./FormComponent";
import joi, { Schema } from "joi";
import {
    getStateSchemaKeys,
    getFormSchemaKeys,
    addClassOptionIfNone,
} from "./helpers";

export class EmailAddressField extends FormComponent {
    schemaOptions: InputFieldsComponentsDef["schema"];

    constructor(def: InputFieldsComponentsDef, model: FormModel) {
        super(def, model);
        this.schemaOptions = def.schema;
        const { min, max, length } = def.schema || {};

        let schema = joi.string().email().label(def.title);

        // If length is specified, it takes precedence over min/max
        if ((def.schema?.length || def.schema?.length === 0) ?? false) {
            schema = schema.length(length);
        } else {
            if ((def.schema?.min || def.schema?.min === 0) ?? false) {
                schema = schema.min(min);
            }

            if ((def.schema?.max || def.schema?.max === 0) ?? false) {
                schema = schema.max(max);
            }
        }

        if (this.options.required === false) {
            let optionalSchema = {};
            if (def.schema?.length) {
                optionalSchema = joi
                    .string()
                    .email()
                    .allow(null)
                    .allow("")
                    .default("")
                    .optional()
                    .length(def.schema?.length)
                    .label(def.title);
            } else if (def.schema?.max && def.schema?.min) {
                optionalSchema = joi
                    .string()
                    .email()
                    .allow(null)
                    .allow("")
                    .default("")
                    .optional()
                    .min(def.schema?.min)
                    .max(def.schema?.max)
                    .label(def.title);
            } else if (def.schema?.max) {
                optionalSchema = joi
                    .string()
                    .email()
                    .allow(null)
                    .allow("")
                    .default("")
                    .optional()
                    .max(def.schema?.max)
                    .label(def.title);
            } else if (def.schema?.min) {
                optionalSchema = joi
                    .string()
                    .email()
                    .allow(null)
                    .allow("")
                    .default("")
                    .optional()
                    .min(def.schema?.min)
                    .label(def.title);
            } else {
                optionalSchema = joi
                    .string()
                    .email()
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

        addClassOptionIfNone(this.options, "govuk-input--width-10");
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
        const viewModel = {
            ...super.getViewModel(formData, errors),
            value: this.value,
        };

        // If length is specified, it takes precedence
        if (this.schemaOptions?.length) {
            viewModel.attributes = {
                maxlength: this.schemaOptions.length,
            };
        } else {
            if (this.schemaOptions?.max) {
                viewModel.attributes = {
                    maxlength: this.schemaOptions.max,
                };
            }

            if (this.schemaOptions?.min) {
                if (viewModel.attributes) {
                    viewModel.attributes.minlength = this.schemaOptions.min;
                } else {
                    viewModel.attributes = {
                        minlength: this.schemaOptions.min,
                    };
                }
            }
        }

        viewModel.type = "email";
        viewModel.autocomplete = "email";

        return viewModel;
    }
}
