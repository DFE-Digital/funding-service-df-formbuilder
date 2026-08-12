import React from "react";

type Props = {};

const AddIcon = (props: Props) => {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect y="6.73685" width="16" height="2.52632" fill="#0B0C0C" />
            <rect
                x="6.73682"
                y="16"
                width="16"
                height="2.52632"
                transform="rotate(-90 6.73682 16)"
                fill="#0B0C0C"
            />
        </svg>
    );
};

export default AddIcon;
