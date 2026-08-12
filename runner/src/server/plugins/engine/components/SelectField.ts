import { ListFormComponent } from "./ListFormComponent";
import {
    FormData,
    FormSubmissionErrors,
    FormSubmissionState,
} from "server/plugins/engine/types";
import { SelectFieldComponent } from "@xgovformbuilder/model";
import { DataType } from "./types";

export class SelectField extends ListFormComponent {
    dataType = "list" as DataType;

    /** Fetches the value and text from state */
    getFormDataFromState(state: FormSubmissionState) {
        const name = this.name;

        if (name in state) {
            return {
                [name]: state[name].toString(),
                selectField: state[name].toString(), //state?.selectField ?? {},
            };
        }

        return undefined;
    }

    getViewModel(formData: FormData, errors: FormSubmissionErrors) {
        const { name } = this;
        const options: SelectFieldComponent["options"] = this.options;
        const viewModel = super.getViewModel(formData, errors);

        // Validates the selected item based on both value and text
        const formattedItems = viewModel.items?.map((item) => {
            let itemValue;
            if (`${formData[name]}`.includes(",")) {
                itemValue = formData[name].split(",");
            } else {
                itemValue = `${formData[name]}`;
            }
            return {
                ...item,
                selected: `${item.value}` === itemValue,
            };
        });
        viewModel.items = formattedItems;

        viewModel.items = [{ value: "" }, ...(viewModel.items ?? [])];
        if (options.autocomplete) {
            viewModel.attributes.autocomplete = options.autocomplete;
        }
        return viewModel;
    }

    /** Fetches the text from state rather than from items */
    getDisplayStringFromState(state: FormSubmissionState) {
        if (this.name in state) {
            if (state.selectField && state.selectField[this.name]) {
                return state.selectField[this.name];
            } else {
                return state[this.name];
            }
        }
        return "";
    }
}
