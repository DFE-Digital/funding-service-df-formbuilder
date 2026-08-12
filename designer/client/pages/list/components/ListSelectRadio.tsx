import React from "react";
import { CellContext } from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
    setSelectedList,
    listSelector,
} from "../../../store/reducers/listReducer";
import { ListEntity } from "../../../store/types";

const ListSelectRadio = (props: CellContext<ListEntity, unknown>) => {
    const dispatch = useAppDispatch();
    const listId = props.row.original.name;
    const list = props.row.original;
    const { selectedList } = useAppSelector(listSelector);

    const onListSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setSelectedList(list));
    };

    return (
        <div className="govuk-radios" data-module="govuk-radios">
            <div className="govuk-radios__item">
                <input
                    className="govuk-radios__input"
                    id={`select-list`}
                    name={`select-list`}
                    type="radio"
                    value={listId}
                    checked={list.name === selectedList?.name ?? ""}
                    onChange={onListSelect}
                />
                <label
                    className="govuk-label govuk-radios__label"
                    htmlFor="select-list"
                ></label>
            </div>
        </div>
    );
};

export default ListSelectRadio;
