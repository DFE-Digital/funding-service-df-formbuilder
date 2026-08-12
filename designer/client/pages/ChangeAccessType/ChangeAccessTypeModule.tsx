import React, { ChangeEvent, useEffect, useState } from "react";
import {
    BackLink,
    Button,
    ButtonVariant,
    CheckboxInput,
    DetailsModal,
    formAccessTypeColumn,
    formCreatedByColumn,
    formDetailsColumn,
    formNameColumn,
    formStatusColumn,
    GridColumn,
    GridColumnType,
    Heading,
    LegendSizes,
    LinkComponent,
    NotificationBanner,
    Para,
    RadioFormComponent,
    Spacing,
    SpacingUnit,
    Table,
} from "../../ui";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useHistory, useRouteMatch } from "react-router-dom";
import {
    changeAccessTypeSelector,
    getFormConfigWithChild,
    resetState,
    setIsParentSelected,
    setSelectedAccessType,
    setSelectedChildForms,
    toggleDetailModal,
} from "../../store/reducers/changeAccessTypeReducer";
import { i18n } from "../../i18n";
import { getApiStatus } from "../../store/reducers/apiReducer";
import { FormAccessType } from "@xgovformbuilder/model";
import Modal from "../../modal";
import { FormConfigurationWithChild, LoadingState } from "../../store/types";
import { NotificationBannerType } from "../../ui/NotificationBanner";
import { FormConfigurationTabs } from "../../utils";
import { CellContext, createColumnHelper } from "@tanstack/react-table";

type Props = {};

type ParamsType = {
    formId: string;
};

const ChangeAccessTypeModule = (props: Props) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showRedirect, setShowRedirect] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const dispatch = useAppDispatch();
    const { params } = useRouteMatch<ParamsType>();
    const history = useHistory();
    const apiState = useAppSelector(getApiStatus);
    const changeAccessState = useAppSelector(changeAccessTypeSelector);
    const {
        selectedFormConfig,
        selectedAccessType,
        isParentSelected,
        selectedChildForms,
        details,
    } = changeAccessState;
    const hasChildForms = !!selectedFormConfig?.childs?.length;
    const formName = `${selectedFormConfig?.DisplayName} ${
        hasChildForms ? "and it's group" : ""
    }`;
    const confirmationMessage = `You are about to switch the access type for <b>${
        selectedFormConfig?.DisplayName
    }</b> ${
        hasChildForms && !!selectedChildForms.length
            ? "and <b>it's group</b>"
            : ""
    } to <b>${selectedAccessType}</b>`;
    const confirmationMessageWithoutParent = `Do you want to change the access type of <b>${
        hasChildForms ? "selected forms" : selectedFormConfig?.DisplayName
    }</b> ${
        hasChildForms
            ? ""
            : `from ${
                  selectedFormConfig?.signInRequired
                      ? FormAccessType.DFESignIn
                      : FormAccessType.Public
              }`
    } to <b>${selectedAccessType}</b>?`;
    const confirmationNote = `<b>Note:</b> One or more forms in this group may have a different status at the moment.`;
    const checkboxMessage = `Yes, I want to change the switch access`;

    const goBack = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        dispatch(resetState());
        history.push(`/dashboard`);
    };

    function onDetailClick(
        ctx: CellContext<FormConfigurationWithChild, unknown>
    ) {
        return (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
            dispatch(toggleDetailModal(ctx.row.original));
        };
    }

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

    const columnHelper = createColumnHelper<FormConfigurationWithChild>();
    const selectParentFormCheckboxColumn = columnHelper.display({
        id: "formSelect",
        cell: (ctx) => (
            <CheckboxInput
                id={"select-parent-form-change-access-type"}
                name={"select-parent-form-change-access-type"}
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
                id={"select-child-form-change-access-type"}
                name={"select-child-form-change-access-type"}
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

    const onChangeAccessType = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        dispatch(setSelectedAccessType(value));
    };

    useEffect(() => {
        if (selectedFormConfig === null) {
            dispatch(getFormConfigWithChild(params?.formId));
        }
    }, []);

    function isButtonDisabled(): boolean | undefined {
        return true;
    }

    function onAccessTypeSubmit(
        e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>
    ): void {
        throw new Error("Function not implemented.");
    }

    function onAccessTypeSubmitConfirm(
        e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>
    ): void {
        throw new Error("Function not implemented.");
    }

    function onParentFormSelect(e: ChangeEvent<HTMLInputElement>): void {
        const value = e.target.value;
        dispatch(setIsParentSelected(value));
    }

    function onChildFormSelect(e: ChangeEvent<HTMLInputElement>): void {
        const value = e.target.value;
        dispatch(setSelectedChildForms(value));
    }

    if (selectedFormConfig === null) {
        return <></>;
    }

    return (
        <>
            <BackLink onClick={goBack}>{i18n("Back")}</BackLink>
            <Heading text={`Switch access type for ${formName}`} />
            <Spacing mb={SpacingUnit.Four} />
            <Table
                name={"parent-form-change-access-type"}
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
                        name={"child-form-change-access-type"}
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
                name={"choose-form-access-type"}
                value={selectedAccessType ?? ""}
                label={"Please set the required access from the option below"}
                labelSize={LegendSizes.S}
                hint={
                    hasChildForms
                        ? "You can either set a bulk access status or select the forms as per the requirement."
                        : ""
                }
                options={[
                    {
                        key: FormAccessType.Public,
                        value: FormAccessType.Public,
                        label: "Public",
                        onChange: onChangeAccessType,
                    },
                    {
                        key: FormAccessType.DFESignIn,
                        value: FormAccessType.DFESignIn,
                        label: "DfE Signin",
                        onChange: onChangeAccessType,
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
                    name={"on-change-access-type-submit"}
                    text={"Switch Access"}
                    isDisabled={isButtonDisabled()}
                    onButtonClick={onAccessTypeSubmit}
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
                    id={"access-type-confirm"}
                    name={"access-type-confirm"}
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
                        name={"on-change-access-type-confirm-submit"}
                        text={"Switch access"}
                        isDisabled={!confirm}
                        onButtonClick={onAccessTypeSubmitConfirm}
                    />
                </GridColumn>
            </Modal>
            {apiState.status !== LoadingState.Pending && (
                <Modal show={showRedirect} hideClose={true}>
                    <NotificationBanner
                        type={NotificationBannerType.Success}
                        title={
                            "The file has been successfully uploaded and access type has changed to DfE Sign-in."
                        }
                        bodyText={`Save copy of the uploaded file on your local device`}
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

export default ChangeAccessTypeModule;
