import React from "react";
import { i18n } from "../../i18n";

export default function FileUpload({
    uploadedFile,
    setUploadedFile,
    previouslyUploadedFile,
}) {
    return (
        <div className="govuk-form-group govuk-!-margin-top-8 govuk-!-margin-bottom-9">
            <h4 className="govuk-label-wrapper">
                <label
                    className="govuk-label govuk-label--s"
                    htmlFor="file-upload-1"
                >
                    {i18n("importData.fileUpload.fileInput.label")}
                </label>
            </h4>
            <div className="custom-file-input">
                <input
                    id="file-upload-1"
                    data-testid="file-upload-1"
                    name="file-upload-1"
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                        if (e.target.files) {
                            setUploadedFile(e.target.files[0]);
                        }
                    }}
                />
                <div
                    id="file-title-hint govuk-!-margin-top-4"
                    className="govuk-hint"
                >
                    {i18n("importData.fileUpload.fileInput.hint")}
                </div>
                <div className="label-container">
                    <label
                        className="dummy-file-upload"
                        htmlFor="file-upload-1"
                    >
                        {i18n("chooseFile")}
                    </label>
                    <label className="dummy-file-name" htmlFor="file-upload-1">
                        {uploadedFile?.name
                            ? uploadedFile?.name
                            : previouslyUploadedFile?.fileName
                            ? previouslyUploadedFile?.fileName
                            : "No file chosen"}
                    </label>
                </div>
            </div>
        </div>
    );
}
