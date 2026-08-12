import React from "react";
import { createColumnHelper } from "@tanstack/react-table";

import { TableCell } from "../custom";
import { FormConfigurationWithChild } from "../../../store/types";

const columnHelper = createColumnHelper<FormConfigurationWithChild>();

const formStatusColumn = columnHelper.accessor("FormStatus", {
    id: "formStatus",
    cell: (ctx) => <TableCell>{ctx.getValue()}</TableCell>,
    header: () => "Form status",
    size: 166, //130 + 36
    enableSorting: true,
});

export default formStatusColumn;
