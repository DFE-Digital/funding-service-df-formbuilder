import React, { useContext, useEffect } from "react";
import { ComponentContext } from "./reducers/component/componentReducer";
import { ComponentTypeEnum, ComponentTypes } from "@xgovformbuilder/model";
import { Actions } from "./reducers/component/types";
import { i18n } from "./i18n";
import { ErrorMessage } from "./components/ErrorMessage";
import {
    LabelSizes,
    MultilineFormComponent,
    Spacing,
    SpacingUnit,
    TextFormComponent,
} from "./ui";

type Props = {
    isContentField?: boolean;
    isEdit?: boolean;
};

export function FieldEdit({ isContentField = false, isEdit = false }: Props) {
    const { state, dispatch } = useContext(ComponentContext);
    const { selectedComponent, errors } = state;

    const { name, title, hint, attrs, type, options = {} } = selectedComponent;
    const {
        hideTitle = false,
        optionalText = false,
        required = true,
    } = options;
    const isFileUploadField = selectedComponent.type === "FileUploadField";
    const fieldTitle =
        ComponentTypes.find((componentType) => componentType.name === type)
            ?.title ?? "";

    // This is used to set default help text for file name validation for file upload and data import components
    useEffect(() => {
        if (!isEdit) {
            if (
                selectedComponent.type === ComponentTypeEnum.FileUploadField ||
                selectedComponent.type === ComponentTypeEnum.DataImport
            ) {
                dispatch({
                    type: Actions.EDIT_HELP,
                    payload:
                        "Please use these as file name format: (A-Z), (a-z), (0-9), underscore (_)",
                });
            }
        }
    }, []);

    return (
        <div>
            <div data-test-id="standard-inputs">
                <TextFormComponent
                    name="title"
                    label={i18n("common.titleField.title")}
                    labelSize={LabelSizes.S}
                    hint={i18n("common.titleField.helpText")}
                    value={title || ""}
                    onChange={(e) => {
                        dispatch({
                            type: Actions.EDIT_TITLE,
                            payload: e.target.value,
                        });
                    }}
                    error={
                        errors?.title && i18n(errors.title[0], errors.title[1])
                    }
                />
                <Spacing mb={SpacingUnit.Six} />
                <div className="govuk-checkboxes govuk-form-group">
                    <div className="govuk-checkboxes__item">
                        <input
                            className="govuk-checkboxes__input"
                            id="field-options-hideTitle"
                            name="options.hideTitle"
                            type="checkbox"
                            checked={hideTitle}
                            onChange={(e) =>
                                dispatch({
                                    type: Actions.EDIT_OPTIONS_HIDE_TITLE,
                                    payload: e.target.checked,
                                })
                            }
                        />
                        <label
                            className="govuk-label govuk-checkboxes__label"
                            htmlFor="field-options-hideTitle"
                        >
                            {i18n("common.hideTitleOption.title")}
                        </label>
                        <span className="govuk-hint govuk-checkboxes__hint">
                            {i18n("common.hideTitleOption.helpText")}
                        </span>
                    </div>
                </div>
                <MultilineFormComponent
                    name="hint"
                    label={i18n("common.helpTextField.title")}
                    labelSize={LabelSizes.S}
                    hint={i18n("common.helpTextField.helpText")}
                    rows={2}
                    value={hint}
                    onChange={(e) => {
                        dispatch({
                            type: Actions.EDIT_HELP,
                            payload: e.target.value,
                        });
                    }}
                />
                <Spacing mb={SpacingUnit.Six} />
                <div
                    className={`govuk-form-group ${
                        errors?.name ? "govuk-form-group--error" : ""
                    }`}
                >
                    <label
                        className="govuk-label govuk-label--s"
                        htmlFor="field-name"
                    >
                        {i18n("common.componentNameField.title")}
                    </label>
                    {errors?.name && (
                        <ErrorMessage>
                            {i18n("name.errors.whitespace")}
                        </ErrorMessage>
                    )}
                    <span className="govuk-hint">{i18n("name.hint")}</span>
                    <input
                        className={`govuk-input govuk-input--width-20 ${
                            errors?.name ? "govuk-input--error" : ""
                        }`}
                        id="field-name"
                        name="name"
                        type="text"
                        value={name || ""}
                        onChange={(e) => {
                            dispatch({
                                type: Actions.EDIT_NAME,
                                payload: e.target.value,
                            });
                        }}
                    />
                </div>
                {!isContentField && (
                    <div className="govuk-checkboxes govuk-form-group">
                        <div className="govuk-checkboxes__item">
                            <input
                                type="checkbox"
                                id="field-options-required"
                                className={`govuk-checkboxes__input ${
                                    isFileUploadField ? "disabled" : ""
                                }`}
                                name="options.required"
                                checked={!required}
                                onChange={(e) => {
                                    dispatch({
                                        type: Actions.EDIT_OPTIONS_REQUIRED,
                                        payload: !e.target.checked,
                                    });
                                    required &&
                                        dispatch({
                                            type:
                                                Actions.EDIT_OPTIONS_HIDE_OPTIONAL,
                                            payload: false,
                                        });
                                }}
                            />
                            <label
                                className="govuk-label govuk-checkboxes__label"
                                htmlFor="field-options-required"
                            >
                                {i18n("common.componentOptionalOption.title", {
                                    component:
                                        ComponentTypes.find(
                                            (componentType) =>
                                                componentType.name === type
                                        )?.title ?? "",
                                })}
                            </label>
                            <span className="govuk-hint govuk-checkboxes__hint">
                                {i18n(
                                    "common.componentOptionalOption.helpText"
                                )}
                            </span>
                        </div>
                    </div>
                )}
                <div
                    className="govuk-checkboxes govuk-form-group"
                    data-test-id="field-options.optionalText-wrapper"
                    hidden={required}
                >
                    <div className="govuk-checkboxes__item">
                        <input
                            className="govuk-checkboxes__input"
                            id="field-options-optionalText"
                            name="options.optionalText"
                            type="checkbox"
                            checked={optionalText}
                            onChange={(e) =>
                                dispatch({
                                    type: Actions.EDIT_OPTIONS_HIDE_OPTIONAL,
                                    payload: e.target.checked,
                                })
                            }
                        />
                        <label
                            className="govuk-label govuk-checkboxes__label"
                            htmlFor="field-options-optionalText"
                        >
                            {i18n("common.hideOptionalTextOption.title")}
                        </label>
                        <span className="govuk-hint govuk-checkboxes__hint">
                            {i18n("common.hideOptionalTextOption.helpText")}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default FieldEdit;
