import { FormData, FormSubmissionErrors } from "../types";
import { ViewModel } from "./types";
import { ResultComponentBase } from "./ResultComponentBase";

export class Result extends ResultComponentBase {
    getViewModel(formData: FormData, errors: FormSubmissionErrors): ViewModel {
        return {
            ...super.getViewModel(formData, errors),
        };
    }
}
