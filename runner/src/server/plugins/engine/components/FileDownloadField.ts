import { ComponentBase } from "./ComponentBase";
import joi, { Schema } from "joi";
import { FormSubmissionErrors, FormData } from "../types";
import { ViewModel } from "./types";
import { FormModel } from "../models";
import { ComponentDef } from "@xgovformbuilder/model";

export class Filedownload extends ComponentBase {
    formSchema = joi.any() as Schema;
    stateSchema = joi.any() as Schema;
    __lang: string = "en";
    selectedDocument: string;
    isFormComponent: boolean = true;
    //options: TextFieldComponent["options"];
    constructor(def: ComponentDef, model: FormModel) {
        super(def, model);
        this.options = def.options;
        this.selectedDocument = def.selectedDocument;
    }
    get lang() {
        return this.__lang;
    }

    set lang(lang) {
        if (lang) {
            this.__lang = lang;
        }
    }
        getFormDataFromState(state: any) {
        return "";
    }
    getStateFromValidForm(formData: FormData) {
        return "";
    }
 
    getFormSchemaKeys() {
        return { [this.name]: this.formSchema as Schema };
    }

    getStateSchemaKeys() {
        return { [this.name]: this.stateSchema as Schema };
    }
    getDisplayStringFromState(state) {
    const inState =
                state.hasOwnProperty(this.name) &&
                state[this.name] != null &&
                state[this.name] !== '';

            const successString = "File downloaded successfully";
            const failureString = "File is not downloaded";

            const component = state.model.values.pages
                .flatMap(p => p.components)
                .find(c => c.name === this.name);

            if (!component?.options?.condition) {
                return inState ? successString : failureString;
            }

            const conditionName = component.options.condition;
            const conditionDef = state.model.def.conditions.find(
                c => c.name === conditionName
            );

             if (!conditionDef) return null;

            const rule = conditionDef.value.conditions[0];
            const fieldName = rule.field.name;
            const expectedValue = rule.value.value;
            const actualValue = state[fieldName];

            const conditionMatches = actualValue === expectedValue;

            if (conditionMatches) {
                return inState ? successString : failureString;
            }

            return "CompNotRendered";
    }

    getViewModel(formData: FormData, errors: FormSubmissionErrors) {
        const options: any = this.options;
        const label = `${this.localisedString(this.title)}`;
        const name = this.name;
        let document = this.model?.def.documents?.find(
            (dc) => dc.id == this.selectedDocument
        );
        const viewModel: ViewModel = {
            ...super.getViewModel(formData, errors),
            label: {
                text: label,
                classes: "govuk-label--s",
            },
            id: name,
            name: name,
            options: options,
            value: document?.path,
        };
        viewModel.attributes = {
            title: document?.fileName,
            accept: document?.type,
        };

        if (this.hint) {
            viewModel.hint = {
                html: this.localisedString(this.hint),
            };
        }

        if (options.classes) {
            viewModel.classes = options.classes;
        }
        if (options.condition) {
            viewModel.condition = options.condition;
        }
        return viewModel;
    }

    localisedString(description) {
        let string;
        if (!description) {
            string = "";
        } else if (typeof description === "string") {
            string = description;
        } else {
            string = description?.[this.lang] ?? description.en;
        }
        return string;
    }
}
