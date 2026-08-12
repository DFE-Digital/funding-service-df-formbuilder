import React from "react";

type Props = {
    text: string;
    isHeading?: boolean;
    size?: LegendSizes;
};

export enum LegendSizes {
    L = "govuk-fieldset__legend--l",
    M = "govuk-fieldset__legend--m",
    S = "govuk-fieldset__legend--s",
}

const Legend = (props: Props) => {
    const isHeading = !!props.isHeading;
    const legendSizeClass = props.size ?? "";
    return (
        <legend className={`govuk-fieldset__legend ${legendSizeClass}`}>
            {isHeading ? (
                <h1 className="govuk-fieldset__heading">{props.text}</h1>
            ) : (
                props.text
            )}
        </legend>
    );
};

export default Legend;
