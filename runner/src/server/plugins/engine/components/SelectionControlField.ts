import { ListFormComponent } from "server/plugins/engine/components/ListFormComponent";
import { FormData, FormSubmissionErrors } from "server/plugins/engine/types";
import { ListItem } from "server/plugins/engine/components/types";
import { FormModel } from "./../models";
import { ComponentDef } from "@xgovformbuilder/model";
import joi, { Schema } from "joi";
/**
 * "Selection controls" are checkboxes and radios (and switches), as per Material UI nomenclature.
 */
export class SelectionControlField extends ListFormComponent {
    formSchema;
    constructor(def: ComponentDef, model: FormModel) {
        super(def, model);
        // @ts-ignore
        this.list = model.getList(def.list);
        this.listType = this.list.type ?? "string";
        this.options = def.options;

        /**
         * Only allow a user to answer with values that have been defined in the list
         */

        let schema = joi[this.listType]()
            .empty("")
            .allow(...this.values)
            .label(def.title);

        if (def.options.required !== false) {
            schema = schema.required();
        }

        this.formSchema = schema;
        this.stateSchema = schema;
    }
    getFormSchemaKeys() {
        return { [this.name]: this.formSchema as Schema };
    }

    getStateSchemaKeys() {
        return { [this.name]: this.stateSchema as Schema };
    }
    getViewModel(formData: FormData, errors: FormSubmissionErrors) {
        const { name, items } = this;
        const options: any = this.options;
        const viewModel = super.getViewModel(formData, errors);

        viewModel.fieldset = {
            legend: viewModel.label,
        };

        viewModel.items = items.map((item) => {
            const itemModel: ListItem = {
                text: item.text,
                value: item.value,
                checked: `${item.value}` === `${formData[name]}`,
                condition: item.condition,
            };

            if (options.bold) {
                itemModel.label = {
                    classes: "govuk-label--s",
                };
            }

            if (item.description) {
                itemModel.hint = {
                    html: this.localisedString(item.description),
                };
            }

            return itemModel;

            // FIXME:- add this back when GDS fix accessibility issues involving conditional reveal fields
            //return super.addConditionalComponents(item, itemModel, formData, errors);
        });
        return viewModel;
    }
}
