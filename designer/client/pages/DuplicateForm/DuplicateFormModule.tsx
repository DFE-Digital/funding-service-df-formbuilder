import React, { useCallback, useEffect, useState } from "react";
import { useRouteMatch, useHistory } from "react-router-dom";
import { CellContext, createColumnHelper } from "@tanstack/react-table";

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
    Generics,
    GenericsColor,
    TextFormComponent,
    Divider,
    ErrorSummary,
} from "../../ui";
import { i18n } from "../../i18n";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    duplicateFormSelector,
    duplicateMutipleForms,
    getFormConfigWithChild,
    resetDuplicateFormState,
    setSelectedChildForms,
    toggleDetailModal,
    setParentNewName,
    checkName,
    setChildFormDetail,
    duplicateParentForm,
} from "../../store/reducers/duplicateFormReducer";
import { FormConfigurationTabs } from "../../utils";
import { FormConfigurationWithChild, LoadingState } from "../../store/types";
import Modal from "../../ui/Modal";
import { getApiStatus } from "../../store/reducers/apiReducer";
import { NotificationBannerType } from "../../ui/NotificationBanner";
import { selectFormConfig } from "../../store/reducers/dashboardReducer";

import "./duplicateForm.scss";
import {
    currentUserSelector,
    getCurrentUserInfo,
} from "../../store/reducers/usersReducer";
import { RenderDuplicateGeneric } from "./utils";
import ChildDuplicateComponent from "./ChildDuplicateComponent";
import { initializeSignOutFunctionality } from "../dashboard/utils";

type Props = {};

type ParamsType = {
    formId: string;
};

const DuplicateFormModule = (props: Props) => {
    const dispatch = useAppDispatch();
    const { params } = useRouteMatch<ParamsType>();
    const history = useHistory();

    const [showErrorSummary, setShowErrorSummary] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const apiState = useAppSelector(getApiStatus);
    const currentUser = useAppSelector(currentUserSelector);
    const duplicateFormState = useAppSelector(duplicateFormSelector);
    const {
        selectedFormConfig,
        selectedChildForms,
        details,
        isChild,
        parentForm,
        childForms,
        showRedirect,
    } = duplicateFormState;
    const hasChildForms = !!selectedFormConfig?.childs?.length;
    const formName = `${selectedFormConfig?.DisplayName} ${
        hasChildForms ? "and it's group" : ""
    }`;

    const goBack = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        dispatch(resetDuplicateFormState());
        history.push(`/dashboard`);
    };

    const parentSelectedAndValid = () => {
        return !!parentForm.newName && parentForm.isChecked;
    };

    const childsSelectedAndValid = () => {
        if (childForms.length > 0) {
            return childForms.every((child) => {
                return !!child.newName && child.isChecked;
            });
        } else {
            return true;
        }
    };
    const isButtonDisabled = () => {
        const allDetailFilled =
            parentSelectedAndValid() && childsSelectedAndValid();
        return !allDetailFilled;
    };

    const detailModalHide = (
        e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
    ) => {
        dispatch(toggleDetailModal({}));
    };

    function onDetailClick(
        ctx: CellContext<FormConfigurationWithChild, unknown>
    ) {
        return (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
            dispatch(toggleDetailModal(ctx.row.original));
        };
    }

    const onDuplicateSubmit = async () => {
        if (childForms.length === 0 || !hasChildForms) {
            dispatch(
                duplicateParentForm({
                    state: duplicateFormState,
                    currentUser: currentUser.data,
                })
            );
        } else {
            dispatch(
                duplicateMutipleForms({
                    state: duplicateFormState,
                    currentUser: currentUser.data,
                })
            );
        }
    };

    const redirectAfterDelay = useCallback(() => {
        setTimeout(function () {
            history.push(`/dashboard`);
            dispatch(resetDuplicateFormState());
            dispatch(selectFormConfig({ form: null, isChild: false }));
        }, 3000);
    }, [dispatch, history]);

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

    const childColumn = columnHelper.accessor("Key", {
        id: "duplicate-child-form-checkbox",
        cell: (ctx) => {
            const child = ctx.row.original;
            return <ChildDuplicateComponent child={child} />;
        },
        enableSorting: false,
    });

    useEffect(() => {
        if (selectedFormConfig === null) {
            dispatch(getFormConfigWithChild(params?.formId));
            dispatch(getCurrentUserInfo());
        }
    }, []);

    useEffect(() => {
        if (showRedirect) {
            redirectAfterDelay();
        }
    }, [redirectAfterDelay, showRedirect]);

    useEffect(() => {
        if (!!parentForm.error) {
            setShowErrorSummary(true);
            setErrorMessage(parentForm.error);
        } else if (childForms.some((child) => !!child.error)) {
            setShowErrorSummary(true);
            setErrorMessage(childForms.find((child) => !!child.error)?.error!);
        } else {
            setShowErrorSummary(false);
            setErrorMessage("");
        }
    }, [parentForm, childForms]);

    if (selectedFormConfig === null) {
        return <></>;
    }

    return (
        <>
            <BackLink onClick={goBack}>{i18n("Back")}</BackLink>
            {showErrorSummary && (
                <ErrorSummary
                    items={[
                        {
                            text: errorMessage,
                            componentId: "",
                        },
                    ]}
                />
            )}
            <Heading text={`Duplicate forms for ${formName}`} />
            <Spacing mb={SpacingUnit.Four} />
            <Table
                name={"duplicate-form"}
                rows={[selectedFormConfig!]}
                columns={tableColumns}
                additionalClasses="form-configuration-table-5-2"
            />
            {hasChildForms && (
                <>
                    <Spacing mb={SpacingUnit.Two} />
                    <div className="duplicate-legend-container">
                        <Para text="Legends:" bold />
                        <Spacing mr={SpacingUnit.Four} />
                        <Generics text="C" color={GenericsColor.Green} />
                        <Spacing mr={SpacingUnit.Four} />
                        <Para text="Checked for duplicate forms" />
                        <Spacing mr={SpacingUnit.Four} />
                        <Generics text="NC" color={GenericsColor.Red} />
                        <Spacing mr={SpacingUnit.Four} />
                        <Para text="Not checked for duplicate forms" />
                    </div>
                </>
            )}
            <Spacing mb={SpacingUnit.Six} />
            <div className="duplicate-text-container">
                <TextFormComponent
                    name={"rename-parent-form"}
                    label={`Rename form for ${selectedFormConfig?.DisplayName}`}
                    hint="Please enter a unique name for this form"
                    value={parentForm.newName!}
                    error={parentForm.error}
                    onChange={function (
                        e: React.ChangeEvent<HTMLInputElement>
                    ): void {
                        dispatch(setParentNewName(e.target.value));
                    }}
                />
                {hasChildForms && (
                    <>
                        <Spacing mr={SpacingUnit.Four} />
                        <div className="legend-button-container">
                            <div>
                                <RenderDuplicateGeneric
                                    hasUniqueName={parentForm.isChecked}
                                />
                            </div>
                            <Spacing mr={SpacingUnit.Four} />
                            <div>
                                <Button
                                    name={"check-for-duplicate-parent"}
                                    text={"Check for duplicate"}
                                    variant={ButtonVariant.Secondary}
                                    additionalClasses="button-margin-bottom"
                                    isDisabled={
                                        !!parentForm.error ||
                                        parentForm.isChecked
                                    }
                                    onButtonClick={() => {
                                        dispatch(
                                            checkName({
                                                formName: parentForm.newName,
                                                id: selectedFormConfig.Key,
                                            })
                                        );
                                    }}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
            {hasChildForms && (
                <>
                    <Spacing mb={SpacingUnit.Eight} />
                    <Para
                        text="Select the child forms you wish to duplicate and rename them"
                        bold
                    />
                    <Spacing mb={SpacingUnit.Six} />
                    <Table
                        name={"duplicate-child-forms"}
                        rows={selectedFormConfig.childs}
                        columns={[childColumn]}
                        renderPagination={true}
                        itemsPerPage={10}
                        hideHeader={true}
                    />
                </>
            )}
            <Spacing
                mb={hasChildForms ? SpacingUnit.Four : SpacingUnit.Eight}
            />
            <GridColumn
                type={GridColumnType.OneQuarter}
                additionalClasses="govuk-!-padding-left-0"
            >
                <Button
                    variant={ButtonVariant.Primary}
                    name={"on-form-delete-submit"}
                    text={"Duplicate form"}
                    isDisabled={
                        hasChildForms ? isButtonDisabled() : !parentForm.newName
                    }
                    onButtonClick={onDuplicateSubmit}
                />
            </GridColumn>
            <DetailsModal
                show={details.show}
                formDetails={details.data!}
                onHide={detailModalHide}
            />
            {apiState.status !== LoadingState.Pending && (
                <Modal show={showRedirect} hideClose={true}>
                    <NotificationBanner
                        type={NotificationBannerType.Success}
                        bodyText={`<b>The selected form(s) have been duplicated.</b>`}
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

export default DuplicateFormModule;
