import React from "react";
import RadioInput, { RadioOption } from "./RadioInput";
import { useUid } from "../../../hooks";
import { Legend, LegendSizes } from "../../Typography";

type Props = {
    name: string;
    value: string | number | boolean | null;
    label: string;
    labelSize?: LegendSizes;
    isLabelHeading?: boolean;
    hint?: string;
    options: RadioOption[];
    isInline?: boolean;
    isSmall?: boolean;
    error?: string;
};

const RadioFormComponent = (props: Props) => {
    const id = useUid();
    const hasHint = !!props.hint;
    const hasError = !!props.error;
    return (
        <div
            className={`govuk-form-group ${
                hasError ? "govuk-form-group--error" : ""
            }`}
        >
            <fieldset className="govuk-fieldset">
                <Legend
                    text={props.label}
                    size={props.labelSize}
                    isHeading={props.isLabelHeading}
                />
                {hasHint && (
                    <div id={`${props.name}-${id}-hint`} className="govuk-hint">
                        {props.hint ?? ""}
                    </div>
                )}
                {hasError && (
                    <p
                        id={`${props.name}-${id}-error`}
                        className="govuk-error-message"
                    >
                        <span className="govuk-visually-hidden">Error:</span>{" "}
                        {props.error}
                    </p>
                )}
                <RadioInput
                    id={`${props.name}-${id}`}
                    name={props.name}
                    selectedValue={props.value}
                    options={props.options}
                    isInline={props.isInline}
                    isSmall={props.isSmall}
                />
            </fieldset>
        </div>
    );
};

export default RadioFormComponent;
