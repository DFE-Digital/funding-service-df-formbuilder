import React, { useEffect, useState } from "react";
import { FormatType, InputType } from "@xgovformbuilder/model";
import { i18n } from "../../../../i18n";
import { SelectedDataSet, DynamicDataSet, Colors } from "../../types";
import { retrieveOptions } from "../../utils/utils";
import { TickIcon } from "../Icons";

type Props = {
    selectedDataSet: SelectedDataSet;
    activeCell: string;
    dynamicDataSet: DynamicDataSet;
    setDynamicDataSet: React.Dispatch<React.SetStateAction<DynamicDataSet>>;
};

/**
 * Translation Function
 * @param key translation key
 * @returns translated string
 */
const t = (key: string) => i18n("designData.designScreen.tableInput." + key);

const TableInput = ({
    selectedDataSet,
    activeCell,
    dynamicDataSet,
    setDynamicDataSet,
}: Props) => {
    const [selected, setSelected] = useState<InputType>(
        dynamicDataSet[activeCell]?.type ?? InputType.CUSTOM
    );
    const selectOptions = retrieveOptions(selectedDataSet);
    const onCustomTextSelect = () => setSelected(InputType.CUSTOM);
    const onSelectValueSelect = () => setSelected(InputType.SELECT);
    const onFilledEmptySelect = () => setSelected(InputType.FILLED);
    const customInputValue =
        selected === InputType.CUSTOM
            ? dynamicDataSet?.[activeCell]?.value ?? ""
            : "";
    const selectValue =
        selected === InputType.SELECT
            ? dynamicDataSet?.[activeCell]?.value ?? ""
            : "";
    const formatValue = dynamicDataSet?.[activeCell]?.format ?? "";
    const boldCheckValue = dynamicDataSet?.[activeCell]?.bold ?? false;
    const calcCheckValue = dynamicDataSet?.[activeCell]?.calc ?? false;
    const numericCheckValue = dynamicDataSet?.[activeCell]?.numeric ?? false;

    /**
     * Updates Dynamic Table State with Custom Input Value on input change
     * @param e onChange Event for HTML Input Element
     */
    const onCustomValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target?.value;
        const updatedState = {
            ...dynamicDataSet,
            [activeCell]: {
                type: InputType.CUSTOM,
                value: value ?? "",
                bold: dynamicDataSet?.[activeCell]?.bold ?? false,
                calc: dynamicDataSet?.[activeCell]?.calc ?? false,
                checked: dynamicDataSet?.[activeCell]?.checked ?? false,
                numeric: dynamicDataSet?.[activeCell]?.numeric ?? false,
                format: dynamicDataSet?.[activeCell]?.format ?? undefined,
            },
        };
        setDynamicDataSet(updatedState);
    };

    /**
     * Updates Dynamic Table State with Select Input Value on input change
     * @param e onChange Event for HTML Input Element
     */
    const onSelectValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target?.value;
        const updatedState = {
            ...dynamicDataSet,
            [activeCell]: {
                type: InputType.SELECT,
                value: value ?? "",
                bold: false,
                calc: false,
                checked: false,
                numeric: false,
                format: undefined,
            },
        };
        setDynamicDataSet(updatedState);
    };

    /**
     * Updates Dynamic Table State with Format Input Value on input change
     * @param e onChange Event for HTML Select Element
     */
    const onFormatValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target?.value;
        const formatValue = value === "" ? undefined : (value as FormatType);
        const updatedState = {
            ...dynamicDataSet,
            [activeCell]: {
                type: dynamicDataSet?.[activeCell]?.type ?? selected,
                value: dynamicDataSet?.[activeCell]?.value ?? "",
                bold: dynamicDataSet?.[activeCell]?.bold ?? false,
                calc: dynamicDataSet?.[activeCell]?.calc ?? false,
                checked: dynamicDataSet?.[activeCell]?.checked ?? false,
                numeric: dynamicDataSet?.[activeCell]?.numeric ?? false,
                format: formatValue ?? undefined,
            },
        };
        setDynamicDataSet(updatedState);
    };

    /** Assigns bold flag to a cell data */
    const onBoldCheckBoxSelect = () => {
        const existingValue = dynamicDataSet?.[activeCell]?.bold ?? false;
        const updatedState = {
            ...dynamicDataSet,
            [activeCell]: {
                type: dynamicDataSet?.[activeCell]?.type ?? selected,
                value: dynamicDataSet?.[activeCell]?.value ?? "",
                bold: !existingValue,
                calc: dynamicDataSet?.[activeCell]?.calc ?? false,
                checked: dynamicDataSet?.[activeCell]?.checked ?? false,
                numeric: dynamicDataSet?.[activeCell]?.numeric ?? false,
                format: dynamicDataSet?.[activeCell]?.format ?? undefined,
            },
        };
        setDynamicDataSet(updatedState);
    };

    /** Assigns calc flag to a cell data */
    const onCalcCheckBoxSelect = () => {
        const existingValue = dynamicDataSet?.[activeCell]?.calc ?? false;
        const updatedState = {
            ...dynamicDataSet,
            [activeCell]: {
                type: dynamicDataSet?.[activeCell]?.type ?? selected,
                value: dynamicDataSet?.[activeCell]?.value ?? "",
                bold: dynamicDataSet?.[activeCell]?.bold ?? false,
                calc: !existingValue,
                checked: dynamicDataSet?.[activeCell]?.checked ?? false,
                numeric: dynamicDataSet?.[activeCell]?.numeric ?? false,
                format: dynamicDataSet?.[activeCell]?.format ?? undefined,
            },
        };
        setDynamicDataSet(updatedState);
    };

    /** Assigns numeric flag to a cell data */
    const onNumericCheckBoxSelect = () => {
        const existingValue = dynamicDataSet?.[activeCell]?.numeric ?? false;
        const updatedState = {
            ...dynamicDataSet,
            [activeCell]: {
                type: dynamicDataSet?.[activeCell]?.type ?? selected,
                value: dynamicDataSet?.[activeCell]?.value ?? "",
                bold: dynamicDataSet?.[activeCell]?.bold ?? false,
                calc: dynamicDataSet?.[activeCell]?.calc ?? false,
                checked: dynamicDataSet?.[activeCell]?.checked ?? false,
                numeric: !existingValue,
                format: dynamicDataSet?.[activeCell]?.format ?? undefined,
            },
        };
        setDynamicDataSet(updatedState);
    };

    /** Validates dynamic data set whenever selected option changes */
    useEffect(() => {
        if (selected && activeCell) {
            if (selected === InputType.FILLED) {
                const updatedState = {
                    ...dynamicDataSet,
                    [activeCell]: {
                        type: selected,
                        value: "",
                        bold: false,
                        calc: false,
                        checked: false,
                        numeric: false,
                    },
                };
                setDynamicDataSet(updatedState);
            } else {
                const updatedState = {
                    ...dynamicDataSet,
                    [activeCell]: {
                        type: selected,
                        // Resets value only when we change the InputType, otherwise populates with previous value
                        value:
                            selected === dynamicDataSet?.[activeCell]?.type
                                ? dynamicDataSet?.[activeCell]?.value ?? ""
                                : "",
                        bold:
                            selected === dynamicDataSet?.[activeCell]?.type
                                ? dynamicDataSet?.[activeCell]?.bold ?? false
                                : false,
                        calc:
                            selected === dynamicDataSet?.[activeCell]?.type
                                ? dynamicDataSet?.[activeCell]?.calc ?? false
                                : false,
                        checked:
                            selected === dynamicDataSet?.[activeCell]?.type
                                ? dynamicDataSet?.[activeCell]?.checked ?? false
                                : false,
                        numeric:
                            selected === dynamicDataSet?.[activeCell]?.type
                                ? dynamicDataSet?.[activeCell]?.numeric ?? false
                                : false,
                        format:
                            selected === dynamicDataSet?.[activeCell]?.type
                                ? dynamicDataSet?.[activeCell]?.format ??
                                  undefined
                                : undefined,
                    },
                };
                setDynamicDataSet(updatedState);
            }
        }
    }, [selected]);

    /** Assigns exisitng selected state whenever active cell changes */
    useEffect(() => {
        setSelected(dynamicDataSet[activeCell]?.type ?? InputType.CUSTOM);
    }, [activeCell]);

    return (
        <div
            className="input-container"
            data-testid="design-dynamic-table-input-container"
        >
            <div className="govuk-form-group govuk-!-margin-bottom-7">
                <fieldset className="govuk-fieldset">
                    <div className="govuk-radios" data-module="govuk-radios">
                        <div
                            className="govuk-radios__item"
                            data-testid="design-dynamic-table-input-custom-radio"
                        >
                            <input
                                className="govuk-radios__input"
                                id="design-table-input-custom-radio"
                                name="design-table-input-custom-radio"
                                type="radio"
                                value={InputType.CUSTOM}
                                data-aria-controls="design-table-input-custom-radio-input-container"
                                onChange={onCustomTextSelect}
                                checked={selected === InputType.CUSTOM}
                            />
                            <label
                                className="govuk-label govuk-radios__label govuk-!-font-weight-bold"
                                htmlFor="design-table-input-custom-radio"
                            >
                                {t("customLabel")}
                            </label>
                        </div>
                        {selected === InputType.CUSTOM && (
                            <div
                                className="govuk-radios__conditional govuk-radios__conditional--hidden"
                                id="design-table-input-custom-radio-input-container"
                            >
                                <div
                                    className="govuk-form-group"
                                    data-testid="design-dynamic-table-input-custom-input"
                                >
                                    <label
                                        id="design-table-input-custom-radio-input-hint"
                                        className="govuk-hint"
                                        htmlFor="design-table-input-custom-radio-input"
                                    >
                                        {t("customInputHint")}
                                    </label>
                                    <input
                                        className="govuk-input govuk-input--width-20"
                                        id="design-table-input-custom-radio-input"
                                        name="design-table-input-custom-radio-input"
                                        spellCheck="false"
                                        aria-describedby="design-table-input-custom-radio-input-hint"
                                        value={customInputValue}
                                        onChange={onCustomValueChange}
                                    />
                                </div>
                            </div>
                        )}
                        <div
                            className="govuk-radios__item"
                            data-testid="design-dynamic-table-input-select-radio"
                        >
                            <input
                                className="govuk-radios__input"
                                id="design-table-input-select-radio"
                                name="design-table-input-select-radio"
                                type="radio"
                                value={InputType.SELECT}
                                data-aria-controls="design-table-input-select-radio-select-container"
                                onChange={onSelectValueSelect}
                                checked={selected === InputType.SELECT}
                            />
                            <label
                                className="govuk-label govuk-radios__label govuk-!-font-weight-bold"
                                htmlFor="design-table-input-select-radio"
                            >
                                {t("selectLabel")}
                            </label>
                        </div>
                        {selected === InputType.SELECT && (
                            <div
                                className="govuk-radios__conditional govuk-radios__conditional--hidden"
                                id="design-table-input-select-radio-select-container"
                            >
                                <div
                                    className="govuk-form-group"
                                    data-testid="design-dynamic-table-input-select-dropdown"
                                >
                                    <label
                                        id="design-table-input-select-radio-select-hint"
                                        className="govuk-hint"
                                        htmlFor="design-table-input-select-radio-select"
                                    >
                                        {t("selectHint")}
                                    </label>
                                    <select
                                        className="govuk-select"
                                        id="design-table-input-select-radio-select"
                                        name="design-table-input-select-radio-select"
                                        aria-describedby="design-table-input-select-radio-select-hint"
                                        onChange={onSelectValueChange}
                                        value={selectValue}
                                    >
                                        <option value="">{t("select")}</option>
                                        {selectOptions.map((option, idx) => (
                                            <option key={idx} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                        <div
                            className="govuk-radios__item"
                            data-testid="design-dynamic-table-input-filled-radio"
                        >
                            <input
                                className="govuk-radios__input"
                                id="design-table-input-filled-radio"
                                name="design-table-input-filled-radio"
                                type="radio"
                                value={InputType.FILLED}
                                onChange={onFilledEmptySelect}
                                checked={selected === InputType.FILLED}
                            />
                            <label
                                className="govuk-label govuk-radios__label govuk-!-font-weight-bold"
                                htmlFor="design-table-input-filled-radio"
                            >
                                {t("filledLabel")}{" "}
                                <TickIcon
                                    class="govuk-!-margin-left-1"
                                    color={Colors.Blue}
                                />
                            </label>
                        </div>
                    </div>
                </fieldset>
            </div>
            {selected !== InputType.FILLED && (
                <>
                    <div
                        className="govuk-checkboxes__item"
                        data-testid="design-dynamic-table-bold-checkbox"
                    >
                        <input
                            className="govuk-checkboxes__input"
                            id="design-table-input-bold-checkbox"
                            name="design-table-input-bold-checkbox"
                            type="checkbox"
                            value="bold"
                            checked={boldCheckValue}
                            aria-describedby="design-table-input-bold-checkbox-hint"
                            onChange={onBoldCheckBoxSelect}
                        />
                        <label
                            className="govuk-label govuk-checkboxes__label govuk-!-font-weight-bold"
                            htmlFor="design-table-input-bold-checkbox"
                        >
                            {t("boldLabel")}
                        </label>
                        <div
                            id="design-table-input-bold-checkbox-hint"
                            className="bold-checkbox-hint govuk-hint govuk-checkboxes__hint govuk-!-margin-top-1"
                        >
                            {t("boldHint")}
                        </div>
                    </div>

                    <div
                        className="govuk-checkboxes__item"
                        data-testid="design-dynamic-table-calc-checkbox"
                    >
                        <input
                            className="govuk-checkboxes__input"
                            id="design-table-input-calc-checkbox"
                            name="design-table-input-calc-checkbox"
                            type="checkbox"
                            value="calc"
                            checked={calcCheckValue}
                            aria-describedby="design-table-input-calc-checkbox-hint"
                            onChange={onCalcCheckBoxSelect}
                        />
                        <label
                            className="govuk-label govuk-checkboxes__label govuk-!-font-weight-bold"
                            htmlFor="design-table-input-calc-checkbox"
                        >
                            {t("calcLabel")}
                            <TickIcon
                                class="govuk-!-margin-left-1"
                                color={Colors.Cyan}
                            />
                        </label>
                        <div
                            id="design-table-input-calc-checkbox-hint"
                            className="calc-checkbox-hint govuk-hint govuk-checkboxes__hint govuk-!-margin-top-1"
                        >
                            {t("calcHint")}
                        </div>
                    </div>

                    <div
                        className="govuk-form-group"
                        data-testid="design-dynamic-table-input-format-dropdown"
                    >
                        <label
                            id="design-table-input-format-select-hint"
                            className="govuk-label govuk-!-font-weight-bold"
                            htmlFor="design-table-input-format-select"
                        >
                            {t("formatLabel")}
                        </label>
                        <div
                            id="design-table-input-format-select-hint"
                            className="govuk-hint"
                        >
                            {t("formatHint")}
                        </div>
                        <select
                            className="govuk-select"
                            id="design-table-input-format-select"
                            name="design-table-input-format-select"
                            aria-describedby="design-table-input-format-select-hint"
                            onChange={onFormatValueChange}
                            value={formatValue}
                        >
                            <option value={""}>{t("select")}</option>
                            <option value={FormatType.INTEGER}>
                                Whole numbers
                            </option>
                            <option value={FormatType.DECIMAL}>
                                Decimal points
                            </option>
                        </select>
                    </div>

                    <div
                        className="govuk-checkboxes__item"
                        data-testid="design-dynamic-table-numeric-checkbox"
                    >
                        <input
                            className="govuk-checkboxes__input"
                            id="design-table-input-numeric-checkbox"
                            name="design-table-input-numeric-checkbox"
                            type="checkbox"
                            value="numeric"
                            checked={numericCheckValue}
                            aria-describedby="design-table-input-numeric-checkbox-hint"
                            onChange={onNumericCheckBoxSelect}
                        />
                        <label
                            className="govuk-label govuk-checkboxes__label govuk-!-font-weight-bold"
                            htmlFor="design-table-input-numeric-checkbox"
                        >
                            {t("numericLabel")}
                        </label>
                        <div
                            id="design-table-input-numeric-checkbox-hint"
                            className="numeric-checkbox-hint govuk-hint govuk-checkboxes__hint govuk-!-margin-top-1"
                        >
                            {t("numericHint")}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TableInput;
