import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import ImportFormModal from "./ImportFormModal";

type Props = {};

const CreateImportForm = (props: Props) => {
    const [showImportFormModal, setShowImportFormModal] = useState(false);
    const onImportFormModalClose = () => {
        setShowImportFormModal(false);
    };

    return (
        <div className="create-import-form-container govuk-!-margin-bottom-8">
            <p className="govuk-body govuk-!-margin-bottom-6">
                <span className="govuk-!-font-weight-bold">
                    Build a form by using the default template or duplicate an
                    existing form and modify it.
                </span>{" "}
                You may also import any saved form from your local machine.
            </p>
            <div className="create-import-button-container">
                <button
                    type="button"
                    className="govuk-button govuk-!-margin-right-4 govuk-!-margin-bottom-0"
                    data-module="govuk-button"
                    title="Create form"
                    onClick={() => {
                        //@ts-ignore
                        props.history.push(`/new`);
                    }}
                >
                    Create new form
                </button>
                <a
                    className="govuk-body govuk-link govuk-!-margin-bottom-0"
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        setShowImportFormModal(true);
                    }}
                >
                    Import saved form
                </a>
                <ImportFormModal
                    show={showImportFormModal}
                    onClose={onImportFormModalClose}
                />
            </div>
        </div>
    );
};

export default withRouter(CreateImportForm);
