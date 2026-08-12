import React from "react";

type Props = {
    id: string;
    name: string;
    width?: TextInputWidth;
    describedBy?: string;
    additionalClasses?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
};

export enum TextInputWidth {
    W20 = 20,
    W10 = 10,
    W5 = 5,
    W4 = 4,
    W3 = 3,
    W2 = 2,
}

const TextInput = (props: Props) => {
    const inputWidthClass = props.width
        ? `govuk-input--width-${props.width}`
        : "";
    const additionalClasses = props.additionalClasses ?? "";
    return (
        <input
            className={`govuk-input ${inputWidthClass} ${additionalClasses}`}
            id={`${props.name}-${props.id}`}
            name={props.name}
            type="text"
            aria-describedby={props.describedBy}
            onChange={props.onChange}
            onBlur={props.onBlur}
            value={props.value}
        />
    );
};

export default TextInput;
