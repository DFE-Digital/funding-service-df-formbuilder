import React from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
    listSelector,
    getListItemDataset,
    resetDatasetLoadingState,
} from "../../../store/reducers/listReducer";
import CSVIcon from "./CSVIcon";
import { Flyout } from "../../../components/Flyout";
import { i18n } from "../../../i18n";
import ImportData from "../../../components/ImportData/ImportData";
import { useMenuItem } from "../../../components/Menu/useMenuItem";
import { LoadingState } from "../../../store/types";

type Props = {
    id: string;
    isEdit: boolean;
};

const ListSelectDataset = ({ id, isEdit }: Props) => {
    const dispatch = useAppDispatch();
    const importData = useMenuItem();
    const { form, datasetLoading, selectedList, newList } = useAppSelector(
        listSelector
    );
    const list = isEdit ? selectedList : newList;
    const isError = datasetLoading === LoadingState.Failed;
    const onDataSetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const datasetId = e.target.value ?? "";
        if (datasetId && datasetId === "-1") {
            dispatch(resetDatasetLoadingState());
            return;
        }
        dispatch(getListItemDataset({ datasetId, isEdit }));
    };
    const onImportDataSet = (
        e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
    ) => {
        e.preventDefault();
        importData.show();
    };
    return (
        <div className="govuk-body govuk-!-margin-bottom-6">
            <div
                className={`govuk-form-group govuk-!-margin-bottom-4 ${
                    isError && "govuk-form-group--error"
                }`}
            >
                <label
                    className="govuk-label govuk-!-font-weight-bold"
                    htmlFor={id}
                >
                    Select a dataset {`(optional)`}
                </label>
                <div id={`${id}-hint`} className="govuk-hint">
                    Choose from the list of uploaded files in the import data
                    set section
                </div>
                <div className="sample-list-csv govuk-!-margin-bottom-3">
                    <CSVIcon />
                    <a
                        className="govuk-link govuk-!-font-size-19"
                        href="https://educationgovuk.sharepoint.com/sites/DigitalForms/_layouts/15/download.aspx?UniqueId=876269e6-f8d3-4be7-8fdc-9ebc4d404256"
                        target="_blank"
                        rel="noreferrer noopener"
                        download
                    >
                        {i18n("listModule.sampleFileName")}
                    </a>
                </div>
                {isError && (
                    <p id={`${id}-error`} className="govuk-error-message">
                        <span className="govuk-visually-hidden">Error:</span>{" "}
                        CSV columns structure must be as per the sample provided
                    </p>
                )}
                <select
                    className="govuk-select"
                    id={id}
                    name={id}
                    value={list.dataset ? list.dataset : "-1"}
                    aria-describedby={`${id}-hint`}
                    onChange={onDataSetSelect}
                >
                    <option value="-1" selected>
                        Select
                    </option>
                    {(form.importedDataSets ?? []).map((dataset) => (
                        <option key={dataset.fileId} value={dataset.fileId}>
                            {dataset.fileTitle}
                        </option>
                    ))}
                </select>
            </div>
            <a
                className="list-import-dataset govuk-link"
                onClick={onImportDataSet}
            >
                Import a new data set
            </a>
            {importData.isVisible && (
                <Flyout
                    title={i18n("importData.title")}
                    onHide={importData.hide}
                    width="md1"
                >
                    <ImportData />
                </Flyout>
            )}
        </div>
    );
};

export default ListSelectDataset;
