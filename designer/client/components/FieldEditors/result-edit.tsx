import React, { useContext, useEffect, useState } from "react";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { RenderPrecisionNumber } from "./number-field-edit";
import { i18n } from "../../i18n";
import { Actions } from "../../reducers/component/types";
import PrefixOptions from "./prefix-options";
import { LabelSizes, Spacing, SpacingUnit } from "../../ui";
import { Flyout } from "../Flyout";
import ConditionsEdit from "../../conditions/ConditionsEdit";
import { RenderInPortal } from "../RenderInPortal";
import { DataContext } from "../../context";
import {
    AutocompleteFormComponent,
    AutocompleteOptions,
} from "../../ui/Input/Autocomplete";
import { computeExpression } from "./utility/expression";

const ResultEdit = () => {
    const {
        data: { pages, conditions, calculations, sections },
    } = useContext(DataContext);

    const conditionOptions: AutocompleteOptions[] = conditions.map((c) => ({
        id: c.name,
        key: c.name,
        title: c.displayName,
    }));

    const calculationOptions: AutocompleteOptions[] = calculations.map(
        (calc) => ({ id: calc.name, key: calc.name, title: calc.title })
    );

    const { state, dispatch } = useContext(ComponentContext);
    const { selectedComponent, pagePath } = state;

    const [showPrefix, setShowPrefix] = useState(
        selectedComponent?.options?.prefixValue?.length > 0
    );
    const [showSuffix, setShowSuffix] = useState(
        selectedComponent?.options?.suffixValue?.length > 0
    );

    const { calculationName, options = {}, schema = {} } = selectedComponent;

    const {
        prefixType = "",
        suffixValue = "",
        condition = "",
        hideResultOnPage,
        hideResultOnSummary,
        hideResult,
        bold,
    } = options;

    const { precision } = schema;

    const conditionId =
        conditions?.find((c) => c?.name === condition)?.name ?? "";
    const calculationId =
        calculations?.find(
            (c) => c?.name === (calculationName ?? selectedComponent.name)
        )?.name ?? "";

    const [showCondition, setShowCondition] = useState(false);

    useEffect(() => {
        !calculationName &&
            calculations?.find((c) => c?.name === selectedComponent.name) &&
            dispatch({
                type: Actions.ADD_CALCULATION,
                payload: { calculationName: selectedComponent.name },
            });
    }, []);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const handleConditionChange = (value: string) => {
        dispatch({
            type: Actions.EDIT_OPTIONS_CONDITION,
            payload: value || "",
        });
    };

    const handleCalculationChange = (calcName: string) => {
        const calc = calculations.find((c) => c.name === calcName);
        const expr =
            calc && pagePath
                ? computeExpression(calc, pagePath, pages, sections)
                : undefined;

        dispatch({
            type: Actions.ADD_CALCULATION,
            payload: { calculationName: calcName, expression: expr },
        });
    };

    const handleOnChangeHideResultOnPage = () => {
        const current = hideResult ?? hideResultOnPage;
        dispatch({
            type: Actions.EDIT_OPTIONS_HIDE_RESULT_ON_PAGE,
            payload: !current,
        });
    };

    const handleOnChangeHideResultOnSummary = () => {
        const current = hideResult ?? hideResultOnSummary;
        dispatch({
            type: Actions.EDIT_OPTIONS_HIDE_RESULT_ON_SUMMARY,
            payload: !current,
        });
    };

    const handleOnChangeBold = () => {
        dispatch({
            type: Actions.EDIT_OPTIONS_BOLD,
            payload: !bold,
        });
    };

    return (
        <div>
            <Spacing mb={SpacingUnit.Six} />
            <AutocompleteFormComponent
                name="autocompleteCalculations"
                value={calculationId}
                options={calculationOptions}
                onChange={handleCalculationChange}
                label={i18n("calculations.calculationField.title")}
                labelSize={LabelSizes.S}
                hint={i18n("calculations.calculationField.helpText")}
                headingText={i18n(
                    "calculations.calculationField.optionsHeading"
                )}
                noResultsText={i18n(
                    "calculations.calculationField.noResultsText"
                )}
                minLength={3}
                displayMenu="overlay"
                confirmOnBlur={false}
                showAllValues={false}
            />

            <Spacing mb={SpacingUnit.Six} />
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
                        className="govuk-label govuk-checkboxes__label govuk-label--s"
                        htmlFor="add-prefix"
                    >
                        {i18n("calculations.addPrefixField.title")}
                    </label>
                    {!showPrefix && (
                        <div
                            id="add-prefix-item-hint"
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
                        className="govuk-label govuk-checkboxes__label govuk-label--s"
                        htmlFor="add-suffix"
                    >
                        {i18n("calculations.addSufixField.title")}
                    </label>
                    {!showSuffix && (
                        <div
                            id="add-suffix-item-hint"
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
            <Spacing mb={SpacingUnit.Six} />
            <RenderPrecisionNumber
                precisionNumber={precision}
                dispatch={dispatch}
                from="ResultComponent"
                handleChange={undefined}
            />
            <Spacing mb={SpacingUnit.Six} />
            <div className="govuk-checkboxes__item govuk-!-margin-top-5">
                <input
                    className="govuk-checkboxes__input"
                    id="bold"
                    data-testid="bold"
                    name="bold"
                    type="checkbox"
                    aria-describedby="bold-item-hint"
                    value={bold}
                    checked={bold}
                    onChange={handleOnChangeBold}
                />
                <label
                    className="govuk-label govuk-checkboxes__label govuk-label--s"
                    htmlFor="bold"
                >
                    {i18n("calculations.boldField.title")}
                </label>
                <div
                    id="bold-item-hint"
                    className="govuk-hint govuk-checkboxes__hint"
                >
                    {i18n("calculations.boldField.helpText")}
                </div>
            </div>
            <Spacing mb={SpacingUnit.Six} />
            <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                <label
                    className="govuk-label govuk-label--s"
                    htmlFor="newlist-item"
                >
                    {i18n("calculations.hideCalculation.title")}
                </label>
                <div id="newlist-item-hint" className="govuk-hint">
                    {i18n("calculations.hideCalculation.helpText")}
                </div>
                <div className="govuk-checkboxes__item">
                    <input
                        className="govuk-checkboxes__input"
                        id="hideResultOnPage"
                        name="hideResultOnPage"
                        type="checkbox"
                        value={hideResult ?? hideResultOnPage}
                        checked={hideResult ?? hideResultOnPage}
                        onChange={handleOnChangeHideResultOnPage}
                    />
                    <label
                        className="govuk-body govuk-checkboxes__label"
                        htmlFor="hideResultOnPage"
                    >
                        {i18n("calculations.hideCalculation.hideOnPage")}
                    </label>
                </div>
                <div className="govuk-checkboxes__item">
                    <input
                        className="govuk-checkboxes__input"
                        id="hideResultOnSummary"
                        name="hideResultOnSummary"
                        type="checkbox"
                        value={hideResult ?? hideResultOnSummary}
                        checked={hideResult ?? hideResultOnSummary}
                        onChange={handleOnChangeHideResultOnSummary}
                    />
                    <label
                        className="govuk-body govuk-checkboxes__label"
                        htmlFor="hideResultOnSummary"
                    >
                        {i18n("calculations.hideCalculation.hideOnSummary")}
                    </label>
                </div>
            </div>
            <Spacing mb={SpacingUnit.Six} />
            <div className="govuk-form-group" data-testid="newlist-item">
                <AutocompleteFormComponent
                    name="autocompleteConditions"
                    value={conditionId}
                    options={conditionOptions}
                    onChange={handleConditionChange}
                    label={i18n("calculations.conditionField.title")}
                    labelSize={LabelSizes.S}
                    hint={i18n("calculations.conditionField.helpText")}
                    headingText={i18n(
                        "calculations.conditionField.optionsHeading"
                    )}
                    noResultsText={i18n(
                        "calculations.conditionField.noResultsText"
                    )}
                    minLength={3}
                    displayMenu="overlay"
                    confirmOnBlur={false}
                    showAllValues={false}
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
        </div>
    );
};

export default ResultEdit;
