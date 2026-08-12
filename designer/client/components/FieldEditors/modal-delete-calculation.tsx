import React from "react";
import { i18n } from "../../i18n";

const ModalDeleteCalculation = ({
    handleCheck,
    handleClose,
    handleDeleteCalculation,
    calculationName,
    isChecked,
    showModal,
}) => {
    if (!showModal) return null;

    const onCheck = (e) => {
        handleCheck && handleCheck(e);
    };

    const onClose = (e) => {
        handleClose && handleClose(e);
    };

    const onDeleteCalculation = (e) => {
        handleDeleteCalculation && handleDeleteCalculation(e);
    };

    return (
        <div className="modal" id="modal">
            <div className="govuk-form-group custom-width">
                <a
                    className="flyout__button-close  govuk-body govuk-!-font-size-16"
                    onClick={onClose}
                >
                    {i18n("close")}
                </a>
                <p />

                <h3 className="govuk-fieldset__legend govuk-fieldset__legend--m govuk-!-margin-bottom-4">
                    {i18n("calculations.deleteCalculationHeading")}
                </h3>
                <fieldset
                    className="govuk-fieldset govuk-!-margin-bottom-6"
                    aria-describedby="contact-hint"
                >
                    <legend className="govuk-fieldset__legend govuk-fieldset govuk-!-margin-bottom-6">
                        <p className="govuk-fieldset">
                            {`${i18n(
                                "calculations.deleteCalculationMessage"
                            )}-${calculationName}.`}
                        </p>
                    </legend>
                    <div
                        className="govuk-checkboxes"
                        data-module="govuk-checkboxes"
                    >
                        <div className="govuk-checkboxes__item">
                            <input
                                checked={isChecked}
                                onChange={onCheck}
                                className="govuk-checkboxes__input"
                                id="confirm1"
                                name="check01"
                                type="checkbox"
                                data-aria-controls="conditional-confirm"
                            />
                            <label
                                className="govuk-label govuk-checkboxes__label govuk-!-padding-top-0 mb-negative"
                                htmlFor="confirm1"
                            >
                                {i18n(
                                    "calculations.deleteCalculationConfirmation"
                                )}
                            </label>
                        </div>
                    </div>
                </fieldset>
                <p />
                <button
                    className="govuk-button govuk-!-padding-right-8 govuk-!-padding-left-8"
                    onClick={onDeleteCalculation}
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default ModalDeleteCalculation;
