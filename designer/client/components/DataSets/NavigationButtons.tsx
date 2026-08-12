import React, { useState } from "react";
import LinkedPropertiesDetails from "../../utils/LinkedPropertiesDetails";

export default function NavigationButtons({
    selectedDataSet,
    onEdit,
    onDelete,
    onAdd,
    editLabel,
    deleteLabel,
    addLabel,
    moduleType,
    confirm,
    setConfirm,
}) {
    return (
        <>
            <div className="govuk-button-group">
                <button
                    id="add-data-set"
                    type="submit"
                    onClick={onAdd}
                    className="govuk-button govuk-!-margin-top-4"
                    data-testid={"add-data-set"}
                    title="Add data set"
                >
                    {addLabel}
                </button>
                <button
                    id="edit-data-set"
                    type="submit"
                    onClick={onEdit}
                    className="govuk-button govuk-button--secondary govuk-!-margin-right-8"
                    data-testid={"edit-data-set"}
                    title="Edit data set"
                    disabled={selectedDataSet ? false : true}
                >
                    {editLabel}
                </button>
            </div>
            <br />
            {selectedDataSet && (
                <>
                    <LinkedPropertiesDetails
                        module={moduleType}
                        selectedComponent={selectedDataSet}
                        confirm={confirm}
                        setConfirm={setConfirm}
                    />
                    <button
                        id="delete-data set"
                        type="submit"
                        onClick={onDelete}
                        className="govuk-button govuk-button--warning"
                        data-testid={"delete-data-set"}
                        title="Delete data set"
                        disabled={selectedDataSet && confirm ? false : true}
                    >
                        {deleteLabel}
                    </button>
                </>
            )}
        </>
    );
}
