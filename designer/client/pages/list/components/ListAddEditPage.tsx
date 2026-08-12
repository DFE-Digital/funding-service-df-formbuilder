import React, { useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { BackLink, ErrorSummary, Loader, BackModal } from "../../../ui";
import ListSelectDataset from "./ListSelectDataset";
import {
    addList,
    listSelector,
    newList as newListObj,
    resetDatasetLoadingState,
    resetNewList,
    resetSelectedList,
    setListTitle,
} from "../../../store/reducers/listReducer";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import SortableListItem from "./SortableListItem";
import { ListEntity, LoadingState } from "../../../store/types";
import { isListEdited } from "../utils";

type Props = {
    isEdit: boolean;
};

const ListAddEditPage = (props: Props) => {
    const { isEdit } = props;
    const dispatch = useAppDispatch();
    const lists = useAppSelector(listSelector);
    const [showBackModal, setShowBackModal] = useState(false);

    const { url } = useRouteMatch();
    const history = useHistory();

    const isError = lists.datasetLoading === LoadingState.Failed;
    const isLoading = lists.datasetLoading === LoadingState.Pending;

    const list = isEdit ? lists.selectedList : lists.newList;
    const originalList = isEdit
        ? lists.form.lists.find((obj) => obj.name === list.name) ?? newListObj
        : newListObj;
    const listSelectComponentId = "list-datasets";
    const ListItemDatasetErrorInfo = [
        {
            text: "CSV columns structure must be as per the sample provided",
            componentId: listSelectComponentId,
        },
    ];
    const loadingText =
        "Processing your request, this should take a few moments";

    const onAddNewListItem = () => {
        history.push(`${url}/add-item`);
    };

    const onBackModalClose = () => {
        setShowBackModal(false);
    };

    const onBack = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        if (!isListEdited(originalList as ListEntity, list)) {
            onPageBack();
            return;
        }
        setShowBackModal(true);
    };

    const onModalBack = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        onPageBack();
    };

    const onPageBack = () => {
        dispatch(resetDatasetLoadingState());
        if (!isEdit) {
            dispatch(resetNewList());
        } else {
            dispatch(resetSelectedList());
        }
        history.goBack();
    };

    const onListTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value ?? "";
        dispatch(setListTitle({ title, isEdit }));
    };

    const canSaveNewList = () => {
        const { title, items } = list;
        if (title && items.length) return true;
        return false;
    };

    const onSaveNewList = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();
        dispatch(addList({ list, data: lists.form }));
        history.push(`/list-module/${lists.form.id}`);
    };

    return (
        <div>
            {isError && <ErrorSummary items={ListItemDatasetErrorInfo} />}
            <Loader show={isLoading} loadingText={loadingText} />
            <BackModal
                onClose={onBackModalClose}
                onBack={onModalBack}
                show={showBackModal}
                buttonText={"Take me back"}
                warningTitle={"Are you sure?"}
            >
                <p className="govuk-body">
                    Do you want to leave your existing screen? This will{" "}
                    <span className="govuk-!-font-weight-bold">
                        result in loss of all the data
                    </span>{" "}
                    you have entered.
                </p>
            </BackModal>
            <div className="list-page-backlink-container">
                <BackLink onClick={onBack}>Back</BackLink>
            </div>
            <div className="list-page-main-container govuk-!-margin-bottom-6">
                <h1 className="govuk-heading-m">
                    {props.isEdit ? "Edit list" : "Add a new List"}
                </h1>
                <div className="list-form">
                    <div className="govuk-form-group">
                        <h1 className="govuk-label-wrapper">
                            <label
                                className="govuk-label govuk-label--s"
                                htmlFor="list-title"
                            >
                                Title
                            </label>
                        </h1>
                        <div id="list-title-hint" className="govuk-hint">
                            Enter the name for your new list
                        </div>
                        <input
                            className="govuk-input"
                            id="list-title"
                            name="list-title"
                            type="text"
                            value={list.title}
                            aria-describedby="list-title-hint"
                            onChange={onListTitleChange}
                        />
                    </div>
                    <ListSelectDataset
                        id={listSelectComponentId}
                        isEdit={isEdit}
                    />
                    <div className="govuk-form-group">
                        <h1 className="govuk-label-wrapper">
                            <label
                                className="govuk-label govuk-label--s"
                                htmlFor="add-list-item"
                            >
                                Your existing lists
                            </label>
                        </h1>
                        <div id="add-list-item-hint" className="govuk-hint">
                            Use the drag handle to reorder the list
                        </div>
                        <button
                            id="add-list-item"
                            className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
                            onClick={() => onAddNewListItem()}
                        >
                            Add list item
                        </button>
                    </div>
                    <SortableListItem isEdit={isEdit} />
                </div>
                <div className="add-list-button-container">
                    <button
                        className="govuk-button"
                        disabled={!canSaveNewList()}
                        type="button"
                        onClick={onSaveNewList}
                    >
                        {isEdit ? "Save list" : "Add list"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ListAddEditPage;
