import {
    InputFieldsComponentsDef,
    TextFieldComponent,
} from "@xgovformbuilder/model";

import { FormComponent } from "./FormComponent";
import { FormData, FormSubmissionErrors } from "../types";
import { FormModel } from "../models";
import {
    addClassOptionIfNone,
    buildFormSchema,
    buildStateSchema,
} from "./helpers";
import joi, { Schema } from "joi";

export class TextField extends FormComponent {
    formSchema;
    stateSchema;
    schemaOptions: TextFieldComponent["schema"];
    options: TextFieldComponent["options"];

    constructor(def, model) {
        super(def, model);
        this.schemaOptions = def.schema;
        const { min, max, length } = def.schema;
        this.options = def.options;
        addClassOptionIfNone(this.options, "govuk-input--width-20");
        let schema = joi.string();
        if (this.options.required !== false) {
            schema = schema.required();
        }
        
      const defaultRegex = '^[^"\\/\\#;]*$';

        if (def.schema?.regex) {
            schema = schema.pattern(new RegExp(def.schema.regex));
        } else {
            schema = schema.pattern(new RegExp(defaultRegex));
        }

 
 


        if (this.options.required === false) {
            schema = schema.allow(null, "").optional();
        }
        schema = schema.label(def.title);

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
                    .allow(null)
                    .allow("")
                    .default("")
                    .optional()
                    .length(def.schema?.length)
                    .label(def.title);
            } else if (def.schema?.max && def.schema?.min) {
                optionalSchema = joi
                    .string()
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
                    .allow(null)
                    .allow("")
                    .default("")
                    .optional()
                    .max(def.schema?.max)
                    .label(def.title);
            } else if (def.schema?.min) {
                optionalSchema = joi
                    .string()
                    .allow(null)
                    .allow("")
                    .default("")
                    .optional()
                    .min(def.schema?.min)
                    .label(def.title);
            } else {
                optionalSchema = joi
                    .string()
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

    getFormSchemaKeys() {
        return { [this.name]: this.schema as Schema };
    }

    getStateSchemaKeys() {
        return { [this.name]: this.schema as Schema };
    }

   getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const options: any = this.options;
    const viewModel = super.getViewModel(formData, errors);

    const regex =
        this.schemaOptions?.regex || '^[^"\\/\\#;]*$';

    viewModel.attributes = {
        ...viewModel.attributes,
        pattern: regex,
    };

    if (this.schemaOptions?.max !== undefined) {
        viewModel.attributes = {
            ...viewModel.attributes,
            maxlength: this.schemaOptions.max,
        };
    }

    if (options.autocomplete) {
        viewModel.autocomplete = options.autocomplete;
    }

    return viewModel;
}

}
