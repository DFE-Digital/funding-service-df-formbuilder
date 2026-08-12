import React from "react";
import { useListItem } from "../list/useListItem";
import { ListActions } from "../../reducers/listActions";
import { FormDefinition } from "@xgovformbuilder/model";

describe("useListItem Hook", () => {
    it("verify returned methods and selected list item data", () => {
        const state = {
            initialName: "BGgfOz",
            selectedItem: {
                text: "TestTitle",
                description: "TestDescription",
                isNew: false,
            },
            selectedList: {
                items: [
                    [
                        {
                            text: "Item 1",
                            value: "item-1",
                        },
                    ],
                ],
                name: "BGgfOz",
                title: "New List 1",
                type: "string",
                isNew: false,
            },
            selectedItemIndex: 1,
        };
        const dummyEvent = {
            target: {
                value: "testValue",
            },
        };
        const dispatch = jest.fn();
        const {
            handleTitleChange,
            handleConditionChange,
            handleValueChange,
            handleHintChange,
            prepareForSubmit,
            prepareForDelete,
            validate,
            value,
            condition,
            title,
            hint,
        } = useListItem(state, dispatch);
        expect(title).toEqual("TestTitle");
        expect(hint).toEqual("TestDescription");
        handleTitleChange(dummyEvent);
        expect(dispatch).toHaveBeenLastCalledWith({
            type: ListActions.EDIT_LIST_ITEM_TEXT,
            payload: "testValue",
        });
        handleConditionChange(dummyEvent);
        expect(dispatch).toHaveBeenLastCalledWith({
            type: ListActions.EDIT_LIST_ITEM_CONDITION,
            payload: "testValue",
        });
        handleValueChange(dummyEvent);
        expect(dispatch).toHaveBeenLastCalledWith({
            type: ListActions.EDIT_LIST_ITEM_VALUE,
            payload: "testValue",
        });
        handleHintChange(dummyEvent);
        expect(dispatch).toHaveBeenLastCalledWith({
            type: ListActions.EDIT_LIST_ITEM_DESCRIPTION,
            payload: "testValue",
        });
        const translate = jest.fn();
        const errors = validate(translate);
        const expectedError = {
            value: {
                href: "#value",
                children: ["Enter Value"],
            },
        };
        expect(dispatch).toHaveBeenLastCalledWith({
            type: ListActions.LIST_ITEM_VALIDATION_ERRORS,
            payload: expectedError,
        });
        expect(errors).toBeTruthy();
        const dummyData: FormDefinition = {
            id: "test123",
            key: "test123",
            displayName: "test123",
            lastModified: "2022/05/27 00:53",
            lastDownloaded: "2022/05/27 00:53",
            pages: [],
            conditions: [],
            lists: [
                {
                    id: "BGgfOz",
                    title: "New List 1",
                    name: "BGgfOz",
                    type: "string",
                    items: [
                        {
                            text: "Item 1",
                            value: "item-1",
                        },
                    ],
                },
            ],
            sections: [],
            confirmationMsg: "",
            fees: [],
            calculations: [],
        };
        const data = prepareForSubmit(dummyData);
        expect(data.lists).toEqual([
            {
                id: "BGgfOz",
                items: [],
                name: "BGgfOz",
                title: "New List 1",
                type: "string",
            },
        ]);
        const deleted = prepareForDelete(dummyData, 0);
        expect(deleted.lists[0].items.length).toEqual(1);
    });

    it("verify isNew lists", () => {
        const state = {
            selectedItem: {
                text: "TestTitle",
                description: "TestDescription",
                value: "testValue",
                isNew: true,
            },
            selectedList: {
                items: [],
                name: "new123",
                title: "New List 2",
                type: "string",
                isNew: true,
            },
            selectedItemIndex: 1,
        };
        const dispatch = jest.fn();
        const { prepareForSubmit, prepareForDelete } = useListItem(
            state,
            dispatch
        );
        const dummyData: FormDefinition = {
            id: "test123",
            key: "test123",
            displayName: "test123",
            lastModified: "2022/05/27 00:53",
            lastDownloaded: "2022/05/27 00:53",
            pages: [],
            conditions: [],
            lists: [],
            sections: [],
            confirmationMsg: "",
            fees: [],
            calculations: [],
        };
        const data = prepareForSubmit(dummyData);
        expect(data.lists[0].name).toEqual("new123");
    });
});
