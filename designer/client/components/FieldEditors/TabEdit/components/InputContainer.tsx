import { TabInputType } from "@xgovformbuilder/model";
import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../../../../context";
import { i18n } from "../../../../i18n";
import { DynamicDataSetTabs } from "../types";

const t = (str: string) => i18n("tabs.tabsInput." + str);

type Props = {
    dynamicDataSet: DynamicDataSetTabs;
    activeCell: string;
    setDynamicDataSet: (data: DynamicDataSetTabs) => void;
};

const InputContainer = ({
    dynamicDataSet,
    activeCell,
    setDynamicDataSet,
}: Props) => {
    const { data } = useContext(DataContext);
    const designedDataSets = data?.designedDataSets ?? [];
    const cellData = dynamicDataSet?.[activeCell] ?? {
        tabHeader: "",
        tabLabel: "",
        type: null,
        value: "",
    };
    const [selected, setSelected] = useState<TabInputType>(
        cellData?.type ?? TabInputType.SELECT_DATASET
    );

    const onSelectDatasetValueSelect = () => {
        setSelected(TabInputType.SELECT_DATASET);
        setDynamicDataSet({
            ...dynamicDataSet,
            [activeCell]: {
                tabLabel: cellData.tabLabel,
                tabHeader: cellData.tabHeader,
                type: TabInputType.SELECT_DATASET,
                value: "",
            },
        });
    };

    const onParagraphTextSelect = () => {
        setSelected(TabInputType.PARAGRAPH);
        setDynamicDataSet({
            ...dynamicDataSet,
            [activeCell]: {
                tabLabel: cellData.tabLabel,
                tabHeader: cellData.tabHeader,
                type: TabInputType.PARAGRAPH,
                value: "",
            },
        });
    };

    const onTabLabelValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDynamicDataSet({
            ...dynamicDataSet,
            [activeCell]: {
                tabLabel: e.target.value,
                tabHeader: cellData.tabHeader,
                type: cellData.type,
                value: cellData.value,
            },
        });
    };

    const onTabHeaderValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDynamicDataSet({
            ...dynamicDataSet,
            [activeCell]: {
                tabLabel: cellData.tabLabel,
                tabHeader: e.target.value,
                type: cellData.type,
                value: cellData.value,
            },
        });
    };

    const onSelectValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setDynamicDataSet({
            ...dynamicDataSet,
            [activeCell]: {
                tabLabel: cellData.tabLabel,
                tabHeader: cellData.tabHeader,
                type: TabInputType.SELECT_DATASET,
                value: e.target.value,
            },
        });
    };

    const onParagraphValueChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        setDynamicDataSet({
            ...dynamicDataSet,
            [activeCell]: {
                tabLabel: cellData.tabLabel,
                tabHeader: cellData.tabHeader,
                type: TabInputType.PARAGRAPH,
                value: e.target.value,
            },
        });
    };

    /** Assigns exisitng selected state whenever active cell changes */
    useEffect(() => {
        setSelected(
            dynamicDataSet[activeCell]?.type ?? TabInputType.SELECT_DATASET
        );
    }, [activeCell]);

    return (
        <div
            className="input-container"
            data-testid="design-dynamic-tab-input-container"
        >
            <div className="govuk-form-group govuk-!-margin-bottom-7">
                <fieldset className="govuk-fieldset tabs">
                    <div data-test-id="standard-inputs" className="tab-texts">
                        <div
                            className="govuk-form-group"
                            data-testid="design-dynamic-table-input-custom-input"
                        >
                            <label
                                className="govuk-label tabs govuk-!-font-weight-bold"
                                htmlFor="design-table-input-custom-radio"
                            >
                                {t("tabLabel")}
                            </label>
                            <label
                                id="design-table-input-custom-radio-input-hint"
                                className="govuk-hint"
                                htmlFor="design-table-input-custom-radio-input"
                            >
                                {t("tabLabelHint")}
                            </label>
                            <input
                                className="govuk-input govuk-input--width-20"
                                id="tab-label"
                                data-testid="input-tab-label"
                                name="design-table-input-custom-radio-input"
                                spellCheck="false"
                                aria-describedby="design-table-input-custom-radio-input-hint"
                                value={cellData.tabLabel}
                                onChange={onTabLabelValueChange}
                                type="text"
                            />
                        </div>
                        <div
                            className="govuk-form-group govuk-!-margin-bottom-6"
                            data-testid="design-dynamic-table-input-custom-input"
                        >
                            <label
                                className="govuk-label tabs govuk-!-font-weight-bold"
                                htmlFor="design-table-input-custom-radio"
                            >
                                {t("tabHeader")}
                            </label>
                            <label
                                id="design-table-input-custom-radio-input-hint"
                                className="govuk-hint"
                                htmlFor="design-table-input-custom-radio-input"
                            >
                                {t("tabHeaderHint")}
                            </label>
                            <input
                                className="govuk-input govuk-input--width-20"
                                id="tab-header"
                                data-testid="input-tab-header"
                                name="design-table-input-custom-radio-input"
                                spellCheck="false"
                                aria-describedby="design-table-input-custom-radio-input-hint"
                                value={cellData.tabHeader}
                                onChange={onTabHeaderValueChange}
                            />
                        </div>
                    </div>
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
                                value={TabInputType.SELECT_DATASET}
                                data-aria-controls="design-table-input-custom-radio-input-container"
                                onChange={onSelectDatasetValueSelect}
                                checked={
                                    selected === TabInputType.SELECT_DATASET
                                }
                            />
                            <label
                                className="govuk-label govuk-radios__label govuk-!-font-weight-bold"
                                htmlFor="design-table-input-custom-radio"
                            >
                                {t("customLabel")}
                            </label>
                        </div>
                        {selected === TabInputType.SELECT_DATASET && (
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
                                    <select
                                        className="govuk-select"
                                        id="tab-select"
                                        data-testid="input-tab-select-dataset"
                                        name="imported-dataset-select"
                                        aria-describedby="imported-dataset-select-hint"
                                        onChange={onSelectValueChange}
                                        value={cellData.value}
                                    >
                                        <option value="">{t("select")}</option>
                                        {designedDataSets?.map((dataset) => (
                                            <option
                                                key={dataset.id}
                                                value={dataset.id}
                                            >
                                                {dataset.title}
                                            </option>
                                        ))}
                                    </select>
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
                                value={TabInputType.PARAGRAPH}
                                data-aria-controls="design-table-input-select-radio-select-container"
                                onChange={onParagraphTextSelect}
                                checked={selected === TabInputType.PARAGRAPH}
                            />
                            <label
                                className="govuk-label govuk-radios__label govuk-!-font-weight-bold"
                                htmlFor="design-table-input-select-radio"
                            >
                                {t("selectLabel")}
                            </label>
                        </div>
                        {selected === TabInputType.PARAGRAPH && (
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
                                    <textarea
                                        className="govuk-textarea"
                                        id="tab-paragraph"
                                        data-testid="input-tab-paragraph"
                                        name="content"
                                        rows={5}
                                        value={cellData.value}
                                        onChange={onParagraphValueChange}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </fieldset>
            </div>
        </div>
    );
};

export default InputContainer;
