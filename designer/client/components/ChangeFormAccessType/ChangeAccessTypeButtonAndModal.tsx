import { FormAccessType } from "@xgovformbuilder/model";
import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import ChangeAccessTypeModal from "./ChangeAccessTypeModal";
import SuccessConfirmationModal from "./SuccessConfirmationModal";

export default function ChangeAccessTypeButtonAndModal({
    displayName,
    isModalOpen,
    showModal,
    hideModal,
    accessTypeChangeConfirmed,
    modalChangeStatus,
    toggleAccessTypeConfirmation,
    selectedAccessType,
    formAccessType,
    changeSuccessful,
}) {
    const { hasNewFileBeenUploaded, incorrectFileType } = useContext(
        AppContext
    );

    const isButtonDisabled = () => {
        // If changing to DFE depends on whether whether a file has been uploaded
        if (selectedAccessType === FormAccessType.DFESignIn) {
            if (incorrectFileType) return true;
            return !hasNewFileBeenUploaded;
        }

        return selectedAccessType === formAccessType; // otherwise, i.e. changing to Public, depends on just if selected is different from current access type
    };

    const onChangeAccessType = (e) => {
        e.preventDefault();

        // When only uploading a new csv file for dfe sign in - no need to show the confirmation modal
        if (
            formAccessType === FormAccessType.DFESignIn &&
            selectedAccessType === FormAccessType.DFESignIn
        ) {
            modalChangeStatus();
            return;
        }

        showModal();
    };

    return (
        <div>
            <button
                type="submit"
                data-testid="change-access-type-button"
                className="govuk-button govuk-!-margin-top-5"
                disabled={isButtonDisabled()}
                onClick={onChangeAccessType}
            >
                Switch access
            </button>

            <ChangeAccessTypeModal
                onClose={hideModal}
                onCheck={toggleAccessTypeConfirmation}
                checked={accessTypeChangeConfirmed}
                onChangeStatus={modalChangeStatus}
                show={isModalOpen}
                formName={displayName}
                selectedAccessType={selectedAccessType}
                formAccessType={formAccessType}
            />

            {changeSuccessful && (
                <SuccessConfirmationModal
                    changeSuccessful={changeSuccessful}
                    selectedAccessType={selectedAccessType}
                />
            )}
        </div>
    );
}
