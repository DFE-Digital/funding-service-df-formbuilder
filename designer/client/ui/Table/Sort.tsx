import React from "react";

import { PointUpSort as Up, PointDownSort as Down } from "../Icons";

import type { SortDirection } from "@tanstack/react-table";

type Props = {
    type: false | SortDirection;
    show: boolean;
};

function Sort({ type, show }: Props) {
    if (!show) return null;
    if (type === "asc") {
        return (
            <div className="sort-container">
                <Up />
            </div>
        );
    } else if (type === "desc") {
        return (
            <div className="sort-container">
                <Down />
            </div>
        );
    } else {
        return (
            <div className="sort-container">
                <Up />
                <Down />
            </div>
        );
    }
}

export default Sort;
