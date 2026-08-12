import React from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    UniqueIdentifier,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { SortableItem } from "./SortableItem";

type Props<T> = {
    items: T;
    onDragEnd: (e: DragEndEvent) => void;
    renderSortableBox: (props: any) => React.ReactNode;
};

const Sortable = <T extends { id: UniqueIdentifier }[]>(props: Props<T>) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
        <div className="sortable-container govuk-!-margin-bottom-6">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={props.onDragEnd}
            >
                <SortableContext
                    items={props.items}
                    strategy={verticalListSortingStrategy}
                >
                    {props.items.map((item, index) => (
                        <SortableItem
                            key={item.id}
                            id={item.id.toString()}
                            index={index}
                            item={item}
                            renderSortableBox={props.renderSortableBox}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default Sortable;
