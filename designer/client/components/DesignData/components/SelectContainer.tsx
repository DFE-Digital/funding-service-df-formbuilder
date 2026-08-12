import React, { useContext, useCallback, useEffect, useState } from "react";
import { i18n } from "../../../i18n";
import { ComponentContext } from "../../../reducers/component/componentReducer";
import { ListComponentsDef } from "@xgovformbuilder/model";
import { ListActions } from "../../../reducers/listActions";
import { ListContext } from "../../../reducers/listReducer";
import { DataContext } from "../../../context";
import { findList } from "../../../data";
import logger from "../../../plugins/logger";
import {
    ListsEditorContext,
    ListsEditorStateActions,
} from "../../../reducers/list/listsEditorReducer";

const SelectContainer = () => {
    const { data } = useContext(DataContext);
    const { dispatch: listsEditorDispatch } = useContext(ListsEditorContext);

    const { state, dispatch } = useContext(ComponentContext);

    const { selectedComponent } = state;
    const { list } = selectedComponent as ListComponentsDef;

    const { state: listState, dispatch: listDispatch } = useContext(
        ListContext
    );

    const { selectedList } = listState;

    const [selectedListTitle, setSelectedListTitle] = useState(
        selectedList?.title
    );
    const handleEditListClick = (e: React.MouseEvent) => {
        e.preventDefault();
        listsEditorDispatch([ListsEditorStateActions.IS_EDITING_LIST, true]);
    };

    const editList = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch({
            type: ListActions.SET_SELECTED_LIST,
            payload: e.target.value,
        });
    };
    const memoizedCallback = useCallback(() => {
        if (data) console.log("forced-rendering");
    }, [data]);
    useEffect(() => {
        if (selectedList?.isNew) {
            return;
        }
        try {
            const [foundList] = findList(data, list);
            listDispatch({
                type: ListActions.SET_SELECTED_LIST,
                payload: foundList,
            });
        } catch (e) {
            logger.error("ComponentListSelect", e);
        }
    }, [data, data.lists, list, listDispatch, selectedList?.isNew]);

    useEffect(() => {
        setSelectedListTitle(selectedList?.title ?? selectedList?.name);
    }, [selectedList]);

    useEffect(() => {
        memoizedCallback();
    }, []);

    return (
        <>
            <span className="govuk-hint">{i18n("list.select.helpText")}</span>
            <select
                className="govuk-select govuk-input--width-10"
                id="field-options-list"
                name="options.list"
                value={list}
                onChange={editList}
            >
                <option value="-1">{i18n("list.select.option")}</option>
                {data.lists.map(
                    (
                        list: {
                            name:
                                | string
                                | number
                                | readonly string[]
                                | undefined;
                            title: React.ReactNode;
                        },
                        index: number
                    ) => {
                        return (
                            <option
                                key={`${list.name}-${index}`}
                                value={list.name}
                            >
                                {list.title}
                            </option>
                        );
                    }
                )}
            </select>
            <div className="govuk-form-group">
                {selectedListTitle && (
                    <button
                        className="govuk-link govuk-body govuk-!-margin-bottom-0"
                        onClick={handleEditListClick}
                    >
                        {i18n("list.edit", { title: selectedListTitle })}
                    </button>
                )}
            </div>
        </>
    );
};

export default SelectContainer;
