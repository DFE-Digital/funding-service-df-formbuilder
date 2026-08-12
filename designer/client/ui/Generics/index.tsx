import React from "react";

import "./generics.scss";

type Props = {
    text: string;
    color: GenericsColor;
    className?: string;
    textClassName?: string;
};

export enum GenericsColor {
    Green = "generics-color-green",
    Red = "generics-color-red",
    LightGreen = "generics-color-light-green",
    LightRed = "generics-color-light-red",
}

const GenericsComponent = (props: Props) => {
    return (
        <div
            className={`generics-component-container ${props.color} ${
                props.className ?? ""
            }`}
        >
            <div
                className={`govuk-body govuk-!-margin-0 ${
                    props.textClassName ?? ""
                }`}
            >
                {props.text}
            </div>
        </div>
    );
};

export default GenericsComponent;
