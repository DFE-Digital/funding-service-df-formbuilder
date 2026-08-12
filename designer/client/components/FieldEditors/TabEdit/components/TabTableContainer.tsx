import React from "react";
import { i18n } from "../../../../i18n";
import { DynamicDataSetTabs } from "../types";
import Cell from "./Cell";
import InputContainer from "./InputContainer";

const t = (str: string) => i18n("tabs." + str);

type Props = {
    sections: number;
    activeCell: string;
    setActiveCell: (str: string) => void;
    dynamicDataSet: DynamicDataSetTabs;
    setDynamicDataSet: (data: DynamicDataSetTabs) => void;
};

const TabTableContainer = (props: Props) => {
    const { sections, activeCell, setActiveCell, dynamicDataSet } = props;
    return (
        <div className="tab-dynamic-table govuk-!-margin-bottom-8">
            <div
                className="table-container"
                data-testid="tab-component-dynamic-table"
            >
                <div
                    className="dynamic-table-row"
                    data-testid="tab-dynamic-table-row"
                >
                    {[...Array(sections).keys()].map((y) => (
                        <Cell
                            key={y}
                            index={`${y}`}
                            activeCell={activeCell}
                            setActiveCell={setActiveCell}
                            dynamicDataSet={dynamicDataSet}
                        />
                    ))}
                </div>
            </div>
            {activeCell ? (
                <InputContainer
                    dynamicDataSet={dynamicDataSet}
                    activeCell={activeCell}
                    setDynamicDataSet={props.setDynamicDataSet}
                />
            ) : (
                <div className="govuk-inset-text govuk-!-margin-top-0">
                    {t("selectCell")}
                </div>
            )}
        </div>
    );
};

export default TabTableContainer;
