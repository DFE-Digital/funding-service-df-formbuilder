import React from "react";

type Props = {
    size?: DividerSizes;
    additionalClasses?: string;
};

export enum DividerSizes {
    XL = "xl",
    L = "l",
    M = "m",
}

const Divider = (props: Props) => {
    const size = props.size ?? DividerSizes.M;
    const additionalClasses = props.additionalClasses ?? "";
    return (
        <hr
            className={`govuk-section-break govuk-section-break--${size} govuk-section-break--visible ${additionalClasses}`}
        />
    );
};

export default Divider;
