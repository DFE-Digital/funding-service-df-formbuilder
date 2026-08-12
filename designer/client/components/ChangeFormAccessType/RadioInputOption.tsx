import { FormAccessType } from "@xgovformbuilder/model";
import React from "react";
import DFESignInAdditionalLabel from "./DFESignInAdditionalLabel";

export default function RadioInputOption({
    formAccessType,
    selectedAccessType,
    handleRadioCheck,
    formName,
    serverError,
}) {
    return (
        <div
            className="govuk-radios"
            data-module="govuk-radios"
            key={formAccessType}
        >
            <div className="govuk-radios__item govuk-!-margin-bottom-2">
                <input
                    className="govuk-radios__input"
                    data-testid="radio-input-option"
                    name="change-status"
                    type="radio"
                    id={`${formAccessType.replace(/\s/g, "")}`} //remove whitespaces to allow access
                    value={`${formAccessType}`}
                    checked={selectedAccessType === formAccessType}
                    onChange={() => handleRadioCheck(formAccessType)}
                />
                <label
                    className="govuk-label govuk-radios__label"
                    htmlFor="change-status"
                >
                    {formAccessType}
                </label>
            </div>
            {selectedAccessType === FormAccessType.DFESignIn &&
                formAccessType === FormAccessType.DFESignIn && (
                    <DFESignInAdditionalLabel
                        formName={formName}
                        serverError={serverError}
                    />
                )}
        </div>
    );
}
