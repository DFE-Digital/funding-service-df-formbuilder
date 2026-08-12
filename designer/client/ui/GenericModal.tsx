import React, { useState } from "react";
import { i18n } from "../i18n";
import "./common.scss";
import { ComponentDef } from "@xgovformbuilder/model";
import LinkedPropertiesDetails from "../utils/LinkedPropertiesDetails";
import { Module } from "../utils/linkedProperties";

export enum ModalType {
    INFORMATIONAL = "informational",
    DELETE = "delete",
}

type Props = {
    onClose: (e) => void;
    onDelete: (e) => void;
    listName?: string;
    show: boolean;
    warning?: string;
    hint?: string;
    hintNote?: string;
    note?: string;
    confirm?: string;
    buttonText: string;
    modalType?: ModalType;
    type?: Module;
    selectedComponent?: Partial<ComponentDef>;
};

/**
 * Generate the modal component to warn user before deleting a list
 */
export default function Modal(props: Props) {
    const { modalType, type } = props;
    const [checked, setChecked] = useState(false);
    const [affectedModules, setAffectedModules] = useState<string[]>([]);

    /* on checkbox click */
    const onCheck = (e) => {
        setChecked((val) => !val);
    };

    /* on close link */
    const onClose = (e) => {
        setChecked(false);
        props.onClose && props.onClose(e);
    };

    /* on final delete action in modal */
    const onDelete = (e) => {
        setChecked(false);
        props.onDelete && props.onDelete(e);
    };

    if (!props.show) {
        return null;
    }

    return (
        <div>
            <div className="modal" id="modal">
                <div
                    className={`warning-delete-container${
                        affectedModules && affectedModules?.length >= 1
                            ? " with-dependencies-warning"
                            : ""
                    }`}
                >
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
                                    {props.hint && (
                                        // <div dangerouslySetInnerHTML={{ __html: htmlString }} />
                                        <p className="govuk-fieldset">
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: props.hint,
                                                }}
                                            />{" "}
                                            <b>{props.listName}</b>{" "}
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: props.hintNote,
                                                }}
                                            />
                                        </p>
                                    )}

                                    <p />
                                    {!type && props.note && (
                                        <p className="govuk-fieldset">
                                            <b>Note: </b>
                                            {props.note}
                                        </p>
                                    )}
                                </legend>
                                <p />
                                {type ? (
                                    <LinkedPropertiesDetails
                                        module={type}
                                        selectedComponent={
                                            props.selectedComponent!
                                        }
                                        confirm={checked}
                                        setConfirm={setChecked}
                                        setAffectedModules={setAffectedModules}
                                    />
                                ) : (
                                    props.confirm && (
                                        <div
                                            className="govuk-checkboxes govuk-!-margin-top-3"
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
                                    )
                                )}
                            </fieldset>
                        </div>
                        <button
                            className={`govuk-button ${
                                modalType === "informational"
                                    ? "govuk-button"
                                    : "govuk-button--warning"
                            } govuk-!-font-size-19`}
                            disabled={!checked}
                            onClick={onDelete}
                        >
                            {props.buttonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
