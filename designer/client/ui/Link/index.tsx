import React from "react";
import "./link.scss";

export enum WeighingUnit {
    /** font weight normal */
    Regular = "Normal",
    /** font weight bold */
    BOLD = "bold",
}

type Props = {
    text: string;
    onClick: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
    color?: string;
    noVisitedState?: boolean;
    openInNewTab?: boolean;
    noUnderline?: boolean;
    weight?: WeighingUnit | undefined;
};

const setClassName = (className: WeighingUnit | undefined) => {
    let fontWeightClass = "govuk-!-";
    if (className === WeighingUnit.BOLD) {
        fontWeightClass = fontWeightClass.concat("font-weight-bold");
    } else {
        fontWeightClass = fontWeightClass.concat("font-weight-normal");
    }
    return fontWeightClass;
};

const LinkComponent = (props: Props) => {
    const fontWeightClass = setClassName(props.weight);
    return (
        <span className="link-component-container">
            <span className="govuk-body">
                <a
                    href="#"
                    className={`govuk-link ${props.color} ${fontWeightClass} ${
                        props.noVisitedState
                            ? "govuk-link--no-visited-state"
                            : ""
                    }
                    ${props.noUnderline ? "govuk-link--no-underline" : ""}`}
                    onClick={(e) => {
                        e.preventDefault();
                        props.onClick(e);
                    }}
                    rel={`${
                        props.openInNewTab ? "noreferrer noopener" : "Nofollow"
                    }`}
                    target={`${props.openInNewTab ? "_blank" : ""}`}
                >
                    {props.text}
                </a>
            </span>
        </span>
    );
};

export default LinkComponent;
