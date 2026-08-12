import React from "react";

type Props = {
    text: string;
};

const WarningText = (props: Props) => {
    return (
        <div className="govuk-warning-text">
            <span className="govuk-warning-text__icon" aria-hidden="true">
                !
            </span>
            <strong className="govuk-warning-text__text">
                <span className="govuk-visually-hidden">Warning</span>
                {props.text}
            </strong>
        </div>
    );
};

export default WarningText;
