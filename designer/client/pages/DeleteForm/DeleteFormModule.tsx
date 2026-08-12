import React, { useEffect, useState } from "react";
import { useRouteMatch, useHistory } from "react-router-dom";
import { createColumnHelper, CellContext } from "@tanstack/react-table";

import {
    BackLink,
    Heading,
    Table,
    formAccessTypeColumn,
    formStatusColumn,
    formCreatedByColumn,
    formDetailsColumn,
    DetailsModal,
    Spacing,
    SpacingUnit,
    Button,
    ButtonVariant,
    GridColumn,
    GridColumnType,
    formNameColumn,
    Para,
    CheckboxInput,
    NotificationBanner,
    LinkComponent,
    WarningText,
} from "../../ui";
import { i18n } from "../../i18n";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    deleteFormSelector,
    deleteMutipleForms,
    getFormConfigWithChild,
    resetDeleteFormState,
    setIsParentSelected,
    setSelectedChildForms,
    toggleDetailModal,
} from "../../store/reducers/deleteFormReducer";
import { FormConfigurationTabs } from "../../utils";
import { FormConfigurationWithChild, LoadingState } from "../../store/types";
import Modal from "../../ui/Modal";
import { getApiStatus } from "../../store/reducers/apiReducer";
import { NotificationBannerType } from "../../ui/NotificationBanner";
import { FormStatus } from "@xgovformbuilder/model";
import { selectFormConfig } from "../../store/reducers/dashboardReducer";

type Props = {};

type ParamsType = {
    formId: string;
};

const DeleteFormModule = (props: Props) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showRedirect, setShowRedirect] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const apiState = useAppSelector(getApiStatus);
    const deleteFormState = useAppSelector(deleteFormSelector);
    const {
        selectedFormConfig,
        isParentSelected,
        selectedChildForms,
        details,
        isChild,
    } = deleteFormState;
    const hasChildForms = !!selectedFormConfig?.childs?.length;
    const dispatch = useAppDispatch();
    const { params } = useRouteMatch<ParamsType>();
    const history = useHistory();
    const goBack = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        dispatch(resetDeleteFormState());
        history.push(`/dashboard`);
    };
    const formName = `${selectedFormConfig?.DisplayName} ${
        selectedChildForms.length > 0 ? "and it's group" : ""
    }`;
    const confirmationMessage = `You're about to delete the ${
        !isParentSelected && selectedChildForms.length > 0
            ? "<b>selected forms</b>"
            : `form <b>${formName}</b>`
    } permanently.`;
    const confirmationNote = `<b>Note:</b> Once deleted, it cannot be retrieved.`;
    const checkboxMessage = `Yes, I want to delete the selected form`;
    const isButtonDisabled = () => {
        if (!hasChildForms) {
            if (selectedFormConfig?.FormStatus === FormStatus.Published) {
                return true;
            }
            return false;
        } else {
            if (!isParentSelected && selectedChildForms.length === 0) {
                return true;
            }
        }
        return false;
    };

    function onDetailClick(
        ctx: CellContext<FormConfigurationWithChild, unknown>
    ) {
        return (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
            dispatch(toggleDetailModal(ctx.row.original));
        };
    }

    const onStatusSubmitConfirm = async () => {
        await dispatch(
            deleteMutipleForms({
                state: deleteFormState,
                hasChild: hasChildForms,
            })
        );
        setShowConfirmModal(false);
        setShowRedirect(true);
        redirectAfterDelay();
    };
    const redirectAfterDelay = () => {
        setTimeout(function () {
            setShowRedirect(false);
            history.push(`/dashboard`);
            dispatch(resetDeleteFormState());
            dispatch(selectFormConfig({ form: null, isChild: false }));
        }, 3000);
    };
    const onStatusSubmit = () => {
        setShowConfirmModal(true);
    };
    const onParentFormSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        dispatch(setIsParentSelected(value));
    };
    const onChildFormSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        dispatch(setSelectedChildForms(value));
    };
    const columnHelper = createColumnHelper<FormConfigurationWithChild>();
    const tableColumns = [
        { ...formNameColumn, enableSorting: false },
        { ...formStatusColumn, enableSorting: false },
        { ...formAccessTypeColumn, enableSorting: false },
        {
            ...formCreatedByColumn(FormConfigurationTabs.MyForms),
            enableSorting: false,
        },
        { ...formDetailsColumn(onDetailClick), enableSorting: false },
    ];

    const selectParentFormCheckboxColumn = columnHelper.display({
        id: "formSelect",
        cell: (ctx) => {
            const shouldRender =
                ctx.row.original.FormStatus !== FormStatus.Published &&
                ctx.row.original.childs.every(
                    (child) => child.FormStatus !== FormStatus.Published
                );
            return shouldRender ? (
                <CheckboxInput
                    id={"select-parent-form-delete-form"}
                    name={"select-parent-form-delete-form"}
                    selectedValue={isParentSelected}
                    options={[
                        {
                            key: ctx.row.original.Key,
                            value: ctx.row.original.Key,
                            label: "",
                            onChange: onParentFormSelect,
                        },
                    ]}
                />
            ) : (
                <></>
            );
        },
        enableSorting: false,
    });

    const selectChildFormCheckboxColumn = columnHelper.display({
        id: "formSelect",
        cell: (ctx) => {
            return ctx.row.original.FormStatus !== FormStatus.Published ? (
                <CheckboxInput
                    id={"select-child-form-delete-form"}
                    name={"select-child-form-delete-form"}
                    isSmall={true}
                    selectedValue={selectedChildForms}
                    options={[
                        {
                            key: ctx.row.original.Key,
                            value: ctx.row.original.Key,
                            label: "",
                            onChange: onChildFormSelect,
                        },
                    ]}
                    additionalClasses="small-checkbox-add-margin-left"
                />
            ) : (
                <></>
            );
        },
        enableSorting: false,
    });

    useEffect(() => {
        if (selectedFormConfig === null) {
            dispatch(getFormConfigWithChild(params?.formId));
        }
    }, []);

    if (selectedFormConfig === null) {
        return <></>;
    }
    return (
        <>
            <BackLink onClick={goBack}>{i18n("Back")}</BackLink>
            <Heading text={`Delete ${formName}`} />
            <Spacing mb={SpacingUnit.Four} />
            <Table
                name={"delete-form"}
                rows={[selectedFormConfig!]}
                columns={
                    hasChildForms
                        ? [selectParentFormCheckboxColumn, ...tableColumns]
                        : tableColumns
                }
                additionalClasses={
                    hasChildForms
                        ? "form-configuration-table-6"
                        : "form-configuration-table-5-2"
                }
            />
            {hasChildForms && (
                <>
                    <Spacing mb={SpacingUnit.Four} />
                    <Para text="Associated child forms" />
                    <Spacing mb={SpacingUnit.Four} />
                    <Table
                        name={"delete-form-childs"}
                        rows={selectedFormConfig!.childs}
                        renderPagination
                        columns={
                            hasChildForms
                                ? [
                                      selectChildFormCheckboxColumn,
                                      ...tableColumns,
                                  ]
                                : tableColumns
                        }
                        additionalClasses={
                            hasChildForms
                                ? "form-configuration-table-6"
                                : "form-configuration-table-5-2"
                        }
                    />
                </>
            )}
            <Spacing mb={SpacingUnit.Four} />
            {hasChildForms && (
                <>
                    <Para
                        text={`<b>Note: You will not be able to delete any published parent and child forms or any parent forms with existing published child forms</b>`}
                    />
                    <Spacing mb={SpacingUnit.Four} />
                </>
            )}
            {!hasChildForms &&
                selectedFormConfig.FormStatus === FormStatus.Published && (
                    <>
                        <Para
                            text={`<b>Note: Published forms cannot be deleted.</b>`}
                        />
                        <Spacing mb={SpacingUnit.Four} />
                    </>
                )}
            {(hasChildForms || isChild) && (
                <>
                    <WarningText
                        text={`If a form has a dependency on another form, deleting it might interrupt the flow.`}
                    />
                    <Spacing mb={SpacingUnit.Five} />
                </>
            )}
            <GridColumn
                type={GridColumnType.OneQuarter}
                additionalClasses="govuk-!-padding-left-0"
            >
                <Button
                    variant={ButtonVariant.Warning}
                    name={"on-form-delete-submit"}
                    text={"Delete form"}
                    isDisabled={isButtonDisabled()}
                    onButtonClick={onStatusSubmit}
                />
            </GridColumn>
            <DetailsModal
                show={details.show}
                formDetails={details.data!}
                onHide={(e) => {
                    dispatch(toggleDetailModal({}));
                }}
            />
            <Modal
                show={showConfirmModal}
                closeStyleOverride={true}
                onHide={function (
                    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
                ): void {
                    setShowConfirmModal(false);
                }}
            >
                <Heading text="Are you sure?" />
                <Spacing mb={SpacingUnit.Four} />
                <Para
                    text={confirmationMessage}
                    additionalClasses="govuk-!-margin-right-9"
                />
                <Spacing mb={SpacingUnit.Four} />
                <Para text={confirmationNote} />
                <Spacing mb={SpacingUnit.Four} />
                <CheckboxInput
                    id={"delete-confirm"}
                    name={"delete-confirm"}
                    selectedValue={confirm ? 1 : 0}
                    options={[
                        {
                            key: "1",
                            value: 1,
                            label: checkboxMessage,
                            onChange: (
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                setConfirm((value) => !value);
                            },
                        },
                    ]}
                />
                <Spacing mb={SpacingUnit.Six} />
                <GridColumn
                    type={GridColumnType.OneHalf}
                    additionalClasses="govuk-!-padding-left-0"
                >
                    <Button
                        variant={ButtonVariant.Warning}
                        name={"on-form-delete-confirm-submit"}
                        text={"Delete form"}
                        isDisabled={!confirm}
                        onButtonClick={onStatusSubmitConfirm}
                    />
                </GridColumn>
            </Modal>
            {apiState.status !== LoadingState.Pending && (
                <Modal show={showRedirect} hideClose={true}>
                    <NotificationBanner
                        type={NotificationBannerType.Success}
                        bodyText={`<b>The selected forms have been deleted.</b>`}
                    />
                    <Spacing mb={SpacingUnit.Four} />
                    <LinkComponent
                        text={"redirecting to dashboard"}
                        color="gray"
                        onClick={function (
                            e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
                        ): void {
                            e.preventDefault();
                        }}
                    />
                </Modal>
            )}
        </>
    );
};

export default DeleteFormModule;
