import React, { useContext, useState } from "react";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { RenderPrecisionNumber } from "./number-field-edit";
import { i18n } from "../../i18n";
import { Actions } from "../../reducers/component/types";
import PrefixOptions from "./prefix-options";
import {
    LabelSizes,
    SelectInput,
    Spacing,
    SpacingUnit,
    TextFormComponent,
} from "../../ui";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    listSelector,
    setListItemCondition,
} from "../../store/reducers/listReducer";
import { Flyout } from "../Flyout";
import ConditionsEdit from "../../conditions/ConditionsEdit";
import { RenderInPortal } from "../RenderInPortal";
import { DataContext } from "../../context";

type Props = {
    errors: string; // TODO
    onSaveCalculation: (e) => void;
};

const RenderTitleAndHelptext = ({ errors, onSaveCalculation }: Props) => {
    const {
        data: { conditions },
    } = useContext(DataContext);

    const selectOptions = conditions.map((condition) => {
        return {
            id: condition.name,
            key: condition.name,
            title: condition.displayName,
        };
    });

    const { state, dispatch } = useContext(ComponentContext);
    const { selectedComponent } = state;

    const [showPrefix, setShowPrefix] = useState(
        selectedComponent?.options?.prefixValue?.length > 0
    );
    const [showSuffix, setShowSuffix] = useState(
        selectedComponent?.options?.suffixValue?.length > 0
    );

    const { options = {}, schema = {} } = selectedComponent;

    const {
        prefixType = "",
        suffixValue = "",
        condition = "",
        hideResult,
    } = options;

    const { precision } = schema;

    const { name } = conditions?.find((c) => c?.name === condition) ?? "";

    const [showCondition, setShowCondition] = useState(false);

    const handleCheckboxChange = (e) => {
        if (e.target.value === "prefix") {
            e.target.checked ? setShowPrefix(true) : setShowPrefix(false);
            dispatch({
                type: Actions.EDIT_OPTIONS_ADD_PREFIX_TYPE,
                payload: "",
            });
            dispatch({
                type: Actions.EDIT_OPTIONS_ADD_PREFIX_VALUE,
                payload: "",
            });
        } else {
            e.target.checked ? setShowSuffix(true) : setShowSuffix(false);
            const suffixType = e.target.checked ? "custom-suffix" : "";
            dispatch({
                type: Actions.EDIT_OPTIONS_ADD_SUFFIX_TYPE,
                payload: suffixType,
            });
            dispatch({
                type: Actions.EDIT_OPTIONS_ADD_SUFFIX,
                payload: "",
            });
        }
    };

    const onResultItemConditionChange = (e) => {
        if (e.target.value === "none") {
            dispatch({
                type: Actions.EDIT_OPTIONS_CONDITION,
                payload: "",
            });
            return;
        }
        dispatch({
            type: Actions.EDIT_OPTIONS_CONDITION,
            payload: e.target.value,
        });
    };

    const handleOnChangeTitle = async (e) => {
        const { value } = e.target;
        dispatch({
            type: Actions.EDIT_TITLE,
            payload: value,
        });
    };

    const handleOnChangeHint = async (e) => {
        const { value } = e.target;
        dispatch({
            type: Actions.EDIT_HELP,
            payload: value,
        });
    };

    const handleOnChangeHideResult = () => {
        dispatch({
            type: Actions.EDIT_OPTIONS_HIDE_RESULT,
            payload: !hideResult,
        });
    };

    return (
        <>
            <TextFormComponent
                name="title"
                additionalClasses="border-1"
                label={i18n("Title")}
                labelSize={LabelSizes.S}
                labelClasses="govuk-!-margin-bottom-3"
                value={selectedComponent?.title}
                onChange={handleOnChangeTitle}
                error={errors?.title && i18n(errors?.title?.children)}
            />
            <Spacing mb={SpacingUnit.Six} />
            <div className="govuk-form-group">
                <label className="govuk-body bold mb-15" htmlFor="helpText">
                    {i18n("calculations.helpTextField.title")}
                </label>
                <div id="calculation-detail-hint" className="govuk-hint">
                    {i18n("calculations.helpTextField.helpText")}
                </div>
                <textarea
                    className="govuk-textarea border-1"
                    id="helpText"
                    name="helpText"
                    rows={4}
                    aria-describedby="calculation-detail-hint"
                    value={selectedComponent?.hint}
                    onChange={handleOnChangeHint}
                />
            </div>
            <div className="govuk-checkboxes__item">
                <input
                    className="govuk-checkboxes__input"
                    id="hideResult"
                    name="hideResult"
                    type="checkbox"
                    value={hideResult}
                    checked={hideResult}
                    onChange={handleOnChangeHideResult}
                />
                <label
                    className="govuk-body govuk-checkboxes__label"
                    htmlFor="hideResult"
                >
                    {i18n("calculations.hideCalculation")}
                </label>
            </div>
            <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                <div className="govuk-checkboxes__item govuk-!-margin-top-5">
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
                        {i18n("calculations.addPrefixField.title")}
                    </label>
                    {!showPrefix && (
                        <div
                            id="nationality-item-hint"
                            className="govuk-hint govuk-checkboxes__hint"
                        >
                            {i18n("calculations.addPrefixField.helpText")}
                        </div>
                    )}
                </div>
                {showPrefix && <PrefixOptions />}
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
                        {i18n("calculations.addSufixField.title")}
                    </label>
                    {!showSuffix && (
                        <div
                            id="nationality-item-hint"
                            className="govuk-hint govuk-checkboxes__hint govuk-!-margin-bottom-5"
                        >
                            {i18n("calculations.addSufixField.helpText")}
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
                                    type: Actions.EDIT_OPTIONS_ADD_SUFFIX,
                                    payload: e.target.value,
                                })
                            }
                        />
                    </div>
                )}
            </div>
            <RenderPrecisionNumber
                precisionNumber={precision}
                dispatch={dispatch}
                from="ResultComponent"
                handleChange={undefined}
            />
            <div className="govuk-form-group" data-testid="newlist-item">
                <label
                    className="govuk-label govuk-label--s"
                    htmlFor="newlist-item"
                >
                    {i18n("list.item.conditionField.title")}
                </label>
                <div id="newlist-item-hint" className="govuk-hint">
                    {i18n("list.item.conditionField.helpText")}
                </div>
                <SelectInput
                    name="list-select-dataset"
                    id="list-select-dataset-id"
                    value={name ? name : "none"}
                    options={selectOptions}
                    onChange={onResultItemConditionChange}
                />
                <a
                    className="import-dataset-link govuk-link govuk-!-margin-top-2 govuk-body govuk-!-margin-bottom-0"
                    onClick={() => {
                        setShowCondition(!showCondition);
                    }}
                >
                    Set a new condition
                </a>
            </div>
            {showCondition && (
                <div id="edit-conditions" data-testid="edit-conditions">
                    <RenderInPortal>
                        <Flyout
                            title={i18n("conditions.addOrEdit")}
                            onHide={() => setShowCondition(false)}
                        >
                            <ConditionsEdit path={""} />
                        </Flyout>
                    </RenderInPortal>
                </div>
            )}
            <button
                id="save-calculation"
                type="submit"
                className="govuk-button calculations__mt-40"
                data-testid="save-calculation"
                title="Continue"
                onClick={onSaveCalculation}
            >
                {i18n("calculations.saveCalculation")}
            </button>
        </>
    );
};

export default RenderTitleAndHelptext;
