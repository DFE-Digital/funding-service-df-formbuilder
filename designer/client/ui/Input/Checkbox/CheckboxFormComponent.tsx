import React from "react";
import CheckboxInput from "./CheckboxInput";
import { useUid } from "../../../hooks";
import { Legend, LegendSizes } from "../../Typography";

import type { CheckboxOption } from "./CheckboxInput";

type Props = {
    name: string;
    value: string | number | string[];
    label: string;
    labelSize?: LegendSizes;
    isLabelHeading?: boolean;
    hint?: string;
    options: CheckboxOption[];
    isInline?: boolean;
    isSmall?: boolean;
    error?: string;
};

const CheckboxFormComponent = (props: Props) => {
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
                <CheckboxInput
                    id={`${props.name}-${id}`}
                    name={props.name}
                    selectedValue={props.value}
                    options={props.options}
                    isSmall={props.isSmall}
                    isInline={props.isInline}
                />
            </fieldset>
        </div>
    );
};

export default CheckboxFormComponent;
