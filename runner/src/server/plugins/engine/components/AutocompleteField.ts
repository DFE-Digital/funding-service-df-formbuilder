import { ListComponentsDef } from "@xgovformbuilder/model";

import { SelectField } from "./SelectField";
import { FormModel } from "../models";
import { addClassOptionIfNone } from "./helpers";
import { FormSubmissionState } from "server/plugins/engine/types";

export class AutocompleteField extends SelectField {
    constructor(def: ListComponentsDef, model: FormModel) {
        super(def, model);
        addClassOptionIfNone(this.options, "govuk-input--width-20");
    }
    getDisplayStringFromState(state: FormSubmissionState) {
        if (this.name in state) {
            return state[this.name];
        }
        return "";
    }

    getFormDataFromState(state: FormSubmissionState) {
        const name = this.name;

        if (name in state) {
            return {
                [name]: state[name].toString(),
                selectField: state[name].toString(),
            };
        }

        return undefined;
    }
}
