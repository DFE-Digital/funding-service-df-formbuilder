import React from "react";

import type { CellContext } from "@tanstack/react-table";
import type { Employee } from "./index";

const Name = (props: CellContext<Employee, unknown>) => {
    return (
        <>{`${props.row.original.firstName} ${props.row.original.lastName}`}</>
    );
};

export default Name;
