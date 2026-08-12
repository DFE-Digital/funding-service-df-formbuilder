import React, { useEffect, useState } from "react";
import {
    useReactTable,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getExpandedRowModel,
    ExpandedState,
} from "@tanstack/react-table";

import { Divider, Para, ParaAlignTypes, Spacing, SpacingUnit } from "../../ui";
import Sort from "./Sort";
import Pagination from "./Pagination";

import type {
    ColumnDef,
    SortingState,
    OnChangeFn,
    PaginationState,
    VisibilityState,
} from "@tanstack/react-table";

import "./table.scss";
import { getRowType } from "../../utils";
import {
    customGetExpandedRowModel,
    customGetPaginationRowModel,
} from "./utils";

export enum TableCaptionSize {
    S = "s",
    M = "m",
    L = "l",
    XL = "xl",
}

type Props<RowType, ColumnType> = {
    name: string;
    rows: RowType[];
    columns: ColumnType;
    renderPagination?: boolean;
    pageIndex?: number;
    itemsPerPage?: number;
    emptyMessage?: string;
    renderEmptyMessage?: boolean;
    caption?: string;
    captionSize?: TableCaptionSize;
    enableMultiSort?: boolean;
    defaultSortingState?: SortingState;
    setSortingState?: OnChangeFn<SortingState> | undefined;
    defaultExpandedState?: ExpandedState;
    setExpandedState?: OnChangeFn<ExpandedState> | undefined;
    defaultPaginationState?: PaginationState;
    setPaginationState?: OnChangeFn<PaginationState> | undefined;
    defaultVisibilityState?: VisibilityState;
    getSubRows?: (r: RowType) => RowType[];
    additionalClasses?: string;
    autoResetPageIndex?: boolean;
    toggleExpandAllRows?: boolean;
    hideHeader?: boolean;
    hide?: boolean;
};

function Table<RowType, ColumnType extends ColumnDef<RowType, any>[]>(
    props: Props<RowType, ColumnType>
) {
    /** Table states */
    const [sorting, setSorting] = useState<SortingState>([]);
    const [expanded, setExpanded] = useState<ExpandedState>({});
    const itemsPerPage = !!props.renderPagination
        ? props.itemsPerPage ?? 10
        : props.rows.length;
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: props.pageIndex ?? 0,
        pageSize: itemsPerPage,
    });

    /** Props */
    const additionalClasses = props.additionalClasses ?? "";

    const renderEmptyMessage =
        !!props.renderEmptyMessage && props.rows.length === 0 && !props.hide;

    const hasCaption = !!props.caption;
    const hideHeader = !!props.hideHeader;
    const captionClass = `govuk-table__caption--${
        props.captionSize ?? TableCaptionSize.M
    }`;
    const enableMultiSort = props.enableMultiSort ?? false;
    /** Table configuration */
    const table = useReactTable({
        /** Table state */
        state: {
            sorting: props.defaultSortingState ?? sorting,
            expanded: props.defaultExpandedState ?? expanded,
            pagination: props.defaultPaginationState ?? pagination,
            columnVisibility: props.defaultVisibilityState,
        },
        /** Rows */
        data: props.rows,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: customGetPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getSubRows: props.getSubRows,
        onExpandedChange: props.setExpandedState ?? setExpanded,
        getExpandedRowModel: customGetExpandedRowModel(),
        /** Sorting */
        enableMultiSort: enableMultiSort,
        onSortingChange: props.setSortingState ?? setSorting,
        /** Columns */
        columns: props.columns,
        /** Pagination */
        onPaginationChange: props.setPaginationState ?? setPagination,
        paginateExpandedRows: false,
        autoResetPageIndex: props.autoResetPageIndex ?? false, //turn off auto reset of pageIndex
    });
    const renderPagination =
        !!props.renderPagination &&
        table.getExpandedRowModel().rows.length > itemsPerPage &&
        !props.hide;

    useEffect(() => {
        // When pagination is disabled, sets itemsPerPage for pagination state
        if (!props.renderPagination) {
            setPagination({ pageIndex: 0, pageSize: itemsPerPage });
        }
    }, [itemsPerPage, props.renderPagination]);

    useEffect(() => {
        table.toggleAllRowsExpanded(!!props.toggleExpandAllRows);
    }, [props.toggleExpandAllRows, table]);

    return (
        <>
            <table
                id={`${props.name}`}
                className={`govuk-table ${
                    props.hide && "govuk-visually-hidden"
                } ${additionalClasses}`}
            >
                {hasCaption && (
                    <>
                        <caption
                            id={`${props.name}-caption`}
                            className={`govuk-table__caption ${captionClass}`}
                        >
                            {props.caption ?? ""}
                        </caption>
                    </>
                )}
                {!hideHeader && (
                    <thead
                        id={`${props.name}-thead`}
                        className="govuk-table__head"
                    >
                        {table.getHeaderGroups().map((headerGroups, idx) => {
                            return (
                                <tr
                                    key={headerGroups.id}
                                    id={`${props.name}-tr-header-groups-${idx}`}
                                    className="govuk-table__row"
                                >
                                    {headerGroups.headers.map((header, idy) => {
                                        const headerIsSortable = header.column.getCanSort();
                                        const toggleSorting = headerIsSortable
                                            ? () =>
                                                  header.column.toggleSorting(
                                                      undefined,
                                                      true
                                                  )
                                            : () => null;
                                        return (
                                            <th
                                                id={`${props.name}-th-header-${idy}`}
                                                key={header.id}
                                                scope="col"
                                                className={`govuk-table__header`}
                                                data-width={`${
                                                    header.getSize() ?? ""
                                                }px`}
                                                style={{
                                                    width:
                                                        header.getSize() ?? "",
                                                }}
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <div
                                                        className={`${
                                                            headerIsSortable
                                                                ? "table-header-sort"
                                                                : ""
                                                        }`}
                                                        onClick={toggleSorting}
                                                    >
                                                        <span>
                                                            {flexRender(
                                                                header.column
                                                                    .columnDef
                                                                    .header,
                                                                header.getContext()
                                                            )}
                                                        </span>
                                                        <Sort
                                                            show={
                                                                headerIsSortable
                                                            }
                                                            type={header.column.getIsSorted()}
                                                        />
                                                    </div>
                                                )}
                                            </th>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </thead>
                )}
                <tbody id={`${props.name}-tbody`} className="govuk-table__body">
                    {table.getRowModel().rows.map((row, idx) => {
                        return (
                            <tr
                                id={`${props.name}-tr-row-${idx}`}
                                key={row.id}
                                className="govuk-table__row"
                            >
                                {row.getVisibleCells().map((cell, idy) => {
                                    return (
                                        <td
                                            id={`${props.name}-td-cell-${idx}-${idy}`}
                                            key={cell.id}
                                            className={`govuk-table__cell ${
                                                cell.column.id === "toggle"
                                                    ? ""
                                                    : getRowType(
                                                          //@ts-ignore
                                                          row
                                                      )
                                            }`}
                                            data-width={`${
                                                cell.column.id === "toggle"
                                                    ? "30"
                                                    : table
                                                          .getHeaderGroups()[0]
                                                          .headers[
                                                              idy
                                                          ].getSize() ?? ""
                                            }px`}
                                            style={{
                                                width:
                                                    cell.column.id === "toggle"
                                                        ? 30
                                                        : table
                                                              .getHeaderGroups()[0]
                                                              .headers[
                                                                  idy
                                                              ].getSize() ?? "",
                                            }}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {renderEmptyMessage && (
                <>
                    <Spacing mt={SpacingUnit.Six} />
                    <Para
                        text={props.emptyMessage ?? "No items found"}
                        align={ParaAlignTypes.Centre}
                    />
                    <Spacing mb={SpacingUnit.Six} />
                    <Divider />
                </>
            )}
            {renderPagination && (
                <Pagination
                    table={table}
                    totalNumber={table.getExpandedRowModel().rows.length}
                    itemsPerPage={itemsPerPage}
                />
            )}
        </>
    );
}

export default Table;
export * from "./custom";
export * from "./columns";
