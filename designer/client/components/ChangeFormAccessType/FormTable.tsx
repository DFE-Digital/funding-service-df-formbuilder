import React from "react";
import { i18n } from "../../i18n";
import { BackLink } from "../BackLink";
import ChangeAccessTypeButtonAndModal from "./ChangeAccessTypeButtonAndModal";
import RadioInputOptions from "./RadioInputOptions";
import TableBody from "./TableBody";
import TableHeader from "./TableHeader";

export default function FormTable({
    getFormAccessType,
    tableData,
    isModalOpen,
    showModal,
    hideModal,
    goBack,
    selectedAccessType,
    handleRadioCheck,
    accessTypeChangeConfirmed,
    modalChangeStatus,
    toggleAccessTypeConfirmation,
    changeSuccessful,
    serverError,
}) {
    return (
        <div className="govuk-grid-row">
            <BackLink onClick={goBack}>{i18n("back")}</BackLink>
            <div className="govuk-grid-column-full">
                <table className="govuk-table">
                    <caption
                        className="govuk-table__caption govuk-table__caption--l govuk-!-margin-bottom-5"
                        data-testid="table-caption"
                    >
                        {i18n("changeFormAccessType.title")}{" "}
                        {tableData.displayName}
                    </caption>
                    <TableHeader />
                    <TableBody
                        tableData={tableData}
                        getFormAccessType={getFormAccessType}
                    />
                </table>
                <p className="govuk-body">
                    {i18n("changeFormAccessType.selectType")}
                </p>
                <RadioInputOptions
                    selectedAccessType={selectedAccessType}
                    handleRadioCheck={handleRadioCheck}
                    formName={tableData.displayName}
                    serverError={serverError}
                />
                <ChangeAccessTypeButtonAndModal
                    hideModal={hideModal}
                    showModal={showModal}
                    toggleAccessTypeConfirmation={toggleAccessTypeConfirmation}
                    accessTypeChangeConfirmed={accessTypeChangeConfirmed}
                    modalChangeStatus={modalChangeStatus}
                    isModalOpen={isModalOpen}
                    displayName={tableData.displayName}
                    selectedAccessType={selectedAccessType}
                    formAccessType={getFormAccessType(tableData.signInRequired)}
                    changeSuccessful={changeSuccessful}
                />
            </div>
        </div>
    );
}
