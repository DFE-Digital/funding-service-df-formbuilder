import React from "react";
import { Colors, DynamicDataSetTabs } from "../types";
import AddIcon from "./AddIcon";
import TickIcon from "./TickIcon";

type Props = {
    index: string;
    activeCell: string;
    setActiveCell: (idx: string) => void;
    dynamicDataSet: DynamicDataSetTabs;
};

const Cell = (props: Props) => {
    const data = props.dynamicDataSet?.[props.index] ?? {
        tabHeader: "",
        tabLabel: "",
        type: "",
        value: "",
    };
    const isActive = props.activeCell === props.index;

    const onCellClick = () => {
        props.setActiveCell(props.index);
    };
    const isComplete = !!data.value && !!data.tabHeader && !!data.tabLabel;
    const classNames = `${isActive ? "cell-active" : ""} ${
        isComplete ? "cell-complete" : ""
    }`;

    return (
        <div
            tabIndex={0}
            className={`cell ${classNames}`}
            onClick={onCellClick}
            data-testid="design-dynamic-table-cell"
        >
            {isComplete ? <TickIcon color={Colors.Green} /> : <AddIcon />}
        </div>
    );
};

export default Cell;
