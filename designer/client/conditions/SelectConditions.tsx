import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import InlineConditions from "./InlineConditions";
import { ConditionsModel } from "@xgovformbuilder/model";
import { Flyout } from "../components/Flyout";
import { i18n } from "../i18n";
import { DataContext } from "../context";
import {
    allInputs,
    inputsAccessibleAt,
    hasConditions as dataHasConditions,
} from "../data";
import {
    Hint,
    LabelSizes,
    SelectFormComponent,
    Spacing,
    SpacingUnit,
} from "../ui";

interface Props {
    path: string;
    data: Data;
    conditionsChange: (selectedCondition: string) => void;
    hints: any[];
    noFieldsHintText?: string;
    selectedCondition?: string;
}

const SelectConditions: React.FC<Props> = ({
    path,
    conditionsChange,
    hints = [],
    noFieldsHintText,
    selectedCondition: initialSelectedCondition,
}) => {
    const context = useContext(DataContext);

    const fieldsForPath = (path: string) => {
        const inputs = path
            ? inputsAccessibleAt(context.data, path)
            : allInputs(context.data) ?? [];
        return inputs
            .map((input) => ({
                label: input.title,
                name: input.name,
                type: input.type,
            }))
            .reduce((obj, item) => {
                obj[item.name] = item;
                return obj;
            }, {});
    };

    const [state, setState] = useState({
        fields: fieldsForPath(path),
        inline: false,
        selectedCondition: initialSelectedCondition || "",
    });

    useEffect(() => {
        const fields = fieldsForPath(path);
        setState((prev) => ({
            ...prev,
            conditions: new ConditionsModel(),
            fields: fields,
            editView: false,
        }));
    }, [path]);

    const onClickDefineCondition = (e: React.MouseEvent) => {
        e.preventDefault();
        setState((prev) => ({
            ...prev,
            inline: true,
        }));
    };

    const onChangeConditionSelection = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value !== "none" ? e.target.value : "";
        setState((prev) => ({
            ...prev,
            selectedCondition: value,
        }));
        conditionsChange(value);
    };

    const onCancelInlineCondition = () => {
        setState((prev) => ({
            ...prev,
            inline: false,
        }));
    };

    const onSaveInlineCondition = (createdCondition: string) => {
        setState((prev) => ({
            ...prev,
            inline: false,
            selectedCondition: createdCondition,
        }));
        conditionsChange(createdCondition);
    };

    const hasConditions =
        dataHasConditions(context.data) || state.selectedCondition;
    const hasFields = Object.keys(state.fields ?? {}).length > 0;

    return (
        <div className="conditions" data-testid="select-conditions">
            <div className="govuk-form-group" id="conditions-header-group">
                <label
                    className="govuk-label govuk-label--s"
                    htmlFor="page-conditions"
                >
                    {i18n("conditions.optional")}
                </label>
                {hints.map((hint, index) => (
                    <Hint
                        key={`conditions-header-group-hint-${index}`}
                        id={`conditions-header-group-hint-${index}`}
                        text={hint}
                    />
                ))}
            </div>
            {hasFields || hasConditions ? (
                <div>
                    {hasConditions && (
                        <>
                            <SelectFormComponent
                                name="cond-select"
                                value={state.selectedCondition ?? ""}
                                onChange={onChangeConditionSelection}
                                label="Select a condition"
                                labelSize={LabelSizes.S}
                                options={context.data.conditions.map((it) => ({
                                    title: it.displayName,
                                    id: it.name,
                                    key: it.name,
                                }))}
                            />
                            <Spacing mb={SpacingUnit.Six} />
                        </>
                    )}
                    {!state.inline && (
                        <div className="govuk-form-group">
                            <a
                                href="#"
                                id="inline-conditions-link"
                                className="govuk-link"
                                onClick={onClickDefineCondition}
                            >
                                Define a new condition
                            </a>
                        </div>
                    )}
                    {state.inline && (
                        <div>
                            <Flyout
                                title="Define condition"
                                onHide={onCancelInlineCondition}
                            >
                                <InlineConditions
                                    path={path}
                                    conditionsChange={
                                        onSaveInlineCondition as any
                                    }
                                    cancelCallback={
                                        onCancelInlineCondition as any
                                    }
                                />
                            </Flyout>
                        </div>
                    )}
                </div>
            ) : (
                <div className="govuk-body">
                    <div className="govuk-hint">{noFieldsHintText}</div>
                </div>
            )}
        </div>
    );
};

export default SelectConditions;
