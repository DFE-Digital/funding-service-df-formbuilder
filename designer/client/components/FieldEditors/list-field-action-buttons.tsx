import React, { useState, useContext } from "react";
import "./list-field.scss";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { DataContext } from "../../context";
import { Page } from "@xgovformbuilder/model";
import DeleteComponent from "../../utils/delete-component";
import { i18n } from "../../i18n";
import LinkedPropertiesDetails from "../../utils/LinkedPropertiesDetails";
import { Module as ReportModule } from "../../utils/linkedProperties";
import {
    handleLinkedPropertyEffect,
    PropertyAction,
    Module,
} from "../../utils";

type Props = {
    isEdit: boolean;
    toggleShowEditor: () => void;
    page: Page;
};
/**
 * Generate the save and delete buttons for the list field component
 */
const ListFieldActionButton = ({ isEdit, toggleShowEditor, page }: Props) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [confirmInitial, setConfirmInitial] = useState(false);

    const { data, save } = useContext(DataContext);
    const { state } = useContext(ComponentContext);
    const { selectedComponent } = state;
    //@ts-ignore
    const { name, title, list } = selectedComponent;
    const options = selectedComponent?.options ?? {};
    //@ts-ignore
    const format = options?.format ?? "";
    const warning = i18n("list.delete.warning");
    const hint = i18n("list.delete.hint");
    const text = i18n("list.delete.text");
    const confirm = i18n("list.delete.confirm");

    const handleDelete = async (e) => {
        e.preventDefault();
        let copy = { ...data };
        copy = handleLinkedPropertyEffect(
            Module.Component,
            selectedComponent,
            PropertyAction.Deleted,
            copy
        );
        const indexOfPage = copy.pages.findIndex((p) => p.path === page.path);
        const indexOfComponent = copy.pages[indexOfPage]?.components?.findIndex(
            (component) => component.name === selectedComponent.name
        );
        if (indexOfComponent === undefined) return;
        copy.pages[indexOfPage].components?.splice(indexOfComponent, 1);
        await save(copy);
        toggleShowEditor();
    };

    const onDeleteModalClose = () => {
        setShowDeleteModal(false);
        setDeleteConfirm(false);
    };

    const onDeleteConfirm = () => {
        setDeleteConfirm((bool) => !bool);
    };

    const onDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        setShowDeleteModal(true);
    };

    const onFormDelete = (e) => {
        setShowDeleteModal(false);
        if (deleteConfirm) {
            handleDelete(e);
        }
        setDeleteConfirm(false);
    };

    const isSaveDisabled = () => {
        const isTitleAvailable = !!title;
        const isNameAvailable = !!name;
        const isFormatAvailable = !!format;
        const isListAvailable = list !== "-1";
        return !(
            isTitleAvailable &&
            isNameAvailable &&
            isFormatAvailable &&
            isListAvailable
        );
    };
    return (
        <div>
            <DeleteComponent
                onClose={onDeleteModalClose}
                onCheck={onDeleteConfirm}
                onDelete={onFormDelete}
                listName={title ?? ""}
                show={showDeleteModal}
                warning={warning}
                hint={hint}
                text={text}
                confirm={confirm}
            />
            <button
                type="submit"
                className="govuk-button"
                disabled={isSaveDisabled()}
            >
                Save
            </button>
            {isEdit && (
                <>
                    <br />
                    <br />
                    <LinkedPropertiesDetails
                        module={ReportModule.Component}
                        selectedComponent={selectedComponent}
                        confirm={confirmInitial}
                        setConfirm={setConfirmInitial}
                    />
                    <button
                        className="govuk-button govuk-button--warning"
                        type="button"
                        onClick={onDelete}
                        disabled={!confirmInitial}
                    >
                        Delete
                    </button>
                </>
            )}
        </div>
    );
};

export default ListFieldActionButton;
