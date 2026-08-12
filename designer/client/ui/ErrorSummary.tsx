import React from "react";

export type ErrorSummaryListItem = {
    text: string;
    href?: string;
    componentId: string;
    openInNewTab?: OpenInNewTabType;
};

export type OpenInNewTabType = {
    text: string;
    link: string;
};

type Props = {
    items: ErrorSummaryListItem[];
};

const ErrorSummary = (props: Props) => {
    const onLinkClick = (
        e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
        compId: string
    ) => {
        e.preventDefault();
        const component = document.querySelector(`#${compId}`);
        if (!component) return;
        component.scrollIntoView();
    };
    const hasNewTab = props.items.some((item) => item.openInNewTab);

    return (
        <div className="govuk-error-summary" data-module="govuk-error-summary">
            <div role="alert">
                <h2 className="govuk-error-summary__title">
                    Sorry, there is a problem with the service
                </h2>
                <div className="govuk-error-summary__body">
                    <ul className="govuk-list govuk-error-summary__list">
                        {props.items.map((item) => (
                            <li key={item.componentId}>
                                {hasNewTab ? (
                                    <div className="govuk-error-message">
                                        {item.text}
                                        <a
                                            href={item.openInNewTab?.link}
                                            target="_blank"
                                            rel="noreferrer noopener"
                                        >
                                            {item.openInNewTab?.text}
                                        </a>
                                    </div>
                                ) : (
                                    <a
                                        href={item.href ?? "#"}
                                        onClick={(e) => {
                                            onLinkClick(e, item.componentId);
                                        }}
                                    >
                                        {item.text}
                                    </a>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ErrorSummary;
