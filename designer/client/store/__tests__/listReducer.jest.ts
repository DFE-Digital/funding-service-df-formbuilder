import { listReducer } from "../reducers";
import { ListState, LoadingState } from "../types";
import {
    // Thunks
    fetchLists,
    deleteList,
    addList,
    getListItemDataset,
    // Actions
    updateForm,
    setSelectedList,
    setListTitle,
    setNewListItems,
    setSelectedListItems,
    resetDatasetLoadingState,
    setListItemText,
    setListItemValue,
    setListItemCondition,
    setListItemLinks,
    setListItemHelpText,
    addListItemtoList,
    removeListItem,
    setListItem,
    resetNewList,
    resetNewListItem,
    resetSelectedList,
    // Selector
    listSelector,
    // Empty Obj
    newList,
    newListItem
} from "../reducers/listReducer"
import {
    addListToForm,
    deleteFormList,
    fetchListFromFormId,
    fetchListItemDataset
} from "../../api/listApi";

jest.mock("../../api/listApi")

describe("Reducer - list reducer", () => {
    const initialState: ListState = {
        loading: LoadingState.Idle,
        datasetLoading: LoadingState.Idle,
        form: {
            id: "",
            key: "",
            displayName: "",
            lastModified: "",
            lastDownloaded: "",
            pages: [],
            conditions: [],
            lists: [],
            sections: [],
            confirmationMsg: "",
            fees: [],
            calculations: [],
        },
        entities: [],
        selectedList: {
            title: "",
            name: "",
            type: "",
            dataset: "",
            items: [],
        },
        newList: {
            title: "",
            name: "",
            type: "",
            dataset: "",
            items: [],
        },
        newListItem: {
            text: "",
            value: "",
        },
        selectedListItem: {
            text: "",
            value: "",
        },
    };
    const mockResponse = {
        data: [],
        form: {
            id: "",
            key: "",
            displayName: "",
            lastModified: "",
            lastDownloaded: "",
            pages: [],
            conditions: [],
            lists: [],
            sections: [],
            confirmationMsg: "",
            fees: [],
            calculations: [],
        },
        error: "",
    }
    test("should return the initial state", () => {
        expect(listReducer(undefined, { type: undefined })).toEqual(initialState)
    })
    test("list selector", () => {
        //@ts-ignore
        expect(listSelector({
            list: initialState
        }).loading).toEqual(LoadingState.Idle)
    })
    test("fetch list thunk", async () => {
        // @ts-ignore
        fetchListFromFormId.mockImplementationOnce(() => (mockResponse))
        const action = await fetchLists("test-id");
        const mockDispatch = jest.fn();
        const mockGetState = jest.fn().mockReturnValue(initialState)
        await action(mockDispatch, mockGetState, undefined)
        expect(mockDispatch).toHaveBeenCalled();
    })
    test("fetch list thunk -- error", async () => {
        // @ts-ignore
        fetchListFromFormId.mockImplementationOnce(() => ({ ...mockResponse, error: "server error" }))
        const action = await fetchLists("test-id");
        const mockDispatch = jest.fn();
        const mockGetState = jest.fn().mockReturnValue(initialState)
        await action(mockDispatch, mockGetState, undefined)
        expect(mockDispatch).toHaveBeenCalled();
    })
    test("delete list thunk", async () => {
        // @ts-ignore
        deleteFormList.mockImplementationOnce(() => ({ form: mockResponse.form, error: "" }))
        const action = await deleteList({ listId: "test-id", data: mockResponse.form});
        const mockDispatch = jest.fn();
        const mockGetState = jest.fn().mockReturnValue(initialState)
        await action(mockDispatch, mockGetState, undefined)
        expect(mockDispatch).toHaveBeenCalled();
    })
    test("delete list thunk -- error", async () => {
        // @ts-ignore
        deleteFormList.mockImplementationOnce(() => ({ form: mockResponse.form, error: "server error" }))
        const action = await deleteList({ listId: "test-id", data: mockResponse.form});
        const mockDispatch = jest.fn();
        const mockGetState = jest.fn().mockReturnValue(initialState)
        await action(mockDispatch, mockGetState, undefined)
        expect(mockDispatch).toHaveBeenCalled();
    })
    test("add list thunk", async () => {
        // @ts-ignore
        addListToForm.mockImplementationOnce(() => ({ form: mockResponse.form, error: "" }))
        const action = await addList({ list: newList, data: mockResponse.form});
        const mockDispatch = jest.fn();
        const mockGetState = jest.fn().mockReturnValue(initialState)
        await action(mockDispatch, mockGetState, undefined)
        expect(mockDispatch).toHaveBeenCalled();
    })
    test("add list thunk -- error", async () => {
        // @ts-ignore
        addListToForm.mockImplementationOnce(() => ({ form: mockResponse.form, error: "server error" }))
        const action = await addList({ list: newList, data: mockResponse.form});
        const mockDispatch = jest.fn();
        const mockGetState = jest.fn().mockReturnValue(initialState)
        await action(mockDispatch, mockGetState, undefined)
        expect(mockDispatch).toHaveBeenCalled();
    })
    test("get list item dataset thunk", async () => {
        // @ts-ignore
        fetchListItemDataset.mockImplementationOnce(() => ({
            dataset: [newListItem],
            datasetId: "test-dataset-id",
            error: false
        }))
        const action = await getListItemDataset({ datasetId: "test-dataset-id", isEdit: false });
        const mockDispatch = jest.fn();
        const mockGetState = jest.fn().mockReturnValue(initialState)
        await action(mockDispatch, mockGetState, undefined)
        expect(mockDispatch).toHaveBeenCalled();
    })
    test("get list item dataset thunk -- error", async () => {
        // @ts-ignore
        fetchListItemDataset.mockImplementationOnce(() => ({
            dataset: [newListItem],
            datasetId: "test-dataset-id",
            error: true
        }))
        const action = await getListItemDataset({ datasetId: "test-dataset-id", isEdit: false });
        const mockDispatch = jest.fn();
        const mockGetState = jest.fn().mockReturnValue(initialState)
        await action(mockDispatch, mockGetState, undefined)
        expect(mockDispatch).toHaveBeenCalled();
    })

    test("should return the fetch list loading state - pending", () => {
        expect(listReducer(undefined, { type: "list/fetchLists/pending" }).loading).toEqual(LoadingState.Pending)
    })
    test("should return the fetch list loading state - rejected", () => {
        expect(listReducer(undefined, { type: "list/fetchLists/rejected" }).loading).toEqual(LoadingState.Failed)
    })
    test("should return the fetch list loading state - succeeded", () => {
        expect(listReducer(undefined, { type: "list/fetchLists/fulfilled", payload: mockResponse }).loading).toEqual(LoadingState.Succeeded)
    })

    test("should return the delete list loading state - pending", () => {
        expect(listReducer(undefined, { type: "list/deleteList/pending" }).loading).toEqual(LoadingState.Pending)
    })
    test("should return the delete list loading state - rejected", () => {
        expect(listReducer(undefined, { type: "list/deleteList/rejected" }).loading).toEqual(LoadingState.Failed)
    })
    test("should return the delete list loading state - succeeded", () => {
        expect(listReducer(undefined, { type: "list/deleteList/fulfilled", payload: { form: mockResponse.form, error: "" } }).loading).toEqual(LoadingState.Succeeded)
    })

    test("should return the add list loading state - pending", () => {
        expect(listReducer(undefined, { type: "list/addList/pending" }).loading).toEqual(LoadingState.Pending)
    })
    test("should return the add list loading state - rejected", () => {
        expect(listReducer(undefined, { type: "list/addList/rejected" }).loading).toEqual(LoadingState.Failed)
    })
    test("should return the add list loading state - succeeded", () => {
        expect(listReducer(undefined, { type: "list/addList/fulfilled", payload: { form: mockResponse.form, error: "" } }).loading).toEqual(LoadingState.Succeeded)
    })

    test("should return the get list item dataset loading state - pending", () => {
        expect(listReducer(undefined, { type: "list/getListItemDataset/pending" }).datasetLoading).toEqual(LoadingState.Pending)
    })
    test("should return the get list item dataset loading state - rejected", () => {
        expect(listReducer(undefined, { type: "list/getListItemDataset/rejected" }).datasetLoading).toEqual(LoadingState.Failed)
    })
    test("should return the get list item dataset loading state - succeeded", () => {
        expect(listReducer(undefined, {
            type: "list/getListItemDataset/fulfilled", payload: {
                dataset: [newListItem],
                datasetId: "test-dataset-id",
                error: false
            }
        }).datasetLoading).toEqual(LoadingState.Succeeded)
    })
    test("should return the get list item dataset loading state - succeeded if isEdit is true", () => {
        expect(listReducer(undefined, {
            type: "list/getListItemDataset/fulfilled", payload: {
                dataset: [newListItem],
                datasetId: "test-dataset-id",
                error: false,
                isEdit: true
            }
        }).datasetLoading).toEqual(LoadingState.Succeeded)
    })

    test("should return the loading state after update form", () => {
        expect(listReducer(undefined, updateForm({ updateForm: mockResponse.form, cb: ()=>{}})).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after update form - without vb", () => {
        expect(listReducer(undefined, updateForm({ updateForm: mockResponse.form })).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after set selected list", () => {
        expect(listReducer(undefined, setSelectedList({})).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after set list title when isEdit is false", () => {
        expect(listReducer(undefined, setListTitle({title: "test-title", isEdit: false})).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after set list title when isEdit is true", () => {
        expect(listReducer(undefined, setListTitle({title: "test-title", isEdit: true})).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after set new list items", () => {
        expect(listReducer(undefined, setNewListItems({})).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after set selected list items", () => {
        expect(listReducer(undefined, setSelectedListItems({})).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after resetting dataset loading state", () => {
        expect(listReducer(undefined, resetDatasetLoadingState()).datasetLoading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after set list item text when isEdit is false", () => {
        expect(listReducer(undefined, setListItemText({title: "test-title", isEdit: false})).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after set list item text when isEdit is true", () => {
        expect(listReducer(undefined, setListItemText({title: "test-title", isEdit: true})).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after set list item value when isEdit is false", () => {
        expect(listReducer(undefined, setListItemValue({value: "test-value", isEdit: false})).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after set list item value when isEdit is true", () => {
        expect(listReducer(undefined, setListItemValue({value: "test-value", isEdit: true})).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after set list item condition when isEdit is false", () => {
        expect(listReducer(undefined, setListItemCondition({condition: "test-condition", isEdit: false})).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after set list item condition when isEdit is true", () => {
        expect(listReducer(undefined, setListItemCondition({condition: "test-condition", isEdit: true})).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after set list item links when isEdit is false", () => {
        expect(listReducer(undefined, setListItemLinks({links: "test-links", isEdit: false})).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after set list item links when isEdit is true", () => {
        expect(listReducer(undefined, setListItemLinks({links: "test-links", isEdit: true})).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after set list item helpText when isEdit is false", () => {
        expect(listReducer(undefined, setListItemHelpText({helpText: "test-helpText", isEdit: false})).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after set list item helpText when isEdit is true", () => {
        expect(listReducer(undefined, setListItemHelpText({helpText: "test-helpText", isEdit: true})).loading).toEqual(LoadingState.Idle)
    })

    test("should return the loading state after adding list item to list when listId is present and when isEdit is true", () => {
        expect(listReducer(undefined, addListItemtoList({listId: "test-list-id", itemIndex: 0, isEdit: true})).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after adding list item to list when listId is present and when isEdit is false", () => {
        expect(listReducer(undefined, addListItemtoList({listId: "test-list-id", itemIndex: 0, isEdit: false})).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after adding list item to list when listId is absent and when isEdit is true", () => {
        expect(listReducer(undefined, addListItemtoList({listId: "", itemIndex: 0, isEdit: true})).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after adding list item to list when listId is absent and when isEdit is false", () => {
        expect(listReducer(undefined, addListItemtoList({listId: "", itemIndex: 0, isEdit: false})).loading).toEqual(LoadingState.Idle)
    })

    test("should return the loading state after remove list item when isEdit is true", () => {
        expect(listReducer(undefined, removeListItem({index: 0, isEdit: true})).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after remove list item when isEdit is false", () => {
        expect(listReducer(undefined, removeListItem({index: 0, isEdit: false})).loading).toEqual(LoadingState.Idle)
    })

    test("should return the loading state after set list item", () => {
        expect(listReducer(undefined, setListItem({})).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after reset new list item", () => {
        expect(listReducer(undefined, resetNewListItem()).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after reset new list", () => {
        expect(listReducer(undefined, resetNewList()).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after reset selected list - no selected list", () => {
        expect(listReducer(
            {
                loading: LoadingState.Idle,
                entities: [],
                //@ts-ignore
                selectedList: { name: "test-list-name" }
            },
            resetSelectedList()).loading).toEqual(LoadingState.Idle)
    })
    test("should return the loading state after reset selected list", () => {
        expect(listReducer(
            {
                loading: LoadingState.Idle,
                  //@ts-ignore
                entities: [{ name: "test-list-name" }],
                  //@ts-ignore
                selectedList: { name: "test-list-name" }
            }, resetSelectedList()).loading).toEqual(LoadingState.Idle)
    })
})