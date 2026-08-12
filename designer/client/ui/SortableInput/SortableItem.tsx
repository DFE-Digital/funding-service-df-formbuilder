import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props<T> = {
    renderSortableBox: (props: any) => React.ReactNode;
    id: string;
    index: number;
    item: T;
};

export function SortableItem<T>(props: Props<T>) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: props.id });

    const childProp = {
        id: props.id,
        index: props.index,
        item: props.item,
    };

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="sortable-item">
            <div
                {...listeners}
                {...attributes}
                className="sortable-drag-handle"
            >
                <svg
                    width="18"
                    height="11"
                    viewBox="0 0 18 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect
                        x="0.851562"
                        width="17.1357"
                        height="2"
                        rx="0.5"
                        fill="#0B0C0C"
                    />
                    <rect
                        x="0.851562"
                        y="4.31641"
                        width="17.1357"
                        height="2"
                        rx="0.5"
                        fill="#0B0C0C"
                    />
                    <rect
                        x="0.851562"
                        y="8.63086"
                        width="17.1357"
                        height="2"
                        rx="0.5"
                        fill="#0B0C0C"
                    />
                </svg>
            </div>
            <div className="sortable-box">
                {props.renderSortableBox(childProp)}
            </div>
        </div>
    );
}
