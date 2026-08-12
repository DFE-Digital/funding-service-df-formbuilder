import React from "react";
import { i18n } from "../../i18n";

const TableBody = ({ tableData, getFormAccessType }) => {
    const tableBody = tableData && (
        <tr className="govuk-table__row">
            <td className="govuk-table__cell">
                <span
                    className={
                        tableData.displayName?.length > 30
                            ? "govuk-formname-ellipsis"
                            : ""
                    }
                    title={tableData.displayName}
                    data-testid="displayName-table-cell"
                >
                    {tableData.displayName}
                </span>
            </td>
            <td className="govuk-table__cell">{tableData.formStatus}</td>
            <td className="govuk-table__cell">{tableData.lastModified}</td>
            <td className="govuk-table__cell">
                {getFormAccessType(tableData.signInRequired)}
            </td>
            <td className="govuk-table__cell">{tableData.createdBy}</td>
        </tr>
    );
    return (
        <tbody className="govuk-table__body">
            {tableData ? (
                <>{tableBody}</>
            ) : (
                <tr className="govuk-table__row">
                    <td className="govuk-table__cell table__cell__noborder">
                        {i18n("landingPage.existing.noforms")}
                    </td>
                </tr>
            )}
        </tbody>
    );
};

export default TableBody;
