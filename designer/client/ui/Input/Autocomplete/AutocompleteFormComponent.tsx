import React from "react";
import AutocompleteInput, { AutocompleteOptions } from "./AutocompleteInput";
import { Label, LabelSizes } from "../../Typography";
import { useUid } from "../../../hooks";

type Props = {
    name: string;
    value: string;
    options: AutocompleteOptions[];
    onChange: (nextId: string) => void;
    label: string;
    labelSize?: LabelSizes;
    hint?: string;
    error?: string;

    /* Autocomplete extras */
    headingText?: string;
    noResultsText?: string;
    nullOptionId?: string;
    minLength?: number;
    showAllValues?: boolean;
    displayMenu?: "overlay" | "inline";
    confirmOnBlur?: boolean;
    inputClasses?: string;
    menuClasses?: string;
};

const AutocompleteFormComponent: React.FC<Props> = (props) => {
    const {
        name,
        value,
        options,
        onChange,
        label,
        labelSize = LabelSizes.S,
        hint,
        error,
        headingText,
        noResultsText,
        nullOptionId,
        minLength,
        showAllValues,
        displayMenu,
        confirmOnBlur,
        inputClasses,
        menuClasses,
    } = props;

    const hasError = !!error;
    const hasHint = !!hint;
    const uid = useUid();

    return (
        <div
            className={`govuk-form-group ${
                hasError ? "govuk-form-group--error" : ""
            } govuk-!-margin-0`}
        >
            <Label text={label} for={`${name}-${uid}`} size={labelSize} />

            {hasHint && (
                <div id={`${name}-hint-${uid}`} className="govuk-hint">
                    {hint ?? ""}
                </div>
            )}

            {hasError && (
                <p id={`${name}-error-${uid}`} className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span>{" "}
                    {error ?? ""}
                </p>
            )}

            <AutocompleteInput
                id={uid}
                name={name}
                value={value}
                options={options}
                onChange={onChange}
                hasError={hasError}
                headingText={headingText}
                noResultsText={noResultsText}
                nullOptionId={nullOptionId}
                minLength={minLength}
                showAllValues={showAllValues}
                displayMenu={displayMenu}
                confirmOnBlur={confirmOnBlur}
                inputClasses={inputClasses}
                menuClasses={menuClasses}
            />
        </div>
    );
};
// Memoize to avoid unnecessary re-renders when props are shallow-equal
export default React.memo(AutocompleteFormComponent);
