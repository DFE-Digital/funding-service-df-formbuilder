import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
    dashboardSelector,
    selectDashboardTab,
    toggleDetailModal,
} from "../../../store/reducers/dashboardReducer";
import { applyFilters, isFilterSearchEmpty } from "../utils";
import Filter from "./filter/Filter";
import Search from "./search/Search";
import {
    DetailsModal,
    formNameColumn,
    FormTableLegend,
    GridColumn,
    GridColumnType,
    GridRow,
    Tab,
    Table,
    TableCell,
    formStatusColumn,
    formAccessTypeColumn,
    formCreatedByColumn,
    formDetailsColumn,
    formPreviewColumn,
    formSubRowToggleColumn,
} from "../../../ui";
import { FormConfigurationTabs } from "../../../utils";
import {
    CellContext,
    PaginationState,
    createColumnHelper,
} from "@tanstack/react-table";
import FormSelectRadio from "./table/FormSelectRadio";
import TableActionButtons from "./table/TableActionButtons";
import { FormConfigurationWithChild } from "../../../store/types";

type Props = {};

const FormConfigTable = (props: Props) => {
    const dispatch = useAppDispatch();
    const dashboardData = useAppSelector(dashboardSelector);
    const showFilters = dashboardData.filter.show;
    function onDetailClick(
        ctx: CellContext<FormConfigurationWithChild, unknown>
    ) {
        return (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
            dispatch(toggleDetailModal(ctx.row.original));
        };
    }

    const onSelectTab = (tabId: string) => {
        dispatch(selectDashboardTab(tabId as FormConfigurationTabs));
    };
    const columnHelper = createColumnHelper<FormConfigurationWithChild>();
    const formSelectColumn = columnHelper.display({
        id: "radioButton",
        cell: (props) => <FormSelectRadio {...props} />,
        header: () => "",
        size: 55, //40 + 15
    });
    const columns = [
        formSubRowToggleColumn,
        formSelectColumn,
        formNameColumn,
        formStatusColumn,
        formAccessTypeColumn,
        formCreatedByColumn(dashboardData.selectedTab),
        formDetailsColumn(onDetailClick),
        formPreviewColumn,
    ];

    return (
        <div
            id="dashboard-tabs"
            className="js-enabled form-config-table-container"
        >
            <Search />
            {showFilters && <Filter />}
            <GridRow>
                <GridColumn type={GridColumnType.Full}>
                    <FormTableLegend />
                    <Tab
                        name={"add-child-forms"}
                        title={"Search forms"}
                        selectedTab={dashboardData.selectedTab}
                        onSelectTab={onSelectTab}
                        childs={[
                            {
                                id: FormConfigurationTabs.MyForms,
                                label: "My forms",
                                render: () => (
                                    <>
                                        <Table
                                            name={
                                                "add-child-forms-my-forms-table"
                                            }
                                            columns={columns}
                                            rows={dashboardData.filteredMyForms}
                                            autoResetPageIndex
                                            renderPagination={true}
                                            getSubRows={(row) => row.childs}
                                            renderEmptyMessage={true}
                                            toggleExpandAllRows={
                                                !isFilterSearchEmpty(
                                                    dashboardData.filter
                                                )
                                            }
                                            additionalClasses="form-configuration-table-dashboard"
                                        />
                                        {/**@ts-ignore*/}
                                        <TableActionButtons
                                            isMyForm={
                                                FormConfigurationTabs.MyForms
                                                    ? true
                                                    : false
                                            }
                                        />
                                    </>
                                ),
                            },
                            {
                                id: FormConfigurationTabs.ColleagueForms,
                                label: "Colleagues' forms",
                                render: () => (
                                    <>
                                        <Table
                                            name={
                                                "add-child-forms-my-forms-table"
                                            }
                                            columns={columns}
                                            rows={
                                                dashboardData.filteredColForms
                                            }
                                            renderPagination={true}
                                            autoResetPageIndex
                                            getSubRows={(row) => row.childs}
                                            renderEmptyMessage={true}
                                            toggleExpandAllRows={
                                                !isFilterSearchEmpty(
                                                    dashboardData.filter
                                                )
                                            }
                                            additionalClasses="form-configuration-table-dashboard"
                                        />
                                        {/**@ts-ignore*/}
                                        <TableActionButtons
                                            isMyForm={
                                                FormConfigurationTabs.ColleagueForms
                                                    ? false
                                                    : true
                                            }
                                        />
                                    </>
                                ),
                            },
                        ]}
                    />
                    <DetailsModal
                        show={dashboardData.details.show}
                        formDetails={dashboardData.details.data!}
                        onHide={(e) => {
                            dispatch(toggleDetailModal({}));
                        }}
                    />
                </GridColumn>
            </GridRow>
        </div>
    );
};

export default FormConfigTable;
