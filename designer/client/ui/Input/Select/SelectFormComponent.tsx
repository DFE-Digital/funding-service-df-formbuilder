import React from "react";

import SelectInput from "./SelectInput";
import { Label, LabelSizes } from "../../Typography";
import { useUid } from "../../../hooks";

import type { SelectOptions } from "./SelectInput";

type Props = {
    name: string;
    value: string;
    options: SelectOptions[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    error?: string;
    label: string;
    labelSize?: LabelSizes;
    hint?: string;
};

const SelectFormComponent = (props: Props) => {
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
            <Label
                text={props.label}
                for={`${props.name}-${id}`}
                size={labelSize}
            />
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
            <SelectInput
                id={id}
                name={props.name}
                value={props.value}
                options={props.options}
                onChange={props.onChange}
                hasError={hasError}
            />
        </div>
    );
};

export default SelectFormComponent;
