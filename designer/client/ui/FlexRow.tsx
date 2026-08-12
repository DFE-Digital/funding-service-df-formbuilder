import React, { PropsWithChildren } from "react";

type Props = {};

const FlexRow = (props: PropsWithChildren<Props>) => {
    return <div className="flex-row-container">{props.children}</div>;
};

export default FlexRow;
