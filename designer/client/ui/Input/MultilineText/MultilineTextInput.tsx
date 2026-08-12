import React from "react";

type Props = {
    id: string;
    name: string;
    rows?: number;
    describedBy?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

const MultilineTextInput = (props: Props) => {
    return (
        <textarea
            className="govuk-textarea govuk-!-margin-0"
            id={`${props.name}-${props.id}`}
            name={props.name}
            rows={props.rows ?? 5}
            aria-describedby={props.describedBy}
            onChange={props.onChange}
            value={props.value}
        ></textarea>
    );
};

export default MultilineTextInput;
