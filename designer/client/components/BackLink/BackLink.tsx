import React, { ReactNode, MouseEvent } from "react";

type Props = {
    children: ReactNode;
    href?: string;
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export const BackLink = ({ children, ...otherProps }: Props) => (
    <a className="govuk-back-link" href="#0" {...otherProps}>
        {children}
    </a>
);
