import React from "react";

import type { CommonPointType } from "./types";

type Props = {} & CommonPointType;

const PointDown = (props: Props) => {
    return (
        <svg
            width={props.width ?? 14}
            height={props.height ?? 15}
            viewBox={`0 0 ${props.width ?? 14} ${props.height ?? 15}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M14 0L7 12L0 -6.11959e-07L14 0Z" fill="#1D70B8" />
        </svg>
    );
};

export default PointDown;
