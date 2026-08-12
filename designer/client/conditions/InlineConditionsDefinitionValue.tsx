import React, { useState, useContext, useEffect } from "react";
import {
    timeUnits,
    absoluteDateOrTimeOperatorNames,
    getOperatorConfig,
    relativeDateOrTimeOperatorNames,
    ConditionValue,
} from "@xgovformbuilder/model";
import RelativeTimeValues from "./inline-conditions-relative-dates";
import { AbsoluteDateValues } from "./AbsoluteDateValues";
import { AbsoluteDateTimeValues } from "./AbsoluteDateTimeValues";
import { AbsoluteTimeValues } from "./AbsoluteTimeValues";
import { TextValues } from "./TextValues";
import { SelectValues } from "./SelectValues";
import { tryParseInt } from "./inline-condition-helpers";
import { DataContext } from "../context";

function DateTimeComponent(fieldType, operator) {
    const operatorConfig = getOperatorConfig(fieldType, operator);
    const absoluteDateTimeRenderFunctions = {
        DateAndTimeField: AbsoluteDateTimeValues,
        //     DateField: AbsoluteDateValues,
        //     DatePartsField: AbsoluteDateValues,
        //     DateTimeField: AbsoluteDateTimeValues,
        //     DateTimePartsField: AbsoluteDateTimeValues,
        //     TimeField: AbsoluteTimeValues,
    };
    if (fieldType in absoluteDateTimeRenderFunctions) {
        if (absoluteDateOrTimeOperatorNames.includes(operator)) {
            //since these are all classes return a function which creates new class comp
            let CustomRendering = absoluteDateTimeRenderFunctions[fieldType];
            const pad = (num: number) => num.toString().padStart(2, "0");

            return function CustomRenderingWrapper({ value, updateValue }) {
                const transformUpdatedValue = (value) => {
                    let transformed;
                    switch (CustomRendering) {
                        case AbsoluteDateTimeValues:
                            transformed = value.toISOString();
                            break;
                        case AbsoluteDateValues:
                            const { year, month, day } = value;
                            transformed = `${pad(year)}-${pad(month)}-${pad(
                                day
                            )}`;
                            break;
                        case AbsoluteTimeValues:
                            const { hour, minute } = value;
                            transformed = `${pad(hour)}:${pad(minute)}`;
                    }
                    updateValue(new ConditionValue(transformed));
                };
                const transformInputValue = (condition?: ConditionValue) => {
                    if (condition && condition.value) {
                        switch (CustomRendering) {
                            case AbsoluteDateTimeValues:
                                // value should be an ISO format date string
                                return new Date(condition.value);
                            case AbsoluteDateValues:
                                const [
                                    year,
                                    month,
                                    day,
                                ] = condition.value.split("-");
                                return {
                                    year: tryParseInt(year),
                                    month: tryParseInt(month),
                                    day: tryParseInt(day),
                                };
                            case AbsoluteTimeValues:
                                const [hour, minute] = condition.value.split(
                                    ":"
                                );
                                return {
                                    hour: tryParseInt(hour),
                                    minute: tryParseInt(minute),
                                };
                        }
                    }
                    return undefined;
                };
                return (
                    <CustomRendering
                        value={transformInputValue(value)}
                        updateValue={transformUpdatedValue}
                    />
                );
            };
        } else if (relativeDateOrTimeOperatorNames.includes(operator)) {
            const units = operatorConfig.units;
            return function RelativeTimeValuesWrapper({ value, updateValue }) {
                return (
                    <RelativeTimeValues
                        value={value}
                        updateValue={updateValue}
                        units={units}
                        timeOnly={units === timeUnits}
                    />
                );
            };
        }
    }
    return null;
}

interface FieldDef {
    label: string;
    name: string;
    type: string;
    values?: any[];
}

interface Props {
    fieldDef: FieldDef;
    operator: string;
    value?: any;
    conditionsType?: string;
    datasetId?: string;
    updateValue: (any) => void;
    updateConditionType: (any) => void;
}

export const InlineConditionsDefinitionValue = ({
    fieldDef,
    operator,
    value,
    updateValue,
}: Props) => {
    const CustomComponent = DateTimeComponent(fieldDef?.type, operator);
    if (CustomComponent) {
        return <CustomComponent value={value} updateValue={updateValue} />;
    }
    return (fieldDef?.values?.length ?? 0) > 0 ? (
        <SelectValues
            fieldDef={fieldDef}
            operator={operator}
            value={value}
            updateValue={updateValue}
        />
    ) : (
        <TextValues
            fieldDef={fieldDef}
            operator={operator}
            value={value}
            updateValue={updateValue}
        />
    );
};

export const NewInlineConditionsDefinitions = ({
    fieldDef,
    operator,
    value,
    conditionsType,
    updateValue,
    updateConditionType,
    datasetId,
}: Props) => {
    const { data } = useContext(DataContext);
    const { importedDataSets } = data;
    const CustomComponent = DateTimeComponent(fieldDef?.type, operator);
    if (CustomComponent) {
        return <CustomComponent value={value} updateValue={updateValue} />;
    }

    function datasetFileDetails(dataset) {
        const { fileId, fileTitle } = dataset;
        return { fileId, fileTitle };
    }
    const datasets = importedDataSets?.map(datasetFileDetails);

    const [conditionType, setConditionType] = useState(conditionsType);
    useEffect(() => {
        updateConditionType(conditionsType);
    }, []);

    const onCustomSelect = () => {
        setConditionType("customCondition");
        updateConditionType("customCondition");
    };

    const onSelectDataset = () => {
        setConditionType("selectDataset");
        updateConditionType("selectDataset");
    };

    return (
        <div className="govuk-form-group govuk-!-margin-bottom-7">
            <fieldset className="govuk-fieldset">
                <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                        <input
                            className="govuk-radios__input"
                            id="custom-prefix"
                            name="custom-prefix"
                            type="radio"
                            value="custom-prefix"
                            onChange={onCustomSelect}
                            checked={conditionType === "customCondition"}
                        />
                        <label
                            className="govuk-label govuk-label--s govuk-radios__label"
                            htmlFor="custom-prefix"
                        >
                            Enter custom text
                        </label>
                    </div>
                    {conditionType === "customCondition" && (
                        <div
                            className="govuk-radios__item govuk-radios__conditional govuk-radios__conditional--hidden "
                            data-testid="design-dynamic-table-input-custom-radio"
                        >
                            <TextValues
                                fieldDef={fieldDef}
                                operator={operator}
                                value={value}
                                updateValue={updateValue}
                                type={conditionType}
                            />
                        </div>
                    )}
                    <div className="govuk-radios__item">
                        <input
                            className="govuk-radios__input"
                            id="select-prefix"
                            name="select-prefix"
                            type="radio"
                            value="select-prefix"
                            onChange={onSelectDataset}
                            checked={conditionType === "selectDataset"}
                        />
                        <label
                            className="govuk-label govuk-label--s govuk-radios__label"
                            htmlFor="select-prefix"
                        >
                            Select an imported data set
                        </label>
                    </div>
                    {conditionType === "selectDataset" && (
                        <div
                            className="govuk-radios__item govuk-radios__conditional govuk-radios__conditional--hidden "
                            data-testid="design-dynamic-table-input-custom-radio"
                        >
                            <SelectValues
                                fieldDef={fieldDef}
                                operator={operator}
                                value={value}
                                updateValue={updateValue}
                                values={datasets}
                                type={conditionType}
                                dataset={datasetId}
                            />
                        </div>
                    )}
                </div>
            </fieldset>
        </div>
    );
};
