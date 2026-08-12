import React from "react";

import TextInput, { TextInputWidth } from "./TextInput";
import { Label, LabelSizes } from "../../Typography";
import { useUid } from "../../../hooks";

type Props = {
    name: string;
    label: string;
    labelSize?: LabelSizes;
    labelClasses?: string;
    hint?: string;
    error?: string;
    inputWidth?: TextInputWidth;
    value?: string;
    additionalClasses?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
};

const TextFormComponent = (props: Props) => {
    const hasError = !!props.error;
    const hasHint = !!props.hint;
    const labelSize = props.labelSize ?? LabelSizes.S;
    const id = useUid();
    return (
        <div
            className={`govuk-form-group ${
                hasError && "govuk-form-group--error"
            } govuk-!-margin-0`}
        >
            <h1 className="govuk-label-wrapper">
                <Label
                    text={props.label}
                    for={`${props.name}-${id}`}
                    size={labelSize}
                    additionalClasses={props.labelClasses}
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
            <TextInput
                id={id}
                name={props.name}
                describedBy={`${props.name}-hint-${id}`}
                width={props.inputWidth}
                onChange={props.onChange}
                onBlur={props.onBlur}
                value={props.value}
                additionalClasses={props.additionalClasses}
            />
        </div>
    );
};

export default TextFormComponent;
