import React from "react";
import { AiOutlineClose } from "react-icons/ai";

import "./tag.scss";

type Props = {
    title: string;
    onClickClose: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

const TagComponent = (props: Props) => {
    return (
        <div className="tag-component-container">
            <div className="govuk-body govuk-!-margin-0">{props.title}</div>
            <div
                className="tag-component-clear"
                onClick={(e) => {
                    e.preventDefault();
                    props.onClickClose(e);
                }}
            >
                <AiOutlineClose size={20} strokeWidth={40} />
            </div>
        </div>
    );
};

export default TagComponent;
