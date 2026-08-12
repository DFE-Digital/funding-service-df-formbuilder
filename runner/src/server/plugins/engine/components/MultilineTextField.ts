import joi, { Schema } from "joi";
import { FormComponent } from "./FormComponent";
import { FormData, FormSubmissionErrors } from "../types";
import { FormModel } from "../models";
import { ComponentDef } from "@xgovformbuilder/model";

export class MultilineTextField extends FormComponent {
    schemaOptions: ComponentDef["schema"];
    formSchema: Schema;
    stateSchema: Schema;

    constructor(def: ComponentDef, model: FormModel) {
        super(def, model);

        this.schemaOptions = def.schema || {};

        const { min, max, length } = this.schemaOptions as {
            max?: number;
            min?: number;
            length?: number;
        };

        let schema = joi.string().label(def.title);

        if (length !== undefined) {
            schema = schema.max(length);
            this.schema = { max: length } as any;
            this.schemaOptions = { max: length } as any;
        } else {
            if (min !== undefined) {
                schema = schema.min(min);
            }
            if (max !== undefined) {
                schema = schema.max(max);
            }
            this.schema = {
                ...(min !== undefined ? { min } : {}),
                ...(max !== undefined ? { max } : {}),
            } as any;
            this.schemaOptions = {
                ...(min !== undefined ? { min } : {}),
                ...(max !== undefined ? { max } : {}),
            } as any;
        }

        if (def.options?.required === false) {
            let optionalSchema: Schema = joi
                .string()
                .allow(null)
                .allow("")
                .default("")
                .optional()
                .label(def.title);

            if (length !== undefined) {
                optionalSchema = optionalSchema.max(length);
            } else {
                if ((min || min === 0) ?? false) {
                    optionalSchema = optionalSchema.min(min as number);
                }
                if ((max || max === 0) ?? false) {
                    optionalSchema = optionalSchema.max(max as number);
                }
            }

            this.formSchema = optionalSchema;
            this.stateSchema = optionalSchema;
        } else {
            this.formSchema = schema;
            this.stateSchema = schema;
        }
    }

    getFormSchemaKeys() {
        return { [this.name]: this.formSchema };
    }

    getStateSchemaKeys() {
        return { [this.name]: this.stateSchema };
    }
    getViewModel(formData: FormData, errors: FormSubmissionErrors) {
        const schemaDerived = (this.schemaOptions || {}) as {
            max?: number;
            min?: number;
            length?: number;
        };
        const options = this.options;
        const viewModel = super.getViewModel(formData, errors);

        const attributes: any = { ...viewModel.attributes };

        if (schemaDerived.length !== undefined) {
            attributes.maxlength = schemaDerived.length;
            delete attributes.min;
        } else {
            if (schemaDerived.max !== undefined) {
                attributes.maxlength = schemaDerived.max;
            }
            if (schemaDerived.min !== undefined) {
                attributes.min = schemaDerived.min;
            }
        }

        if (Object.keys(attributes).length) {
            viewModel.attributes = attributes;
        }

        if (options?.rows) {
            viewModel.rows = options.rows;
        }

        return viewModel;
    }
}
