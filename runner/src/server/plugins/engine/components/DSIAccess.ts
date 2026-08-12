import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { FormComponent } from "./FormComponent";
import { buildFormSchema, buildStateSchema } from "./helpers";
import { DSIAccessComponent } from "@xgovformbuilder/model";
import { FormModel } from "../models";
import * as helpers from "./helpers";
import { ViewModel } from "./types";
import { StringSchema } from "joi";

export class DSIAccess extends FormComponent {
    formSchema: StringSchema;
    stateSchema;
    constructor(def: DSIAccessComponent, model: FormModel) {
        super(def, model);
        this.options = def.options;
        this.options.required = false;
        this.formSchema = buildFormSchema("string", this, false);
    }

    value: any = "ukprn";

    getFormDataFromState(state: FormSubmissionState) {
        this.value = state.orgUKPRN;
        return undefined;
    }

    getFormSchemaKeys() {
        return helpers.getFormSchemaKeys(this.name, "string", this);
    }

    getStateSchemaKeys() {
        return helpers.getStateSchemaKeys(this.name, "string", this);
    }

    getViewModel(formData: FormData, errors: FormSubmissionErrors) {
        const options: any = this.options;
        const viewModel: ViewModel = {
            ...super.getViewModel(formData, errors),
            value: this.value,
        };
        if (options.required) {
            options.required = false;
        }
        return viewModel;
    }
}
