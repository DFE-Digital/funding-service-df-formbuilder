import React, { PropsWithChildren } from "react";
import DOMPurify from "dompurify";

type Props = {
    text?: string;
    type?: ParaType;
    size?: ParaFontSizes;
    align?: ParaAlignTypes;
    bold?: boolean;
    asChild?: boolean;
    additionalClasses?: string;
};

export enum ParaType {
    L = "l",
    M = "m",
    S = "s",
}

/**
 * Used for font size override
 * - S14: govuk-!-font-size-14
 * - S16: govuk-!-font-size-16
 * - S19: govuk-!-font-size-19
 * - S24: govuk-!-font-size-24
 * - S27: govuk-!-font-size-27
 * - S36: govuk-!-font-size-36
 * - S48: govuk-!-font-size-48
 * - S80: govuk-!-font-size-80
 */
export enum ParaFontSizes {
    S14 = 14,
    S16 = 16,
    S19 = 19,
    S24 = 24,
    S27 = 27,
    S36 = 36,
    S48 = 48,
    S80 = 80,
}

/**
 * Used to set text align
 * - Left: govuk-!-text-align-left
 * - Centre: govuk-!-text-align-centre
 * - Right: govuk-!-text-align-right
 */
export enum ParaAlignTypes {
    Left = "govuk-!-text-align-left",
    Centre = "govuk-!-text-align-centre",
    Right = "govuk-!-text-align-right",
}

const Para = (props: PropsWithChildren<Props>) => {
    let mainClass = "govuk-body";
    const hasFontOverride = !!props.size;
    const hasAlignType = !!props.align;
    const asChild = props.asChild ?? false;
    const size = props.size ?? ParaFontSizes.S19;
    const alignment = props.align ?? ParaAlignTypes.Left;
    let fontSizeClass = `govuk-!-font-size-${size}`;
    const additionalClasses = props.additionalClasses ?? "";
    if (props.type === ParaType.L) mainClass = mainClass.concat("-l");
    if (props.type === ParaType.S) mainClass = mainClass.concat("-s");
    if (asChild) {
        return (
            <p
                className={`${mainClass} ${
                    hasFontOverride ? fontSizeClass : ""
                } ${!!props.bold ? "govuk-!-font-weight-bold" : ""} ${
                    hasAlignType ? alignment : ""
                } govuk-!-margin-0 ${additionalClasses}`}
            >
                {props.children}
            </p>
        );
    } else {
        return (
            <p
                className={`${mainClass} ${
                    hasFontOverride ? fontSizeClass : ""
                } ${!!props.bold ? "govuk-!-font-weight-bold" : ""} ${
                    hasAlignType ? alignment : ""
                } govuk-!-margin-0 ${additionalClasses}`}
                dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(props.text, {
                        USE_PROFILES: { html: true },
                    }),
                }}
            />
        );
    }
};

export default Para;
