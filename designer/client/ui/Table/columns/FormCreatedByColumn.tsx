import React from "react";
import { createColumnHelper } from "@tanstack/react-table";

import { TableCell } from "../custom";
import { FormConfigurationTabs } from "../../../utils";
import { FormConfigurationWithChild } from "../../../store/types";

const columnHelper = createColumnHelper<FormConfigurationWithChild>();

const createdByColumn = (selectedTab: FormConfigurationTabs) =>
    columnHelper.accessor("CreatedBy", {
        id: "createdBy",
        cell: (ctx) => (
            <TableCell>
                <span title={ctx.getValue()}>{ctx.getValue()}</span>
            </TableCell>
        ),
        header: () => "Created by",
        size: 131, //95 + 36
        enableSorting:
            selectedTab === FormConfigurationTabs.MyForms ? false : true,
    });

export default createdByColumn;
