import React, { useState, useContext } from "react";
import {
    SortableHandle,
    SortableContainer,
    SortableElement,
} from "react-sortable-hoc";
import EditSchemaCell from "./EditSchemaCell";
import { i18n } from "../../i18n";
import { Actions } from "../../reducers/component/types";
import { ComponentContext } from "../../reducers/component/componentReducer";
const DragHandle = SortableHandle(() => (
    <span className="column-drag-handle">&#9776;</span>
));

const dataImporti18 = (key) => i18n("dataImportComp." + key);

const SchemaContainer = ({
    key,
    index,
    col,
    arrayindex,
    deleteColumn,
    editColumn,
    columnEdited,
}) => {
    const { state, dispatch } = useContext(ComponentContext);
    const [showEdit, setShowEdit] = useState({ id: null });
    const [hideSchemaContainer, setHideSchemaContainer] = useState(false);
    const [editedColId, setEditedColId] = useState(null);
    const handleEditColumn = (id) => {
        setShowEdit({ id });
        setHideSchemaContainer(true);
        editColumn(id);
        setEditedColId(id);
        dispatch({
            type: Actions.COLUMN_EDITED,
            payload: true,
        });
    };
    return (
        <div
            className={`column-schema-bordered ${
                editedColId === col.columnId ? `edited-column` : ""
            }`}
        >
            {!hideSchemaContainer && (
                <div className="schema-container">
                    <table key={key} className="govuk-label">
                        <tr>
                            <td className="govuk-body">
                                <span>
                                    <strong>C{arrayindex + 1}</strong>
                                </span>
                                <span>&nbsp;{" | "}&nbsp;</span>
                            </td>
                            <td className="govuk-body">
                                <span>
                                    <strong>Column Name: </strong>
                                </span>
                                <span title={col.selectedColumnHeaderValue}>
                                    {col.selectedColumnHeaderValue}
                                </span>
                            </td>
                        </tr>
                    </table>
                    <div className="govuk-label ml-40">
                        <span>
                            <strong>Column Type: </strong>
                        </span>
                        <span>{col.columnType}</span>
                    </div>

                    <div className="ml-40" key={key}>
                        <div>
                            <div className="govuk-label mt-10">
                                Schema Details
                            </div>
                            {col.columnType === "Date" && (
                                <div className="mt-10 govuk-label flex-container">
                                    <span className="fg-1">
                                        <strong>Max days in past</strong> :
                                        &nbsp;
                                        {col.columnSchema.maxDaysInPast
                                            ? col.columnSchema.maxDaysInPast
                                            : "-"}{" "}
                                    </span>
                                    <span className="govuk-label inline-block separator-big">
                                        {" | "}
                                    </span>
                                    <span className="fg-2">
                                        <strong>Max days in future</strong> :
                                        &nbsp;
                                        {col.columnSchema.maxDaysInFuture
                                            ? col.columnSchema.maxDaysInFuture
                                            : "-"}
                                    </span>
                                </div>
                            )}

                            {col.columnType === "Text" && (
                                <div className="mt-10 govuk-label">
                                    <strong>Max Length : </strong>
                                    {col.columnSchema.maxLength
                                        ? col.columnSchema.maxLength
                                        : "-"}{" "}
                                </div>
                            )}

                            {col.columnType === "Number" && (
                                <div className="mt-10 govuk-label flex-container">
                                    <span className="fg-1">
                                        <strong>Min</strong> : &nbsp;
                                        {col.columnSchema.minNumber
                                            ? col.columnSchema.minNumber
                                            : "-"}{" "}
                                    </span>
                                    <span className="govuk-label inline-block separator-big">
                                        {" | "}
                                    </span>
                                    <span className="fg-1">
                                        <strong>Max</strong> : &nbsp;
                                        {col.columnSchema.maxNumber
                                            ? col.columnSchema.maxNumber
                                            : "-"}
                                    </span>
                                    <span className="govuk-label inline-block separator-big">
                                        {" | "}
                                    </span>
                                    <span className="fg-1">
                                        <strong>Precision</strong> : &nbsp;
                                        {col.columnSchema.precisionNumber
                                            ? col.columnSchema.precisionNumber
                                            : "-"}
                                    </span>
                                </div>
                            )}

                            {col.columnType === "UKAddress" && (
                                <>
                                    <div className="mt-10 govuk-label">
                                        <strong>Address : </strong>
                                        {col.columnSchema.addressRequired ===
                                        true
                                            ? "Optional"
                                            : "Mandatory"}
                                    </div>
                                </>
                            )}
                            {!columnEdited && (
                                <div className="mt-10">
                                    <a
                                        className="govuk-label inline-block govuk-link edit-link mt-10"
                                        onClick={() =>
                                            handleEditColumn(col.columnId)
                                        }
                                    >
                                        Edit
                                    </a>
                                    <span className="govuk-label inline-block separator">
                                        {" | "}
                                    </span>
                                    <a
                                        className="govuk-label inline-block govuk-link delete-link mt-10"
                                        onClick={() =>
                                            deleteColumn(col.columnId)
                                        }
                                    >
                                        Delete
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {showEdit.id === col.columnId && hideSchemaContainer && (
                <EditSchemaCell
                    id={col.columnId}
                    setHideSchemaContainer={setHideSchemaContainer}
                    setEditedColId={setEditedColId}
                />
            )}
        </div>
    );
};

const SortableItem = SortableElement(
    ({
        key,
        index,
        col,
        arrayindex,
        deleteColumn,
        editColumn,
        columnEdited,
    }) => (
        <>
            {!columnEdited && <DragHandle />}

            <SchemaContainer
                key={key}
                index={index}
                col={col}
                arrayindex={arrayindex}
                deleteColumn={deleteColumn}
                editColumn={editColumn}
                columnEdited={columnEdited}
            />
        </>
    )
);

export const SortableList = SortableContainer(
    ({ columns = [], deleteColumn, editColumn, columnEdited }) => {
        return (
            <div className="column-list">
                {columns?.map((col, index) => (
                    <SortableItem
                        key={index}
                        index={index}
                        col={col}
                        arrayindex={index}
                        columnEdited={columnEdited}
                        editColumn={editColumn}
                        deleteColumn={deleteColumn}
                    />
                ))}
                {columns.length > 0 && (
                    <div className="govuk-warning-text">
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
                            {dataImporti18("SchemaWarningText")}
                        </strong>
                    </div>
                )}
            </div>
        );
    }
);
