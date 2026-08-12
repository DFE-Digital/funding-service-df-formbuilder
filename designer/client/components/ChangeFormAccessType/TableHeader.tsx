import React from "react";

const TableHeader = () => {
    return (
        <thead className="govuk-table__head">
            <tr className="govuk-table__row">
                <th scope="col" className="govuk-table__header">
                    Form name
                </th>
                <th scope="col" className="govuk-table__header">
                    Form status
                </th>
                <th scope="col" className="govuk-table__header">
                    Last modified
                </th>
                <th scope="col" className="govuk-table__header">
                    Access type
                </th>
                <th scope="col" className="govuk-table__header">
                    Created by
                </th>
            </tr>
        </thead>
    );
};

export default TableHeader;
