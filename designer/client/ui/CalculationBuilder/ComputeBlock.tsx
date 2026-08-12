import React, { useState, useRef } from "react";
import {
    closestCenter,
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
    useDndContext,
    MeasuringStrategy,
    DropAnimation,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
    arrayMove,
    useSortable,
    SortableContext,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS, isKeyboardEvent } from "@dnd-kit/utilities";

import {
    CheckboxInput,
    Divider,
    Generics,
    GenericsColor,
    Para,
    Spacing,
    SpacingUnit,
} from "..";
import ComputeUnitBlock, { Position } from "./ComputeUnitBlock";

import type { ComputeList, ComputeUnit } from "../../store/types";
import type {
    DragStartEvent,
    DragEndEvent,
    MeasuringConfiguration,
    UniqueIdentifier,
} from "@dnd-kit/core";

import computeBlockStyles from "./ComputeBlock.module.scss";

interface ComputeBlockProps {
    computeList: ComputeList;
    onUpdateComputeList: (newList: ComputeList) => void;
    isEdit?: boolean;
}

const measuring: MeasuringConfiguration = {
    droppable: {
        strategy: MeasuringStrategy.Always,
    },
};

const dropAnimation: DropAnimation = {
    keyframes({ transform }) {
        return [
            { transform: CSS.Transform.toString(transform.initial) },
            {
                transform: CSS.Transform.toString({
                    scaleX: 0.98,
                    scaleY: 0.98,
                    x: transform.final.x - 10,
                    y: transform.final.y - 10,
                }),
            },
        ];
    },
    sideEffects: defaultDropAnimationSideEffects({
        className: {
            active: computeBlockStyles.active,
        },
    }),
};

function always() {
    return true;
}

type OverlayProps = {
    id: UniqueIdentifier;
    items: ComputeList;
    isEdit: boolean;
};

const ComputeUnitOverlay = ({ id, items, isEdit, ...props }: OverlayProps) => {
    const { activatorEvent, over } = useDndContext();
    const isKeyboardSorting = isKeyboardEvent(activatorEvent);
    const unit = items.find((item) => item.id === (id as string));
    const activeIndex = items.map((u) => u.id).indexOf(id as string);
    const overIndex = over?.id
        ? items.map((u) => u.id).indexOf(over.id as string)
        : -1;

    return (
        <ComputeUnitBlock
            style={undefined}
            unit={unit!}
            {...props}
            isEdit={isEdit}
            clone
            insertPosition={
                isKeyboardSorting && overIndex !== activeIndex
                    ? overIndex > activeIndex
                        ? Position.After
                        : Position.Before
                    : undefined
            }
        />
    );
};

type SortableUnitBlockProps = {
    unit: ComputeUnit;
    activeIndex: number;
    key: string;
    showTooltip: boolean;
    isEdit: boolean;
};

const SortableUnitBlock = ({
    unit,
    activeIndex,
    isEdit,
    ...props
}: SortableUnitBlockProps) => {
    const {
        attributes,
        listeners,
        index,
        isDragging,
        isSorting,
        over,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: unit.id,
        animateLayoutChanges: always,
    });
    return (
        <ComputeUnitBlock
            ref={setNodeRef}
            unit={unit}
            active={isDragging}
            style={{
                transition,
                transform: isSorting
                    ? undefined
                    : CSS.Translate.toString(transform),
            }}
            insertPosition={
                over?.id === unit.id
                    ? index > activeIndex
                        ? Position.After
                        : Position.Before
                    : undefined
            }
            clone={false}
            {...props}
            isEdit={isEdit}
            {...attributes}
            {...listeners}
        />
    );
};

const ComputeBlock: React.FC<ComputeBlockProps> = ({
    computeList = [],
    onUpdateComputeList,
    isEdit = false,
}) => {
    const [showToolTip, setShowToolTip] = useState(true);
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const activeIndex =
        activeId != null
            ? computeList.map((unit) => unit.id).indexOf(activeId as string)
            : -1;
    const computeAreaRef = useRef<HTMLDivElement | null>(null);
    // track the last pointer position while dragging (doesn't trigger rerenders)
    const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(PointerSensor, {
            activationConstraint: {
                // delay in ms to require press-and-hold before drag starts
                delay: 180,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragStart({ active }: DragStartEvent) {
        setActiveId(active.id);
        // start tracking pointer moves so we can determine if drop was outside
        const onPointerMove = (ev: PointerEvent) => {
            lastPointerRef.current = { x: ev.clientX, y: ev.clientY };
        };
        // store handler on ref so we can remove it later
        (handleDragStart as any)._pointerMove = onPointerMove;
        document.addEventListener("pointermove", onPointerMove);
    }

    function handleDragCancel() {
        // cleanup pointer listener
        const pm = (handleDragStart as any)._pointerMove;
        if (pm) document.removeEventListener("pointermove", pm);
        lastPointerRef.current = null;
        setActiveId(null);
    }

    function handleDragEnd({ active, over }: DragEndEvent) {
        // Clean up the pointer listener first (if any) and capture the
        // latest pointer position. We use the pointer coords to detect
        // whether the drop occurred outside the compute-area. This must
        // run before interpreting `over` because `over` may point to a
        // nearby item even when the pointer has left the area.
        const pm = (handleDragStart as any)._pointerMove;
        if (pm) document.removeEventListener("pointermove", pm);

        const last = lastPointerRef.current;
        let droppedOutside = false;
        if (last && computeAreaRef.current) {
            const rect = computeAreaRef.current.getBoundingClientRect();
            if (
                last.x < rect.left ||
                last.x > rect.right ||
                last.y < rect.top ||
                last.y > rect.bottom
            ) {
                droppedOutside = true;
            }
        }

        if (droppedOutside) {
            if (active && active.id != null) {
                const newList = computeList.filter(
                    (u) => u.id !== (active.id as string)
                );
                if (newList.length !== computeList.length) {
                    onUpdateComputeList(newList);
                }
            }

            lastPointerRef.current = null;
            setActiveId(null);
            return;
        }

        // Dropped over another item or a droppable container
        if (over) {
            const overIndex = computeList
                .map((unit) => unit.id)
                .indexOf(over.id as string);

            // If overIndex is -1 it means `over.id` is not one of the item ids
            // (for example it's the compute-area container or another droppable).
            // Treat that as a drop-outside and remove the active item.
            if (overIndex === -1) {
                if (active && active.id != null) {
                    const newList = computeList.filter(
                        (u) => u.id !== (active.id as string)
                    );
                    if (newList.length !== computeList.length) {
                        onUpdateComputeList(newList);
                    }
                }

                lastPointerRef.current = null;
                setActiveId(null);
                return;
            }

            if (activeIndex !== overIndex) {
                const newIndex = overIndex;
                onUpdateComputeList(
                    arrayMove(
                        computeList,
                        activeIndex,
                        newIndex
                    ).map((unit, idx) => ({ ...unit, order: idx + 1 }))
                );
            }

            lastPointerRef.current = null;
            setActiveId(null);
            return;
        }

        // If we get here there was no `over` and the drop was inside the area
        lastPointerRef.current = null;
        setActiveId(null);
    }

    return (
        <div
            className={`${computeBlockStyles.computeBlockContainer} govuk-body`}
        >
            <div className={computeBlockStyles.upperComputeBlock}>
                <Spacing mb={SpacingUnit.Three} />
                <Para text={"Calculation compute block"} bold />
                <Spacing mb={SpacingUnit.Three} />
                <div className={computeBlockStyles.legendSection}>
                    Legends:
                    <Generics
                        text="Component"
                        color={GenericsColor.LightGreen}
                        textClassName="govuk-!-font-size-16"
                    />
                    <Generics
                        text="Design data set"
                        color={GenericsColor.LightRed}
                        textClassName="govuk-!-font-size-16"
                    />
                </div>
                <Spacing mb={SpacingUnit.Two} />
                <Para asChild>
                    <span>Computation operator:</span>
                    {/* <Spacing pr={SpacingUnit.Two} />
                    <span>:</span> */}
                    <Spacing pr={SpacingUnit.Two} />
                    <span>+ - * / %</span>
                </Para>
                <Spacing mb={SpacingUnit.One} />
                <Para asChild>
                    <span>Repeatable operator:</span>
                    {/* <Spacing pr={SpacingUnit.Four} />
                    <span>:</span> */}
                    <Spacing pr={SpacingUnit.Four} />
                    <span>R+</span>
                </Para>
                <Spacing mb={SpacingUnit.Three} />
            </div>
            <div
                ref={computeAreaRef}
                className={computeBlockStyles.computeArea}
                data-testid="compute-area"
            >
                <DndContext
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    measuring={measuring}
                >
                    <SortableContext items={computeList}>
                        {computeList.map((unit) => (
                            <SortableUnitBlock
                                key={unit.id}
                                unit={unit}
                                activeIndex={activeIndex}
                                showTooltip={showToolTip}
                                isEdit={isEdit}
                            />
                        ))}
                    </SortableContext>
                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeId != null ? (
                            <ComputeUnitOverlay
                                id={activeId}
                                items={computeList}
                                isEdit={isEdit}
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
            <div className={computeBlockStyles.lowerComputeBlock}>
                <Divider additionalClasses="govuk-!-margin-0" />
                <Spacing mb={SpacingUnit.Two} />
                <CheckboxInput
                    id={"hide-tooltip-details"}
                    name={"hide-tooltip-details"}
                    selectedValue={showToolTip ? 0 : 1}
                    options={[
                        {
                            label: "Hide tooltip details",
                            key: "hide-tooltip-details-option",
                            value: 1,
                            onChange: (
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                setShowToolTip((value) => !value);
                            },
                        },
                    ]}
                />
                <Spacing mb={SpacingUnit.Two} />
                <Divider additionalClasses="govuk-!-margin-0" />
                <Spacing mb={SpacingUnit.Two} />
                <div className="govuk-hint">
                    To remove a box or variable, drag it out of the compute
                    block.
                </div>
            </div>
        </div>
    );
};

export default ComputeBlock;
