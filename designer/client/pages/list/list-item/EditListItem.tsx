import React, { useEffect } from "react";
import { useRouteMatch } from "react-router-dom";
import {
    listSelector,
    setListItem,
    setSelectedList,
} from "../../../store/reducers/listReducer";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import ListItemAddEdit from "./ListItemAddEdit";

type Props = {};

type ParamsType = {
    params: { listId: string; itemIndex: string };
};

const EditListItem = (props: Props) => {
    const dispatch = useAppDispatch();
    const lists = useAppSelector(listSelector);
    const { params }: ParamsType = useRouteMatch();
    const itemIndex = Number(params.itemIndex);

    useEffect(() => {
        // Populated selectedList and selectedListItem from URL
        if (lists.selectedList.name) return;
        const selectedList = lists.entities.find(
            (list) => list.name === params.listId
        );
        if (!selectedList) return;
        dispatch(setSelectedList(selectedList));
        if (lists.selectedListItem.value) return;
        const selectedListItem = selectedList.items[itemIndex];
        if (!selectedListItem) return;
        dispatch(setListItem(selectedListItem));
    }, []);

    return (
        <div>
            <ListItemAddEdit isEdit={true} />
        </div>
    );
};

export default EditListItem;
