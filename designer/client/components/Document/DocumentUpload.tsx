import { Documents, DOC_UPLOAD_PATH_PREFIX } from "@xgovformbuilder/model";
import React, { useContext, useEffect, useState } from "react";
import { DesignerApi } from "../../api/designerApi";
import { DataContext } from "../../context";
import { i18n } from "../../i18n";
import randomId from "../../randomId";
import { BackLink } from "../BackLink";
import FileUpload from "../FileUpload/FileUpload";
import "./DocumentUpload.scss";
import { validateFileTypeAndExtension, validateFileName } from "./utils";

const t = (key: string) => i18n("documents.documentUpload." + key);

type Props = {
    isEdit: boolean;
    selectedId: string;
    setShowDocumentUpload: React.Dispatch<React.SetStateAction<boolean>>;
    from: string;
};

const acceptedExtensions = [
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".doc",
    ".docx",
    ".csv",
    ".ods",
    ".xls",
    ".xlsx",
    ".xlsm",
];

const acceptedTypes = [
    "text/csv",
    "application/msword",
    "image/jpeg",
    "application/vnd.oasis.opendocument.spreadsheet",
    "application/pdf",
    "image/png",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const csvAcceptedType = ["text/csv"];

const csvAcceptedExtension = [".csv"];

// Contains the accepted file types (based on extensions and MIME Type)
const acceptedFileTypes = acceptedExtensions.concat(acceptedTypes);

const DocumentUpload = (props: Props) => {
    const designerApi = new DesignerApi();
    const { data, save } = useContext(DataContext);
    const [documentTitle, setDocumentTitle] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileTypeError, setFileTypeError] = useState(false);
    const [fileNameError, setFileNameError] = useState(false);
    const [serverError, setServerError] = useState(false);

    /**
     * Sets the uploaded file in the state
     * @param e Event triggered on File Upload
     * @returns
     */
    const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = e.target.files;
        if (!uploadedFiles) return;
        const uploadedFile = uploadedFiles.item(0);
        if (!uploadedFile) return;
        setSelectedFile(uploadedFile);
    };

    const onSave = async () => {
        if (!fileTypeError && selectedFile) {
            const id = props.isEdit ? props.selectedId : randomId();
            const type =
                selectedFile.name.split(".").pop() ?? selectedFile.type;
            const documentData: Documents = {
                id,
                title: documentTitle,
                uploadedDate: new Date(),
                type: type,
                fileName: selectedFile.name,
                path: `${DOC_UPLOAD_PATH_PREFIX}/${id}/${selectedFile.name}`,
            };
            /** Since on edit, size is empty/zero. Server call will be skipped for dummy file created.*/
            if (selectedFile.size) {
                // File Upload API Call
                const response = await designerApi.fileUpload(id, selectedFile);

                if (!response.status) {
                    setServerError(true);
                    return;
                }
                if (response.status) setServerError(false);
            }
            // update the form data with document data
            const updatedData = data?.documents
                ? {
                      ...data,
                      documents: props.isEdit
                          ? [
                                ...data.documents.filter(
                                    (doc) => doc.id !== documentData.id
                                ),
                                documentData,
                            ]
                          : [...data.documents, documentData],
                  }
                : {
                      ...data,
                      documents: [documentData],
                  };
            save(updatedData);
            props.setShowDocumentUpload(false);
        }
    };

    const isSaveDisabled = () => {
        const selectedDocs =
            props.isEdit && props.selectedId
                ? data.documents?.filter((doc) => doc.id === props.selectedId)
                : [];
        const selected = selectedDocs ? selectedDocs[0] : null;
        const isTitleSame = selected ? selected.title === documentTitle : false;
        const sameDoc = isTitleSame && props.isEdit && !selectedFile?.size;
        if (sameDoc) return true;
        const isNotDisabled =
            !!documentTitle &&
            !!selectedFile &&
            !fileTypeError &&
            !fileNameError;
        return !isNotDisabled;
    };

    const isFileSelectedAndNoError = () => {
        const result =
            !!selectedFile &&
            !fileTypeError &&
            !fileNameError &&
            !(props.isEdit && !selectedFile.size) &&
            !serverError;
        return result;
    };

    const isEditModeAndNoPath = () => {
        return (
            props.isEdit &&
            !selectedFile?.size &&
            !serverError &&
            !fileTypeError
        );
    };

    /** Validates selected file based on file type or extension */
    useEffect(() => {
        if (selectedFile) {
            if (
                selectedFile.type !== "text/csv" &&
                props.from === "dataImport"
            ) {
                const fileTypeValidatedResponse = validateFileTypeAndExtension(
                    selectedFile,
                    csvAcceptedType,
                    csvAcceptedExtension
                );
                setFileTypeError(fileTypeValidatedResponse);
            } else {
                const fileTypeValidatedResponse = validateFileTypeAndExtension(
                    selectedFile,
                    acceptedTypes,
                    acceptedExtensions
                );
                const fileNameValidatedResponse = validateFileName(
                    selectedFile
                );
                setFileTypeError(fileTypeValidatedResponse);
                setFileNameError(fileNameValidatedResponse);
            }
        }
    }, [selectedFile]);

    /** Populates on edit */
    useEffect(() => {
        if (props.isEdit && props.selectedId) {
            const selectedDoc = data?.documents?.filter(
                (doc) => doc.id === props.selectedId
            )![0];
            if (!selectedDoc) return;
            // Set Title
            setDocumentTitle(selectedDoc.title);
            const newFile = new File([], selectedDoc.fileName);
            // Set File
            setSelectedFile(newFile);
        }
    }, []);

    return (
        <>
            <BackLink
                onClick={(e) => {
                    e.preventDefault();
                    props.setShowDocumentUpload(false);
                }}
            >
                {i18n("back")}
            </BackLink>
            <h4 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-8">
                {props.isEdit
                    ? i18n("documents.editDocument")
                    : i18n("documents.importDocument")}
            </h4>
            <div className="document-container govuk-!-margin-right-8 govuk-!-margin-top-8">
                {fileTypeError && (
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
                            {t("fileTypeError.errorSummaryTitle")}
                        </h2>
                        <div className="govuk-error-summary__body">
                            <ul className="govuk-list govuk-error-summary__list">
                                <li>
                                    <a>{t("fileTypeError.errorSummaryBody")}</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
                <div className="govuk-form-group govuk-!-margin-bottom-8">
                    <h1 className="govuk-label-wrapper">
                        <label
                            className="govuk-label govuk-label--l govuk-!-font-size-19 govuk-!-margin-bottom-1"
                            htmlFor="document-title"
                        >
                            {t("documentTitle")}
                        </label>
                    </h1>
                    <div
                        id="document-title-hint"
                        className="govuk-hint govuk-!-margin-bottom-2"
                    >
                        {t("documentTitleHint")}
                    </div>
                    <input
                        className="govuk-input"
                        id="document-title"
                        name="document-title"
                        type="text"
                        aria-describedby="document-title-hint"
                        value={documentTitle}
                        onChange={(e) => {
                            const value = e.target?.value ?? "";
                            setDocumentTitle(value);
                        }}
                    />
                </div>
                <div
                    className={`govuk-form-group ${
                        fileTypeError && "govuk-form-group--error"
                    } govuk-!-margin-bottom-8`}
                >
                    <h1 className="govuk-label-wrapper">
                        <label
                            className="govuk-label govuk-label--l govuk-!-font-size-19 govuk-!-margin-bottom-1"
                            htmlFor="document-upload"
                        >
                            {t("documentUploadTitle")}
                        </label>
                    </h1>
                    <div
                        id="document-upload-hint"
                        className="govuk-hint govuk-!-margin-bottom-3"
                    >
                        {props.from === "dataImport"
                            ? t("dataImportDocumentUploadHint")
                            : t("documentUploadHint")}
                    </div>
                    {fileTypeError && (
                        <p
                            id="event-name-error"
                            className="govuk-error-message"
                        >
                            <span className="govuk-visually-hidden">
                                {t("fileTypeError.errorTitle")}:
                            </span>{" "}
                            {t("fileTypeError.errorMessage")}
                        </p>
                    )}
                    <FileUpload
                        id="document-upload"
                        name="document-upload"
                        hintId="document-upload-hint"
                        buttonText={t("documentUploadButtonText")}
                        emptyMessage={t("documentUploadButtonEmptyMessage")}
                        acceptableFileExtension={
                            props.from === "dataImport"
                                ? csvAcceptedType.join(",")
                                : acceptedFileTypes.join(",")
                        }
                        onChange={onFileUpload}
                        selectedFile={selectedFile}
                    />
                </div>
                {isFileSelectedAndNoError() && (
                    <div
                        className="govuk-notification-banner"
                        role="region"
                        aria-labelledby="document-notification-banner-title"
                        data-module="govuk-notification-banner"
                    >
                        <div className="govuk-notification-banner__header">
                            <h2
                                className="govuk-notification-banner__title"
                                id="document-notification-banner-title"
                            >
                                {t("retainCopyBanner.title")}
                            </h2>
                        </div>
                        <div className="govuk-notification-banner__content">
                            <p className="govuk-notification-banner__heading">
                                {t("retainCopyBanner.body")}
                            </p>
                        </div>
                    </div>
                )}
                {isEditModeAndNoPath() && (
                    <div
                        className="govuk-notification-banner"
                        role="region"
                        aria-labelledby="document-notification-banner-title"
                        data-module="govuk-notification-banner"
                    >
                        <div className="govuk-notification-banner__header">
                            <h2
                                className="govuk-notification-banner__title"
                                id="document-notification-banner-title"
                            >
                                {t("existingFileBanner.title")}
                            </h2>
                        </div>
                        <div className="govuk-notification-banner__content">
                            <p className="govuk-notification-banner__heading">
                                {t("existingFileBanner.heading")}
                            </p>
                            <p className="govuk-body">
                                {t("existingFileBanner.body")}
                            </p>
                        </div>
                    </div>
                )}
                {serverError && (
                    <div
                        className="govuk-notification-banner service-down"
                        role="region"
                        id="{{params.id}}"
                        aria-labelledby="govuk-notification-banner-title"
                        data-module="govuk-notification-banner"
                    >
                        <div className="govuk-notification-banner__header">
                            <h2
                                className="govuk-notification-banner__title"
                                id="govuk-notification-banner-title"
                            >
                                Important
                            </h2>
                        </div>
                        <div className="govuk-notification-banner__content">
                            <p className="govuk-notification-banner__heading">
                                Network timed out.
                            </p>
                            <p>
                                The network timed out before your upload could
                                be completed. Please try again.
                            </p>
                        </div>
                    </div>
                )}
                {fileNameError && (
                    <div
                        className="govuk-notification-banner error-banner"
                        role="alert"
                        aria-labelledby="document-notification-banner-title"
                        data-module="govuk-notification-banner"
                    >
                        <div className="govuk-notification-banner__header">
                            <h2
                                className="govuk-notification-banner__title"
                                id="document-notification-banner-title"
                            >
                                {t("fileNameErrorBanner.title")}
                            </h2>
                        </div>
                        <div className="govuk-notification-banner__content">
                            <p className="govuk-notification-banner__heading">
                                {t("fileNameErrorBanner.heading")}
                            </p>
                            <p className="govuk-body">
                                {t("fileNameErrorBanner.body")}
                            </p>
                        </div>
                    </div>
                )}
                <div>
                    <button
                        type="submit"
                        className="govuk-button"
                        disabled={isSaveDisabled()}
                        data-testid="document-save-button"
                        onClick={onSave}
                    >
                        {i18n("Save")}
                    </button>
                </div>
            </div>
        </>
    );
};

export default DocumentUpload;
