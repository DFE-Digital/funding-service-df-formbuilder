import React, { useState, useContext, useEffect } from "react";
import { DataContext } from "../../context";
import { Actions } from "../../reducers/component/types";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { i18n } from "../../i18n";
import randomId from "../../randomId";
import "./data-import.scss";
import { arrayMove } from "react-sortable-hoc";
import { Flyout } from "../../components/Flyout";
import { RenderInPortal } from "../../components/RenderInPortal";
import DocumentUpload from "../Document/DocumentUpload";
import { CssClasses } from "../CssClasses";
import { SortableList } from "./data-import-sortings";
import { DesignerApi } from "../../api/designerApi";
import DateSchema from "./DateSchema";
import TextSchema from "./TextSchema";
import NumberSchema from "./NumberSchema";
import UKAddressSchema from "./UKAddressSchema";
import {
    RenderDataImportRadioButtons,
    RenderColumnType,
} from "./CommonRenders";

type DateSchema = {
    maxDaysInPast: string;
    maxDaysInFuture: string;
};

type ColumnType = {
    columnId: string;
    columnType: string;
    columnSchema: DateSchema;
};

const dataImporti18 = (key) => i18n("dataImportComp." + key);

/* Render additional settings section */
const RenderAdditionalSettings = () => (
    <details className="govuk-details additional-settings">
        <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">
                {i18n("common.detailsLink.title")}
            </span>
        </summary>

        <div className="govuk-details__text govuk-checkboxes govuk-form-group">
            <CssClasses />
        </div>
    </details>
);

function DataImport() {
    const { data, save } = useContext(DataContext);
    const { documents } = data;
    const csvDocuments = documents?.filter((doc) => doc.type === "csv");
    const { state, dispatch } = useContext(ComponentContext);

    const initialFormState = {
        showColumnDropdown: true,
        showCustomColumn: false,
        disableAddButton: true,
        maxDaysInPast: "",
        maxDaysInFuture: "",
        selectedColumnHeaderType: "",
        selectedColumnHeaderValue: "",
        columnData: [] || {},
        columnTypeSelected: false,
        maxLength: "",
        minNumber: "",
        maxNumber: "",
        precisionNumber: "",
        columnType: "",
        addressRequired: false,
    };
    const [importState, setImportState] = useState(initialFormState);

    /* On radio buttons like custom column or select column name change */
    const onColumnSelect = (e) => {
        const { id } = e.currentTarget;
        setImportState((prevState) => {
            return {
                ...prevState,
                selectedColumnHeaderType: id,
                selectedColumnHeaderValue: "",
                showColumnDropdown: id === "select_column" ? true : false,
                showCustomColumn: id === "custom_column" ? true : false,
                disableAddButton: addButtonChecks(),
            };
        });
    };

    const handleSchemaChanges = (e) => {
        const { value, name } = e.target;
        setImportState((prevState) => {
            return {
                ...prevState,
                [name]: value,
            };
        });
    };

    const [showDocumentUpload, setShowDocumentUpload] = useState(false);

    const cancelShowDocumentUpload = () => {
        setShowDocumentUpload(false);
    };

    const showDocumentView = () => {
        setShowDocumentUpload(true);
    };

    /* check if Add button need to be disabled or enabled */
    const addButtonChecks = () => {
        const { selectedColumnHeaderValue, columnTypeSelected } = importState;
        let flag;
        if (selectedColumnHeaderValue !== "" && columnTypeSelected) {
            flag = false;
        } else {
            flag = true;
        }
        setImportState((prevState) => {
            return {
                ...prevState,
                disableAddButton: flag,
            };
        });
    };

    /* reset all fields */
    const resetColumns = () => {
        setImportState((prevState) => {
            return {
                ...prevState,
                maxDaysInPast: "",
                maxDaysInFuture: "",
                selectedColumnHeaderValue: "",
                disableAddButton: true,
                columnTypeSelected: false,
                maxLength: "",
                minNumber: "",
                maxNumber: "",
                precisionNumber: "",
                addressRequired: false,
                // columnEdited: false,
                columnData: {
                    columnId: randomId(),
                    columnType: "none",
                    selectedColumnHeaderType: "select_column",
                    selectedColumnHeaderValue: "none",
                    columnSchema: null,
                    isEdited: false,
                },
            };
        });
    };

    /* find the right schema for the selected column */
    const getRelatedSchema = (schema) => {
        const {
            maxDaysInFuture,
            maxDaysInPast,
            maxLength,
            minNumber,
            maxNumber,
            precisionNumber,
            addressRequired,
        } = importState;
        const dateSchema = {
            maxDaysInPast,
            maxDaysInFuture,
        };

        const textSchema = {
            maxLength,
        };

        const numberSchema = {
            minNumber,
            maxNumber,
            precisionNumber,
        };

        // const numberSchema = {};
        const ukAddressSchema = {
            addressRequired,
        };
        switch (schema) {
            case "Date":
                return dateSchema;

            case "Text":
                return textSchema;

            case "Number":
                return numberSchema;

            case "UKAddress":
                return ukAddressSchema;

            default:
                return null;
        }
    };

    /* on click of add button */
    const saveSchema = (e) => {
        const { columnData, columnType } = importState;

        const updateColumn = {
            ...columnData,
            columnSchema: getRelatedSchema(columnType),
        };
        dispatch({
            type: Actions.EDIT_DATA_IMPORT,
            payload: updateColumn,
        });
        e.preventDefault();
        resetColumns();
    };

    let { selectedComponent } = state;
    const {
        options = { condition: "" },
        selectedDocument = "",
        columns = [],
        columnNames = [],
        columnEdited,
    } = selectedComponent;

    const onSortEnd = ({ oldIndex, newIndex }) => {
        const copy = { ...data };
        const componentData = { ...selectedComponent };
        const { columns } = componentData;
        componentData.columns = arrayMove(
            componentData.columns!,
            oldIndex,
            newIndex
        );
        selectedComponent.columns = componentData.columns;
        copy.pages.map((component) =>
            component.components?.find((comp) => {
                if (comp.name === selectedComponent.name) {
                    comp = selectedComponent;
                }
            })
        );
        // save(copy);
        dispatch({
            type: Actions.COMPONENT_EDITED,
            payload: true,
        });
    };

    const columnTypes = ["Date", "Text", "UKAddress", "Number"];

    const callDispatcher = (documentId, documentFields) => {
        dispatch({
            type: Actions.EDIT_DOCUMENT,
            payload: documentId,
        });
        dispatch({
            type: Actions.DOCUMENT_FIELDS,
            payload: documentFields,
        });
    };

    const populateData = (documentData, documentId) => {
        if (documentData) {
            const documentFields =
                documentData?.length > 0 && Object.keys(documentData[0] || {});
            documentData?.length > 0 &&
                callDispatcher(documentId, documentFields);
        }
    };

    /* on documents selection dropdown change */
    const documentSelection = async (e) => {
        const documentId = e?.target.value;
        if (documentId !== "none") {
            const designerApi = new DesignerApi();
            const selectedDocument = documents?.find(
                (docid) => docid.id === documentId
            );
            const { id, fileName } = selectedDocument;

            const documentData = await designerApi.getDocument(
                id,
                selectedDocument
            );
            // const documentFields = documentData && Object.keys(documentData[0]);
            dispatch({
                type: Actions.DOCUMENT_NAME,
                payload: fileName,
            });
            await populateData(documentData, documentId);
        } else {
            callDispatcher(documentId, []);
            resetColumns();
        }
    };

    /* on select column dropdown change */
    const onColumnNameSelection = (e) => {
        const selectedColumn = e.target.value;
        setImportState((prevState) => {
            return {
                ...prevState,
                selectedColumnHeaderType: "select_column",
                selectedColumnHeaderValue: selectedColumn,
                disableAddButton: addButtonChecks(),
            };
        });
    };

    /* Delete one of the listed columns */
    const handleDeleteColumn = (e) => {
        const {
            selectedComponent: { columns },
        } = state;

        const updatedColumns = columns.filter(
            (column) => column.columnId !== e
        );

        dispatch({
            type: Actions.EDIT_DELETE_COLUMN,
            payload: updatedColumns,
        });
    };

    /* Edit one of the listed columns */
    const handleEditColumn = (e) => {
        const {
            selectedComponent: { columns },
        } = state;

        const findColumn = columns.find((col) => col.columnId === e);

        findColumn.isEdited = true;
    };

    /* on column type dropdown change */
    const columnTypeSelection = (value, headerType, headerValue) => {
        const columnData = {
            columnId: randomId(),
            columnType: value,
            selectedColumnHeaderType: headerType,
            selectedColumnHeaderValue: headerValue,
            columnSchema: getRelatedSchema(value),
            isEdited: false,
        };

        setImportState((prevState) => {
            return {
                ...prevState,
                columnData: columnData,
                columnTypeSelected:
                    value !== "" || value !== "none" ? true : false,
                disableAddButton: addButtonChecks(),
                columnType: value,
            };
        });
    };

    /* on entering of custom column text */
    const handleCustomColumn = (e) => {
        const text = e.target.value;
        setImportState((prevState) => {
            return {
                ...prevState,
                selectedColumnHeaderValue:
                    selectedColumnHeaderType === "custom_column" ? text : "",
                disableAddButton: addButtonChecks(),
            };
        });
    };

    /* render add button */
    const RenderAddButton = ({ disableAddButton, saveSchema }) => (
        <div className="govuk-button-group">
            <button
                className="govuk-button mt-20"
                data-module="govuk-button"
                disabled={disableAddButton}
                onClick={(e) => saveSchema(e)}
            >
                Add
            </button>
        </div>
    );

    /* Render the documents section */
    const RenderImportDocument = () => (
        <div className="govuk-body govuk-form-group">
            <p className="govuk-label govuk-label--s">
                {dataImporti18("documentTitle")}
            </p>
            <span className="govuk-hint">
                {dataImporti18("documentDescription")}
            </span>
            <select
                className="govuk-select govuk-input--width-10"
                id="document-selection"
                name="selectedDocument"
                value={selectedDocument}
                onChange={(e) => documentSelection(e)}
            >
                <option value="none">{i18n("select")}</option>
                {csvDocuments?.map((document) => {
                    return (
                        <option key={document?.id} value={document?.id}>
                            {document?.title}
                        </option>
                    );
                })}
            </select>
            <button
                className="govuk-link govuk-!-margin-top-2 govuk-body govuk-!-margin-bottom-0"
                onClick={() => showDocumentView()}
            >
                Import a new document
            </button>
        </div>
    );

    const {
        showColumnDropdown,
        showCustomColumn,
        disableAddButton,
        maxDaysInPast,
        maxDaysInFuture,
        selectedColumnHeaderType,
        selectedColumnHeaderValue,
        columnData,
        columnTypeSelected,
        maxLength,
        minNumber,
        maxNumber,
        precisionNumber,
        // columnEdited,
    } = importState;

    useEffect(() => {
        addButtonChecks();
    }, [selectedColumnHeaderValue, columnTypeSelected]);

    return (
        <div className="data-import-container">
            {showDocumentUpload && (
                <RenderInPortal>
                    <Flyout
                        title={i18n("documents.title")}
                        onHide={cancelShowDocumentUpload}
                    >
                        <DocumentUpload
                            setShowDocumentUpload={setShowDocumentUpload}
                            from="dataImport"
                        />
                    </Flyout>
                </RenderInPortal>
            )}
            <RenderImportDocument />
            <div>
                <SortableList
                    columns={columns}
                    pressDelay={200}
                    onSortEnd={onSortEnd}
                    lockAxis="y"
                    helperClass="dragging"
                    lockToContainerEdges
                    useDragHandle
                    columnEdited={columnEdited}
                    editColumn={(e) => handleEditColumn(e)}
                    deleteColumn={(e) => handleDeleteColumn(e)}
                />
            </div>
            <div className="column-table-bordered">
                <div className="govuk-label govuk-label--s">
                    {dataImporti18("columnInfo")}
                </div>
                <div className="govuk-hint">
                    {dataImporti18("columnDescription")}
                </div>
                <div className="govuk-hint">
                    {dataImporti18("columnDescriptionNote")}
                </div>

                <RenderDataImportRadioButtons
                    onColumnSelect={onColumnSelect}
                    showColumnDropdown={showColumnDropdown}
                    selectedColumnHeaderValue={selectedColumnHeaderValue}
                    showCustomColumn={showCustomColumn}
                    onColumnNameSelection={onColumnNameSelection}
                    handleCustomColumn={handleCustomColumn}
                    columnNames={columnNames}
                    from="dataimport"
                />

                <RenderColumnType
                    columnType={columnData?.columnType}
                    columnTypeSelection={columnTypeSelection}
                    selectedColumnHeaderType={selectedColumnHeaderType}
                    selectedColumnHeaderValue={selectedColumnHeaderValue}
                    columnTypes={columnTypes}
                />

                {columnData?.columnType === "Date" && (
                    <>
                        <DateSchema
                            maxDaysInPast={maxDaysInPast}
                            maxDaysInFuture={maxDaysInFuture}
                            handleDateSchemaChanges={handleSchemaChanges}
                        />
                        <RenderAddButton
                            disableAddButton={disableAddButton}
                            saveSchema={saveSchema}
                        />
                    </>
                )}
                {columnData?.columnType === "Text" && (
                    <>
                        <TextSchema
                            maxLength={maxLength}
                            handleTextSchemaChanges={handleSchemaChanges}
                        />
                        <RenderAddButton
                            disableAddButton={disableAddButton}
                            saveSchema={saveSchema}
                        />
                    </>
                )}
                {columnData?.columnType === "Number" && (
                    <>
                        <NumberSchema
                            minNumber={minNumber}
                            maxNumber={maxNumber}
                            precisionNumber={precisionNumber}
                            handleNumberSchemaChanges={handleSchemaChanges}
                        />

                        <RenderAddButton
                            disableAddButton={disableAddButton}
                            saveSchema={saveSchema}
                        />
                    </>
                )}

                {columnData?.columnType === "UKAddress" && (
                    <>
                        <UKAddressSchema
                            setImportState={setImportState}
                            importState={importState}
                            from="dataImport"
                        />

                        <RenderAddButton
                            disableAddButton={disableAddButton}
                            saveSchema={saveSchema}
                        />
                    </>
                )}
                {!columnTypeSelected && (
                    <>
                        --
                        <RenderAddButton
                            disableAddButton={disableAddButton}
                            saveSchema={saveSchema}
                        />
                    </>
                )}
            </div>
            <RenderAdditionalSettings />
        </div>
    );
}

export default DataImport;
