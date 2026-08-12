import React from "react";
import { i18n } from "../../i18n";

export default function DataSetsTable({
    isChecked,
    onItemSelect,
    columns,
    rows,
    emptyMessage,
}) {
    const isRowsEmpty: boolean =
        (Array.isArray(rows) && rows.length === 0) || !rows;

    return (
        <table className="govuk-table">
            <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header"></th>
                    {columns.map((column) => (
                        <th
                            scope="col"
                            className="govuk-table__header"
                            key={column.key}
                        >
                            {i18n(column.label)}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="govuk-table__body">
                {isRowsEmpty && (
                    <tr>
                        <td
                            className="govuk-table__cell no-data-cell"
                            colSpan={columns.length + 1}
                        >
                            {emptyMessage}
                        </td>
                    </tr>
                )}
                {!isRowsEmpty &&
                    rows.map((row, idx) => (
                        <tr className="govuk-table__row" key={idx}>
                            <td className="govuk-table__cell govuk-!-padding-right-0 custom-radio-input">
                                <div
                                    className="govuk-radios"
                                    data-module="govuk-radios"
                                >
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id={row?.id}
                                            data-testid="data-set-radio-input"
                                            name={row?.id}
                                            type="radio"
                                            checked={isChecked(row?.id)}
                                            onChange={onItemSelect}
                                            value={row?.id}
                                        />
                                        <label
                                            className="govuk-label govuk-radios__label"
                                            htmlFor={row?.id}
                                        ></label>
                                    </div>
                                </div>
                            </td>
                            {columns.map((column) => (
                                <td
                                    className="govuk-table__cell vertical-align"
                                    key={column.key}
                                >
                                    <div className="flex-ellipsis">
                                        <div className={column?.class ?? ""}>
                                            {column.render(row[column.key])}
                                        </div>
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
            </tbody>
        </table>
    );
}
