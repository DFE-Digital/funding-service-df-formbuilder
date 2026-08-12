import React from "react";

import type { CellContext } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";

import { PointRight, PointDown } from "../../../ui/Icons";
import { FormConfigurationWithChild } from "../../../store/types";
import { TableCell } from "../custom";

const columnHelper = createColumnHelper<FormConfigurationWithChild>();

const SubRowToggle = (
    props: CellContext<FormConfigurationWithChild, unknown>
) => {
    return (
        <>
            {props.row.getCanExpand() ? (
                <span onClick={props.row.getToggleExpandedHandler()}>
                    {props.row.getIsExpanded() ? (
                        <PointDown width={14} height={15} />
                    ) : (
                        <PointRight width={14} height={15} />
                    )}
                </span>
            ) : null}
        </>
    );
};

const subRowToggle = columnHelper.display({
    id: "toggle",
    cell: (ctx) => (
        <TableCell>
            <SubRowToggle {...ctx} />
        </TableCell>
    ),
    header: "",
});

export default subRowToggle;
