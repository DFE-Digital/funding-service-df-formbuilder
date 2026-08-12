import React from "react";

import type { CommonPointType } from "./types";

type Props = {} & CommonPointType;

const PointDownSort = (props: Props) => {
    return (
        <svg
            width={props.width ?? 8}
            height={props.height ?? 7}
            viewBox={`0 0 ${props.width ?? 8} ${props.height ?? 7}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M7.72412 0.378906L3.86205 6.99959L-1.33514e-05 0.378906L7.72412 0.378906Z"
                fill={"#1D70B8"}
            />
        </svg>
    );
};

export default PointDownSort;
