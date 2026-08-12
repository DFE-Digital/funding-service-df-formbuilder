import React from "react";
import { i18n } from "../../../i18n";
const d = (key: string) => i18n("importData." + key);

export default function NameInput({
    dataSetName,
    setDataSetName,
    duplicateTitleError,
}) {
    return (
        <div className="govuk-form-group">
            {duplicateTitleError && (
                <div
                    className="govuk-error-summary"
                    aria-labelledby="document-error-summary-title"
                    role="alert"
                    data-module="govuk-error-summary"
                >
                    <h2
                        className="govuk-error-summary__title"
                        id="document-error-summary-title"
                    >
                        {d("titleDuplicatedError.errorSummaryTitle")}
                    </h2>
                    <div className="govuk-error-summary__body">
                        <ul className="govuk-list govuk-error-summary__list">
                            <li>
                                <a>
                                    {d("titleDuplicatedError.errorSummaryBody")}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
            <h4 className="govuk-label-wrapper">
                <label
                    className="govuk-label govuk-label--s"
                    htmlFor="design-data-set-name"
                >
                    {i18n("designData.designScreen.nameInput.label")}
                </label>
            </h4>
            <div id="design-data-set-name-hint" className="govuk-hint">
                {i18n("designData.designScreen.nameInput.hint")}
            </div>
            <div
                className={`govuk-form-group ${
                    duplicateTitleError && "govuk-form-group--error"
                } govuk-!-margin-bottom-8`}
            >
                {duplicateTitleError && (
                    <p id="event-name-error" className="govuk-error-message">
                        <span className="govuk-visually-hidden">
                            {d("titleDuplicatedError.errorTitle")}:
                        </span>{" "}
                        {d("titleDuplicatedError.errorMessage")}
                    </p>
                )}
                <input
                    value={dataSetName}
                    onChange={setDataSetName}
                    className="govuk-input"
                    id="design-data-set-name"
                    data-testid="design-data-set-name-input"
                    name="design-data-set-name"
                    type="text"
                    aria-describedby="design-data-set-name-hint"
                />
            </div>
        </div>
    );
}
