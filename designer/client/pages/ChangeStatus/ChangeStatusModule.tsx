import React, { useEffect, useState } from "react";
import { useRouteMatch, useHistory } from "react-router-dom";
import { FormStatus } from "@xgovformbuilder/model";
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
    RadioFormComponent,
    Spacing,
    SpacingUnit,
    LegendSizes,
    Button,
    ButtonVariant,
    GridColumn,
    GridColumnType,
    formNameColumn,
    Para,
    CheckboxInput,
    NotificationBanner,
    LinkComponent,
    TableCell,
} from "../../ui";
import { i18n } from "../../i18n";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    changeStatusSelector,
    getFormConfigWithChild,
    resetChangeStatusState,
    setIsParentSelected,
    setSelectedChildForms,
    setSelectedStatus,
    toggleDetailModal,
    updateMutipleStatus,
} from "../../store/reducers/changeStatusReducer";
import { FormConfigurationTabs } from "../../utils";
import { FormConfigurationWithChild, LoadingState } from "../../store/types";
import Modal from "../../ui/Modal";
import { getApiStatus } from "../../store/reducers/apiReducer";
import { NotificationBannerType } from "../../ui/NotificationBanner";
import { selectFormConfig } from "../../store/reducers/dashboardReducer";

type Props = {};

type ParamsType = {
    formId: string;
};

const ChangeAccessModule = (props: Props) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showRedirect, setShowRedirect] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const apiState = useAppSelector(getApiStatus);
    const changeStatusState = useAppSelector(changeStatusSelector);
    const {
        selectedFormConfig,
        selectedStatus,
        isParentSelected,
        selectedChildForms,
        details,
    } = changeStatusState;
    const hasChildForms = !!selectedFormConfig?.childs?.length;
    const dispatch = useAppDispatch();
    const { params } = useRouteMatch<ParamsType>();
    const history = useHistory();
    const goBack = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        dispatch(resetChangeStatusState());
        history.push(`/dashboard`);
    };
    const formName = `${selectedFormConfig?.DisplayName} ${
        hasChildForms ? "and it's group" : ""
    }`;
    const confirmationMessage = `You are about to change the form status for <b>${
        selectedFormConfig?.DisplayName
    }</b> ${
        hasChildForms && !!selectedChildForms.length
            ? "and <b>it's group</b>"
            : ""
    } to <b>${selectedStatus}</b>`;
    const confirmationMessageWithoutParent = `Do you want to change the form status of <b>${
        hasChildForms ? "selected forms" : selectedFormConfig?.DisplayName
    }</b> ${
        hasChildForms ? "" : `from ${selectedFormConfig?.FormStatus}`
    } to <b>${selectedStatus}</b>?`;
    const confirmationNote = `<b>Note:</b> One or more forms in this group may have a different status at the moment.`;
    const checkboxMessage = `Yes, I want to change the form status to ${selectedStatus}`;
    const isButtonDisabled = () => {
        if (!hasChildForms) {
            if (selectedFormConfig!.FormStatus! === selectedStatus) {
                return true;
            }
        } else {
            if (
                (!isParentSelected && selectedChildForms.length === 0) ||
                !selectedStatus
            ) {
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

    const onChangeStatus = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        dispatch(setSelectedStatus(value));
    };
    const onStatusSubmitConfirm = async () => {
        await dispatch(
            updateMutipleStatus({
                state: changeStatusState,
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
            dispatch(resetChangeStatusState());
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
        cell: (ctx) => (
            <CheckboxInput
                id={"select-parent-form-change-status"}
                name={"select-parent-form-change-status"}
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
        ),
        enableSorting: false,
    });

    const selectChildFormCheckboxColumn = columnHelper.display({
        id: "formSelect",
        cell: (ctx) => (
            <CheckboxInput
                id={"select-child-form-change-status"}
                name={"select-child-form-change-status"}
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
        ),
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
            <Heading text={`Change form status for ${formName}`} />
            <Spacing mb={SpacingUnit.Four} />
            <Table
                name={"form-change-status"}
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
                        name={"form-change-status"}
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
            <RadioFormComponent
                name={"choose-form-status"}
                value={selectedStatus ?? ""}
                label={
                    "Please assign the status required from the options below"
                }
                labelSize={LegendSizes.S}
                hint={
                    hasChildForms
                        ? "You can either do a bulk status change or select the forms as per the requirement"
                        : ""
                }
                options={[
                    {
                        key: FormStatus.InDevelopment,
                        value: FormStatus.InDevelopment,
                        label: "In development",
                        onChange: onChangeStatus,
                    },
                    {
                        key: FormStatus.UAT,
                        value: FormStatus.UAT,
                        label: "UAT",
                        onChange: onChangeStatus,
                    },
                    {
                        key: FormStatus.Published,
                        value: FormStatus.Published,
                        label: "Published",
                        onChange: onChangeStatus,
                    },
                    {
                        key: FormStatus.Closed,
                        value: FormStatus.Closed,
                        label: "Closed",
                        onChange: onChangeStatus,
                    },
                ]}
            />
            <Spacing mb={SpacingUnit.Four} />
            <GridColumn
                type={GridColumnType.OneQuarter}
                additionalClasses="govuk-!-padding-left-0"
            >
                <Button
                    variant={ButtonVariant.Primary}
                    name={"on-change-status-submit"}
                    text={"Change status"}
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
                    text={
                        isParentSelected
                            ? confirmationMessage
                            : confirmationMessageWithoutParent
                    }
                />
                {hasChildForms && (
                    <>
                        <Spacing mb={SpacingUnit.Four} />
                        <Para text={confirmationNote} />
                    </>
                )}
                <Spacing mb={SpacingUnit.Four} />
                <CheckboxInput
                    id={"status-confirm"}
                    name={"status-confirm"}
                    selectedValue={confirm ? 1 : 0}
                    options={[
                        {
                            key: "1",
                            value: 1,
                            label: hasChildForms
                                ? checkboxMessage
                                : "I confirm",
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
                        variant={ButtonVariant.Primary}
                        name={"on-change-status-confirm-submit"}
                        text={"Change form status"}
                        isDisabled={!confirm}
                        onButtonClick={onStatusSubmitConfirm}
                    />
                </GridColumn>
            </Modal>
            {apiState.status !== LoadingState.Pending && (
                <Modal show={showRedirect} hideClose={true}>
                    <NotificationBanner
                        type={NotificationBannerType.Success}
                        bodyText={`<b>The form status successfully changed to ${selectedStatus}</b>`}
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

export default ChangeAccessModule;
