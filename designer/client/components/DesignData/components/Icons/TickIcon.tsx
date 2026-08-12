import React from "react";
import { Colors } from "../../types";

type Props = {
    color: Colors;
    class?: string;
};

const TickIcon = (props: Props) => {
    return (
        <svg
            className={props.class}
            width="20"
            height="16"
            viewBox="0 0 20 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M20 2.8L17.2 0L6.8 10.4L2.8 6.4L0 9.2L6.8 16L20 2.8Z"
                fill={props.color}
            />
        </svg>
    );
};

export default TickIcon;
