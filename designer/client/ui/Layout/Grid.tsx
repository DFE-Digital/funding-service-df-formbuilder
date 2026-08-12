import React from "react";

import type { PropsWithChildren } from "react";

type GridRowProps = {
    additionalClasses?: string;
};

type GridColumnProps = {
    type?: GridColumnType;
    additionalClasses?: string;
};

const GridRow = (props: PropsWithChildren<GridRowProps>) => {
    return (
        <div className={`govuk-grid-row ${props.additionalClasses ?? ""}`}>
            {props.children}
        </div>
    );
};

enum GridColumnType {
    Full = "-full",
    OneHalf = "-one-half",
    OneThird = "-one-third",
    TwoThirds = "-two-thirds",
    OneQuarter = "-one-quarter",
    ThreeQuarter = "-three-quarters",
}

const GridColumn = (props: PropsWithChildren<GridColumnProps>) => {
    const columnClass = "govuk-grid-column";
    return (
        <div
            className={`${columnClass.concat(
                props.type ?? GridColumnType.Full
            )} ${props.additionalClasses ?? ""}`}
        >
            {props.children}
        </div>
    );
};

export { GridRow, GridColumn, GridColumnType };
