import React from "react";
import { i18n } from "../../i18n";
const dataImporti18 = (key) => i18n("dataImportComp." + key);

export function RenderDataImportRadioButtons({
    onColumnSelect,
    showColumnDropdown,
    selectedColumnHeaderValue,
    showCustomColumn,
    onColumnNameSelection,
    handleCustomColumn,
    columnNames,
    from,
}) {
    return (
        <div>
            <fieldset
                className="govuk-fieldset"
                aria-describedby="changed-name-hint"
            >
                <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                        <input
                            className="govuk-radios__input"
                            id={
                                from === "dataimport"
                                    ? "select_column"
                                    : "select_column_edit"
                            }
                            name={
                                from === "dataimport"
                                    ? "select_column"
                                    : "select_column_edit"
                            }
                            type="radio"
                            onChange={onColumnSelect}
                            checked={showColumnDropdown === true ? true : false}
                            value={
                                from === "dataimport"
                                    ? "select_column"
                                    : "select_column_edit"
                            }
                        />
                        <label
                            className="govuk-label govuk-label--s govuk-radios__label"
                            htmlFor={
                                from === "dataimport"
                                    ? "select_column"
                                    : "select_column_edit"
                            }
                        >
                            {dataImporti18("columnName")}
                        </label>
                    </div>
                    {showColumnDropdown && (
                        <div className="govuk-radios__conditional govuk-radios__conditional--hidden column-names-container">
                            <select
                                className="govuk-select govuk-input--width-10"
                                id="column-names"
                                name="selectedColumnHeaderValue"
                                value={selectedColumnHeaderValue}
                                onChange={onColumnNameSelection}
                            >
                                <option value="">
                                    {i18n("dataImportComp.selectionDefaults")}
                                </option>
                                {columnNames?.map((type) => {
                                    return (
                                        <option
                                            key={type}
                                            value={type}
                                            title={type}
                                        >
                                            {type.length > 60
                                                ? `${type.substring(0, 60)}...`
                                                : type}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    )}
                    <div className="govuk-radios__item">
                        <input
                            className="govuk-radios__input"
                            id={
                                from === "dataimport"
                                    ? "custom_column"
                                    : "custom_column_edit"
                            }
                            name={
                                from === "dataimport"
                                    ? "custom_column"
                                    : "custom_column_edit"
                            }
                            type="radio"
                            checked={showCustomColumn === true ? true : false}
                            onChange={onColumnSelect}
                            value={
                                from === "dataimport"
                                    ? "custom_column"
                                    : "custom_column_edit"
                            }
                        />
                        <label
                            className="govuk-label govuk-label--s govuk-radios__label"
                            htmlFor={
                                from === "dataimport"
                                    ? "custom_column"
                                    : "custom_column_edit"
                            }
                        >
                            {dataImporti18("customColumnName")}
                        </label>
                    </div>
                    {showCustomColumn && (
                        <div className="flex-container">
                            <div className="flex-item1"></div>
                            <div className="govuk-radios__conditional govuk-radios__conditional--hidden flex-item2">
                                <input
                                    className="govuk-input govuk-input--width-10"
                                    id="custom-column-text"
                                    name="custom-column-text"
                                    value={selectedColumnHeaderValue}
                                    onChange={handleCustomColumn}
                                    type="text"
                                />
                            </div>
                            <div className="flex-item3"></div>
                        </div>
                    )}
                </div>
            </fieldset>
        </div>
    );
}

export const RenderColumnType = ({
    columnType,
    columnTypeSelection,
    selectedColumnHeaderType,
    selectedColumnHeaderValue,
    columnTypes,
}) => (
    <>
        <p className="govuk-label govuk-label--s">Select column type</p>
        <select
            className="govuk-select govuk-input--width-10"
            id="column-type"
            name="column-type"
            value={columnType}
            onChange={(e) =>
                columnTypeSelection(
                    e.target.value,
                    selectedColumnHeaderType,
                    selectedColumnHeaderValue
                )
            }
        >
            <option value="">{i18n("dataImportComp.selectionDefaults")}</option>
            {columnTypes?.map((type) => {
                return (
                    <option key={type} value={type}>
                        {type}
                    </option>
                );
            })}
        </select>
        <div className="govuk-label govuk-label--s mt-20">
            {" "}
            {i18n("dataImportComp.schemaHeader")}
        </div>
        <div className="govuk-hint">
            {i18n("dataImportComp.schemaOptionalDescription")}
        </div>
    </>
);
