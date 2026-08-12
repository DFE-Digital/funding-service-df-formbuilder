import React, { useContext, useEffect, useState } from "react";
import { DesignedDataSet } from "@xgovformbuilder/model";
import { DesignerApi } from "../../api/designerApi";
import { DataContext } from "../../context";
import { i18n } from "../../i18n";
import { BackLink } from "../BackLink";
import {
    NameInput,
    ColumnInput,
    RowInput,
    ImportedDataSetSelect,
    KeyIdentifierSelect,
} from "./components";
import DynamicDataSetTable from "./components/DynamicDataSetTable";
import {
    SelectedDataSet,
    DynamicDataSet,
    RenderTableType,
    TableDimension,
} from "./types";
import {
    isReadyForSave,
    prepareDataSetForSave,
    validateDataSetBasedOnSelectedDataSet,
    validateDataSetBasedOnTableDimension,
    populateForEdit,
} from "./utils/utils";

const emptySelectedDataSet: SelectedDataSet = {
    datasetId: "",
    keys: [],
};

const t = (key) => i18n("designData.designScreen." + key);

type Props = {
    setShowDesignScreen: React.Dispatch<React.SetStateAction<boolean>>;
    isEdit: boolean;
    selectedId: string | undefined;
};

export default function DesignScreen({
    setShowDesignScreen,
    isEdit,
    selectedId,
}: Props) {
    const { data, save } = useContext(DataContext);
    const designerApi = new DesignerApi();
    const [dataSetName, setDataSetName] = useState("");
    const [numberOfRows, setNumberOfRows] = useState<number | null>(0);
    const [numberOfColumns, setNumberOfColumns] = useState(0);
    const [tableDimension, setTableDimension] = useState<TableDimension>({
        rows: 0,
        columns: 0,
    });
    const [duplicateTitleError, setDuplicateTitleError] = useState(false);
    const setDataSetNameHandler = (e) => {
        setDataSetName(e.target.value);
        const isDatasetDuplicated: any = data?.designedDataSets?.some(
            (dataSet) => dataSet.title === e.target.value
        );
        setDuplicateTitleError(isDatasetDuplicated);
    };
    const [
        renderDynamicTable,
        setRenderDynamicTable,
    ] = useState<RenderTableType | null>(null);
    const [selectedDataSet, setDataSet] = useState<SelectedDataSet>(
        emptySelectedDataSet
    );
    const [keyIdentifier, setKeyIdentifier] = useState("");
    const [dynamicTableDataSet, setDynamicTableDataSet] = useState<
        DynamicDataSet
    >({});

    // Enable button only after user types name and selects rows and columns
    const isGenerateButtonDisabled = () => {
        const identicalInput =
            numberOfColumns === tableDimension.columns &&
            numberOfRows === tableDimension.rows;
        if (renderDynamicTable === RenderTableType.INITIAL && identicalInput)
            return true;
        if (!numberOfRows) return true;
        const validInputPresent =
            dataSetName.trim().length > 0 &&
            numberOfRows > 0 &&
            numberOfColumns > 0;
        if (validInputPresent && !identicalInput) return false;
        return true;
    };

    const onGenerateClick = () => {
        setTableDimension({ rows: numberOfRows!, columns: numberOfColumns });
        setRenderDynamicTable(RenderTableType.INITIAL);
    };

    const onSaveClick = () => {
        let updatedDesignDataSets: DesignedDataSet[];
        const formattedDataSet = prepareDataSetForSave(
            tableDimension,
            dynamicTableDataSet,
            dataSetName,
            selectedDataSet.datasetId,
            keyIdentifier
        );
        updatedDesignDataSets = data?.designedDataSets
            ? [...data?.designedDataSets, formattedDataSet]
            : [formattedDataSet];
        if (isEdit && selectedId) {
            formattedDataSet.id = selectedId;
            const filteredDataSets = data?.designedDataSets?.filter(
                (dataset) => dataset.id !== selectedId
            );
            updatedDesignDataSets = filteredDataSets
                ? [...filteredDataSets, formattedDataSet]
                : [formattedDataSet];
        }
        const updatedData = {
            ...data,
            designedDataSets: updatedDesignDataSets,
        };
        save(updatedData);
        setShowDesignScreen(false);
    };

    // Validates Data Set based on rows and columns set
    useEffect(() => {
        const validationOptions = {
            tableDimension,
            dynamicTableDataSet,
            setter: setDynamicTableDataSet,
        };
        validateDataSetBasedOnTableDimension(validationOptions);
    }, [tableDimension]);

    // Validates Data Set and Key Identifier when we select different data set (CSV)
    useEffect(() => {
        const validationOptions = {
            selectedDataSet,
            dynamicTableDataSet,
            setKeyIdentifier,
            setDataSet: setDynamicTableDataSet,
        };
        validateDataSetBasedOnSelectedDataSet(validationOptions);
    }, [selectedDataSet]);

    // Populates data when in edit mode
    useEffect(() => {
        if (isEdit && selectedId) {
            const selectedData = data?.designedDataSets?.find(
                (dataset) => dataset.id === selectedId
            )!;
            const editOptions = {
                data: selectedData,
                setName: setDataSetName,
                setRows: setNumberOfRows,
                setColumns: setNumberOfColumns,
                setTableDimension,
                setCSV: setDataSet,
                setKey: setKeyIdentifier,
                setTableData: setDynamicTableDataSet,
                designerApi,
                renderTable: setRenderDynamicTable,
            };
            populateForEdit(editOptions);
        }
    }, []);

    return (
        <div>
            <BackLink
                onClick={(e) => {
                    e.preventDefault();
                    setShowDesignScreen(false);
                }}
            >
                {i18n("back")}
            </BackLink>
            <h4 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-8">
                {t("title")}
            </h4>
            <NameInput
                dataSetName={dataSetName}
                setDataSetName={setDataSetNameHandler}
                duplicateTitleError={duplicateTitleError}
            />
            <ColumnInput
                label={t("columnsInput.label")}
                hint={t("columnsInput.hint")}
                value={numberOfColumns}
                setter={setNumberOfColumns}
            />
            <RowInput
                label={t("rowsInput.label")}
                hint={t("rowsInput.hint")}
                value={numberOfRows}
                setter={setNumberOfRows}
            />
            <button
                className={`govuk-button govuk-button--secondary ${
                    renderDynamicTable && "govuk-!-margin-bottom-7"
                }`}
                data-module="govuk-button"
                disabled={isGenerateButtonDisabled()}
                data-testid="design-generate-button"
                onClick={onGenerateClick}
            >
                {i18n("designData.buttons.generate")}
            </button>
            {renderDynamicTable && (
                <>
                    <div
                        className="govuk-inset-text"
                        data-testid="design-inset-text"
                    >
                        <p className="govuk-body govuk-!-font-weight-regular">
                            {i18n("designData.designScreen.infoTextOne")}
                            <span className="govuk-body govuk-!-font-weight-bold">
                                {" "}
                                {i18n("designData.designScreen.infoTextTwo")}
                            </span>
                        </p>
                    </div>
                    <div
                        className="govuk-warning-text govuk-!-margin-bottom-9"
                        data-testid="design-warning-text"
                    >
                        <span
                            className="govuk-warning-text__icon"
                            aria-hidden="true"
                        >
                            !
                        </span>
                        <strong className="govuk-warning-text__text">
                            <span className="govuk-warning-text__assistive">
                                Warning
                            </span>
                            {i18n("designData.designScreen.warningText")}
                        </strong>
                    </div>
                    <ImportedDataSetSelect
                        importedDataSets={data.importedDataSets}
                        selectedDataSet={selectedDataSet}
                        setSelectedDataSet={setDataSet}
                    />
                    <KeyIdentifierSelect
                        selectedDataSet={selectedDataSet}
                        keyIdentifier={keyIdentifier}
                        setKeyIdentifier={setKeyIdentifier}
                    />
                    <DynamicDataSetTable
                        tableDimension={tableDimension}
                        selectedDataSet={selectedDataSet}
                        dynamicTableDataSet={dynamicTableDataSet}
                        setDynamicDataSet={setDynamicTableDataSet}
                    />
                </>
            )}
            <button
                type="submit"
                className="govuk-button govuk-!-display-block govuk-!-margin-top-8"
                disabled={isReadyForSave(
                    tableDimension,
                    dynamicTableDataSet,
                    isEdit,
                    data,
                    selectedId,
                    dataSetName,
                    selectedDataSet?.datasetId,
                    keyIdentifier,
                    duplicateTitleError
                )}
                data-testid="design-save-button"
                onClick={onSaveClick}
            >
                {i18n("Save")}
            </button>
        </div>
    );
}
