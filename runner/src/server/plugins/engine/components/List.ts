import { ComponentBase } from "./ComponentBase";
import { FormData, FormSubmissionErrors } from "../types";
import { Item } from "@xgovformbuilder/model";
import { Schema } from "joi";

export class List extends ComponentBase {
    formSchema;
    stateSchema;
    list: List;
    __lang: string = "en";
    get items(): Item[] {
        return this.list?.items ?? [];
    }
    constructor(def, model) {
        super(def, model);
        this.options = def.options;
        this.list = model.getList(def.list);
    }

    get lang() {
        return this.__lang;
    }

    set lang(lang) {
        if (lang) {
            this.__lang = lang;
        }
    }

    value: any = "";

    getFormSchemaKeys() {
        return { [this.name]: this.formSchema as Schema };
    }

    getStateSchemaKeys() {
        return { [this.name]: this.stateSchema as Schema };
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

    getViewModel(formData: FormData, errors: FormSubmissionErrors) {
        const options: any = this.options;
        const { items } = this;
        this.lang = formData.lang;
        const label = options.hideTitle ? "" : this.localisedString(this.title);

        const name = this.name;
        const viewModel = {
            ...super.getViewModel(formData, errors),
            label: {
                text: label,
                classes: "govuk-label--s",
            },
            id: name,
            name: name,
            value: formData[name],
        };

        if ("type" in options && options.type) {
            viewModel.type = options.type;
        }
        if ("format" in options && options.format) {
            viewModel.format = options.format;
        }
        if (this.hint) {
            viewModel.hint = {
                html: this.localisedString(this.hint),
            };
        }

        if (options.classes) {
            viewModel.classes = options.classes;
        }

        viewModel.content = items.map((item) => {
            const contentItem: {
                text: string;
                condition?: any;
                links?: string;
            } = {
                text: item.text,
            };
            if (item.condition) {
                contentItem.condition = item.condition;
            }
            if (item.links) {
                contentItem.links = item.links;
            }
            return contentItem;
        });

        return viewModel;
    }
}
