import { FormDefinition } from "@xgovformbuilder/model";
import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import _ from "lodash";

import { importSavedForm } from "../../../api/formConfigurationsApi";
import FileUpload from "../../../components/FileUpload";
import Modal from "../../../modal";
import { useAppSelector } from "../../../store/hooks";
import { currentUserSelector } from "../../../store/reducers/usersReducer";
import { onformImport, removeAzureMetaProperties } from "../utils";
import {
    convertDateTimeString,
    convertLastDownloaded,
} from "../../../utils/date-time-fns";

type Props = {
    show: boolean;
    onClose: () => void;
};

const ImportFormModal = (props: Props) => {
    const [duplicateNameError, setduplicateNameError] = useState(false);
    const [serverError, setServerError] = useState(false);
    const [specialCharError, setSpecialCharError] = useState(false);
    const [selectedJson, setSelectedJson] = useState<File | null>(null);
    const [formName, setFormName] = useState("");
    const currentUser = useAppSelector(currentUserSelector);
    const saveForm = async (form: FormDefinition) => {
        try {
            removeAzureMetaProperties(form);
            // Allows updating json from cosmosDB envs
            if (_.isEmpty(form.file)) form.file = "";
            if (form.lastModified) {
                form.lastModified = convertDateTimeString(form.lastModified);
            }
            if (form.lastDownloaded) {
                form.lastDownloaded = convertLastDownloaded(
                    form.lastDownloaded
                );
            }
            //Add current user credentials
            form.lastUpdatedByName = currentUser.data.name;
            form.lastUpdatedById = currentUser.data.id;
            // Add parsed new name
            form.name = formName;
            form.displayName = formName;
            const response = await importSavedForm(form);
            if (response.status && response.id) return response.id;
            if (response.error === "duplicate-name-error") {
                setduplicateNameError(true);
                setSpecialCharError(false);
                setServerError(false);
                return "";
            }
            if (response.error === "special-character-error") {
                setSpecialCharError(true);
                setduplicateNameError(false);
                setServerError(false);
                return "";
            }
            setServerError(true);
            setSpecialCharError(false);
            setduplicateNameError(false);
            return "";
        } catch (e) {
            setServerError(true);
            setSpecialCharError(false);
            setduplicateNameError(false);
            return "";
        }
    };
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
        setSelectedJson(uploadedFile);
    };
    const onFormNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormName(e.target.value);
        setduplicateNameError(false);
        setSpecialCharError(false);
    };
    const onModalClose = () => {
        props.onClose();
        setFormName("");
        setduplicateNameError(false);
        setSpecialCharError(false);
        setServerError(false);
        setSelectedJson(null);
    };
    return (
        <>
            <Modal show={props.show} closeStyleOverride onHide={onModalClose}>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-8">
                    Import saved forms
                </h2>
                {(duplicateNameError || specialCharError) && (
                    <div
                        className="govuk-error-summary"
                        data-module="govuk-error-summary"
                    >
                        <div role="alert">
                            <h2 className="govuk-error-summary__title">
                                {`Please fix the following error(s)`}
                            </h2>
                            <div className="govuk-error-summary__body">
                                <ul className="govuk-list govuk-error-summary__list">
                                    <li>
                                        <a
                                            href="#"
                                            onClick={(e) => e.preventDefault()}
                                        >
                                            {duplicateNameError
                                                ? "Enter a different form title - This title is already in use for a different form"
                                                : "Form name should not contain special characters"}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
                <div
                    className={`govuk-form-group ${
                        (duplicateNameError || specialCharError) &&
                        "govuk-form-group--error"
                    }`}
                >
                    <h1 className="govuk-label-wrapper">
                        <label
                            className="govuk-label govuk-label--s"
                            htmlFor="import-form-title"
                        >
                            Form title
                        </label>
                    </h1>
                    <div id="import-form-title-hint" className="govuk-hint">
                        Please enter a new form name and not an existing one
                    </div>
                    {(duplicateNameError || specialCharError) && (
                        <p
                            id="event-name-error"
                            className="govuk-error-message"
                        >
                            <span className="govuk-visually-hidden">
                                Error:
                            </span>{" "}
                            {duplicateNameError
                                ? "Enter a different form title - This title is already in use for a different form"
                                : "Form name should not contain special characters"}
                        </p>
                    )}
                    <input
                        className="govuk-input import-form-title"
                        id="import-form-title"
                        name="import-form-title"
                        type="text"
                        aria-describedby="import-form-title-hint"
                        value={formName}
                        onChange={onFormNameChange}
                    />
                </div>
                <div
                    className={`govuk-form-group ${
                        serverError
                            ? "govuk-!-margin-bottom-4"
                            : "govuk-!-margin-bottom-8"
                    }`}
                >
                    <h1 className="govuk-label-wrapper">
                        <label
                            className="govuk-label govuk-label--s"
                            htmlFor="event-name"
                        >
                            Upload form .json
                        </label>
                    </h1>
                    <div id="event-name-hint" className="govuk-hint">
                        Select a .json file format from your local drive to
                        design a form
                    </div>
                    <FileUpload
                        id="import-saved-form"
                        name="import-saved-form"
                        hintId="import-saved-form-hint"
                        buttonText="Choose file"
                        emptyMessage="No file chosen"
                        acceptableFileExtension={"json"}
                        onChange={onFileUpload}
                        selectedFile={selectedJson}
                    />
                </div>
                {serverError && (
                    <div
                        className="govuk-notification-banner service-down govuk-!-margin-bottom-4"
                        role="region"
                        id="import-network-error"
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
                <button
                    className={`govuk-button ${"govuk-!-margin-bottom-2"}`}
                    data-module="govuk-button"
                    disabled={!(selectedJson && formName)}
                    onClick={() => {
                        if (!selectedJson) return;
                        //@ts-ignore
                        onformImport(selectedJson, saveForm, props.history);
                    }}
                >
                    Import .json
                </button>
            </Modal>
        </>
    );
};

export default withRouter(ImportFormModal);
