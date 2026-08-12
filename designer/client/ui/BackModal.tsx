import React from "react";
import { i18n } from "../i18n";

type Props = {
    show: boolean;
    warningTitle: string;
    onBack: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    onClose: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
    buttonText: string;
    children: React.ReactNode;
};

const BackModal = (props: Props) => {
    if (!props.show) {
        return null;
    }
    return (
        <div className="modal" id="modal">
            <div className="back-warning-container">
                <div className="back-warning-text">
                    <div className="back-warning-header">
                        <h3 className="govuk-fieldset__legend govuk-fieldset__legend--m govuk-!-margin-top-0">
                            {props.warningTitle}
                        </h3>
                        <a
                            className="modal-close-button govuk-body govuk-!-font-size-16"
                            onClick={props.onClose}
                        >
                            {i18n("close")}
                        </a>
                    </div>
                    <div className="back-warning-text-container govuk-!-margin-bottom-6">
                        {props.children}
                    </div>
                </div>
                <button
                    className="govuk-button govuk-button--secondary govuk-!-font-size-19 govuk-!-margin-bottom-3"
                    onClick={props.onBack}
                >
                    {props.buttonText}
                </button>
            </div>
        </div>
    );
};

export default BackModal;
