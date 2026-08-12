import React, { useContext, useState } from "react";
import { DataContext } from "../../context";
// import ModalDeleteCalculation from "./modal-delete-calculation";
import { updateDataObjectForDeleteCalculation } from "./utility/helperFunctions";
import { GenericModal } from "../../ui";
import { i18n } from "../../i18n";
import { Module as ReportModule } from "../../utils/linkedProperties";
import {
    handleLinkedPropertyEffect,
    Module,
    PropertyAction,
} from "../../utils";
import { ComponentContext } from "../../reducers/component/componentReducer";

const DeleteCalculation = ({
    onHide,
    selectedCalculation,
    setSelectedCalculation,
    showModal,
}) => {
    // const [deleteConfirmed, setDeleteConfirmed] = useState(false);
    // const toggleDeleteConfirmed = () => {
    //     setDeleteConfirmed((currentState) => !currentState);
    // };
    const { data, save } = useContext(DataContext);
    const { state } = useContext(ComponentContext);
    const { selectedComponent } = state;

    const deleteModal = {
        warning: i18n("calculations.deleteCalculations.warning"),
        hint: i18n("calculations.deleteCalculations.hint"),
        note: i18n("calculations.deleteCalculations.text"),
        confirm: i18n("calculations.deleteCalculations.confirm"),
    };

    const onDeleteCalculation = async (e) => {
        e.preventDefault();
        if (!selectedCalculation) return onHide();

        // Update data object in context and DB to remove calculation from relevant page's components array and the calculations array
        let updatedData = updateDataObjectForDeleteCalculation({
            data,
            calculationNameToDelete: selectedCalculation.name,
            calculationToDeletePage: selectedCalculation.pageLocation,
        });
        updatedData = handleLinkedPropertyEffect(
            Module.Component,
            selectedComponent,
            PropertyAction.Deleted,
            updatedData
        );

        // if (deleteConfirmed) {
        await save(updatedData);
        setSelectedCalculation();
        // }
        onHide();
    };

    return (
        <div className="delete-calculation">
            <GenericModal
                onClose={onHide}
                onDelete={onDeleteCalculation}
                listName={selectedCalculation?.displayName}
                show={showModal}
                warning={deleteModal.warning}
                hint={deleteModal.hint}
                note={deleteModal.note}
                confirm={deleteModal.confirm}
                buttonText="Delete Calculation"
                type={ReportModule.Component}
                selectedComponent={selectedCalculation}
            />
            {/* <ModalDeleteCalculation
                handleClose={onHide}
                handleCheck={toggleDeleteConfirmed}
                handleDeleteCalculation={onDeleteCalculation}
                showModal={showModal}
                calculationName={selectedCalculation?.displayName}
                isChecked={deleteConfirmed}
            /> */}
        </div>
    );
};

export default DeleteCalculation;
