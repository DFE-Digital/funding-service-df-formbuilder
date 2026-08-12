import React from "react";

import { PointRight, PointDown } from "../../../ui/Icons";

import type { CellContext } from "@tanstack/react-table";
import type { Employee } from "./index";

const SubRowToggle = (props: CellContext<Employee, unknown>) => {
    return (
        <>
            {props.row.getCanExpand() ? (
                <div onClick={props.row.getToggleExpandedHandler()}>
                    {props.row.getIsExpanded() ? (
                        <PointDown width={14} height={15} />
                    ) : (
                        <PointRight width={14} height={15} />
                    )}
                </div>
            ) : null}
        </>
    );
};

export default SubRowToggle;
