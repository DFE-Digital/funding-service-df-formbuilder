import React, { useContext, useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { listSelector, deleteList } from "../../../store/reducers/listReducer";
import { GenericModal } from "../../../ui";
import { i18n } from "../../../i18n";
import { Module } from "../../../utils/linkedProperties";

const ListActionButtons = () => {
    const dispatch = useAppDispatch();
    const { selectedList, form } = useAppSelector(listSelector);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { path } = useRouteMatch();
    const history = useHistory();

    const deleteModal = {
        warning: i18n("list.deleteList.warning"),
        hint: i18n("list.deleteList.hint"),
        note: i18n("list.deleteList.text"),
        confirm: i18n("list.deleteList.confirm"),
    };

    const onEditClick = () => {
        history.push(`${path}/edit/${selectedList.name}`);
    };

    const onDeleteModalClose = () => {
        setShowDeleteModal(false);
    };

    const onDeleteList = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();
        setShowDeleteModal(true);
    };

    const onFinalDelete = (e) => {
        setShowDeleteModal(false);
        dispatch(deleteList({ listId: selectedList.name, data: form }));
    };

    return (
        <div className="list-action-button-container">
            <GenericModal
                onClose={onDeleteModalClose}
                onDelete={onFinalDelete}
                listName={selectedList.title ?? ""}
                show={showDeleteModal}
                warning={deleteModal.warning}
                hint={deleteModal.hint}
                note={deleteModal.note}
                confirm={deleteModal.confirm}
                buttonText="Delete list"
                type={Module.List}
                selectedComponent={selectedList as any}
            />

            <button
                className="govuk-button govuk-button--secondary govuk-!-margin-right-6"
                onClick={() => onEditClick()}
                disabled={!selectedList.name}
            >
                Edit list
            </button>
            <button
                className="govuk-button govuk-button--warning"
                disabled={!selectedList.name}
                onClick={onDeleteList}
            >
                Delete list
            </button>
        </div>
    );
};

export default ListActionButtons;
