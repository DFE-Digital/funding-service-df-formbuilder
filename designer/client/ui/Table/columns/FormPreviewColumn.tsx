import React from "react";
import { createColumnHelper } from "@tanstack/react-table";

import { PreviewLinks, TableCell } from "../custom";
import { FormConfigurationWithChild } from "../../../store/types";

const columnHelper = createColumnHelper<FormConfigurationWithChild>();

const previewColumn = columnHelper.display({
    id: "preview",
    cell: (ctx) => (
        <TableCell>
            <PreviewLinks data={ctx} />
        </TableCell>
    ),
    header: () => "Preview",
    size: 90, //90 + 0
    enableSorting: false,
});

export default previewColumn;
