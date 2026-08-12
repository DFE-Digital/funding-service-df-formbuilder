import React from "react";
import { i18n } from "../i18n";
import "./delete-component.scss";

type Props = {
    onClose: (e) => void;
    onCheck: (e) => void;
    onDelete: (e) => void;
    listName: string;
    show: boolean;
    warning: string;
    hint: string;
    text: string;
    confirm: string;
};

/**
 * Generate the modal component to warn user before deleting a list
 */
export default function DeleteComponent(props: Props) {
    const onCheck = (e) => {
        props.onCheck && props.onCheck(e);
    };

    const onClose = (e) => {
        props.onClose && props.onClose(e);
    };

    const onDelete = (e) => {
        props.onDelete && props.onDelete(e);
    };

    if (!props.show) {
        return null;
    }

    return (
        <div>
            <div className="modal" id="modal">
                <div className="warning-delete-container">
                    <div className="warning-delete-text-container">
                        <div className="warning-delete-text">
                            <h3 className="govuk-fieldset__legend govuk-fieldset__legend--m">
                                {props.warning}
                            </h3>
                            <a
                                className="flyout__button-close govuk-body govuk-!-font-size-16"
                                onClick={onClose}
                            >
                                {i18n("close")}
                            </a>
                            <fieldset
                                className="govuk-fieldset"
                                aria-describedby="contact-hint"
                            >
                                <legend className="govuk-fieldset__legend govuk-fieldset">
                                    <p className="govuk-fieldset">
                                        {props.hint} <b>{props.listName}</b>
                                    </p>
                                    <p />
                                    {props.text && (
                                        <p className="govuk-fieldset">
                                            <b>Note: </b>
                                            {props.text}
                                        </p>
                                    )}
                                </legend>
                                <p />
                                {props.confirm && (
                                    <div
                                        className="govuk-checkboxes"
                                        data-module="govuk-checkboxes"
                                    >
                                        <div className="govuk-checkboxes__item">
                                            <input
                                                onClick={onCheck}
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
                                                {props.confirm}
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </fieldset>
                        </div>
                        <button
                            className="govuk-button govuk-button--warning govuk-!-font-size-19"
                            onClick={onDelete}
                        >
                            Delete component
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
