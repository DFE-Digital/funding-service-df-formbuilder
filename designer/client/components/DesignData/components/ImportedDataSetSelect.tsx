import React from "react";
import { ImportedDataSet } from "@xgovformbuilder/model";
import { DesignerApi } from "../../../api/designerApi";
import { i18n } from "../../../i18n";
import { SelectedDataSet } from "../types";
import { retrieveKeys } from "../utils/utils";

/**
 * Translation Function
 * @param key translation key
 * @returns translated string
 */
const t = (key: string) =>
    i18n("designData.designScreen.importedDataSetSelect." + key);

type Props = {
    importedDataSets: ImportedDataSet[] | undefined;
    selectedDataSet: SelectedDataSet;
    setSelectedDataSet: (obj: SelectedDataSet) => void;
};

/**
 * Dropdown for selecting imported data list
 * @param props Props for rendering imported data set dropdown
 * @returns
 */
const ImportedDataSetSelect = (props: Props) => {
    const designerApi = new DesignerApi();
    /**
     * Function to be called on selecting an imported data list from dropdown
     * @param event Change event for HTML select element
     */
    const onDataSetSelect = async (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const fileId = event?.target.value;
        const dataSet = await designerApi.getDataSet(fileId);
        const processedDataSet: SelectedDataSet = {
            datasetId: fileId,
            keys: retrieveKeys(dataSet),
        };
        props.setSelectedDataSet(processedDataSet);
    };

    return (
        <>
            <div
                className="govuk-form-group"
                data-testid="design-imported-dataset-select"
            >
                <label
                    className="govuk-label govuk-label--s"
                    htmlFor="imported-dataset-select"
                >
                    {t("label")}
                </label>
                <div id="imported-dataset-select-hint" className="govuk-hint">
                    {t("hint")}
                </div>
                <select
                    className="govuk-select"
                    id="imported-dataset-select"
                    name="imported-dataset-select"
                    aria-describedby="imported-dataset-select-hint"
                    onChange={onDataSetSelect}
                    value={props.selectedDataSet.datasetId}
                >
                    <option value="">{t("select")}</option>
                    {props.importedDataSets?.map((dataset) => (
                        <option key={dataset.fileId} value={dataset.fileId}>
                            {dataset.fileTitle}
                        </option>
                    ))}
                </select>
            </div>
        </>
    );
};

export default ImportedDataSetSelect;
