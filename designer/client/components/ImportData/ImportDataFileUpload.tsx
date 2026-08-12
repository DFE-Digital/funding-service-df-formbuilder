import React, { useState, useContext } from "react";
import { i18n } from "../../i18n";
import { BackLink } from "../BackLink";
import FileUpload from "./FileUpload";
import NotificationBanner from "../ChangeFormAccessType/NotificationBanner";
import { DataContext } from "../../context";
// import { Module } from "../../utils/LinkedPropertiesDetails";
import LinkedPropertiesDetails from "../../utils/LinkedPropertiesDetails";
import { Module } from "../../utils/linkedProperties";
const d = (key: string) => i18n("importData." + key);
const t = (key: string) => i18n("documents.documentUpload." + key);

export default function ImportDataFileUpload({
    setShowFileUpload,
    previouslyUploadedFile,
    saveDataSet,
    uploadedFile,
    setUploadedFile,
    selectedDataSet,
    serverError,
}) {
    const [fileTitle, setFileTite] = useState(
        previouslyUploadedFile?.fileTitle || ""
    );

    const [confirm, setConfirm] = useState(false);

    const { data } = useContext(DataContext);

    const [duplicateTitleError, setDuplicateTitleError] = useState(false);

    const isButtonDisabled = (duplicateTitleError) => {
        if (
            (previouslyUploadedFile || uploadedFile) &&
            fileTitle.trim().length > 0 &&
            !duplicateTitleError
        ) {
            if ((selectedDataSet && confirm) || !selectedDataSet) return false;
        }
        return true;
    };
    const onTitleChange = (e: any) => {
        e.preventDefault();
        setFileTite(e.target.value);
        const isDatasetDuplicated: any = data?.importedDataSets?.some(
            (dataSet) => dataSet.fileTitle === e.target.value
        );
        setDuplicateTitleError(isDatasetDuplicated);
    };

    return (
        <div>
            <BackLink
                onClick={(e) => {
                    e.preventDefault();
                    setShowFileUpload(false);
                }}
            >
                Back
            </BackLink>
            <h4 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-8">
                {selectedDataSet
                    ? i18n("importData.fileUpload.headingEdit")
                    : i18n("importData.fileUpload.headingNew")}
            </h4>
            <div className="import-data-container govuk-!-margin-right-8 govuk-!-margin-top-8">
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
                                        {d(
                                            "titleDuplicatedError.errorSummaryBody"
                                        )}
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
                <div className="govuk-form-group">
                    <h4 className="govuk-label-wrapper">
                        <label
                            className="govuk-label govuk-label--s"
                            htmlFor="file-title"
                        >
                            {i18n("importData.fileUpload.title")}
                        </label>
                    </h4>
                    <div id="file-title-hint" className="govuk-hint">
                        {i18n("importData.fileUpload.hint")}
                    </div>
                    <div
                        className={`govuk-form-group ${
                            duplicateTitleError && "govuk-form-group--error"
                        } govuk-!-margin-bottom-8`}
                    >
                        {duplicateTitleError && (
                            <p
                                id="event-name-error"
                                className="govuk-error-message"
                            >
                                <span className="govuk-visually-hidden">
                                    {d("titleDuplicatedError.errorTitle")}:
                                </span>{" "}
                                {d("titleDuplicatedError.errorMessage")}
                            </p>
                        )}

                        <input
                            value={fileTitle}
                            onChange={onTitleChange}
                            className="govuk-input"
                            id="file-title"
                            data-testid="data-set-title-input"
                            name="file-title"
                            type="text"
                            aria-describedby="file-title-hint"
                        />
                    </div>
                </div>
                <FileUpload
                    uploadedFile={uploadedFile}
                    setUploadedFile={setUploadedFile}
                    previouslyUploadedFile={previouslyUploadedFile}
                />
                {(previouslyUploadedFile || uploadedFile) && (
                    <NotificationBanner
                        isNewUpload={uploadedFile ? true : false}
                    />
                )}
                {serverError && (
                    <div
                        className="govuk-notification-banner"
                        role="alert"
                        aria-labelledby="document-notification-banner-title"
                        data-module="govuk-notification-banner"
                    >
                        <div className="govuk-notification-banner__header">
                            <h2
                                className="govuk-notification-banner__title"
                                id="document-notification-banner-title"
                            >
                                {t("errorBanner.title")}
                            </h2>
                        </div>
                        <div className="govuk-notification-banner__content">
                            <p className="govuk-notification-banner__heading">
                                {t("errorBanner.heading")}
                            </p>
                            <p className="govuk-body">
                                {t("errorBanner.body")}
                            </p>
                        </div>
                    </div>
                )}

                {selectedDataSet && (
                    <LinkedPropertiesDetails
                        module={Module.ImportedDataSet}
                        selectedComponent={selectedDataSet}
                        confirm={confirm}
                        setConfirm={setConfirm}
                        isEdit={true}
                    />
                )}

                <button
                    type="submit"
                    className={`govuk-button govuk-!-margin-top-8 ${
                        selectedDataSet && "govuk-button--warning"
                    }`}
                    disabled={isButtonDisabled(duplicateTitleError)}
                    onClick={(e) =>
                        saveDataSet(e, {
                            fileTitle,
                            fileName: uploadedFile?.name,
                        })
                    }
                >
                    {selectedDataSet
                        ? i18n("importData.summaryPage.buttons.edit")
                        : i18n("Save")}
                </button>
            </div>
        </div>
    );
}
