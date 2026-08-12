import React from "react";
import { CellContext, createColumnHelper } from "@tanstack/react-table";

import { TableCell } from "../custom";
import LinkComponent from "../../Link";
import { FormConfigurationWithChild } from "../../../store/types";

const columnHelper = createColumnHelper<FormConfigurationWithChild>();

const detailsColumn = (
    onClick: (
        ctx: CellContext<FormConfigurationWithChild, unknown>
    ) => (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
) => {
    return columnHelper.display({
        id: "details",
        cell: (ctx) => (
            <TableCell>
                <LinkComponent text={"View"} onClick={onClick(ctx)} />
            </TableCell>
        ),
        header: () => "Details",
        size: 96, //60 + 36
        enableSorting: false,
    });
};

export default detailsColumn;
