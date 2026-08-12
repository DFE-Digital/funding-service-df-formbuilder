import React from "react";
import { i18n } from "../../i18n";

export default function ChangeAccessTypeModal({
    onCheck,
    onClose,
    onChangeStatus,
    checked,
    show,
    formName,
    formAccessType,
    selectedAccessType,
}) {
    const message = (
        <>
            {i18n("changeFormAccessType.modal.primaryMessage")}
            <b>{formName}</b> {" from "}
            <b>{` ${formAccessType} to ${selectedAccessType}?`}</b>
        </>
    );

    if (!show) {
        return null;
    }

    return (
        <div className="modal" id="modal">
            <div className="change-access-type-modal">
                <header className="modal-header">
                    <h3 className="govuk-fieldset__legend govuk-fieldset__legend--m govuk-!-margin-bottom-5">
                        {i18n("changeFormAccessType.modal.title")}
                    </h3>
                    <a
                        className="govuk-link close-link govuk-!-font-weight-regular govuk-!-font-size-16 govuk-!-margin-0"
                        onClick={onClose}
                    >
                        {i18n("close")}
                    </a>
                </header>
                <fieldset
                    className="govuk-fieldset"
                    aria-describedby="contact-hint"
                >
                    <legend className="govuk-fieldset__legend govuk-fieldset govuk-!-margin-bottom-4">
                        <p className="govuk-fieldset">{message}</p>
                    </legend>
                    <div
                        className="govuk-checkboxes"
                        data-module="govuk-checkboxes"
                    >
                        <div className="govuk-checkboxes__item">
                            <input
                                checked={checked}
                                onChange={onCheck}
                                className="govuk-checkboxes__input"
                                id="confirm1"
                                name="check01"
                                type="checkbox"
                                data-aria-controls="conditional-confirm"
                            />
                            <label
                                className="govuk-label govuk-checkboxes__label"
                                htmlFor="confirm1"
                            >
                                {i18n(
                                    "changeFormAccessType.modal.confirmMessage"
                                )}
                            </label>
                        </div>
                    </div>
                </fieldset>
                <button
                    className="govuk-button govuk-!-margin-top-7"
                    onClick={onChangeStatus}
                    disabled={!checked}
                >
                    {i18n("changeFormAccessType.modal.button")}
                </button>
            </div>
        </div>
    );
}
