import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
    CellContext,
    PaginationState,
    Row,
    createColumnHelper,
} from "@tanstack/react-table";

import {
    BackLink,
    Button,
    ButtonGroup,
    ButtonVariant,
    FormFilter,
    GridColumn,
    GridColumnType,
    GridRow,
    Heading,
    Para,
    RadioInput,
    SearchInput,
    Spacing,
    SpacingUnit,
    Tab,
    Table,
    TableCell,
    DetailsModal,
    LinkComponent,
    PreviewLinks,
    FormTableLegend,
    formNameColumn,
    formStatusColumn,
    formAccessTypeColumn,
    formCreatedByColumn,
    formDetailsColumn,
    formPreviewColumn,
    formSubRowToggleColumn,
} from "../../ui";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { FormConfigurationTabs } from "../../utils";
import {
    clearFilters,
    createdBySelector,
    dashboardSelector,
    detailsSelector,
    searchForms,
    setCreatedByFilter,
    setFormAccessTypeFilter,
    setFormStatusFilter,
    setModifiedOnFilter,
    toggleDetailModal,
} from "../../store/reducers/dashboardReducer";
import { ChildConfig, FormConfigurationWithChild } from "../../store/types";
import {
    newChildConfigSelector,
    parentChildSelector,
    setNewChildConfig,
} from "../../store/reducers/parentChildReducer";
import { removeParentAndExistingChild } from "./utils";
import { currentUserSelector } from "../../store/reducers/usersReducer";
import { isFilterSearchEmpty } from "../dashboard/utils";

type Props = {
    parentId: string;
};

const AddChildForms = (props: Props) => {
    const dispatch = useAppDispatch();
    const [selectedTab, setSelectedTab] = useState(
        FormConfigurationTabs.MyForms
    );
    const [showFilter, setShowFilter] = useState(false);
    const [selectedChild, setSelectedChild] = useState<Row<
        FormConfigurationWithChild
    > | null>(null);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const dashboardData = useAppSelector(dashboardSelector);
    const parentChild = useAppSelector(parentChildSelector);
    const createdByList = useAppSelector(createdBySelector);
    const details = useAppSelector(detailsSelector);
    const newChildConfig = useAppSelector(newChildConfigSelector);
    const currentUser = useAppSelector(currentUserSelector);

    const history = useHistory();

    useEffect(() => {
        dispatch(searchForms(""));
    }, []);

    useEffect(() => {
        setPagination({ pageIndex: 0, pageSize: 10 });
    }, [selectedTab]);

    const onBack = (e?: React.MouseEvent<HTMLAnchorElement>) => {
        e?.preventDefault();
        dispatch(clearFilters());
        history.push(`/group-form/${props.parentId}`);
    };

    const onChildFormAdd = () => {
        const childConfig: ChildConfig = {
            ...newChildConfig,
            childId: selectedChild?.original.Key!,
            childFormName: selectedChild?.original.DisplayName!,
            childFormTitle: selectedChild?.original.Name!,
            parentId: props.parentId,
            isMainChild: true,
        };
        dispatch(setNewChildConfig(childConfig));
        onBack();
    };

    function onDetailClick(
        ctx: CellContext<FormConfigurationWithChild, unknown>
    ) {
        return (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
            dispatch(toggleDetailModal(ctx.row.original));
        };
    }

    const isDisabled = () => {
        if (selectedChild?.original.childs?.length ?? 0 > 0) {
            return true;
        } else if (selectedChild?.parentId) {
            return true;
        } else {
            return false;
        }
    };

    const columnHelper = createColumnHelper<FormConfigurationWithChild>();
    const selectFormColumn = columnHelper.display({
        id: "radioButton",
        cell: (props) => {
            const isChild = !!props.row.parentId;
            return (
                <RadioInput
                    id={"select-form"}
                    name={"add-child-form-select"}
                    selectedValue={selectedChild?.original.Key}
                    isSmall={isChild}
                    options={[
                        {
                            key: "select-form",
                            label: "",
                            value: props.row.original.Key,
                            onChange: (e) => {
                                setSelectedChild(props.row);
                            },
                        },
                    ]}
                    additionalClasses={`govuk-!-padding-left-${
                        isChild ? "5" : "2"
                    }`}
                />
            );
        },
        header: () => "",
        size: 55, //40 + 15
        enableSorting: false,
    });

    const columns = [
        formSubRowToggleColumn,
        selectFormColumn,
        formNameColumn,
        formStatusColumn,
        formAccessTypeColumn,
        formCreatedByColumn(dashboardData.selectedTab),
        formDetailsColumn(onDetailClick),
        formPreviewColumn,
    ];
    return (
        <GridColumn type={GridColumnType.Full}>
            <BackLink onClick={onBack}>Back</BackLink>
            <GridRow>
                <GridColumn type={GridColumnType.OneHalf}>
                    <Heading text="Add child form" />
                    <Spacing mb={SpacingUnit.Two} />
                    <Para text="You can only add standalone forms to a child form." />
                    <Spacing mb={SpacingUnit.Six} />
                </GridColumn>
            </GridRow>
            <GridRow>
                <SearchInput
                    name={"add-child-search-component"}
                    label="Search forms"
                    value={dashboardData.filter.search}
                    onSearchChange={(e) => {
                        dispatch(searchForms(e.target.value));
                    }}
                    additionalClasses="close-gap"
                />
                <GridColumn
                    type={GridColumnType.OneHalf}
                    additionalClasses="govuk-!-padding-left-0"
                >
                    <Spacing mt={SpacingUnit.Six} />
                    <ButtonGroup>
                        <Button
                            name={"sample-button"}
                            text={"Show filters"}
                            variant={ButtonVariant.Secondary}
                            onButtonClick={() => {
                                setShowFilter(true);
                            }}
                        />
                    </ButtonGroup>
                </GridColumn>
                <Spacing mb={SpacingUnit.Three} />
            </GridRow>
            <GridRow>
                <GridColumn type={GridColumnType.Full}>
                    <FormFilter
                        show={showFilter}
                        createdByList={createdByList}
                        onClose={() => {
                            setShowFilter(false);
                        }}
                        filters={dashboardData.filter}
                        setFormStatus={(formStatus: any) => {
                            dispatch(setFormStatusFilter(formStatus));
                        }}
                        setFormAccessType={(formAccessType: any) => {
                            dispatch(setFormAccessTypeFilter(formAccessType));
                        }}
                        setCreatedby={(createdBy: any) => {
                            dispatch(setCreatedByFilter(createdBy));
                        }}
                        setModifedOn={(modifiedOn: any) => {
                            dispatch(setModifiedOnFilter(modifiedOn));
                        }}
                    />
                </GridColumn>
            </GridRow>
            <GridRow>
                <GridColumn type={GridColumnType.Full}>
                    <FormTableLegend />
                    <Tab
                        name={"add-child-forms"}
                        title={"Search forms"}
                        selectedTab={selectedTab}
                        onSelectTab={function (tabId: string): void {
                            setSelectedTab(tabId as FormConfigurationTabs);
                        }}
                        childs={[
                            {
                                id: FormConfigurationTabs.MyForms,
                                label: "My forms",
                                render: () => (
                                    <Table
                                        name={"add-child-forms-my-forms-table"}
                                        columns={columns}
                                        rows={removeParentAndExistingChild(
                                            parentChild,
                                            FormConfigurationTabs.MyForms,
                                            dashboardData.filteredMyForms,
                                            currentUser.data
                                        )}
                                        getSubRows={(row) => row.childs}
                                        renderPagination={true}
                                        defaultPaginationState={pagination}
                                        setPaginationState={setPagination}
                                        renderEmptyMessage={true}
                                        toggleExpandAllRows={
                                            !isFilterSearchEmpty(
                                                dashboardData.filter
                                            )
                                        }
                                        additionalClasses="form-configuration-table"
                                    />
                                ),
                            },
                            {
                                id: FormConfigurationTabs.ColleagueForms,
                                label: "Colleagues' forms",
                                render: () => (
                                    <Table
                                        name={"add-child-forms-my-forms-table"}
                                        columns={columns}
                                        rows={removeParentAndExistingChild(
                                            parentChild,
                                            FormConfigurationTabs.ColleagueForms,
                                            dashboardData.filteredColForms,
                                            currentUser.data
                                        )}
                                        getSubRows={(row) => row.childs}
                                        renderPagination={true}
                                        defaultPaginationState={pagination}
                                        setPaginationState={setPagination}
                                        renderEmptyMessage={true}
                                        toggleExpandAllRows={
                                            !isFilterSearchEmpty(
                                                dashboardData.filter
                                            )
                                        }
                                        additionalClasses="form-configuration-table"
                                    />
                                ),
                            },
                        ]}
                    />
                    <DetailsModal
                        show={details.show}
                        formDetails={details.data!}
                        onHide={(e) => {
                            //@ts-ignore
                            dispatch(toggleDetailModal());
                        }}
                    />
                </GridColumn>
            </GridRow>
            <GridRow>
                <GridColumn type={GridColumnType.Full}>
                    <ButtonGroup>
                        <Button
                            name={"add-child-list-submit-button"}
                            text="Add to child list"
                            isDisabled={isDisabled()}
                            variant={ButtonVariant.Primary}
                            onButtonClick={onChildFormAdd}
                        />
                        <LinkComponent
                            // name={"add-child-list-cancel-button"}
                            text="Cancel"
                            onClick={onBack} // variant={ButtonVariant.Secondary}
                        />
                    </ButtonGroup>
                </GridColumn>
            </GridRow>
        </GridColumn>
    );
};

export default AddChildForms;
