import React, { useContext, useState, useEffect } from "react";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Actions } from "../../reducers/component/types";
import PrefixOptions from "./prefix-options";
import { CssClasses } from "../CssClasses";
import { i18n } from "../../i18n";

type Props = {
    context: any; // TODO
};

export const RenderMinNumber = ({
    dispatch,
    from,
    handleChange,
    minNumber,
}) => {
    const onChangeTrigger = (e) => {
        if (from === "NumberComponent") {
            dispatch({
                type: Actions.EDIT_SCHEMA_MIN,
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
                htmlFor="field-schema-min"
            >
                {i18n("numberFieldEditComponent.minField.title")}
            </label>
            <span className="govuk-hint">
                {i18n("numberFieldEditComponent.minField.helpText")}
            </span>
            <input
                className="govuk-input govuk-input--width-3"
                data-cast="number"
                data-testid="field-schema-min"
                id="field-schema-min"
                name="minNumber"
                // value={from === "NumberComponent" ? minNumber : value}
                value={minNumber}
                type="number"
                onChange={(e) => onChangeTrigger(e)}
            />
        </div>
    );
};

export const RenderMaxNumber = ({
    dispatch,
    from,
    handleChange,
    maxNumber,
}) => {
    const onChangeTrigger = (e) => {
        if (from === "NumberComponent") {
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
                {i18n("numberFieldEditComponent.maxField.title")}
            </label>
            <span className="govuk-hint">
                {i18n("numberFieldEditComponent.maxField.helpText")}
            </span>
            <input
                className="govuk-input govuk-input--width-3"
                data-cast="number"
                id="field-schema-max"
                data-testid="field-schema-max"
                name="maxNumber"
                value={maxNumber}
                // value={from === "NumberComponent" ? maxNumber : value}
                type="number"
                onChange={(e) => onChangeTrigger(e)}
            />
        </div>
    );
};

export const RenderPrecisionNumber = ({
    dispatch,
    from,
    handleChange,
    precisionNumber,
}) => {
    const onChangeTrigger = (e) => {
        if (from === "NumberComponent" || from === "ResultComponent") {
            dispatch({
                type: Actions.EDIT_SCHEMA_PRECISION,
                payload: e.target.value,
            });
        } else {
            handleChange(e);
        }
    };
    const title =
        from === "NumberComponent"
            ? i18n("numberFieldEditComponent.precisionField.title")
            : i18n("calculations.precisionField.title");
    const helpText =
        from === "NumberComponent"
            ? i18n("numberFieldEditComponent.precisionField.helpText")
            : i18n("calculations.precisionField.helpText");
    return (
        <div className="govuk-form-group">
            <label
                className="govuk-label govuk-label--s"
                htmlFor="field-schema-precision"
            >
                {title}
            </label>
            <span className="govuk-hint">{helpText}</span>
            <input
                className="govuk-input govuk-input--width-3"
                data-cast="number"
                id="field-schema-precision"
                data-testid="field-schema-precision"
                name="precisionNumber"
                value={precisionNumber}
                // value={from === "NumberComponent" ? precisionNumber : value}
                type="number"
                onChange={(e) => onChangeTrigger(e)}
            />
        </div>
    );
};

export function NumberFieldEdit({ context = ComponentContext }: Props) {
    // If you are editing a component, the default context will be ComponentContext because props.context is undefined,
    // but if you editing a component which is a children of a list based component, then the props.context is the ListContext.
    const { state, dispatch } = useContext(context);
    const { selectedComponent } = state;

    const [showPrefix, setShowPrefix] = useState(false);
    const [currency] = useState("");
    const [showSuffix, setShowSuffix] = useState(false);

    const { prefixType, suffixValue, schema = {} } = selectedComponent;

    useEffect(() => {
        prefixType && !showPrefix && setShowPrefix(true);
        suffixValue && !showSuffix && setShowSuffix(true);
    }, [prefixType, suffixValue]);

    const handleCheckboxChange = (e) => {
        if (e.target.value === "prefix") {
            e.target.checked ? setShowPrefix(true) : setShowPrefix(false);
            dispatch({
                type: Actions.ADD_PREFIX_TYPE,
                payload: "",
            });
            dispatch({
                type: Actions.ADD_PREFIX_VALUE,
                payload: "",
            });
        } else {
            e.target.checked ? setShowSuffix(true) : setShowSuffix(false);
            dispatch({
                type: Actions.ADD_SUFFIX,
                payload: "",
            });
        }
    };

    return (
        <>
            <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                <div className="govuk-checkboxes__item">
                    <input
                        className="govuk-checkboxes__input"
                        id="add-prefix"
                        data-testid="add-prefix"
                        name="add-prefix"
                        type="checkbox"
                        value="prefix"
                        aria-describedby="add-prefix-item-hint"
                        onChange={(e) => {
                            handleCheckboxChange(e);
                        }}
                        checked={showPrefix || prefixType ? true : false}
                    />
                    <label
                        className="govuk-label govuk-checkboxes__label"
                        htmlFor="add-prefix"
                    >
                        Add prefix
                    </label>
                    {!showPrefix && (
                        <div
                            id="nationality-item-hint"
                            className="govuk-hint govuk-checkboxes__hint"
                        >
                            Tick this box if you want to add a prefix to the
                            number component
                        </div>
                    )}
                </div>
                {showPrefix && (
                    <PrefixOptions currency={currency} context={context} />
                )}
                <div className="govuk-checkboxes__item govuk-!-margin-top-5">
                    <input
                        className="govuk-checkboxes__input"
                        id="add-suffix"
                        name="add-suffix"
                        type="checkbox"
                        value="suffix"
                        aria-describedby="add-suffix-item-hint"
                        onChange={(e) => {
                            handleCheckboxChange(e);
                        }}
                        checked={showSuffix || suffixValue ? true : false}
                    />
                    <label
                        className="govuk-label govuk-checkboxes__label"
                        htmlFor="add-suffix"
                    >
                        Add suffix
                    </label>
                    {!showSuffix && (
                        <div
                            id="nationality-item-hint"
                            className="govuk-hint govuk-checkboxes__hint govuk-!-margin-bottom-5"
                        >
                            Tick this box if you want to add a suffix to the
                            number component
                        </div>
                    )}
                </div>

                {showSuffix && (
                    <div className="govuk-form-group govuk-radios__conditional">
                        <label className="govuk-label" htmlFor="custom-suffix">
                            Enter custom suffix
                        </label>
                        <input
                            className="govuk-input govuk-input--width-10"
                            id="custom-suffix"
                            name="custom-suffix"
                            type="text"
                            key="custom-suffix"
                            value={suffixValue}
                            onChange={(e) =>
                                dispatch({
                                    type: Actions.ADD_SUFFIX,
                                    payload: e.target.value,
                                })
                            }
                        />
                    </div>
                )}
            </div>
            <details className="govuk-details">
                <summary className="govuk-details__summary">
                    <span className="govuk-details__summary-text">
                        {i18n("common.detailsLink.title")}
                    </span>
                </summary>

                <RenderMinNumber
                    minNumber={schema.min}
                    dispatch={dispatch}
                    from="NumberComponent"
                />

                <RenderMaxNumber
                    maxNumber={schema.max}
                    dispatch={dispatch}
                    from="NumberComponent"
                />

                <RenderPrecisionNumber
                    precisionNumber={schema.precision}
                    dispatch={dispatch}
                    from="NumberComponent"
                />

                <CssClasses />
            </details>
        </>
    );
}
