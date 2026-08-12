import React from "react";

type Props = {
    text: string;
    for?: string;
    size?: LabelSizes;
    bold?: boolean;
    additionalClasses?: string;
    renderRight?: () => React.JSX.Element;
};

export enum LabelSizes {
    L = "govuk-label--l",
    M = "govuk-label--m",
    S = "govuk-label--s",
}

const Label = (props: Props) => {
    const labelSizeClass = props.size ?? "";
    const hasRenderRight = !!props.renderRight;
    const hasBold = !!props.bold;
    return (
        <label
            className={`govuk-label ${labelSizeClass} ${
                props.additionalClasses ?? ""
            } ${hasBold ? "govuk-!-font-weight-bold" : ""}`}
            htmlFor={props.for}
        >
            {props.text}
            {hasRenderRight && props.renderRight!()}
        </label>
    );
};

export default Label;
