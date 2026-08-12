import React, { forwardRef, useEffect, useState } from "react";
import classNames from "classnames";
import { Generics, GenericsColor, TextInput, TextInputWidth } from "..";

import type { ComputeUnit } from "../../store/types";
import { useAppDispatch } from "../../store/hooks";
import {
    updateNumberValue,
    updateOperatorValue,
} from "../../store/reducers/calculationBuilderReducer";

import computeUnitBlockStyles from "./ComputeUnitBlock.module.scss";
import ComputeTooltip from "./ComputeTooltip";

type Props = {
    unit: ComputeUnit;
    insertPosition?: Position;
    style?: React.CSSProperties;
    active?: boolean;
    clone: boolean;
    showTooltip?: boolean;
    isEdit?: boolean;
};

export enum Position {
    Before = -1,
    After = 1,
}

const ComputeUnitBlock = forwardRef<HTMLDivElement, Props>(function UnitBlock(
    props: Props,
    ref
) {
    const {
        unit,
        insertPosition,
        active,
        clone,
        style,
        showTooltip,
        isEdit,
    } = props;

    const dispatch = useAppDispatch();

    const [operatorValue, setOperatorValue] = useState<string>(
        unit.type === "operator" && (unit as any).value
            ? (unit as any).value
            : ""
    );
    const [numberValue, setNumberValue] = useState<string>(
        unit.type === "number" &&
            unit.value != null &&
            Number.isFinite(Number(unit.value))
            ? unit.value.toString()
            : ""
    );

    useEffect(() => {
        // initialize local input state when the unit changes (by id).
        if (unit.type === "number") {
            setNumberValue(
                unit.type === "number" &&
                    unit.value != null &&
                    Number.isFinite(Number(unit.value))
                    ? unit.value.toString()
                    : ""
            );
        }
        if (unit.type === "operator") {
            setOperatorValue((unit as any).value ?? "");
        }
        // only re-run when the unit identity changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unit.id]);

    const handleDoubleClickFocus = (e: React.MouseEvent) => {
        // find an input within this unit and focus it on double click
        const root = e.currentTarget as HTMLElement;
        const input = root.querySelector("input") as HTMLInputElement | null;
        if (input) {
            input.focus();
            if (input.select) input.select();
        }
    };

    const onMouseDownHandle = (e: React.MouseEvent) => {
        // prevent native focusing of input on single click
        const target = e.target as HTMLElement | null;
        if (target && target.closest && target.closest("input")) {
            e.preventDefault();
            // focus the wrapper instead on single-click
            (e.currentTarget as HTMLElement).focus();
        }
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        // Allow empty string, or an optional leading - and digits with optional decimal
        if (/^-?\d*\.?\d*$/.test(v)) {
            setNumberValue(v);
            // Immediately parse and dispatch the numeric value so updates happen while typing
            const raw = v.trim();
            const parsed = raw === "" ? null : parseFloat(raw);
            const current = unit.value as number | null;
            // Only dispatch when value actually changes to avoid noise
            if (
                !((current === null && parsed === null) || current === parsed)
            ) {
                const mode = isEdit ?? false;
                dispatch(
                    updateNumberValue({
                        id: unit.id,
                        value: parsed,
                        isEdit: mode,
                    })
                );
            }
        }
    };

    const handleOperatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        // Allow empty string, or exactly one of + - * / %
        if (v === "" || /^[+\-*\/\%\-]$/.test(v)) {
            setOperatorValue(v);
            const current = (unit as any).value as string | null;
            const parsed = v === "" ? null : v;
            if (
                !((current === null && parsed === null) || current === parsed)
            ) {
                const mode = isEdit ?? false;
                dispatch(
                    updateOperatorValue({
                        id: unit.id,
                        value: parsed,
                        isEdit: mode,
                    })
                );
            }
        }
    };

    switch (unit.type) {
        case "operator":
            return (
                <div
                    ref={ref}
                    key={unit.id}
                    className={classNames(
                        computeUnitBlockStyles.wrapper,
                        active && computeUnitBlockStyles.active,
                        clone && computeUnitBlockStyles.clone,
                        insertPosition === Position.Before &&
                            computeUnitBlockStyles.insertBefore,
                        insertPosition === Position.After &&
                            computeUnitBlockStyles.insertAfter
                    )}
                    style={style}
                    tabIndex={0}
                    onDoubleClick={handleDoubleClickFocus}
                    onMouseDownCapture={onMouseDownHandle}
                    {...props}
                >
                    <div className={computeUnitBlockStyles.block}>
                        <TextInput
                            id={unit.id}
                            name={unit.id}
                            value={operatorValue ?? undefined}
                            width={TextInputWidth.W2}
                            additionalClasses={computeUnitBlockStyles.operator}
                            onChange={handleOperatorChange}
                        />
                    </div>
                </div>
            );
        case "component":
            return (
                <div
                    ref={ref}
                    key={unit.id}
                    className={classNames(
                        computeUnitBlockStyles.wrapper,
                        active && computeUnitBlockStyles.active,
                        clone && computeUnitBlockStyles.clone,
                        insertPosition === Position.Before &&
                            computeUnitBlockStyles.insertBefore,
                        insertPosition === Position.After &&
                            computeUnitBlockStyles.insertAfter
                    )}
                    style={style}
                >
                    <ComputeTooltip hideTooltip={!showTooltip} unit={unit} />
                    <div className={computeUnitBlockStyles.block} {...props}>
                        {unit.entity.isComponent ? (
                            <Generics
                                text={
                                    unit.entity.isComponent &&
                                    unit.entity.isRepeatable
                                        ? `${unit.value}~R+`
                                        : unit.value
                                }
                                color={GenericsColor.LightGreen}
                                className={computeUnitBlockStyles.component}
                            />
                        ) : (
                            <Generics
                                text={unit.value}
                                color={GenericsColor.LightRed}
                                className={computeUnitBlockStyles.component}
                            />
                        )}
                    </div>
                </div>
            );
        case "number":
            return (
                <div
                    ref={ref}
                    key={unit.id}
                    className={classNames(
                        computeUnitBlockStyles.wrapper,
                        active && computeUnitBlockStyles.active,
                        clone && computeUnitBlockStyles.clone,
                        insertPosition === Position.Before &&
                            computeUnitBlockStyles.insertBefore,
                        insertPosition === Position.After &&
                            computeUnitBlockStyles.insertAfter
                    )}
                    style={style}
                    tabIndex={0}
                    onDoubleClick={handleDoubleClickFocus}
                    onMouseDownCapture={onMouseDownHandle}
                    {...props}
                >
                    <div className={computeUnitBlockStyles.block}>
                        <TextInput
                            id={unit.id}
                            name={unit.id}
                            value={numberValue ?? undefined}
                            width={TextInputWidth.W2}
                            additionalClasses={computeUnitBlockStyles.number}
                            onChange={handleNumberChange}
                        />
                    </div>
                </div>
            );
        case "calculation":
            return (
                <div
                    ref={ref}
                    key={unit.id}
                    className={classNames(
                        computeUnitBlockStyles.wrapper,
                        active && computeUnitBlockStyles.active,
                        clone && computeUnitBlockStyles.clone,
                        insertPosition === Position.Before &&
                            computeUnitBlockStyles.insertBefore,
                        insertPosition === Position.After &&
                            computeUnitBlockStyles.insertAfter
                    )}
                    style={style}
                >
                    <ComputeTooltip hideTooltip={!showTooltip} unit={unit} />
                    <div className={computeUnitBlockStyles.block} {...props}>
                        <Generics
                            text={unit.value}
                            color={GenericsColor.LightGreen}
                            className={computeUnitBlockStyles.calculation}
                        />
                    </div>
                </div>
            );
    }

    // ensure a valid React node is always returned
    return null;
});

export default ComputeUnitBlock;
