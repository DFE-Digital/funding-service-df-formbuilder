import React from "react";
import { Sortable } from "../../../ui";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import ListItem from "./ListItem";
import {
    listSelector,
    setNewListItems,
    setSelectedListItems,
} from "../../../store/reducers/listReducer";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";

type Props = {
    isEdit: boolean;
};

const SortableListItem = (props: Props) => {
    const { isEdit } = props;
    const dispatch = useAppDispatch();
    const lists = useAppSelector(listSelector);
    const list = isEdit ? lists.selectedList : lists.newList;
    const listItemWithId = list.items.map((item) => ({
        id: item.value,
        ...item,
    }));
    const onDragEndHandle = (e: DragEndEvent) => {
        const { active, over } = e;
        if (!over) return;
        if (active.id !== over.id) {
            const oldIndex = listItemWithId
                .map((item) => item.id.toString())
                .indexOf(active.id.toString());
            const newIndex = listItemWithId
                .map((item) => item.id.toString())
                .indexOf(over.id.toString());
            const newItemsArr = arrayMove(
                listItemWithId,
                oldIndex,
                newIndex
            ).map(({ id, ...item }) => item);
            if (isEdit) {
                dispatch(setSelectedListItems(newItemsArr));
            } else {
                dispatch(setNewListItems(newItemsArr));
            }
        }
    };
    if (listItemWithId.length === 0) {
        return <div className="govuk-body empty-list-items">No list found</div>;
    }
    return (
        <Sortable
            items={listItemWithId}
            renderSortableBox={ListItem}
            onDragEnd={onDragEndHandle}
        ></Sortable>
    );
};

export default SortableListItem;
