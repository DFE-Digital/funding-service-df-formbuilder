import React from "react";
import { createColumnHelper } from "@tanstack/react-table";

import { TableCell } from "../custom";
import { FormConfigurationWithChild } from "../../../store/types";

const columnHelper = createColumnHelper<FormConfigurationWithChild>();

const displayNameColumn = columnHelper.accessor("DisplayName", {
    id: "formName",
    cell: (ctx) => (
        <TableCell>
            <span title={ctx.getValue()}>{ctx.getValue()}</span>
        </TableCell>
    ),
    header: () => "Form name",
    size: 226, //190 + 36
    enableSorting: true,
});

export default displayNameColumn;
