import React from "react";
import DataSetsTable from "./DataSetsTable";
import NavigationButtons from "./NavigationButtons";

export default function SummaryScreen({
    selectedDataSet,
    introMesage,
    onAdd,
    onDelete,
    onEdit,
    addLabel,
    deleteLabel,
    editLabel,
    emptyMessage,
    onItemSelect,
    isChecked,
    columns,
    rows,
    moduleType,
    confirm,
    setConfirm,
}) {
    return (
        <div className="import-data-container">
            <p className="govuk-body govuk-!-margin-top-7 govuk-!-margin-top-6">
                {introMesage}
            </p>
            <DataSetsTable
                emptyMessage={emptyMessage}
                isChecked={isChecked}
                onItemSelect={onItemSelect}
                columns={columns}
                rows={rows}
            />
            <NavigationButtons
                selectedDataSet={selectedDataSet}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
                addLabel={addLabel}
                editLabel={editLabel}
                deleteLabel={deleteLabel}
                moduleType={moduleType}
                confirm={confirm}
                setConfirm={setConfirm}
            />
        </div>
    );
}
