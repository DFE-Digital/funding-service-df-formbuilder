import React, { useState } from "react";
import { i18n } from "../../../../i18n";
import { DynamicDataSet, SelectedDataSet } from "../../types";
import TableInput from "./TableInput";
import Cell from "./Cell";

/**
 * Translation Function
 * @param key translation key
 * @returns translated string
 */
const t = (key: string) => i18n("designData.designScreen." + key);

type Props = {
    selectedDataSet: SelectedDataSet;
    dynamicTableDataSet: DynamicDataSet;
    setDynamicDataSet: React.Dispatch<React.SetStateAction<DynamicDataSet>>;
    tableDimension: {
        rows: number;
        columns: number;
    };
};

const DynamicDataSetTable = (props: Props) => {
    const { rows, columns } = props.tableDimension;
    const [activeCell, setActiveCell] = useState("");
    return (
        <div className="dynamic-table" data-testid="design-dynamic-table">
            <div
                className="table-container"
                data-testid="design-dynamic-table-container"
            >
                {[...Array(rows).keys()].map((x) => (
                    <div
                        key={x + 1}
                        className="dynamic-table-row"
                        data-testid="design-dynamic-table-row"
                    >
                        {[...Array(columns).keys()].map((y) => (
                            <Cell
                                key={`${x + 1}-${y + 1}`}
                                index={`${x + 1}-${y + 1}`}
                                activeCell={activeCell}
                                setActiveCell={setActiveCell}
                                dynamicTableDataSet={props.dynamicTableDataSet}
                            />
                        ))}
                    </div>
                ))}
            </div>
            {activeCell ? (
                <TableInput
                    selectedDataSet={props.selectedDataSet}
                    dynamicDataSet={props.dynamicTableDataSet}
                    activeCell={activeCell}
                    setDynamicDataSet={props.setDynamicDataSet}
                />
            ) : (
                <div>
                    <div className="govuk-inset-text">{t("selectCell")}</div>
                </div>
            )}
        </div>
    );
};

export default DynamicDataSetTable;
