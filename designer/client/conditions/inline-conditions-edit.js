import React, { useState, useEffect } from "react";
import {
    ConditionGroupDef,
    toPresentationString,
    clone,
} from "@xgovformbuilder/model";
import InlineConditionsDefinition from "./InlineConditionsDefinition";
import { EditIcon, MoveDownIcon, MoveUpIcon } from "../components/Icons";

function InlineConditionsEdit({
    conditions: initialConditions,
    fields,
    saveCallback,
    exitCallback,
}) {
    const [state, setState] = useState({
        conditions: initialConditions,
        selectedConditions: [],
        editingIndex: undefined,
        editingError: undefined,
        condition: undefined,
    });

    const {
        conditions,
        selectedConditions,
        editingIndex,
        editingError,
        condition,
    } = state;

    useEffect(() => {
        setState((prevState) => ({
            ...prevState,
            conditions: initialConditions,
            selectedConditions: [],
        }));
    }, [initialConditions]);

    const onChangeCheckbox = (e) => {
        let copy = clone(selectedConditions ?? []);
        const index = Number(e.target.value);
        if (e.target.checked) {
            copy.push(index);
        } else {
            copy = copy.filter((it) => it !== index);
        }
        setState((prev) => ({
            ...prev,
            selectedConditions: copy,
        }));
    };

    const groupWithConsecutiveConditions = (selectedConditions) => {
        const result = [];
        selectedConditions.sort((a, b) => a - b);
        selectedConditions.forEach((condition) => {
            const groupForCondition = result.find(
                (group) =>
                    group.includes(condition - 1) ||
                    group.includes(condition + 1)
            );
            if (groupForCondition) {
                groupForCondition.push(condition);
            } else {
                result.push([condition]);
            }
        });
        return result;
    };

    const onClickGroup = (e) => {
        e?.preventDefault();
        if (selectedConditions?.length < 2) {
            setState((prev) => ({
                ...prev,
                editingError: "Please select at least 2 items for grouping",
            }));
        } else {
            const groups = groupWithConsecutiveConditions(selectedConditions);
            if (groups.find((group) => group.length === 1)) {
                setState((prev) => ({
                    ...prev,
                    editingError: "Please select consecutive items to group",
                }));
            } else {
                const updatedConditions = conditions.addGroups(
                    groups
                        .sort((a, b) => a - b)
                        .reduce((groupDefs, group) => {
                            groupDefs.push(
                                new ConditionGroupDef(
                                    group[0],
                                    group[group.length - 1]
                                )
                            );
                            return groupDefs;
                        }, [])
                );
                setState((prev) => ({
                    ...prev,
                    editingError: undefined,
                    selectedConditions: [],
                    conditions: updatedConditions,
                }));
                saveCallback(updatedConditions);
            }
        }
    };

    const onClickRemove = (e) => {
        e?.preventDefault();
        if (selectedConditions?.length < 1) {
            setState((prev) => ({
                ...prev,
                editingError: "Please select at least 1 item to remove",
            }));
        } else {
            const updatedConditions = conditions.remove(selectedConditions);
            setState((prev) => ({
                ...prev,
                editingError: undefined,
                selectedConditions: [],
                conditions: updatedConditions,
                condition: undefined,
            }));
            saveCallback(updatedConditions);
            if (!updatedConditions.hasConditions) {
                exitCallback();
            }
        }
    };

    const onClickCancelEditView = (e) => {
        e?.preventDefault();
        setState((prev) => ({
            ...prev,
            selectedConditions: [],
            editingIndex: undefined,
        }));
        exitCallback();
    };

    const onClickSplit = (index) => {
        const updatedConditions = conditions.splitGroup(index);
        setState((prev) => ({
            ...prev,
            conditions: updatedConditions,
        }));
        saveCallback(updatedConditions);
    };

    const onClickEdit = (index) => {
        const conditionsList = conditions.asPerUserGroupings;
        if (conditionsList.length > index) {
            setState((prev) => ({
                ...prev,
                editingIndex: index,
                condition: Object.assign({}, conditionsList[index]),
            }));
        }
    };

    const moveConditionEarlier = (event) => {
        event.preventDefault();
        const index = event.currentTarget.dataset.index;
        const updatedConditions = conditions.moveEarlier(index);
        setState((prev) => ({
            ...prev,
            conditions: updatedConditions,
            selectedConditions: [],
        }));
        saveCallback(updatedConditions);
    };

    const moveConditionLater = (event) => {
        event.preventDefault();
        const index = event.currentTarget.dataset.index;
        const updatedConditions = conditions.moveLater(index);
        setState((prev) => ({
            ...prev,
            conditions: updatedConditions,
            selectedConditions: [],
        }));
        saveCallback(updatedConditions);
    };

    const saveCondition = (condition) => {
        const updatedConditions = conditions.replace(editingIndex, condition);
        setState((prev) => ({
            ...prev,
            conditions: updatedConditions,
            condition: undefined,
            editingIndex: undefined,
        }));
        saveCallback(updatedConditions);
    };

    return (
        <div id="edit-conditions">
            {!editingIndex && editingIndex !== 0 && (
                <fieldset className="govuk-fieldset">
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                        Amend conditions
                    </legend>
                    {editingError && (
                        <span
                            id="conditions-error"
                            className="govuk-error-message"
                        >
                            <span className="govuk-visually-hidden">
                                Error:
                            </span>{" "}
                            {editingError}
                        </span>
                    )}
                    <div id="editing-checkboxes" className="govuk-checkboxes">
                        {conditions.asPerUserGroupings.map(
                            (condition, index) => (
                                <div
                                    key={`condition-checkbox-${index}`}
                                    className="govuk-checkboxes__item"
                                    style={{ display: "flex" }}
                                >
                                    <input
                                        type="checkbox"
                                        className="govuk-checkboxes__input"
                                        id={`condition-${index}`}
                                        name={`condition-${index}`}
                                        value={index}
                                        onChange={onChangeCheckbox}
                                        checked={
                                            selectedConditions?.includes(
                                                index
                                            ) || ""
                                        }
                                    />
                                    <label
                                        className="govuk-label govuk-checkboxes__label"
                                        htmlFor={`condition-${index}`}
                                    >
                                        {toPresentationString(condition)}
                                    </label>
                                    <span
                                        id={`condition-${index}-actions`}
                                        style={{
                                            display: "inline-flex",
                                            flexGrow: 1,
                                        }}
                                    >
                                        {condition.isGroup() && (
                                            <span style={{ flexGrow: 1 }}>
                                                <a
                                                    href="#"
                                                    id={`condition-${index}-split`}
                                                    className="govuk-link"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        onClickSplit(index);
                                                    }}
                                                >
                                                    Split
                                                </a>
                                            </span>
                                        )}
                                        {!condition.isGroup() && (
                                            <span style={{ flexGrow: 1 }}>
                                                <a
                                                    href="#"
                                                    id={`condition-${index}-edit`}
                                                    className="govuk-link"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        onClickEdit(index);
                                                    }}
                                                >
                                                    <EditIcon bottom={true} />
                                                </a>
                                            </span>
                                        )}
                                        {index > 0 && (
                                            <span>
                                                <a
                                                    href="#"
                                                    id={`condition-${index}-move-earlier`}
                                                    data-index={index}
                                                    onClick={
                                                        moveConditionEarlier
                                                    }
                                                >
                                                    <MoveUpIcon />
                                                </a>
                                            </span>
                                        )}
                                        {index < conditions.lastIndex && (
                                            <span>
                                                <a
                                                    href="#"
                                                    className="govuk-link"
                                                    id={`condition-${index}-move-later`}
                                                    data-index={index}
                                                    onClick={moveConditionLater}
                                                >
                                                    <MoveDownIcon />
                                                </a>
                                            </span>
                                        )}
                                    </span>
                                </div>
                            )
                        )}
                    </div>
                    <div className="govuk-form-group" id="group-and-remove">
                        {selectedConditions?.length > 1 && (
                            <span>
                                <a
                                    href="#"
                                    id="group-conditions"
                                    className="govuk-link"
                                    onClick={onClickGroup}
                                >
                                    Group
                                </a>{" "}
                                /
                            </span>
                        )}
                        {selectedConditions?.length > 0 && (
                            <a
                                href="#"
                                id="remove-conditions"
                                className="govuk-link"
                                onClick={onClickRemove}
                            >
                                Remove
                            </a>
                        )}
                    </div>
                </fieldset>
            )}
            {editingIndex >= 0 && (
                <InlineConditionsDefinition
                    expectsCoordinator={editingIndex > 0}
                    fields={fields}
                    condition={condition}
                    saveCallback={saveCondition}
                />
            )}
            <div className="govuk-form-group">
                <a
                    href="#"
                    id="cancel-edit-inline-conditions-link"
                    className="govuk-link"
                    onClick={onClickCancelEditView}
                >
                    Finished editing
                </a>
            </div>
        </div>
    );
}

export default InlineConditionsEdit;
