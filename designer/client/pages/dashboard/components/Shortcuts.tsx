import React from "react";

type Props = {};

const Shortcuts = (props: Props) => {
    return (
        <div className="shortcut-info-container">
            <div className="info-container">
                <h3 className="govuk-heading-s">Information guide</h3>
                <div>
                    <a
                        className="govuk-body govuk-link govuk-!-margin-bottom-0"
                        target="_blank"
                        rel="noreferrer noopener"
                        href="https://www.youtube.com/channel/UCROOCs9OvIwqFOy5_E0Jtfg"
                    >
                        Introductory videos
                    </a>
                </div>
            </div>
            <div className="shortcuts-container">
                <h3 className="govuk-heading-s">Support shortcuts</h3>
                <div className="shortcuts">
                    <a
                        className="govuk-body govuk-link govuk-!-margin-bottom-0"
                        href="https://www.gov.uk/contact-dfe"
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        Contacts
                    </a>
                    <a
                        className="govuk-body govuk-link govuk-!-margin-bottom-0"
                        href="https://www.gov.uk/help/report-vulnerability"
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        Submit a bug
                    </a>
                    <a
                        className="govuk-body govuk-link govuk-!-margin-bottom-0"
                        href="https://www.gov.uk/contact-dfe"
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        Wishlist
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Shortcuts;
