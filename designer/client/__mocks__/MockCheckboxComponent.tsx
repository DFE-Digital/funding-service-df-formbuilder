import React, { ChangeEvent } from "react";

type Items = {
    children: string | HTMLElement;
    value: boolean | string | number;
    hint?: {
        children: HTMLElement;
    };
};

type Props = {
    name: string;
    value: string | number | null;
    items: Items[];
    error?: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    fieldset?: {
        legend: {
            children: HTMLElement;
        };
    };
    hint?: {
        children: HTMLElement;
    };
};

const MockCheckboxComponent = (props: Props) => {
    const id = "id";
    const hasHint = !!props.hint;
    const hasError = !!props.error;
    return (
        <div className={`govuk-form-group`}>
            <fieldset className="govuk-fieldset">
                {props.fieldset?.legend.children}
                {props.hint?.children}
                {hasError && (
                    <p
                        id={`${props.name}-${id}-error`}
                        className="govuk-error-message"
                    >
                        <span className="govuk-visually-hidden">Error:</span>{" "}
                        {props.error}
                    </p>
                )}
                <div
                    className={`govuk-checkboxes`}
                    data-module="govuk-checkboxes"
                >
                    {props.items.map((option, idx) => {
                        const checked = props.value === option.value;
                        const hintId = hasHint ? `${idx}-hint` : "";
                        return (
                            <>
                                <div
                                    key={`${option.value}`}
                                    className="govuk-checkboxes__item"
                                >
                                    <input
                                        className="govuk-checkboxes__input"
                                        id={`${props.name}`}
                                        name={`${props.name}`}
                                        type="checkbox"
                                        value={option.value}
                                        checked={checked}
                                        onChange={props.onChange}
                                        aria-describedby={hintId}
                                    />
                                    <label
                                        className={`govuk-label`}
                                        htmlFor={`${option.value}`}
                                    >
                                        {option.children}
                                    </label>
                                </div>
                            </>
                        );
                    })}
                </div>
            </fieldset>
        </div>
    );
};

module.exports = { Checkboxes: MockCheckboxComponent };
