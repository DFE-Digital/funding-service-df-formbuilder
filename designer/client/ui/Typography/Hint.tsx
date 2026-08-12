import React from "react";

type Props = {
    id: string;
    text: string;
};

const Hint = (props: Props) => {
    return (
        <div id={`${props.id}-hint`} className="govuk-hint">
            {props.text}
        </div>
    );
};

export default Hint;
