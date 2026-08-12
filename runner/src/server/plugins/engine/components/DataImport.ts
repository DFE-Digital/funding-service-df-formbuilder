import joi from "joi";
import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { FormComponent } from "./FormComponent";
import * as helpers from "./helpers";
import { ComponentDef, DataImportStatus } from "@xgovformbuilder/model";
import { FormModel } from "../models";

import { DataType, ViewModel } from "./types";

export class DataImport extends FormComponent {
    constructor(def: ComponentDef, model: FormModel) {
        super(def, model);
        this.addedFileTypes = def.addedFileTypes;
    }
    dataType = "file" as DataType;
    addedFileTypes: ComponentDef["addedFileTypes"];
    attributes: any = { accept: "text/csv" };
    getFormSchemaKeys() {
        return {
            ...helpers.getFormSchemaKeys(this.name, "string", this),
            [`filesizeerror_${this.name}`]: joi
                .string()
                .optional()
                .allow(null, ""),
            [`filenameerror_${this.name}`]: joi
                .string()
                .optional()
                .allow(null, ""),
        };
    }

    getStateSchemaKeys() {
        return helpers.getStateSchemaKeys(this.name, "string", this);
    }

    getFormDataFromState(state: FormSubmissionState) {
        const name = this.name;
        const result = {};

        if (name in state) {
            result[name] = this.getFormValueFromState(state);
        }

        if (state.dataImportStatus) {
            result["dataImportStatus"] = state.dataImportStatus;
        }

        return result;
    }

    getViewModel(formData: FormData, errors: FormSubmissionErrors) {
        const { options } = this;
        let status = DataImportStatus.INITIAL;
        if (formData.dataImportStatus && formData.dataImportStatus[this.name]) {
            status = formData.dataImportStatus[this.name];
        }
        const viewModel: ViewModel = {
            ...super.getViewModel(formData, errors),
            attributes: this.attributes,
            status: status,
        };

        if ("multiple" in options && options.multiple) {
            viewModel.attributes.multiple = "multiple";
        }

        return viewModel;
    }
}
