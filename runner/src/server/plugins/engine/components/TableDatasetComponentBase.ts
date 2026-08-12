import joi, { Schema } from "joi";

import { ComponentBase } from "./ComponentBase";
import { Item, List, Blobresponse, FormatType } from "@xgovformbuilder/model";
import {
    FormSubmissionState,
    FormSubmissionErrors,
    FormData,
    FormPayload,
} from "../types";
import { ViewModel } from "./types";
import { FormModel } from "../models";
import { ComponentDef } from "@xgovformbuilder/model";
import { debugConsoleLog } from "src/server/utils/commonUtils";
import { trackEvent } from "src/server/logging/customTracker";
import { numberWithCommas } from "../pageControllers/utils";

/* table dataset component */
export class TableDatasetComponentBase extends ComponentBase {
    list: List;
    blobResponse: Blobresponse;
    get items(): Item[] {
        return this.list?.items ?? [];
    }
    isFormComponent: boolean = false;
    __lang: string = "en";
    expression: string = "";
    constructor(def: ComponentDef, model: FormModel) {
        super(def, model);
        this.list = model.getList(def.list);
        this.options = def.options;
    }

    get lang() {
        return this.__lang;
    }

    set lang(lang) {
        if (lang) {
            this.__lang = lang;
        }
    }

    getTableData(data, datasetId) {
        if (!datasetId) {
            trackEvent(
                "TableDataset:getTableData:missingDatasetId",
                {
                    datasetId,
                    availableDatasets: data?.map((dataset) => dataset?.id),
                },
                false
            );
            return [];
        }

        const tableData = data?.filter((dataset) => dataset.id === datasetId);
        const tableDataset = tableData?.[0]?.data ?? [];
        const keyId = tableData?.[0]?.keyIdentifier;

        if (tableDataset && typeof tableDataset === "object") {
            tableDataset.keyIdentifier = keyId;
        }

        trackEvent(
            "TableDataset:getTableData",
            {
                datasetId,
                keyIdentifier: keyId,
                tableDatasetPresent: !!tableDataset,
                rowCount: Array.isArray(tableDataset) ? tableDataset.length : undefined,
                foundDataset: tableData?.length > 0,
            },
            false
        );
        return tableDataset;
    }

    formulateTableData(formJSONData, keyIdValue) {
        formJSONData.map((data) => {
            for (const item of data) {
                if (item?.type === "select_value") {
                    const rawValue = item?.value == null ? "" : item.value.toString();
                    if (!rawValue) continue;
                    if (rawValue.includes("-Value") && keyIdValue) {
                        const replacementValue = rawValue.split("-Value")[0];
                        item.value = keyIdValue?.[replacementValue];
                        if (
                            item.value !== null &&
                            item.value !== "" &&
                            item.value !== undefined &&
                            replacementValue !== formJSONData.keyIdentifier
                        ) {
                            const rawValue2 = item.value?.toString();
                            const cleanedValue = rawValue2.replace(/,/g, "");

                            if (!isNaN(cleanedValue) && cleanedValue.trim() !== "") {
                                const numericValue = parseFloat(cleanedValue);

                                if (item.format === FormatType.INTEGER) {
                                    item.value = Math.round(numericValue);
                                } else if (item.format === FormatType.DECIMAL) {
                                    item.value = numericValue.toFixed(2);
                                } else {
                                    // No format selected
                                    if (
                                        numericValue.toFixed(1) ===
                                        numericValue.toString()
                                    ) {
                                        item.value = numericValue.toFixed(2);
                                    }
                                }
                                if (item.numeric) {
                                    item.value = numberWithCommas(item.value);
                                } else {
                                    // If original value had commas, reinsert them
                                    if (rawValue2.includes(",")) {
                                        item.value = numberWithCommas(item.value);
                                    }
                                }
                            }
                        }
                    } else {
                        item.value = rawValue
                            .split("-Header")[0]
                            .split("_")
                            .join(" ");
                    }
                }
            }
        });
    }

    getUKPRNcontentFromJSON(blobResponse, keyId, ukprn, urn) {
        let ukprnMatch, urnMatch;
        if (keyId === "UKPRN") {
            ukprnMatch = blobResponse?.filter(
                (data) => data[keyId] === Number(ukprn)
            );
        } else if (keyId === "URN") {
            urnMatch = blobResponse?.filter(
                (data) => data[keyId] === Number(urn)
            );
        } else if (keyId === "district_administrative_code") {
            ukprnMatch = blobResponse?.filter((data) => data[keyId] === ukprn);
        }

        const filteredContent =
            ukprnMatch?.length > 0
                ? ukprnMatch && ukprnMatch[0]
                : urnMatch
                ? urnMatch[0]
                : {};

        return filteredContent;
    }

    getViewModel(formData: FormData, errors: FormSubmissionErrors) {
        const options: any = this.options;
        const { items } = this;
        this.lang = formData.lang;
        trackEvent(
            "TableDataset:getViewModel:tableData",
            {
                tableData: formData?.tableData,
            },
            false
        );
        const { orgData, blobData, fileId, dataset } = formData?.tableData;
        trackEvent(
            "TableDataset:getViewModel:orgData",
            {
                orgData,
                fileId,
                dataset,
            },
            false
        );
        const { ukprn, urn } = orgData;

        this.blobResponse = blobData;

        const label = options.hideTitle
            ? ""
            : `${this.localisedString(this.title)}`;
        const name = this.name;

        const tableDataset = this.getTableData(
            this.model.values.designedDataSets,
            dataset
        );
        const keyIdentifier = tableDataset?.keyIdentifier;
        const selectedUKPRNarray =
            this.blobResponse &&
            this.getUKPRNcontentFromJSON(
                this.blobResponse,
                keyIdentifier,
                ukprn ?? orgData?.DistrictAdministrative_code,
                urn
            );

        if (Array.isArray(tableDataset) && tableDataset.length > 0) {
            this.formulateTableData(tableDataset, selectedUKPRNarray);
        }

        trackEvent(
            "TableDataset:getViewModel:complete",
            {
                tableDataset: {
                    dataset,
                    present: Array.isArray(tableDataset)
                        ? tableDataset.length > 0
                        : !!tableDataset,
                    rowCount: Array.isArray(tableDataset)
                        ? tableDataset.length
                        : undefined,
                    parsedTableData: Array.isArray(tableDataset)
                        ? tableDataset[0]
                        : undefined,
                },
                selectedUKPRNarrayPresent: !!selectedUKPRNarray,
                keyIdentifier,
            },
            false
        );

        const viewModel: ViewModel = {
            ...super.getViewModel(formData, errors),
            label: {
                text: label,
                classes: "govuk-label--s",
            },
            id: name,
            name: name,
            value: formData[name],
            options: options,
            tableData: tableDataset,
        };

        if (this.hint) {
            viewModel.hint = {
                html: this.localisedString(this.hint),
            };
        }
        if (this.expression) {
            viewModel.attributes = { expression: this.expression };
        }
        const page = this.model?.def?.pages.find((page) =>
            page.components?.find((comp) => comp.name == viewModel.id)
        );
        if (page?.components?.find((comp) => comp?.type == "TableDataset")) {
            viewModel.classes = "table-dataset-input";
        }

        if (options.classes) {
            viewModel.classes = options.classes;
        }
        viewModel.content = items.map(({ text, description, condition }) => {
            return {
                title: text,
                text: description || "",
                condition,
            };
        });
        return viewModel;
    }

    getFormDataFromState(state: FormSubmissionState) {
        const name = this.name;

        if (name in state) {
            return {
                [name]: this.getFormValueFromState(state),
            };
        }

        return undefined;
    }

    getFormValueFromState(state: FormSubmissionState) {
        const name = this.name;

        if (name in state) {
            return state[name] === null ? "" : state[name].toString();
        }
    }

    getStateFromValidForm(payload: FormPayload) {
        const name = this.name;

        return {
            [name]: this.getStateValueFromValidForm(payload),
        };
    }

    getStateValueFromValidForm(payload: FormPayload): any {
        const name = this.name;

        return name in payload && payload[name] !== "" ? payload[name] : null;
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

    getFormSchemaKeys() {
        return { [this.name]: joi.any() };
    }

    getStateSchemaKeys(): { [k: string]: Schema } {
        return { [this.name]: joi.any() };
    }

    getDisplayStringFromState(state) {
        return state[this.name];
    }
}
