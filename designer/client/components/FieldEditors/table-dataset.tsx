import React from "react";

const TableDataset = ({
    dataset,
    onDatasetCheckboxChange,
    isDatasetChecked,
}) => (
    <tr className="govuk-table__row">
        <td className="govuk-table__cell govuk-!-padding-right-0">
            <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                <div className="govuk-checkboxes__item govuk-!-padding-left-0 custom-checkbox">
                    <input
                        className="govuk-checkboxes__input"
                        id={dataset.value}
                        name={dataset.value}
                        type="checkbox"
                        value={dataset.value}
                        onChange={() => onDatasetCheckboxChange(dataset)}
                        checked={isDatasetChecked(dataset.value)}
                    />
                    <label
                        className="govuk-label govuk-checkboxes__label components-list"
                        htmlFor={dataset.value}
                    />
                </div>
            </div>
        </td>
        <td className="govuk-table__cell govuk-body-s">
            <span
                title={dataset.value}
                className="govuk-formname-ellipsis govuk-!-margin-0 dataset-value"
            >
                {dataset.value}
            </span>
        </td>
        <td className="govuk-table__cell govuk-body-s"></td>
    </tr>
);

export default TableDataset;
