import React from "react";

import { Label } from "../../Typography";

type Props = {
    id: string;
    name: string;
    selectedValue?: string | number | boolean | null;
    options: RadioOption[];
    isInline?: boolean;
    isSmall?: boolean;
    additionalClasses?: string;
};

export type RadioOption = {
    key: string;
    value: string | number | boolean;
    label: string;
    hint?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    divider?: string;
    renderConditional?: () => React.JSX.Element;
    additionalClasses?: string;
};

const RadioInput = (props: Props) => {
    const isInline = !!props.isInline;
    const isSmall = !!props.isSmall;
    const inlineClass = isInline ? "govuk-radios--inline" : "";
    const smallClass = isSmall ? "govuk-radios--small" : "";
    const additionalClasses = props.additionalClasses ?? "";
    return (
        <div
            className={`govuk-radios ${inlineClass} ${smallClass} ${additionalClasses}`}
            data-module="govuk-radios"
        >
            {props.options.map((option, idx) => {
                const hasHint = !!option.hint;
                const hasDivider = !!option.divider;
                const checked = props.selectedValue === option.value;
                const hasConditionalRender =
                    !!option.renderConditional && checked && !isInline;
                const hintId = hasHint ? `${props.id}-${idx}-hint` : "";
                return (
                    <>
                        <div key={option.key} className="govuk-radios__item">
                            <input
                                className="govuk-radios__input"
                                id={`${props.id}-${idx}`}
                                name={props.name}
                                type="radio"
                                value={option.value}
                                checked={checked}
                                onChange={option.onChange}
                                aria-describedby={hintId}
                            />
                            <Label
                                text={option.label}
                                for={`${props.id}-${idx}`}
                                additionalClasses={`govuk-radios__label ${option.additionalClasses}`}
                            />
                            {hasHint && (
                                <div
                                    id={hintId}
                                    className="govuk-hint govuk-radios__hint"
                                >
                                    {option.hint ?? ""}
                                </div>
                            )}
                        </div>
                        {hasDivider && (
                            <div className="govuk-radios__divider">
                                {option.divider}
                            </div>
                        )}
                        {hasConditionalRender && (
                            <div
                                className={`govuk-radios__conditional`}
                                id={`${props.id}-${idx}-contact`}
                            >
                                {option.renderConditional
                                    ? option.renderConditional()
                                    : ""}
                            </div>
                        )}
                    </>
                );
            })}
        </div>
    );
};

export default RadioInput;
