/* eslint-disable react/display-name */
import React from "react";
import {
    useReactTable,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
} from "@tanstack/react-table";
import { ListEntity } from "../../../store/types";
import ListSelectRadio from "./ListSelectRadio";
import Cell from "./Cell";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { listSelector } from "../../../store/reducers/listReducer";
import Pagination from "../../../ui/Table/Pagination";

const ListTable = () => {
    const dispatch = useAppDispatch();
    const lists = useAppSelector(listSelector);
    const columnHelper = createColumnHelper<ListEntity>();
    const columns = [
        columnHelper.display({
            id: "radioButton",
            cell: (props) => (
                <Cell>
                    <ListSelectRadio {...props} />
                </Cell>
            ),
            header: () => "",
            size: 55, //40 + 15
        }),
        columnHelper.accessor("title", {
            id: "listTitle",
            cell: (row) => (
                <Cell>
                    <span title={row.getValue()}>{row.getValue()}</span>
                </Cell>
            ),
            header: () => "List title",
            size: 350, //190 + 36
        }),
        columnHelper.display({
            id: "noOfListItems",
            cell: (row) => (
                <Cell>
                    <span>{row.row.original.items.length}</span>
                </Cell>
            ),
            header: () => "No. of list items",
            size: 150, //190 + 36
        }),
        columnHelper.display({
            id: "datasetAvailable",
            cell: (row) => (
                <Cell>
                    <span>{row.row.original.dataset ? "Yes" : "No"}</span>
                </Cell>
            ),
            header: () => "Data set available",
            size: 150, //190 + 36
        }),
        columnHelper.display({
            id: "linksAvailable",
            cell: (row) => (
                <Cell>
                    <span>
                        {row.row.original.items.some((item) => item.links)
                            ? "Yes"
                            : "No"}
                    </span>
                </Cell>
            ),
            header: () => "Links available",
            size: 150, //190 + 36
        }),
    ];
    const table = useReactTable({
        data: lists.entities,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        columns: columns,
    });
    return (
        <div className="list-table-container">
            <div className="govuk-body govuk-!-margin-bottom-5">
                Edit or delete the following lists
            </div>
            <div className="list-table">
                <table className="govuk-table">
                    <thead className="govuk-table__head">
                        {table.getHeaderGroups().map((headerGroups, idx) => {
                            return (
                                <tr
                                    key={headerGroups.id}
                                    className="govuk-table__row"
                                >
                                    {headerGroups.headers.map((header, idy) => {
                                        return (
                                            <th
                                                key={header.id}
                                                scope="col"
                                                className={`govuk-table__header data-table-header dashboard-table-cell govuk-!-padding-right-0`}
                                                data-width={`${header.getSize()}px`}
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <div
                                                        className={`govuk-!-font-size-19`}
                                                    >
                                                        <span className="">
                                                            {flexRender(
                                                                header.column
                                                                    .columnDef
                                                                    .header,
                                                                header.getContext()
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                            </th>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </thead>
                    <tbody className="govuk-table__body">
                        {table.getRowModel().rows.map((row, idx) => {
                            return (
                                <tr key={row.id} className="govuk-table__row">
                                    {row.getVisibleCells().map((cell, idy) => {
                                        return (
                                            <td
                                                key={cell.id}
                                                className="govuk-table__cell govuk-!-padding-right-0"
                                                data-width={`${table
                                                    .getHeaderGroups()[0]
                                                    .headers[idy].getSize()}px`}
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
                {lists.entities.length === 0 && (
                    <div className="govuk-body govuk-!-margin-bottom-6 govuk-!-text-align-centre">
                        No lists found
                    </div>
                )}
                {lists.entities.length > 10 && (
                    <Pagination
                        table={table}
                        totalNumber={lists.entities.length}
                        itemsPerPage={10}
                    />
                )}
            </div>
        </div>
    );
};

export default ListTable;
