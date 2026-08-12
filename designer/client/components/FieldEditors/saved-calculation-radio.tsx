import React from "react";

const SavedCalculationRadio = ({
    calc,
    setSelectedCalculation,
    selectedCalculation,
}) => {
    return (
        <tr className="govuk-table__row" key={calc.name}>
            <td className="govuk-table__cell govuk-!-padding-right-0">
                <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item custom-radios__item">
                        <input
                            className="govuk-radios__input"
                            id={calc.name}
                            name={calc.name}
                            type="radio"
                            checked={calc.name === selectedCalculation?.name}
                            onChange={() => setSelectedCalculation(calc)}
                            value={calc.name}
                        />
                        <label
                            className="govuk-label govuk-radios__label"
                            htmlFor={calc.name}
                        ></label>
                    </div>
                </div>
            </td>
            <td className="govuk-table__cell vertical-align">
                <span
                    title={calc.displayName}
                    className="govuk-formname-ellipsis"
                >
                    {calc.displayName}
                </span>
            </td>
            <td className="govuk-table__cell vertical-align">{calc.name}</td>
            <td className="govuk-table__cell vertical-align">
                {calc.pageLocation}
            </td>
            <td className="govuk-table__cell vertical-align">
                {calc.components.length}
            </td>
        </tr>
    );
};

export default SavedCalculationRadio;
