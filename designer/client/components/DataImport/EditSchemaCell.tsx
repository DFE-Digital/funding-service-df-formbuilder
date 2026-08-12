import React, { useContext, useEffect, useState } from "react";
import { Actions } from "../../reducers/component/types";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { i18n } from "../../i18n";
const dataImporti18 = (key) => i18n("dataImportComp." + key);
import {
    RenderDataImportRadioButtons,
    RenderColumnType,
} from "./CommonRenders";
import UKAddressSchema from "./UKAddressSchema";
import DateSchema from "./DateSchema";
import TextSchema from "./TextSchema";
import NumberSchema from "./NumberSchema";

function EditSchemaCell({ id, setHideSchemaContainer, setEditedColId }) {
    const {
        state: {
            selectedComponent: { columns, columnNames },
        },
        dispatch,
    } = useContext(ComponentContext);

    const columnTypes = ["Date", "Text", "UKAddress", "Number"];

    const selectedComponent = columns.find((col) => col.columnId == id);
    const [clonedState, setClonedState] = useState(selectedComponent);

    const [disableSaveButton, setDisableSaveButton] = useState(true);

    const {
        selectedColumnHeaderType,
        selectedColumnHeaderValue,
        columnType,
        columnSchema,
    } = selectedComponent;
    const defaultState = {
        editColumnHeaderType: selectedColumnHeaderType,
        editColumnHeaderValue: selectedColumnHeaderValue,
        editColumnType: columnType,
        editColumnSchema: columnSchema,
    };

    const [editState, setEditState] = useState(defaultState);
    const onColumnSelect = (e) => {
        const { id } = e.currentTarget;
        const selectedHeaderType = id.split("_edit")[0];
        setEditState((prevState) => {
            return {
                ...prevState,
                editColumnHeaderType: selectedHeaderType,
                editColumnHeaderValue: "",
            };
        });
    };

    const onColumnNameSelection = (e) => {
        const selectedColumn = e.target.value;
        setEditState((prevState) => {
            return {
                ...prevState,
                editColumnHeaderType: "select_column",
                editColumnHeaderValue: selectedColumn,
            };
        });
    };

    const handleCustomColumn = (e) => {
        const text = e.target.value;
        setEditState((prevState) => {
            return {
                ...prevState,
                editColumnHeaderValue:
                    editColumnHeaderType === "custom_column" ? text : "",
            };
        });
    };

    const getRelatedSchema = (schema) => {
        const dateSchema = {
            maxDaysInPast: "",
            maxDaysInFuture: "",
        };

        const textSchema = {
            maxLength: "",
        };

        const numberSchema = {
            minNumber: "",
            maxNumber: "",
            precisionNumber: "",
        };

        // const numberSchema = {};
        const ukAddressSchema = {
            addressRequired: "",
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

    const columnTypeSelection = (value) => {
        setEditState((prevState) => {
            return {
                ...prevState,
                editColumnType: value,
                editColumnSchema: getRelatedSchema(value),
            };
        });
    };

    const checkForChanges = (clonedState, editState) => {
        console.log(clonedState, editState);
        const {
            columnSchema,
            columnType,
            selectedColumnHeaderType,
            selectedColumnHeaderValue,
        } = clonedState;

        const clonedCompValues = {
            columnSchema,
            columnType,
            selectedColumnHeaderType,
            selectedColumnHeaderValue,
        };

        const {
            editColumnSchema,
            editColumnType,
            editColumnHeaderType,
            editColumnHeaderValue,
        } = editState;

        const updatedStateValues = {
            columnSchema: editColumnSchema,
            columnType: editColumnType,
            selectedColumnHeaderType: editColumnHeaderType,
            selectedColumnHeaderValue: editColumnHeaderValue,
        };

        const isEqual =
            JSON.stringify(clonedCompValues) ===
            JSON.stringify(updatedStateValues);

        setDisableSaveButton(isEqual);
        !isEqual &&
            dispatch({
                type: Actions.COMPONENT_EDITED,
                payload: true,
            });
    };

    useEffect(() => {
        checkForChanges(clonedState, editState);
    }, [clonedState, editState]);

    const handleSchemaChanges = (e) => {
        const { value, name } = e.target;

        setEditState((prevState) => {
            return {
                ...prevState,
                editColumnSchema: {
                    ...prevState.editColumnSchema,
                    [name]: value,
                },
            };
        });
    };

    const onSave = () => {
        selectedComponent.isEdited = false;

        const {
            editColumnHeaderType,
            editColumnHeaderValue,
            editColumnType,
            editColumnSchema,
        } = editState;
        const updatedColumn = {
            ...selectedComponent,
            selectedColumnHeaderType: editColumnHeaderType,
            selectedColumnHeaderValue: editColumnHeaderValue,
            columnType: editColumnType,
            columnSchema: editColumnSchema,
        };

        const target = columns.find(
            (obj) => obj.columnId === selectedComponent.columnId
        );

        const source = updatedColumn;

        Object.assign(target, source);

        setHideSchemaContainer(false);

        setEditedColId(null);

        dispatch({
            type: Actions.EDIT_DELETE_COLUMN,
            payload: columns,
        });
        dispatch({
            type: Actions.COLUMN_EDITED,
            payload: false,
        });
    };

    const onClose = () => {
        selectedComponent.isEdited = false;
        selectedComponent.columnEdited = false;
        setHideSchemaContainer(false);
        setEditedColId(null);
        dispatch({
            type: Actions.COLUMN_EDITED,
            payload: false,
        });
    };

    const {
        editColumnHeaderType,
        editColumnHeaderValue,
        editColumnType,
        editColumnSchema,
    } = editState;

    return (
        <div className="edit-schema-container">
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
                showColumnDropdown={editColumnHeaderType === "select_column"}
                selectedColumnHeaderValue={editColumnHeaderValue}
                showCustomColumn={editColumnHeaderType === "custom_column"}
                onColumnNameSelection={onColumnNameSelection}
                handleCustomColumn={handleCustomColumn}
                columnNames={columnNames}
                from="EditColumn"
            />
            <RenderColumnType
                columnType={editColumnType}
                columnTypeSelection={columnTypeSelection}
                selectedColumnHeaderType={selectedColumnHeaderType}
                selectedColumnHeaderValue={selectedColumnHeaderValue}
                columnTypes={columnTypes}
            />
            {editColumnType === "UKAddress" && (
                <>
                    <UKAddressSchema
                        from="editSchema"
                        setImportState={setEditState}
                        importState={editState}
                    />
                </>
            )}
            {editColumnType === "Number" && (
                <>
                    <NumberSchema
                        minNumber={editColumnSchema?.minNumber}
                        maxNumber={editColumnSchema?.maxNumber}
                        precisionNumber={editColumnSchema?.precisionNumber}
                        handleNumberSchemaChanges={handleSchemaChanges}
                        // columnData={columnData}
                    />
                </>
            )}
            {editColumnType === "Text" && (
                <>
                    <TextSchema
                        maxLength={editColumnSchema?.maxLength}
                        handleTextSchemaChanges={handleSchemaChanges}
                    />
                </>
            )}
            {editColumnType === "Date" && (
                <>
                    <DateSchema
                        maxDaysInPast={editColumnSchema?.maxDaysInPast}
                        maxDaysInFuture={editColumnSchema?.maxDaysInFuture}
                        handleDateSchemaChanges={handleSchemaChanges}
                    />
                </>
            )}

            <div className="mt-10">
                <button
                    type="button"
                    className="govuk-button govuk-button--secondary hyperlink"
                    disabled={disableSaveButton}
                    onClick={onSave}
                >
                    Save
                </button>
                <a
                    className="govuk-link hyperlink close-link inline-block"
                    onClick={onClose}
                >
                    Close
                </a>
            </div>
        </div>
    );
}

export default EditSchemaCell;
