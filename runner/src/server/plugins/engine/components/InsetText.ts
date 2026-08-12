import { ComponentBase } from "./ComponentBase";
import { ViewModel } from "./types";
import { FormData, FormSubmissionErrors } from "../types";
import {
    InputFieldsComponentsDef,
    TextFieldComponent,
} from "@xgovformbuilder/model";
import { FormModel } from "../models";
import {
    addClassOptionIfNone,
    buildFormSchema,
    buildStateSchema,
} from "./helpers";
import { Schema } from "joi";

export class InsetText extends ComponentBase {
    formSchema;
    stateSchema;
    options: TextFieldComponent["options"];

    constructor(def: InputFieldsComponentsDef, model: FormModel) {
        super(def, model);
        this.options = def.options;

        addClassOptionIfNone(this.options, "govuk-input--width-20");

        const { schema } = this;
        if (!schema["regex"]) {
            schema["regex"] = '^[^"\\/\\#;]*$';
        }

        this.formSchema = buildFormSchema("string", this);
        this.stateSchema = buildStateSchema("string", this);
    }

    getFormSchemaKeys() {
        return { [this.name]: this.formSchema as Schema };
    }

    getStateSchemaKeys() {
        return { [this.name]: this.stateSchema as Schema };
    }
    getViewModel(formData: FormData, errors: FormSubmissionErrors): ViewModel {
        const options: any = this.options;
        const viewModel = {
            ...super.getViewModel(formData, errors),
            content: this.content,
        };

        if (options.condition) {
            viewModel.condition = options.condition;
        }
        return viewModel;
    }
}
