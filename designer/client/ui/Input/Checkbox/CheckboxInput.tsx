import React from "react";

import { Label } from "../../Typography";

import "./checkbox.scss";

type Props = {
    id: string;
    name: string;
    selectedValue: string | number | string[] | null;
    options: CheckboxOption[];
    isSmall?: boolean;
    isInline?: boolean;
    additionalClasses?: string;
};

export type CheckboxOption = {
    key: string;
    value: string | number;
    label: string;
    labelBold?: boolean;
    hint?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    divider?: string;
    renderConditional?: () => React.JSX.Element;
    additionalClasses?: string;
};

const CheckboxInput = (props: Props) => {
    const isInline = !!props.isInline;
    const isSmall = !!props.isSmall;
    const inlineClass = isInline ? "govuk-checkboxes--inline" : "";
    const smallClass = isSmall ? "govuk-checkboxes--small" : "";
    const additionalClasses = props.additionalClasses ?? "";
    return (
        <div
            className={`govuk-checkboxes ${smallClass} ${inlineClass} ${additionalClasses}`}
            data-module="govuk-checkboxes"
        >
            {props.options.map((option, idx) => {
                const hasHint = !!option.hint;
                const hasDivider = !!option.divider;
                const checked =
                    props.selectedValue?.constructor === Array
                        ? props.selectedValue.includes(option.value.toString())
                        : props.selectedValue === option.value;
                const hasConditionalRender =
                    !!option.renderConditional && checked;
                const hintId = hasHint ? `${props.id}-${idx}-hint` : "";
                return (
                    <>
                        <div
                            key={option.key}
                            className="govuk-checkboxes__item"
                        >
                            <input
                                className="govuk-checkboxes__input"
                                id={`${props.id}-${idx}`}
                                name={props.name}
                                type="checkbox"
                                value={option.value}
                                checked={checked}
                                onChange={option.onChange}
                                aria-describedby={hintId}
                            />
                            <Label
                                text={option.label}
                                for={props.id}
                                bold={option.labelBold}
                                additionalClasses={`govuk-checkboxes__label ${option.additionalClasses}`}
                            />
                            {hasHint && (
                                <div
                                    id={hintId}
                                    className="govuk-hint govuk-checkboxes__hint"
                                >
                                    {option.hint ?? ""}
                                </div>
                            )}
                        </div>
                        {hasDivider && (
                            <div className="govuk-checkboxes__divider">
                                {option.divider}
                            </div>
                        )}
                        {hasConditionalRender && (
                            <div
                                className={`govuk-checkboxes__conditional`}
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

export default CheckboxInput;
