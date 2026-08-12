import React from "react";

type Props = {
    label: string;
    hint: string;
    setter: React.Dispatch<React.SetStateAction<number>>;
    value: number;
};

function ColumnInput({ label, hint, value, setter }: Props) {
    const options = [...Array(6).keys()].map((number) => (
        <option key={number} value={number}>
            {number}
        </option>
    ));

    return (
        <div className="govuk-form-group dataset-group">
            <h4 className="govuk-label-wrapper">
                <label
                    className="govuk-label govuk-label--s"
                    htmlFor={`design-data-set-dropdown-column`}
                >
                    {label}
                </label>
            </h4>
            <div
                id={`design-data-set-dropdown-column-hint`}
                className="govuk-hint"
            >
                {hint}
            </div>
            <select
                value={value}
                onChange={(e) => setter(parseInt(e.target.value))}
                className="govuk-select dataset-dropdown"
                id={`design-data-set-dropdown-column`}
                data-testid={`design-data-set-dropdown-column-input`}
                name={`design-data-set-dropdown-column`}
                aria-describedby={`design-data-set-dropdown-column-hint`}
            >
                {options}
            </select>
        </div>
    );
}

export default ColumnInput;
