import React from "react";
import { createColumnHelper } from "@tanstack/react-table";

import { TableCell } from "../custom";
import { FormConfigurationWithChild } from "../../../store/types";

const columnHelper = createColumnHelper<FormConfigurationWithChild>();

const accessTypeColumn = columnHelper.accessor("signInRequired", {
    id: "accessType",
    cell: (ctx) => (
        <TableCell>{ctx.getValue() ? "DFE SignIn" : "Public"}</TableCell>
    ),
    header: () => "Access type",
    size: 156, //120 + 36
    enableSorting: true,
});

export default accessTypeColumn;
