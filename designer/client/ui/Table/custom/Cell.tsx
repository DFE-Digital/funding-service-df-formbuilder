import React, { PropsWithChildren } from "react";

type Props = {};

const Cell = (props: PropsWithChildren<Props>) => {
    return <div className={`table-cell`}>{props.children}</div>;
};

export default Cell;
