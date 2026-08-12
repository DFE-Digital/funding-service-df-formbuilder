import { FormData, FormSubmissionErrors } from "../types";
import { FormComponent } from "./FormComponent";
import * as helpers from "./helpers";
import { ComponentDef } from "@xgovformbuilder/model";
import { FormModel } from "../models";
import joi from "joi";

import { DataType, ViewModel } from "./types";
import config from "../../../config";

const REQUEST_TIMEOUT_MS = Number(config.globalTimeout);
export class FileUploadField extends FormComponent {
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
            [`filebandwidtherror_${this.name}`]: joi
                .string()
                .optional()
                .allow(null, ""),
            [`timeout`]: joi
                .string()
                .optional()
                .allow(null, ""),
        };
    }

    getStateSchemaKeys() {
        return helpers.getStateSchemaKeys(this.name, "string", this);
    }

    getViewModel(formData: FormData, errors: FormSubmissionErrors) {
        const { options } = this;
        let newArray: any = [];
        if (this.addedFileTypes != null && this.addedFileTypes?.length > 0) {
            this.addedFileTypes?.forEach((type) => {
                if (type === "PDF") newArray.push("application/pdf");
                if (type === "PNG") newArray.push("image/png");
                if (type === "JPG/JPEG") newArray.push("image/jpeg");
                if (type === "DOC/DOCX")
                    newArray.push(
                        ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    );
                if (type === "XLS/XLSX")
                    newArray.push(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    );
                if (type === "CSV") newArray.push("text/csv");
            });
        } else {
            newArray = [
                "application/pdf",
                "image/png",
                "image/jpeg",
                "text/csv",
                ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel",
            ];
        }
        this.attributes = {
            accept: newArray.join(),
        };
        const viewModel: ViewModel = {
            ...super.getViewModel(formData, errors),
            attributes: this.attributes,
            timeout:REQUEST_TIMEOUT_MS
        };

        if ("multiple" in options && options.multiple) {
            viewModel.attributes.multiple = "multiple";
        }

        return viewModel;
    }
}
