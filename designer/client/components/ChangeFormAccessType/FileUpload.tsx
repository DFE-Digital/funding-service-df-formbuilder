import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { i18n } from "../../i18n";

export default function FileUpload() {
    const {
        previouslyUploadedFile,
        uploadedFile,
        setUploadedFile,
    } = useContext(AppContext);

    return (
        <div className="govuk-form-group govuk-!-margin-bottom-9 pos-relative">
            <label className="govuk-label" htmlFor="file-upload-1">
                {i18n("changeFormAccessType.DFESignIn.fileUploadLabel")}
            </label>
            <div className="custom-file-input">
                <input
                    id="file-upload-1"
                    data-testid="file-upload-1"
                    name="file-upload-1"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setUploadedFile(e)}
                />
                <label className="dummy-file-upload" htmlFor="file-upload-1">
                    {i18n("chooseFile")}
                </label>
                <label className="dummy-file-name" htmlFor="file-upload-1">
                    {uploadedFile?.name
                        ? uploadedFile?.name
                        : previouslyUploadedFile
                        ? previouslyUploadedFile
                        : "No file chosen"}
                </label>
            </div>
        </div>
    );
}
