import React from "react";

import type { CommonPointType } from "./types";

type Props = {} & CommonPointType;

const PointRight = (props: Props) => {
    return (
        <svg
            width={props.width ?? 12}
            height={props.height ?? 14}
            viewBox={`0 0 ${props.width ?? 12} ${props.height ?? 14}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M0 0L12 7L0 14L0 0Z" fill="#1D70B8" />
        </svg>
    );
};

export default PointRight;
