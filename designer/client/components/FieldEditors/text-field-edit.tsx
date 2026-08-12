import React, { useContext } from "react";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Actions } from "../../reducers/component/types";
import { CssClasses } from "../CssClasses";
import { i18n } from "../../i18n";
import { Autocomplete } from "../Autocomplete";
import { CustomValidationMessage } from "../CustomValidationMessage";

type Props = {
    context: any; // TODO
    children: React.ReactNode;
};

export const RenderMaxLength = ({
    value,
    dispatch,
    from,
    handleChange,
    maxLength,
}) => {
    const onChangeTrigger = (e) => {
        if (from === "TextComponent") {
            dispatch({
                type: Actions.EDIT_SCHEMA_MAX,
                payload: e.target.value,
            });
        } else {
            handleChange(e);
        }
    };
    return (
        <div className="govuk-form-group">
            <label
                className="govuk-label govuk-label--s"
                htmlFor="field-schema-max"
            >
                {i18n("textFieldEditComponent.maxLengthField.title")}
            </label>
            <span className="govuk-hint">
                {i18n("textFieldEditComponent.maxLengthField.helpText")}
            </span>
            <input
                className="govuk-input govuk-input--width-3"
                data-cast="number"
                data-testid="field-schema-max"
                id="field-schema-max"
                name="maxLength"
                value={from === "TextComponent" ? maxLength : value}
                type="number"
                onChange={(e) => onChangeTrigger(e)}
            />
        </div>
    );
};

export function TextFieldEdit({ children, context = ComponentContext }: Props) {
    // If you are editing a component, the default context will be ComponentContext because props.context is undefined,
    // but if you editing a component which is a children of a list based component, then the props.context is the ListContext.
    const { state, dispatch } = useContext(context);
    const { selectedComponent } = state;
    const { schema = {} } = selectedComponent;

    return (
        <details className="govuk-details">
            <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                    {i18n("common.detailsLink.title")}
                </span>
            </summary>

            <div className="govuk-form-group">
                <label
                    className="govuk-label govuk-label--s"
                    htmlFor="field-schema-min"
                >
                    {i18n("textFieldEditComponent.minLengthField.title")}
                </label>
                <span className="govuk-hint">
                    {i18n("textFieldEditComponent.minLengthField.helpText")}
                </span>
                <input
                    className="govuk-input govuk-input--width-3"
                    data-cast="number"
                    data-testid="field-schema-min"
                    id="field-schema-min"
                    name="schema.min"
                    value={schema.min || ""}
                    type="number"
                    onChange={(e) =>
                        dispatch({
                            type: Actions.EDIT_SCHEMA_MIN,
                            payload: e.target.value,
                        })
                    }
                />
            </div>

            <RenderMaxLength
                maxLength={schema.max}
                dispatch={dispatch}
                from="TextComponent"
            />

            <div className="govuk-form-group">
                <label
                    className="govuk-label govuk-label--s"
                    htmlFor="field-schema-length"
                >
                    {i18n("textFieldEditComponent.lengthField.title")}
                </label>
                <span className="govuk-hint">
                    {i18n("textFieldEditComponent.lengthField.helpText")}
                </span>
                <input
                    className="govuk-input govuk-input--width-3"
                    data-cast="number"
                    id="field-schema-length"
                    data-testid="field-schema-length"
                    name="schema.length"
                    value={schema.length || ""}
                    type="number"
                    onChange={(e) =>
                        dispatch({
                            type: Actions.EDIT_SCHEMA_LENGTH,
                            payload: parseInt(e.target.value),
                        })
                    }
                />
            </div>

            <div className="govuk-form-group">
                <label
                    className="govuk-label govuk-label--s"
                    htmlFor="field-schema-regex"
                >
                    {i18n("textFieldEditComponent.regexField.title")}
                </label>
                <span className="govuk-hint">
                    {i18n("textFieldEditComponent.regexField.helpText")}
                </span>
                <input
                    className="govuk-input"
                    id="field-schema-regex"
                    data-testid="field-schema-regex"
                    name="schema.regex"
                    value={schema.regex || ""}
                    onChange={(e) =>
                        dispatch({
                            type: Actions.EDIT_SCHEMA_REGEX,
                            payload: e.target.value,
                        })
                    }
                />
            </div>

            {children}

            <Autocomplete />

            <CssClasses />

            {selectedComponent.type === "TelephoneNumberField" && (
                // Remove type check when fully integrated into all runner components
                <CustomValidationMessage />
            )}
        </details>
    );
}
