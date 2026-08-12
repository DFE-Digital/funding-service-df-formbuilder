import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import Sortable from "../SortableInput/Sortable";

describe("Sortable Input Components", () => {
    describe("Sortable", () => {
        let onDragEndMock: jest.Mock;
        
        beforeEach(() => {
            onDragEndMock = jest.fn();
        });
        
        const renderSortableBox = (props: any) => <div>{props.item.name}</div>;
        
        const items = [
            { id: "1", name: "Item 1" },
            { id: "2", name: "Item 2" },
            { id: "3", name: "Item 3" },
        ];
        
        test("renders Sortable component with correct items", () => {
            const { container } = render(
            <Sortable
                items={items}
                onDragEnd={onDragEndMock}
                renderSortableBox={renderSortableBox}
            />
            );
        
            expect(container.querySelector(".sortable-container")).toBeInTheDocument();
            expect(container.querySelectorAll(".sortable-item").length).toBe(3);
            expect(container.textContent).toContain("Item 1");
            expect(container.textContent).toContain("Item 2");
            expect(container.textContent).toContain("Item 3");
        });
    });
        
    describe("SortableItem", () => {
        const renderSortableBox = (props: any) => <div>{props.item.name}</div>;
        
        const item = { id: "1", name: "Item 1" };
        
        test("renders SortableItem with correct props", () => {
            const { container } = render(
            <DndContext>
                <Sortable
                items={[item]}
                onDragEnd={() => {}}
                renderSortableBox={renderSortableBox}
                />
            </DndContext>
            );
        
            const sortableItem = container.querySelector(".sortable-item");
        
            expect(sortableItem).toBeInTheDocument();
            expect(container.textContent).toContain("Item 1");
        
            const dragHandle = sortableItem?.querySelector(".sortable-drag-handle");
            expect(dragHandle).toBeInTheDocument();
        });
    });
})