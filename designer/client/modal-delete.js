import React from "react";
import { i18n } from "./i18n";

export default class ModalDelete extends React.Component {
    onCheck = (e) => {
        this.props.onCheck && this.props.onCheck(e);
    };

    onClose = (e) => {
        this.props.onClose && this.props.onClose(e);
    };

    onDelete = (e) => {
        this.props.onDelete && this.props.onDelete(e);
    };

    render() {
        const areYouSure = "Are you sure?";
        const myText1 =
            " Do you really want to delete the " +
            this.props.formName +
            " form? This will result in loss of data.";

        const confirm =
            " I confirm I have understood that this form will be deleted.";
        if (!this.props.show) {
            return null;
        }

        return (
            <div>
                <div className="modal" id="modal">
                    <div className="govuk-form-group">
                        <a
                            className="flyout__button-close govuk-body govuk-!-font-size-16"
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
                                        onClick={this.onCheck}
                                        className="govuk-checkboxes__input"
                                        id="confirm"
                                        name="check1"
                                        type="checkbox"
                                        data-aria-controls="conditional-confirm"
                                    />
                                    <label
                                        className="govuk-label govuk-checkboxes__label"
                                        htmlFor="confirm"
                                    >
                                        {confirm}
                                    </label>
                                </div>
                            </div>
                        </fieldset>
                        <p />
                        <button
                            className="govuk-button govuk-!-font-size-14"
                            onClick={this.onDelete}
                        >
                            Delete form
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
