import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import { i18n } from "../../../i18n";
import AddChildFormListDetails from "./AddChildFormListDetails";
import {
    Button,
    ButtonVariant,
    CheckboxInput,
    GenericModal,
    GridColumn,
    GridRow,
    Spacing,
    SpacingUnit,
    Table,
    TableCaptionSize,
    NotificationBanner,
    GridColumnType,
    WarningText,
    BackLink,
    formNameColumn,
    formStatusColumn,
    formAccessTypeColumn,
    formCreatedByColumn,
    TableCell,
    ErrorSummary,
} from "../../../ui";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
    parentChildSelector,
    toggleMarkAsParent,
    addParentChild,
    resetParentChild,
    resetChildDetails,
    removeChildFromParent,
} from "../../../store/reducers/parentChildReducer";
import { ModalType } from "../../../ui/GenericModal";
import { checkIfNewChangesAreMade, parentChildMapper } from "../utils";
import { FormConfigurationWithChild } from "../../../store/types";
import { selectFormConfig } from "../../../store/reducers/dashboardReducer";
import { FormConfigurationTabs } from "../../../utils";

type Props = {};

const GroupForm = (props: Props) => {
    const dispatch = useAppDispatch();
    const parentChild = useAppSelector(parentChildSelector);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRemoveChildListModal, setShowRemoveChildListModal] = useState(
        false
    );
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showErrorSummary, setShowErrorSummary] = useState(false);
    const selectedParentForm = parentChild.selectedParentForm!;
    const selectedFormData = parentChild.selectedFormData!;
    const isParentIdAvailable = !!(parentChild?.parentDetails?.parentId ?? "");
    const parentName = parentChild?.parentDetails?.parentName ?? "";
    const parentId = parentChild?.parentDetails?.parentId ?? "";
    const rows = [selectedParentForm];
    const columnHelper = createColumnHelper<FormConfigurationWithChild>();
    const history = useHistory();
    const deleteModal = {
        warning: i18n("groupForm.removeChildCards.warning"),
        hint: i18n("groupForm.removeChildCards.hint"),
        hintNote: i18n("groupForm.removeChildCards.hintNote"),
        note: i18n("groupForm.removeChildCards.text"),
        confirm: i18n("groupForm.removeChildCards.confirm"),
    };

    const removeChildModal = {
        warning: i18n("groupForm.removeChildList.warning"),
        hint: i18n("groupForm.removeChildList.hint"),
        hintNote: i18n("groupForm.removeChildList.hintNote"),
        confirm: i18n("groupForm.removeChildList.confirm"),
    };

    const groupFormModal = {
        warning: i18n("groupForm.groupFormInfo.warning"),
        hint: i18n("groupForm.groupFormInfo.hint"),
        confirm: i18n("groupForm.groupFormInfo.confirm"),
    };

    const isDisabled = () => {
        if (parentChild.isEdit) {
            return checkIfNewChangesAreMade(parentChild);
        } else if (
            parentChild.childConfigs.length > 0 &&
            parentChild.description !== "" &&
            parentChild.childHeading !== ""
        ) {
            return false;
        } else {
            return true;
        }
    };

    const onDeleteModalClose = () => {
        setShowDeleteModal(false);
    };

    const goBack = (event) => {
        event.preventDefault();
        dispatch(resetParentChild());
        dispatch(selectFormConfig({ form: null, isChild: false }));
        history.push(`/dashboard`);
    };
    const columns = [
        { ...formNameColumn, enableSorting: false },
        { ...formStatusColumn, enableSorting: false },
        columnHelper.accessor("LastModified", {
            id: "lastModified",
            header: "Modified on",
            enableSorting: false,
            cell: (ctx) => <TableCell>{ctx.getValue()}</TableCell>,
        }),
        { ...formAccessTypeColumn, enableSorting: false },
        {
            ...formCreatedByColumn(FormConfigurationTabs.MyForms),
            enableSorting: false,
        },
    ];

    const handleOnChange = () => {
        if (parentChild.markAsParent === "0") {
            dispatch(toggleMarkAsParent());
        } else {
            setShowDeleteModal(true);
        }
    };

    const onFinalDelete = () => {
        setShowDeleteModal(false);
        const updatedForm = {
            ...selectedFormData,
        };
        if (updatedForm.parentChild) {
            delete updatedForm.parentChild;
            dispatch(addParentChild(updatedForm));
        }
        dispatch(resetChildDetails());
    };

    const onGroupHandler = () => {
        setShowGroupModal(true);
    };

    const NewParentTemplate = () => (
        <>
            <GenericModal
                onClose={onDeleteModalClose}
                onDelete={onFinalDelete}
                listName={selectedParentForm?.DisplayName ?? ""}
                show={showDeleteModal}
                warning={deleteModal.warning}
                hint={deleteModal.hint}
                hintNote={deleteModal.hintNote}
                note={deleteModal.note}
                confirm={deleteModal.confirm}
                buttonText="Make standalone"
                modalType={ModalType.DELETE}
            />
            <CheckboxInput
                id={"mark-as-parent-checkbox"}
                name={"mark-as-parent-checkbox"}
                selectedValue={parentChild.markAsParent}
                options={[
                    {
                        key: "markAsParentOption",
                        label: "Mark this as a parent form and add child lists",
                        value: "1",
                        onChange: () => {
                            handleOnChange();
                        },
                        renderConditional: () => <AddChildFormListDetails />,
                    },
                ]}
            />
            <Spacing mb={SpacingUnit.Eight} />
            <Button
                name={"group-form"}
                text="Group form"
                isDisabled={isDisabled()}
                onButtonClick={onGroupHandler}
            />
        </>
    );
    const onRemoveChildClose = () => {
        setShowRemoveChildListModal(false);
    };

    const onFinalRemoveChild = async () => {
        const formUpdated = await dispatch(
            removeChildFromParent({
                childId: selectedParentForm.Key,
                parentId: parentId,
            })
        );
        const {
            meta: { requestStatus },
        } = formUpdated;
        if (requestStatus === "fulfilled") {
            setShowRemoveChildListModal(false);
            dispatch(resetParentChild());
            dispatch(selectFormConfig({ form: null, isChild: false }));
            history.push("/dashboard");
        } else {
            setShowRemoveChildListModal(true);
        }
    };

    const onGroupModalClose = () => {
        setShowGroupModal(false);
    };

    const onFinalGroupForm = async () => {
        const parentChildGroupValue = parentChildMapper(parentChild);
        const updatedForm = {
            ...selectedFormData,
            parentChild: parentChildGroupValue,
        };
        // Delete parentDetails if it is empty
        if (!updatedForm.parentDetails?.parentId) {
            delete updatedForm.parentDetails;
        }
        const formUpdated = await dispatch(addParentChild(updatedForm));
        setShowGroupModal(false);
        const {
            meta: { requestStatus },
        } = formUpdated;
        if (requestStatus === "fulfilled") {
            dispatch(resetParentChild());
            dispatch(selectFormConfig({ form: null, isChild: false }));
            history.push(`/dashboard`);
        } else if (requestStatus === "rejected") {
            setShowErrorSummary(true);
        }
    };
    const RenderGroupModal = () => (
        <GenericModal
            onClose={onGroupModalClose}
            onDelete={onFinalGroupForm}
            listName={selectedParentForm?.DisplayName ?? ""}
            show={showGroupModal}
            warning={groupFormModal.warning}
            hint={groupFormModal.hint}
            confirm={groupFormModal.confirm}
            buttonText="Group form"
            modalType={ModalType.INFORMATIONAL}
        />
    );

    const LoadChildTemplate = () => (
        <>
            <Spacing mb={SpacingUnit.Eight} />
            <GridRow>
                <GridColumn type={GridColumnType.ThreeQuarter}>
                    <NotificationBanner
                        title={i18n("groupForm.informationBanner.title")}
                        subtitle={
                            i18n("groupForm.informationBanner.subtitle") +
                            " " +
                            parentName
                        }
                        bodyText={i18n("groupForm.informationBanner.body")}
                    />
                </GridColumn>
            </GridRow>
            <Spacing mb={SpacingUnit.Six} />
            <WarningText
                text={
                    "If this form has a dependency on another form, removing it from the child list might interrupt the flow."
                }
            />
            <Spacing mb={SpacingUnit.Six} />
            <GenericModal
                onClose={onRemoveChildClose}
                onDelete={onFinalRemoveChild}
                listName={selectedParentForm?.DisplayName ?? ""}
                show={showRemoveChildListModal}
                warning={removeChildModal.warning}
                hint={removeChildModal.hint}
                hintNote={removeChildModal.hintNote}
                confirm={removeChildModal.confirm}
                buttonText="Remove from child list"
                modalType={ModalType.DELETE}
            />
            <Button
                name={"Remove from child list"}
                text="Remove from child list"
                variant={ButtonVariant.Warning}
                onButtonClick={() => setShowRemoveChildListModal(true)}
            />
        </>
    );

    if (!parentChild.selectedParentForm) {
        return null;
    }

    return (
        <GridRow>
            <BackLink onClick={goBack}>{i18n("Back")}</BackLink>
            {showErrorSummary && (
                <ErrorSummary
                    items={[
                        {
                            text: "Try again later.",
                            componentId: "",
                        },
                        {
                            text: "Contact the Customer Helpline at ",
                            componentId: "",
                            openInNewTab: {
                                text: "DfE enquiry form (opens in a new tab).",
                                link:
                                    "https://customerhelpportal.education.gov.uk/",
                            },
                        },
                    ]}
                />
            )}
            <GridColumn>
                <Table
                    name={"selected-parent-form"}
                    rows={rows}
                    columns={columns}
                    caption={`Group forms for ${selectedParentForm?.DisplayName}`}
                    captionSize={TableCaptionSize.L}
                    additionalClasses="form-configuration-table-5"
                />
                <Spacing mb={SpacingUnit.Four} />
                {isParentIdAvailable
                    ? LoadChildTemplate()
                    : NewParentTemplate()}
                {showGroupModal && <RenderGroupModal />}
            </GridColumn>
        </GridRow>
    );
};

export default GroupForm;
