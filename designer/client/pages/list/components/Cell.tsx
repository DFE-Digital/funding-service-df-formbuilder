import React, { PropsWithChildren } from "react";

type Props = {};

const Cell = (props: PropsWithChildren<Props>) => {
    return <p className="list-table-cell govuk-!-margin-0">{props.children}</p>;
};

export default Cell;
