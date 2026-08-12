import React, {
    MouseEvent,
    ChangeEvent,
    useState,
    useEffect,
    useContext,
} from "react";
import classNames from "classnames";
import {
    ConditionsModel,
    clone,
    Item,
    FormDefinition,
    ConditionRawData,
} from "@xgovformbuilder/model";

import InlineConditionsDefinition from "./InlineConditionsDefinition";
import InlineConditionsEdit from "./inline-conditions-edit";
import { DataContext } from "../context";
import ErrorSummary, { ErrorListItem } from "../error-summary";
import { i18n } from "../i18n";
import { ErrorMessage } from "../components/ErrorMessage";
import {
    addCondition,
    allInputs,
    findList,
    inputsAccessibleAt,
    updateCondition,
} from "../data";
import randomId from "../randomId";
import { handleLinkedPropertyEffect, PropertyAction } from "../utils";

import "./inline-conditions.scss";
import LinkedPropertiesDetails from "../utils/LinkedPropertiesDetails";
import { Module } from "../utils/linkedProperties";

interface Props {
    path: string;
    condition?: any;
    cancelCallback?: (event: MouseEvent) => void;
    conditionsChange?: (event: MouseEvent) => void;
}

const yesNoValues: Readonly<Item> = [
    {
        text: "Yes",
        value: true,
    },
    {
        text: "No",
        value: false,
    },
];

export const InlineConditions: React.FC<Props> = ({
    path,
    condition,
    cancelCallback,
    conditionsChange,
}) => {
    const { data, save } = useContext(DataContext);

    const fieldsForPath = (path: string) => {
        const inputs = !!path
            ? inputsAccessibleAt(data, path)
            : allInputs(data);

        const fieldInputs = inputs?.map((input) => {
            const label = [
                data.sections?.[input.page.section]?.title,
                input.title ?? input.name,
            ]
                .filter((p) => p)
                .join(" ");

            let list;
            if (input?.list) {
                list = findList(data, input?.list);
            }

            const values =
                `${input.type}` == "YesNoField" ? yesNoValues : list?.items;

            return {
                label,
                name: input.name,
                type: input.type,
                values,
            };
        });
        const conditionsInputs = data.conditions.map((condition) => ({
            label: condition.displayName,
            name: condition.name,
            type: "Condition",
        }));

        return fieldInputs.concat(conditionsInputs).reduce((obj, item) => {
            obj[item.name] = item;
            return obj;
        }, {});
    };

    const initialConditions =
        condition && typeof condition.value === "object"
            ? ConditionsModel.from(condition.value)
            : new ConditionsModel();

    if (initialConditions.name) {
        initialConditions.name = condition.displayName;
    }

    const [editView, setEditView] = useState(false);
    const [conditions, setConditions] = useState(initialConditions);
    const [fields, setFields] = useState(fieldsForPath(path));
    const [conditionString] = useState(condition?.value);
    const [isConditionEdit, setIsConditionEdit] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ErrorListItem[]>(
        []
    );
    const [hasConditions, setHasConditions] = useState(
        conditions?.hasConditions
    );
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        if (path) {
            const fields = fieldsForPath(path);
            setConditions(new ConditionsModel());
            setFields(fields);
            setEditView(false);
        }
    }, [path]);

    useEffect(() => {
        const conditionName = condition?.displayName;
        const oldConditionsTotal = condition?.value?.conditions?.length;
        const newConditionsTotal = conditions?.asPerUserGroupings?.length;
        const newConditionName = conditions?.name;

        if (
            (conditionName !== newConditionName && !isConditionEdit) ||
            (oldConditionsTotal !== undefined &&
                oldConditionsTotal !== newConditionsTotal &&
                !isConditionEdit)
        ) {
            setIsConditionEdit(true);
        }
    }, [condition, conditions, isConditionEdit]);

    const toggleEdit = () => {
        setEditView(!editView);
    };

    const deleteCondition = (data: FormDefinition, condition: string) => {
        const results = data.conditions.filter(
            (cond) => cond.name !== condition
        );

        const selectedCondition: ConditionRawData = data.conditions.find(
            (cond) => cond.name === condition
        )!;

        const updatedData = handleLinkedPropertyEffect(
            Module.Condition,
            selectedCondition,
            PropertyAction.Deleted,
            data
        );

        return {
            ...updatedData,
            conditions: results,
        };
    };

    const onClickDelete = async (event: MouseEvent<HTMLButtonElement>) => {
        event?.preventDefault();
        if (condition) {
            const updatedData = deleteCondition(data, condition.name);
            await save(updatedData);
            setConditions(conditions.clear());
            setEditView(false);
            if (cancelCallback) {
                cancelCallback(event);
            }
        }
    };

    const validateName = () => {
        const nameError: ErrorListItem = {
            href: "#cond-name",
            children: i18n("conditions.enterName"),
        };
        const otherErrors = validationErrors.filter(
            (error) => error.href !== nameError.href
        );

        if (!conditions.name) {
            setValidationErrors([...otherErrors, nameError]);
            return true;
        }

        setValidationErrors(otherErrors);
        return false;
    };

    const onClickSave = async (event: MouseEvent<HTMLButtonElement>) => {
        event?.preventDefault();

        const nameError = validateName();

        if (nameError) {
            return;
        }

        if (condition) {
            const updatedData = updateCondition(data, condition.name, {
                displayName: conditions.name,
                value: conditions,
            });
            await save(updatedData);
            if (conditionsChange) {
                conditionsChange(event);
            }
        } else if (conditions.hasConditions) {
            const updatedData = addCondition(data, {
                displayName: conditions.name!,
                name: randomId(),
                value: conditions.toJSON(),
            });

            await save(updatedData);
            if (conditionsChange) {
                conditionsChange(event);
            }
        }
    };

    const saveCondition = (condition) => {
        setConditions(conditions.add(condition));
        setHasConditions(conditions.hasConditions);
        setIsConditionEdit(true);
    };

    const editCallback = (updatedConditions) => {
        setConditions(updatedConditions);
        setIsConditionEdit(true);
    };

    const onChangeDisplayName = (e: ChangeEvent<HTMLInputElement>) => {
        const copy = clone(conditions);
        copy.name = e.target.value;
        setConditions(copy);
    };

    const nameError = validationErrors.filter(
        (error) => error.href === "#cond-name"
    )[0];
    const hasErrors = !!validationErrors.length;

    return (
        <div
            id="inline-conditions"
            data-testid={"inline-conditions"}
            className="inline-conditions"
        >
            <div id="inline-condition-header">
                <div className="govuk-hint">
                    {i18n("conditions.addOrEditHint")}
                </div>
                {typeof conditionString === "string" && (
                    <div
                        id="condition-string-edit-warning"
                        className="govuk-warning-text"
                    >
                        <span
                            className="govuk-warning-text__icon"
                            aria-hidden="true"
                        >
                            !
                        </span>
                        <strong className="govuk-warning-text__text">
                            <span className="govuk-warning-text__assistive">
                                {i18n("warning")}
                            </span>
                            {i18n("conditions.youCannotEditWarning", {
                                conditionString,
                            })}
                        </strong>
                    </div>
                )}
                <div>
                    {hasErrors && <ErrorSummary errorList={validationErrors} />}
                    <div
                        className={classNames("govuk-form-group", {
                            "govuk-form-group--error": nameError,
                        })}
                    >
                        <label
                            className="govuk-label govuk-label--s"
                            htmlFor="cond-name"
                        >
                            {i18n("conditions.displayName")}
                        </label>
                        <div className="govuk-hint">
                            {i18n("conditions.displayNameHint")}
                        </div>
                        {nameError && (
                            <ErrorMessage>{nameError?.children}</ErrorMessage>
                        )}
                        <input
                            className={classNames(
                                "govuk-input govuk-input--width-20",
                                {
                                    "govuk-input--error": nameError,
                                }
                            )}
                            id="cond-name"
                            name="cond-name"
                            type="text"
                            value={conditions.name}
                            required
                            onChange={onChangeDisplayName}
                        />
                    </div>
                    <div>
                        <label
                            className="govuk-label govuk-label--s"
                            id="condition-string-label"
                            htmlFor="condition-string"
                        >
                            {i18n("conditions.when")}
                        </label>
                    </div>
                    <div className="govuk-hint">
                        {i18n("conditions.whenHint")}
                    </div>
                </div>
                {hasConditions && (
                    <div id="conditions-display" className="govuk-body">
                        <div
                            key="condition-string"
                            id="condition-string"
                            className="condition-string"
                        >
                            {conditions?.toPresentationString()}
                        </div>
                        {!editView && (
                            <div>
                                <a
                                    href="#"
                                    id="edit-conditions-link"
                                    className="govuk-link"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleEdit();
                                    }}
                                >
                                    {i18n("conditions.notWhatYouMean")}
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {!editView && (
                <div>
                    <InlineConditionsDefinition
                        expectsCoordinator={hasConditions}
                        fields={fields}
                        saveCallback={saveCondition}
                    />

                    {hasConditions && condition?.name && (
                        <LinkedPropertiesDetails
                            module={Module.Condition}
                            selectedComponent={condition}
                            confirm={confirmDelete}
                            setConfirm={setConfirmDelete}
                        />
                    )}

                    <div className="govuk-form-group">
                        {hasConditions && (
                            <button
                                type="submit"
                                id="save-inline-conditions"
                                className="govuk-button"
                                onClick={onClickSave}
                                disabled={isConditionEdit ? false : true}
                            >
                                {i18n("save")}
                            </button>
                        )}

                        {hasConditions && condition?.name && (
                            <button
                                className="govuk-!-margin-left-3 govuk-button govuk-button--warning"
                                type="submit"
                                disabled={!confirmDelete}
                                onClick={onClickDelete}
                            >
                                {i18n("delete")}
                            </button>
                        )}
                    </div>
                </div>
            )}
            {editView && (
                <InlineConditionsEdit
                    conditions={conditions}
                    fields={fields}
                    saveCallback={editCallback}
                    exitCallback={toggleEdit}
                />
            )}
        </div>
    );
};

export default InlineConditions;
