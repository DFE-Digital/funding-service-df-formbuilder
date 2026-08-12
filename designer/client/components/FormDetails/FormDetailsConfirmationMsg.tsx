import React, { ChangeEvent } from "react";

interface Props {
    handleconfirmationMsgInputTextArea: (
        event: ChangeEvent<HTMLTextAreaElement>
    ) => void;
    confirmationMsg: string;
    remainingChar: number;
}
export const FormDetailsConfirmationMsg = (props: Props) => {
    const {
        confirmationMsg,
        handleconfirmationMsgInputTextArea,
        remainingChar,
    } = props;
    return (
        <div
            className="govuk-character-count"
            data-module="govuk-character-count"
            data-maxlength="500"
        >
            <div className="govuk-form-group">
                <h3 className="govuk-heading-s">
                    Customise confirmation message
                </h3>
                <div id="with-hint-hint" className="govuk-hint">
                    Customised confirmation message is shown to user after
                    submitting the form. This helps the user to carry out any
                    further steps. This can contain link, text, images, etc. in
                    html format
                </div>
                <textarea
                    className="govuk-textarea govuk-js-character-count"
                    id="with-hint"
                    name="with-hint"
                    rows="5"
                    aria-describedby="with-hint-info with-hint-hint"
                    defaultValue={confirmationMsg}
                    onChange={handleconfirmationMsgInputTextArea}
                ></textarea>
            </div>
        </div>
    );
};
