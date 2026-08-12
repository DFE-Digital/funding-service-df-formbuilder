import React, { useContext } from "react";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Actions } from "../../reducers/component/types";
import { CssClasses } from "../CssClasses";
import { i18n } from "../../i18n";

type Props = {
    context: any; // TODO
};

export const RenderMaxDaysInPast = ({
    value,
    dispatch,
    from,
    maxDaysInPast,
    handleChange,
}) => {
    const onChangeTrigger = (e) => {
        if (from === "DateComponent") {
            dispatch({
                type: Actions.EDIT_OPTIONS_MAX_DAYS_IN_PAST,
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
                htmlFor="field-options-maxDaysInPast"
            >
                {i18n("dateFieldEditComponent.maxDaysInPastField.title")}
            </label>
            <span className="govuk-hint">
                {i18n("dateFieldEditComponent.maxDaysInPastField.helpText")}
            </span>
            <input
                className="govuk-input govuk-input--width-3"
                data-cast="number"
                data-testid="field-options-max-days-in-past"
                id="field-options-maxDaysInPast"
                name="maxDaysInPast"
                value={from === "DateComponent" ? maxDaysInPast : value}
                type="number"
                // value="save"
                // type="button"
                onChange={(e) => onChangeTrigger(e)}
            />
        </div>
    );
};

export const RenderMaxDaysInFuture = ({
    value,
    dispatch,
    from,
    handleChange,
    maxDaysInFuture,
}) => {
    const onChangeTrigger = (e) => {
        if (from === "DateComponent") {
            dispatch({
                type: Actions.EDIT_OPTIONS_MAX_DAYS_IN_FUTURE,
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
                htmlFor="field-options-maxDaysInFuture"
            >
                {i18n("dateFieldEditComponent.maxDaysInFutureField.title")}
            </label>
            <span className="govuk-hint">
                {i18n("dateFieldEditComponent.maxDaysInFutureField.helpText")}
            </span>
            <input
                className="govuk-input govuk-input--width-3"
                data-cast="number"
                id="field-options-maxDaysInFuture"
                data-testid="field-options-max-days-in-future"
                name="maxDaysInFuture"
                value={from === "DateComponent" ? maxDaysInFuture : value}
                type="number"
                onChange={(e) => onChangeTrigger(e)}
            />
        </div>
    );
};

export function DateFieldEdit({ context = ComponentContext }: Props) {
    // If you are editing a component, the default context will be ComponentContext because props.context is undefined,
    // but if you editing a component which is a children of a list based component, then the props.context is the ListContext.
    const { state, dispatch } = useContext(context);
    const { selectedComponent } = state;
    const { options = {} } = selectedComponent;

    return (
        <details className="govuk-details">
            <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                    {i18n("common.detailsLink.title")}
                </span>
            </summary>

            <RenderMaxDaysInPast
                maxDaysInPast={options.maxDaysInPast}
                dispatch={dispatch}
                from="DateComponent"
            />

            <RenderMaxDaysInFuture
                maxDaysInFuture={options.maxDaysInFuture}
                dispatch={dispatch}
                from="DateComponent"
            />

            <CssClasses />
        </details>
    );
}
