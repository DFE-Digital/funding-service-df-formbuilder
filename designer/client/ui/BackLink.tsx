import React, { ReactNode, MouseEvent } from "react";
import { createPortal } from "react-dom";

type Props = {
    children: ReactNode;
    href?: string;
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

const BackLink = ({ children, ...otherProps }: Props) => {
    const backLinkContainer = document.getElementById("backLink")!;
    return createPortal(
        <a className="govuk-back-link" href="#0" {...otherProps}>
            {children}
        </a>,
        backLinkContainer
    );
};

export default BackLink;
