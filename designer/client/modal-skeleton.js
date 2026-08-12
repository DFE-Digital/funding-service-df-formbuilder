import React, { Children, useEffect, useState } from "react";
import { i18n } from "./i18n";
import ErrorSummary from "./error-summary";
import { hasValidationErrors, validateDuplicateFormName } from "./validations";

function ModalSkeleton({
    showModal,
    buttonText,
    titleText,
    children,
    error,
    disable,
    onSubmit,
    onClose,
}) {
    if (!showModal) return null;

    return (
        <>
            <div className="modal" id="modal">
                <div className="govuk-form-group">
                    <a
                        className="flyout__button-close govuk-body govuk-!-font-size-16"
                        onClick={onClose}
                    >
                        {i18n("close")}
                    </a>
                    <p />

                    <h3 className="govuk-fieldset__legend govuk-fieldset__legend--m">
                        {titleText}
                    </h3>
                    {hasValidationErrors(error) && (
                        <ErrorSummary errorList={Object.values(error)} />
                    )}
                    <div className="govuk-body">{children}</div>
                    <button
                        className="govuk-button govuk-!-font-size-16"
                        onClick={onSubmit}
                        disabled={disable}
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </>
    );
}

export default ModalSkeleton;
