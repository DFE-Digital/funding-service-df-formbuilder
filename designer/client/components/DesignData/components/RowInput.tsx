import React from "react";

type Props = {
    label: string;
    hint: string;
    setter: (num: number | null) => void;
    value: number | null;
};

const RowInput = ({ label, hint, value, setter }: Props) => {
    return (
        <div className="govuk-form-group">
            <h1 className="govuk-label-wrapper">
                <label
                    className="govuk-label govuk-label--s"
                    htmlFor={`design-data-set-dropdown-row`}
                >
                    {label}
                </label>
            </h1>
            <div
                id={`design-data-set-dropdown-row-hint`}
                className="govuk-hint"
            >
                {hint}
            </div>
            <input
                className="govuk-input govuk-input--width-2"
                id={`design-data-set-dropdown-row`}
                data-testid={`design-data-set-dropdown-row-input`}
                name={`design-data-set-dropdown-row`}
                aria-describedby={`design-data-set-dropdown-row-hint`}
                type="text"
                spellCheck="false"
                pattern="[0-9]*"
                inputMode="numeric"
                onChange={(e) => {
                    if (e.target.value === "") {
                        setter(null);
                        return;
                    }
                    const result = parseInt(e.target.value);
                    if (!Number.isNaN(result) && result <= 100) {
                        setter(result);
                    }
                }}
                value={value ?? ""}
            />
        </div>
    );
};

export default RowInput;
