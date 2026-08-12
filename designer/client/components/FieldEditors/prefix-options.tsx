import React, { useContext } from "react";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Actions } from "../../reducers/component/types";
import { DataContext } from "../../context";

/* Display prefix options on Add Prefix checkbox selection in number component */
function PrefixOptions() {
    const { state, dispatch } = useContext(ComponentContext);
    const { selectedComponent } = state;
    const { options = {}, type = "" } = selectedComponent;

    /* When user clicks on Select a prefix as currency in prefix checkbox selection */
    const onPreSelect = () => {
        if (type === "Result") {
            dispatch({
                type: Actions.EDIT_OPTIONS_ADD_PREFIX_TYPE,
                payload: "select-prefix",
            });
            dispatch({
                type: Actions.EDIT_OPTIONS_ADD_PREFIX_VALUE,
                payload: "",
            });
        } else {
            dispatch({
                type: Actions.ADD_PREFIX_TYPE,
                payload: "select-prefix",
            });
            dispatch({
                type: Actions.ADD_PREFIX_VALUE,
                payload: "",
            });
        }
    };
    /* When user clicks on Enter custom prefix in prefix checkbox selection */
    const onCustomSelect = () => {
        if (type === "Result") {
            dispatch({
                type: Actions.EDIT_OPTIONS_ADD_PREFIX_TYPE,
                payload: "custom-prefix",
            });
            dispatch({
                type: Actions.EDIT_OPTIONS_ADD_PREFIX_VALUE,
                payload: "",
            });
        } else {
            dispatch({
                type: Actions.ADD_PREFIX_TYPE,
                payload: "custom-prefix",
            });
            dispatch({
                type: Actions.ADD_PREFIX_VALUE,
                payload: "",
            });
        }
    };

    /* When user selects custom prefix and type something */
    const customPrefixInput = (e) => {
        const text = e.target.value;
        if (type === "Result") {
            dispatch({
                type: Actions.EDIT_OPTIONS_ADD_PREFIX_VALUE,
                payload: text,
            });
        } else {
            dispatch({
                type: Actions.ADD_PREFIX_VALUE,
                payload: text,
            });
        }
    };

    /* When user selects Select a prefix as currency radio button we need to show currencies */
    const ShowCurrencies = () => {
        return (
            <div className="govuk-radios__conditional">
                <select
                    className="govuk-select govuk-input--width-10"
                    id="currency-list"
                    data-testid="currency-list"
                    name="currency"
                    value={
                        type === "Result"
                            ? options?.prefixValue
                            : selectedComponent.prefixValue
                    }
                    onChange={(e) => {
                        if (type === "Result") {
                            dispatch({
                                type: Actions.EDIT_OPTIONS_ADD_PREFIX_VALUE,
                                payload: e.target.value,
                            });
                        } else {
                            dispatch({
                                type: Actions.ADD_PREFIX_VALUE,
                                payload: e.target.value,
                            });
                        }
                    }}
                >
                    return (
                    <option key="select" value="">
                        select
                    </option>
                    <option key="pounds" value="£">
                        Pounds(£)
                    </option>
                    <option key="euros" value="€">
                        Euros(€)
                    </option>
                    );
                </select>
            </div>
        );
    };
    return (
        <>
            <div className="govuk-radios__conditional">
                <fieldset
                    className="govuk-fieldset"
                    aria-describedby="changed-name-hint"
                >
                    <div className="govuk-radios" data-module="govuk-radios">
                        <div className="govuk-radios__item">
                            <input
                                className="govuk-radios__input"
                                id="select-prefix"
                                name="select-prefix"
                                type="radio"
                                value="select-prefix"
                                onChange={onPreSelect}
                                checked={
                                    type === "Result"
                                        ? options?.prefixType ===
                                          "select-prefix"
                                        : selectedComponent.prefixType ===
                                          "select-prefix"
                                }
                            />
                            <label
                                className="govuk-label govuk-label--s govuk-radios__label"
                                htmlFor="select-prefix"
                            >
                                Select a prefix as currency
                            </label>
                        </div>
                        {(type === "Result"
                            ? options.prefixType === "select-prefix"
                            : selectedComponent.prefixType ===
                              "select-prefix") && <ShowCurrencies />}
                        <div className="govuk-radios__item">
                            <input
                                className="govuk-radios__input"
                                id="custom-prefix"
                                name="custom-prefix"
                                type="radio"
                                value="custom-prefix"
                                onChange={onCustomSelect}
                                checked={
                                    type === "Result"
                                        ? options?.prefixType ===
                                          "custom-prefix"
                                        : selectedComponent.prefixType ===
                                          "custom-prefix"
                                }
                            />
                            <label
                                className="govuk-label govuk-label--s govuk-radios__label"
                                htmlFor="custom-prefix"
                            >
                                Enter custom prefix
                            </label>
                        </div>
                        {(type === "Result"
                            ? options.prefixType === "custom-prefix"
                            : selectedComponent.prefixType ===
                              "custom-prefix") && (
                            <div className="govuk-radios__conditional govuk-form-group">
                                <input
                                    className="govuk-input govuk-input--width-10"
                                    id="text-input"
                                    data-testid="text-input"
                                    name="text-input"
                                    key="text-input"
                                    value={
                                        type === "Result"
                                            ? options.prefixValue
                                            : selectedComponent.prefixValue
                                    }
                                    onChange={customPrefixInput}
                                    type="text"
                                />
                            </div>
                        )}
                    </div>
                </fieldset>
            </div>
        </>
    );
}

export default PrefixOptions;
