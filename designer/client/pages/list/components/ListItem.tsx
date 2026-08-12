import React, { useState } from "react";
import { useRouteMatch, useHistory } from "react-router-dom";
import {
    listSelector,
    removeListItem,
    setListItem,
} from "../../../store/reducers/listReducer";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { ListItem as ListItemType } from "../../../store/types";
import { GenericModal } from "../../../ui";
import { i18n } from "../../../i18n";

type Props = {
    id: number;
    index: number;
    item: ListItemType & { id: string };
};

type ParamsType = {
    params: { listId?: string };
    url: string;
};

const ListItem = (props: Props) => {
    const { item } = props;
    const { id, ...listItem } = item;
    const dispatch = useAppDispatch();
    const lists = useAppSelector(listSelector);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { url, params }: ParamsType = useRouteMatch();
    const isEdit = !!params.listId;
    const history = useHistory();

    const deleteModal = {
        warning: "Are you sure?",
        hint: "You are about to remove this list item from",
        confirm: "Yes, I want to remove this list item",
        buttonText: "Remove list item",
    };

    const onDeleteModalClose = () => {
        setShowDeleteModal(false);
    };

    const onListIemDelete = (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        e.preventDefault();
        if (isEdit) {
            setShowDeleteModal(true);
        } else {
            dispatch(removeListItem({ isEdit, index: props.index }));
        }
    };

    const onFinalDelete = (e) => {
        setShowDeleteModal(false);
        dispatch(removeListItem({ isEdit, index: props.index }));
    };

    const onListItemEdit = (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        dispatch(setListItem(listItem));
        history.push(`${url}/edit-item/${props.index}`);
    };

    return (
        <div className="list-item govuk-body govuk-!-margin-bottom-0">
            <GenericModal
                onClose={onDeleteModalClose}
                onDelete={onFinalDelete}
                listName={lists.selectedList.title ?? ""}
                show={showDeleteModal}
                warning={deleteModal.warning}
                hint={deleteModal.hint}
                confirm={deleteModal.confirm}
                buttonText={deleteModal.buttonText}
            />
            <div className="list-item-content">
                <div className="govuk-!-font-weight-bold">{`L${
                    props.index + 1
                }`}</div>
                <span className="govuk-label inline-block separator"> | </span>
                <div>{props.item.text}</div>
            </div>
            <div className="list-item-actions govuk-!-margin-left-7">
                <div
                    className="list-item-action-element govuk-link govuk-!-font-weight-bold"
                    onClick={onListItemEdit}
                >
                    Edit
                </div>
                <span className="govuk-label inline-block separator"> | </span>
                <div
                    className="list-item-action-element govuk-link govuk-!-font-weight-bold"
                    onClick={onListIemDelete}
                >
                    Remove
                </div>
            </div>
        </div>
    );
};

export default ListItem;
