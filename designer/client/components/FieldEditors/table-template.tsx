import React from "react";
import { TickIcon } from "../Icons";

const TableTemplate = ({
    component,
    comptype,
    onCheckBoxChange,
    isChecked,
    repeatableSection,
}) => (
    <tr className="govuk-table__row">
        <td className="govuk-table__cell govuk-!-padding-right-0">
            <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                <div className="govuk-checkboxes__item govuk-!-padding-left-0 custom-checkbox">
                    <input
                        className="govuk-checkboxes__input"
                        id={component.name}
                        name={component.name}
                        type="checkbox"
                        value={component.name}
                        onChange={() => onCheckBoxChange(component)}
                        checked={isChecked(component.name)}
                    />
                    <label
                        className="govuk-label govuk-checkboxes__label components-list"
                        htmlFor={component.name}
                    />
                </div>
            </div>
        </td>
        <td className="govuk-table__cell govuk-body-s">
            <span
                title={
                    comptype === "Component"
                        ? component.title
                        : component.displayName
                }
                className="govuk-formname-ellipsis govuk-!-margin-0 component-name"
            >
                {comptype === "Component"
                    ? component.title
                    : component.displayName}
            </span>
        </td>
        <td className="govuk-table__cell govuk-body-s">{component.name}</td>
        {repeatableSection ? (
            <td className="govuk-table__cell govuk-!-padding-right-0">
                <span>
                    <TickIcon />
                </span>
            </td>
        ) : (
            <td className="govuk-table__cell govuk-!-padding-right-0"></td>
        )}
    </tr>
);

export default TableTemplate;
