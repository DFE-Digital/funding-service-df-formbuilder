import React, { useState, useContext } from "react";
import { i18n } from "../../i18n";
import { ListFormatOptions } from "@xgovformbuilder/model";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Options } from "../../reducers/component/types";

/** Format options available to display list */
const formatOptions = [
    {
        label: "list.selectFormat.format.bullets",
        value: ListFormatOptions.BULLETS,
    },
    {
        label: "list.selectFormat.format.numbered",
        value: ListFormatOptions.NUMBERED_ITEMS,
    },
    {
        label: "list.selectFormat.format.links",
        value: ListFormatOptions.LINKS,
    },
];

/** Generates radio buttons to select a format type for the list component*/
function ListFormatEdit() {
    const { state, dispatch } = useContext(ComponentContext);
    const { selectedComponent } = state;
    const options = selectedComponent?.options ?? {};
    const format = options?.format ?? "";

    const onChangeHandler = (e) => {
        dispatch({
            type: Options.EDIT_OPTIONS_LIST_FORMAT,
            payload: e.target.value,
        });
    };

    return (
        <div className="govuk-form-group">
            <label
                htmlFor="field-list-types"
                className="govuk-label govuk-label--s"
            >
                {i18n("list.selectFormat.title")}
            </label>
            <span className="govuk-hint">
                {i18n("list.selectFormat.helpText")}
            </span>
            <div className="govuk-form-group">
                <fieldset className="govuk-fieldset">
                    <div className="govuk-radios" data-module="govuk-radios">
                        {formatOptions.map((option) => (
                            <div
                                className="govuk-radios__item"
                                key={option.value}
                            >
                                <input
                                    className="govuk-radios__input"
                                    id={option.value}
                                    name="list-type"
                                    type="radio"
                                    value={option.value}
                                    onChange={onChangeHandler}
                                    checked={format === option.value}
                                />
                                <label
                                    className="govuk-label govuk-radios__label"
                                    htmlFor="bullets"
                                >
                                    {i18n(option.label)}
                                </label>
                            </div>
                        ))}
                    </div>
                </fieldset>
            </div>
        </div>
    );
}

export default ListFormatEdit;
