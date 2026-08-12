import React, { useEffect } from "react";
import { useRouteMatch } from "react-router-dom";
import ListAddEditPage from "./components/ListAddEditPage";
import {
    listSelector,
    setSelectedList,
} from "../../store/reducers/listReducer";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

type ParamsType = {
    params: { listId: string };
};

const ListEditPage = () => {
    const dispatch = useAppDispatch();
    const lists = useAppSelector(listSelector);
    const { params }: ParamsType = useRouteMatch();

    useEffect(() => {
        // Populated selectedList from URL
        if (lists.selectedList.name) return;
        const selectedList = lists.entities.find(
            (list) => list.name === params.listId
        );
        if (!selectedList) return;
        dispatch(setSelectedList(selectedList));
    }, []);

    return (
        <div>
            <ListAddEditPage isEdit={true} />
        </div>
    );
};

export default ListEditPage;
