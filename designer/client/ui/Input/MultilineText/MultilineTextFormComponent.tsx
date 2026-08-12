import React from "react";

import MultilineTextInput from "./MultilineTextInput";
import { Label, LabelSizes } from "../../Typography";
import { useUid } from "../../../hooks";

type Props = {
    name: string;
    label: string;
    labelSize?: LabelSizes;
    hint?: string;
    rows?: number;
    error?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

const MultilineFormComponent = (props: Props) => {
    const hasError = !!props.error;
    const hasHint = !!props.hint;
    const labelSize = props.labelSize ?? LabelSizes.S;
    const id = useUid();
    return (
        <div
            className={`govuk-form-group ${
                hasError ? "govuk-form-group--error" : ""
            } govuk-!-margin-0`}
        >
            <h1 className="govuk-label-wrapper">
                <Label
                    text={props.label}
                    for={`${props.name}-${id}`}
                    size={labelSize}
                />
            </h1>
            {hasHint && (
                <div id={`${props.name}-hint-${id}`} className="govuk-hint">
                    {props.hint ?? ""}
                </div>
            )}
            {hasError && (
                <p
                    id={`${props.name}-error-${id}`}
                    className="govuk-error-message"
                >
                    <span className="govuk-visually-hidden">Error:</span>{" "}
                    {props.error ?? ""}
                </p>
            )}
            <MultilineTextInput
                id={id}
                name={props.name}
                rows={props.rows}
                describedBy={`${props.name}-hint-${id}`}
                onChange={props.onChange}
                value={props.value}
            />
        </div>
    );
};

export default MultilineFormComponent;
