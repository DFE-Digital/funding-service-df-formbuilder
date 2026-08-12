import React from "react";

import type { CommonPointType } from "./types";

type Props = {} & CommonPointType;

const PointUpSort = (props: Props) => {
    return (
        <svg
            width={props.width ?? 8}
            height={props.height ?? 7}
            viewBox={`0 0 ${props.width ?? 8} ${props.height ?? 7}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M0 6.62109L3.86207 0.000407725L7.72413 6.62109L0 6.62109Z"
                fill={"#1D70B8"}
            />
        </svg>
    );
};

export default PointUpSort;
