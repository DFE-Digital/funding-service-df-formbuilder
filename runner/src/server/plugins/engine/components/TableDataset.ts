import { FormData, FormSubmissionErrors } from "../types";
import { ViewModel } from "./types";
import { TableDatasetComponentBase } from "./TableDatasetComponentBase";

export class TableDataset extends TableDatasetComponentBase {
    getViewModel(formData: FormData, errors: FormSubmissionErrors): ViewModel {
        return {
            ...super.getViewModel(formData, errors),
        };
    }
}
