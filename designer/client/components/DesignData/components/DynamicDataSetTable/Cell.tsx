import React from "react";
import { Colors, DynamicDataSet } from "../../types";
import { AddIcon, TickIcon } from "../Icons";
import { InputType } from "@xgovformbuilder/model";

type Props = {
    index: string;
    activeCell: string;
    setActiveCell: (idx: string) => void;
    dynamicTableDataSet: DynamicDataSet;
};

const Cell = (props: Props) => {
    const data = props.dynamicTableDataSet?.[props.index];
    const isActive = props.activeCell === props.index;

    const onCellClick = () => {
        props.setActiveCell(props.index);
    };
    const isFilled = data?.type === InputType.FILLED && !data?.value;
    const isCalc =
        data?.type !== InputType.FILLED && data?.calc === true && !!data.value;
    const isComplete = data?.type !== InputType.FILLED && !!data?.value;
    const classNames = `${isActive ? "cell-active" : ""} ${
        isComplete ? "cell-complete" : ""
    } ${isFilled ? "cell-filled" : ""}`;

    return (
        <div
            tabIndex={0}
            className={`cell ${classNames}`}
            onClick={onCellClick}
            data-testid="design-dynamic-table-cell"
        >
            {isComplete || isCalc || isFilled ? (
                !isFilled ? (
                    <TickIcon
                        color={
                            isComplete && isCalc ? Colors.Cyan : Colors.Green
                        }
                    />
                ) : (
                    <TickIcon color={Colors.Blue} />
                )
            ) : (
                <AddIcon />
            )}
        </div>
    );
};

export default Cell;
