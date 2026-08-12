import React, { PropsWithChildren } from "react";

type Props = {
    text: string;
    type?: HeadingType;
    caption?: string;
};

export enum HeadingType {
    XL = "xl",
    L = "l",
    M = "m",
    S = "s",
}

const Heading = (props: PropsWithChildren<Props>) => {
    const hasCaption = !!props.caption;
    switch (props.type) {
        case HeadingType.XL: {
            return (
                <h1 className="govuk-heading-xl govuk-!-margin-0">
                    {hasCaption && (
                        <span className="govuk-caption-xl">
                            {props.caption ?? ""}
                        </span>
                    )}
                    {props.text}
                </h1>
            );
        }
        case HeadingType.L: {
            return (
                <h1 className="govuk-heading-l govuk-!-margin-0">
                    {hasCaption && (
                        <span className="govuk-caption-l">
                            {props.caption ?? ""}
                        </span>
                    )}
                    {props.text}
                </h1>
            );
        }
        case HeadingType.M: {
            return (
                <h2 className="govuk-heading-m govuk-!-margin-0">
                    {hasCaption && (
                        <span className="govuk-caption-m">
                            {props.caption ?? ""}
                        </span>
                    )}
                    {props.text}
                </h2>
            );
        }
        case HeadingType.S: {
            return (
                <h3 className="govuk-heading-s govuk-!-margin-0">
                    {props.text}
                </h3>
            );
        }
        default: {
            return (
                <h1 className="govuk-heading-l govuk-!-margin-0">
                    {hasCaption && (
                        <span className="govuk-caption-l">
                            {props.caption ?? ""}
                        </span>
                    )}
                    {props.text}
                </h1>
            );
        }
    }
};

export default Heading;
