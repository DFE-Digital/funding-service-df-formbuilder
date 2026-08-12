import React from "react";
import { i18n } from "./i18n";

export default class ModalChangeStatus extends React.Component {
    onCheck = (e) => {
        this.props.onCheck && this.props.onCheck(e);
    };

    onClose = (e) => {
        this.props.onClose && this.props.onClose(e); //
    };

    onChangeStatus = (e) => {
        this.props.onChangeStatus && this.props.onChangeStatus(e);
    };

    render() {
        const areYouSure = "Are you sure?";
        const myText1 =
            " Do you really want to change the status of the  " +
            this.props.formName +
            " form? If you proceed the status of the form will change.";

        const confirm =
            "I confirm I have understood that this the status of this form will be changed.";
        if (!this.props.show) {
            return null;
        }

        return (
            <div>
                <div className="modal" id="modal">
                    <div className="govuk-form-group">
                        <a
                            className="flyout__button-close  govuk-body govuk-!-font-size-16"
                            onClick={this.onClose}
                        >
                            {i18n("close")}
                        </a>
                        <p />

                        <h3 className="govuk-fieldset__legend govuk-fieldset__legend--m">
                            {areYouSure}
                        </h3>
                        <fieldset
                            className="govuk-fieldset"
                            aria-describedby="contact-hint"
                        >
                            <legend className="govuk-fieldset__legend govuk-fieldset">
                                <p className="govuk-fieldset">{myText1}</p>
                            </legend>
                            <div
                                className="govuk-checkboxes"
                                data-module="govuk-checkboxes"
                            >
                                <div className="govuk-checkboxes__item">
                                    <input
                                        checked={this.props.checked}
                                        onChange={this.onCheck}
                                        className="govuk-checkboxes__input"
                                        id="confirm1"
                                        name="check01"
                                        type="checkbox"
                                        data-aria-controls="conditional-confirm"
                                    />
                                    <label
                                        className="govuk-label govuk-checkboxes__label"
                                        htmlFor="confirm1"
                                    >
                                        {confirm}
                                    </label>
                                </div>
                            </div>
                        </fieldset>
                        <p />
                        <button
                            className="govuk-button govuk-!-font-size-16"
                            onClick={this.onChangeStatus}
                        >
                            Change status
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
