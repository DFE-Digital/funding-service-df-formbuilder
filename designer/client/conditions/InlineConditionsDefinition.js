import React, { useState, useEffect } from "react";
import {
    Condition,
    ConditionField,
    ConditionRef,
    conditionValueFrom,
    getOperatorNames,
    clone,
} from "@xgovformbuilder/model";
import { i18n } from "../i18n";

import {
    InlineConditionsDefinitionValue,
    NewInlineConditionsDefinitions,
} from "./InlineConditionsDefinitionValue";
import { DesignerApi } from "../api/designerApi";

function isCondition(fieldDef) {
    return fieldDef?.type === "Condition";
}

function InlineConditionsDefinition({
    condition: initialCondition,
    expectsCoordinator,
    fields,
    saveCallback,
    conditionsChange,
}) {
    const [state, setState] = useState({
        condition: clone(initialCondition) || {},
        fileId: "",
    });

    useEffect(() => {
        const { condition } = state;
        const newCondition = fields[condition?.field?.name]
            ? state.condition
            : {};
        setState((prevState) => ({
            ...prevState,
            condition: newCondition,
        }));
    }, [expectsCoordinator, fields]);

    const onChangeCoordinator = (e) => {
        const input = e.target;
        let newCondition = {};

        if (input.value && input.value.trim() !== "") {
            newCondition = clone(state.condition ?? {});
            newCondition.coordinator = input.value;
        }
        setState((prevState) => ({
            ...prevState,
            condition: newCondition,
        }));
    };

    const updateFormulaForCondition = async (condition) => {
        const designerApi = new DesignerApi();
        if (condition?.conditionType === "selectDataset") {
            const fileId = condition?.value?.value;
            setState((prevState) => ({
                ...prevState,
                fileId: fileId,
            }));
            const dataSet = await designerApi.getDataSet(fileId);
            const values = dataSet.map((value) => value.establishment_UKPRN);
            updateConditionFormula(condition, values);
        }
    };

    const onClickFinalise = () => {
        const { condition, fileId } = state;

        setState((prevState) => ({
            ...prevState,
            condition: {},
        }));

        const fieldDef = fields[condition.field.name];
        if (isCondition(fieldDef) && !condition?.datasets?.length > 0) {
            saveCallback(
                new ConditionRef(
                    fieldDef.name,
                    fieldDef.label,
                    condition.coordinator
                )
            );
        } else {
            if (condition?.datasets?.length > 0) {
                condition?.datasets?.map((dataset, index) => {
                    condition.value = {
                        display: dataset.toString(),
                        type: "Value",
                        value: dataset.toString(),
                    };
                    if (index !== 0) {
                        if (condition.operator === "is") {
                            condition.coordinator = "or";
                        } else if (condition.operator === "is not") {
                            condition.coordinator = "and";
                        }
                    }
                    condition.conditionType = "selectDataset";
                    saveCallback(
                        new Condition(
                            ConditionField.from(condition.field),
                            condition.operator,
                            conditionValueFrom(condition.value),
                            condition.conditionType,
                            condition.coordinator,
                            fileId
                        )
                    );
                });
            } else {
                saveCallback(
                    new Condition(
                        ConditionField.from(condition.field),
                        condition.operator,
                        conditionValueFrom(condition.value),
                        condition.conditionType,
                        condition.coordinator
                    )
                );
            }
        }
    };

    const onChangeField = (e) => {
        debugger;
        const input = e.target;
        const fieldName = input.value;
        const { condition } = state;
        const currentField = condition.field?.name;
        const currentOperator = condition.operator;
        const fieldDef = fields[fieldName];

        _updateCondition(condition, (c) => {
            if (fieldName) {
                if (isCondition(fieldDef)) {
                    delete c.value;
                    delete c.operator;
                } else {
                    if (
                        currentField &&
                        fields[currentField].values !== fieldDef.values
                    ) {
                        delete c.value;
                    }
                    if (
                        currentOperator &&
                        !getOperatorNames(fieldName).includes(currentOperator)
                    ) {
                        delete c.operator;
                    }
                }
                c.field = {
                    name: fieldName,
                    display: fieldDef.label,
                    type: fieldDef.type,
                };
            } else {
                delete c.field;
                delete c.operator;
                delete c.value;
            }
        });
    };

    const _updateCondition = (condition, updates) => {
        const copy = clone(condition);
        updates(copy);
        setState((prevState) => ({
            ...prevState,
            condition: copy,
        }));
    };

    const onChangeOperator = (e) => {
        const input = e.target;
        const { condition } = state;

        _updateCondition(condition, (c) => {
            c.operator = input.value;
        });
    };

    const updateValue = (newValue) => {
        const { condition } = state;
        if (condition.conditionType === "selectDataset") {
            const updatedCondition = {
                ...condition,
                value: newValue,
            };
            updateFormulaForCondition(updatedCondition);
        }

        _updateCondition(condition, (c) => {
            c.value = newValue;
        });
    };

    const updateConditionType = (conditionType) => {
        const { condition } = state;
        _updateCondition(condition, (c) => {
            c.conditionType = conditionType;
        });
    };

    const updateConditionFormula = (condition, values) => {
        _updateCondition(condition, (c) => {
            c.datasets = values;
        });
    };

    const customSetState = (newState, callback) => {
        if (newState.conditions || newState.selectedCondition !== undefined) {
            conditionsChange(newState.conditions, newState.selectedCondition);
        }
        setState((prevState) => ({
            ...prevState,
            ...newState,
        }));
        if (callback) callback();
    };

    const { condition } = state;
    const fieldDef = fields[condition.field?.name];
    const allowedTypes = [
        "TextField",
        "TelephoneNumberField",
        "NumberField",
        "EmailAddressField",
        "DateAndTimeField",
        // "TimeField",
        // "DateField",
        // "DateTimeField",
        // "DatePartsField",
        // "DateTimePartsField",
        // "MonthYearField",
        "MultilineTextField",
        "RadiosField",
        "CheckboxesField",
        "AutocompleteField",
        "SelectField",
        "YesNoField",
        "UkAddressField",
        "Result",
        "DSIAccess",
    ];
    const filteredFields = Object.values(fields).filter((field) =>
        allowedTypes.includes(field.type)
    );

    return (
        <div className="govuk-form-group" id="condition-definition-group">
            {expectsCoordinator && (
                <div className="govuk-form-group" id="cond-coordinator-group">
                    <select
                        className="govuk-select"
                        id="cond-coordinator"
                        name="cond-coordinator"
                        value={condition?.coordinator ?? ""}
                        onChange={onChangeCoordinator}
                    >
                        <option />
                        <option key="and" value="and">
                            And
                        </option>
                        <option key="or" value="or">
                            Or
                        </option>
                    </select>
                </div>
            )}
            {(condition.coordinator || !expectsCoordinator) && (
                <div id="condition-definition-inputs">
                    <select
                        className="govuk-select"
                        id="cond-field"
                        name="cond-field"
                        value={condition?.field?.name ?? "Component name"}
                        onChange={onChangeField}
                    >
                        <option key="-1" value="-1">
                            Component name
                        </option>
                        {filteredFields.map((field, index) => (
                            <option
                                key={`${field.name}-${index}`}
                                value={field.name}
                            >
                                {field.label}
                            </option>
                        ))}
                    </select>

                    <br />
                    <br />

                    <select
                        className="govuk-select"
                        id="cond-operator"
                        name="cond-operator"
                        value={condition?.operator ?? "Condition variable"}
                        onChange={onChangeOperator}
                    >
                        <option key="-1" value="-1">
                            Condition variable
                        </option>
                        {getOperatorNames(fieldDef?.type).map((conditional) => {
                            return (
                                <option
                                    key={`${condition?.field}-${conditional}`}
                                    value={conditional}
                                >
                                    {conditional}
                                </option>
                            );
                        })}
                    </select>

                    <br />
                    <br />

                    <NewInlineConditionsDefinitions
                        fieldDef={fieldDef}
                        value={condition?.value}
                        operator={condition?.operator}
                        conditionsType={
                            condition?.conditionType ?? "customCondition"
                        }
                        updateValue={updateValue}
                        updateConditionType={updateConditionType}
                        datasetId={condition?.datasetId}
                    />

                    {(condition.value || isCondition(fieldDef)) && (
                        <div className="govuk-form-group">
                            <button
                                id="save-condition"
                                className="govuk-link"
                                onClick={onClickFinalise}
                            >
                                {i18n("add")}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default InlineConditionsDefinition;
