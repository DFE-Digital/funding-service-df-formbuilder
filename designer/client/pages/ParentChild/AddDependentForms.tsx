import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
    CellContext,
    PaginationState,
    createColumnHelper,
} from "@tanstack/react-table";

import {
    BackLink,
    Button,
    ButtonGroup,
    ButtonVariant,
    CheckboxInput,
    DetailsModal,
    FormFilter,
    FormTableLegend,
    GridColumn,
    GridColumnType,
    GridRow,
    Heading,
    Para,
    SearchInput,
    Spacing,
    SpacingUnit,
    Tab,
    Table,
    formAccessTypeColumn,
    formCreatedByColumn,
    formDetailsColumn,
    formNameColumn,
    formPreviewColumn,
    formStatusColumn,
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
import {
    addDependentToNewChild,
    editChildDependent,
    parentChildSelector,
} from "../../store/reducers/parentChildReducer";
import { formConfigurationsSelector } from "../../store/reducers/formConfigurationsReducer";
import { FormConfigurationWithChild } from "../../store/types";
import { removeParentAndExistingChild } from "./utils";
import { currentUserSelector } from "../../store/reducers/usersReducer";
import { isFilterSearchEmpty } from "../dashboard/utils";

type Props = {
    parentId: string;
    selectedDependentForms?: string[];
};

const AddDependentForms = (props: Props) => {
    const [selectedTab, setSelectedTab] = useState(
        FormConfigurationTabs.MyForms
    );
    const [showFilter, setShowFilter] = useState(false);
    const [childIds, setChildIds] = useState<string[]>([]);
    const [selectedDependents, setSelectedDependents] = useState<
        FormConfigurationWithChild[]
    >([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const selectedValues = selectedDependents.map((config) => config.Key);

    const dispatch = useAppDispatch();
    const formConfigs = useAppSelector(formConfigurationsSelector);
    const dashboardData = useAppSelector(dashboardSelector);
    const parentChild = useAppSelector(parentChildSelector);
    const createdByList = useAppSelector(createdBySelector);
    const details = useAppSelector(detailsSelector);
    const currentUser = useAppSelector(currentUserSelector);

    const history = useHistory();

    useEffect(() => {
        // Reset search string
        dispatch(searchForms(""));
        // Ensures selectedDependentForms are selected in table (used in edit cases)
        if (props.selectedDependentForms) {
            const selectedConfigs = formConfigs.data
                .flatMap((conf) => [conf, ...conf.childs])
                .filter((config) =>
                    props.selectedDependentForms?.includes(config.Key)
                );
            setSelectedDependents(selectedConfigs);
        }
    }, []);

    useEffect(() => {
        setPagination({ pageIndex: 0, pageSize: 10 });
    }, [selectedTab]);

    const findDependentsHaveChilds = () => {
        return selectedDependents.filter((config) => config.childs?.length > 0);
    };

    const findIfSelectedAreChilds = () => {
        return selectedDependents.some((config) =>
            childIds.includes(config.Key)
        );
    };

    const isDisabled = () => {
        if (selectedDependents.length > 0) {
            if (findDependentsHaveChilds().length > 0) {
                return true;
            } else if (findIfSelectedAreChilds()) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    };

    const onBack = (
        event?: React.MouseEvent<
            HTMLAnchorElement | HTMLButtonElement,
            MouseEvent
        >
    ) => {
        event?.preventDefault();
        dispatch(clearFilters());
        history.push(`/group-form/${props.parentId}`);
    };

    const onAddDependent = () => {
        dispatch(
            addDependentToNewChild(
                selectedDependents.map((config) => ({
                    id: config.Key,
                    name: config.DisplayName,
                    title: config.Name,
                    status: null,
                }))
            )
        );
        onBack();
    };

    function onDetailClick(
        ctx: CellContext<FormConfigurationWithChild, unknown>
    ) {
        return (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
            dispatch(toggleDetailModal(ctx.row.original));
        };
    }

    const onEditDependent = () => {
        dispatch(
            editChildDependent(
                selectedDependents.map((config) => ({
                    id: config.Key,
                    name: config.DisplayName,
                    title: config.Name,
                    status: null,
                }))
            )
        );
        onBack();
    };

    const columnHelper = createColumnHelper<FormConfigurationWithChild>();
    const selectFormColumn = columnHelper.display({
        id: "radioButton",
        cell: (props) => {
            const formConfig = props.row.original;
            const isChild = !!props.row.parentId;
            return (
                <CheckboxInput
                    id={"select-form"}
                    name={"add-child-form-select"}
                    isSmall={isChild}
                    options={[
                        {
                            key: "select-form",
                            label: "",
                            value: formConfig.Key,
                            onChange: (e) => {
                                const id = formConfig.Key;
                                const index = selectedDependents.findIndex(
                                    (config) => config.Key === id
                                );
                                if (index === -1) {
                                    const addedDependents = [
                                        ...selectedDependents,
                                        formConfig,
                                    ];
                                    setSelectedDependents(addedDependents);
                                    if (props.row.parentId) {
                                        setChildIds((currVal) => {
                                            if (
                                                !currVal.includes(
                                                    formConfig.Key
                                                )
                                            ) {
                                                return currVal.concat(
                                                    formConfig.Key
                                                );
                                            } else {
                                                return currVal;
                                            }
                                        });
                                    }
                                } else {
                                    const removedDependents = selectedDependents.toSpliced(
                                        index,
                                        1
                                    );
                                    setSelectedDependents(removedDependents);
                                }
                            },
                        },
                    ]}
                    selectedValue={selectedValues}
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
                    <Heading text="Add dependent forms" />
                    <Spacing mb={SpacingUnit.Two} />
                    <Para text="You can only add standalone forms to a dependent list." />
                    <Spacing mb={SpacingUnit.Six} />
                </GridColumn>
            </GridRow>
            <GridRow>
                <SearchInput
                    name={"add-dependent-search-component"}
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
                                        additionalClasses="form-configuration-table"
                                        renderEmptyMessage={true}
                                        toggleExpandAllRows={
                                            !isFilterSearchEmpty(
                                                dashboardData.filter
                                            )
                                        }
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
                                        additionalClasses="form-configuration-table"
                                        toggleExpandAllRows={
                                            !isFilterSearchEmpty(
                                                dashboardData.filter
                                            )
                                        }
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
                            name={"add-dependent-list-submit-button"}
                            text="Add to dependent list"
                            isDisabled={isDisabled()}
                            variant={ButtonVariant.Primary}
                            onButtonClick={
                                parentChild.isChildEdit
                                    ? onEditDependent
                                    : onAddDependent
                            }
                        />
                        <Button
                            name={"add-dependent-list-cancel-button"}
                            text="Cancel"
                            onButtonClick={onBack}
                            variant={ButtonVariant.Secondary}
                        />
                    </ButtonGroup>
                </GridColumn>
            </GridRow>
        </GridColumn>
    );
};

export default AddDependentForms;
