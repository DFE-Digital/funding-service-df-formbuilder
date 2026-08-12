import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ListEntity, ListItem, ListState, LoadingState } from "../types";
import {
    addListToForm,
    deleteFormList,
    fetchListFromFormId,
    fetchListItemDataset,
} from "../../api/listApi";
import { RootState } from "../store";
import { FormDefinition } from "@xgovformbuilder/model";

export const newList: ListEntity = {
    title: "",
    name: "",
    type: "",
    dataset: "",
    items: [],
};

export const newListItem: ListItem = {
    text: "",
    value: "",
};

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

export const fetchLists = createAsyncThunk(
    "list/fetchLists",
    async (formId: string, { rejectWithValue }) => {
        const response = await fetchListFromFormId(formId);
        if (response.error) {
            return rejectWithValue(response.error);
        }
        return response;
    }
);

export const deleteList = createAsyncThunk(
    "list/deleteList",
    async (
        { listId, data }: { listId: string; data: FormDefinition },
        { rejectWithValue }
    ) => {
        const response = await deleteFormList(listId, data);
        if (response.error) {
            return rejectWithValue(response.form);
        }
        return response.form;
    }
);

export const addList = createAsyncThunk(
    "list/addList",
    async (
        { list, data }: { list: ListEntity; data: FormDefinition },
        { rejectWithValue }
    ) => {
        const response = await addListToForm(list, data);
        if (response.error) {
            return rejectWithValue(response.form);
        }
        return response.form;
    }
);

export const getListItemDataset = createAsyncThunk(
    "list/getListItemDataset",
    async (
        { datasetId, isEdit }: { datasetId: string; isEdit: boolean },
        { rejectWithValue }
    ) => {
        const response = await fetchListItemDataset(datasetId);
        if (response.error) {
            return rejectWithValue(response.error);
        }
        return { ...response, isEdit };
    }
);

export const listSlice = createSlice({
    name: "list",
    initialState,
    reducers: {
        updateForm: (state, action) => {
            state.form = action.payload.updatedForm;
            if (typeof action.payload.cb === "function") {
                action.payload.cb();
            }
        },
        setSelectedList: (state, action) => {
            state.selectedList = action.payload;
        },
        setListTitle: (state, action) => {
            if (action.payload.isEdit) {
                state.selectedList.title = action.payload.title;
            } else {
                state.newList.title = action.payload.title;
            }
        },
        setNewListItems: (state, action) => {
            state.newList.items = action.payload;
        },
        setSelectedListItems: (state, action) => {
            state.selectedList.items = action.payload;
        },
        resetDatasetLoadingState: (state) => {
            state.datasetLoading = LoadingState.Idle;
        },
        setListItemText: (state, action) => {
            if (action.payload.isEdit) {
                state.selectedListItem.text = action.payload.title;
            } else {
                state.newListItem.text = action.payload.title;
            }
        },
        setListItemValue: (state, action) => {
            if (action.payload.isEdit) {
                state.selectedListItem.value = action.payload.value;
            } else {
                state.newListItem.value = action.payload.value;
            }
        },
        setListItemCondition: (state, action) => {
            if (action.payload.isEdit) {
                state.selectedListItem.condition = action.payload.condition;
            } else {
                state.newListItem.condition = action.payload.condition;
            }
        },
        setListItemLinks: (state, action) => {
            if (action.payload.isEdit) {
                state.selectedListItem.links = action.payload.links;
            } else {
                state.newListItem.links = action.payload.links;
            }
        },
        setListItemHelpText: (state, action) => {
            if (action.payload.isEdit) {
                state.selectedListItem.description = action.payload.helpText;
            } else {
                state.newListItem.description = action.payload.helpText;
            }
        },
        addListItemtoList: (state, action) => {
            if (action.payload.listId) {
                if (action.payload.isEdit) {
                    state.selectedList.items.splice(
                        action.payload.itemIndex,
                        1,
                        state.selectedListItem
                    );
                    state.selectedListItem = newListItem;
                } else {
                    state.selectedList.items.push(state.newListItem);
                    state.newListItem = newListItem;
                }
            } else {
                if (action.payload.isEdit) {
                    state.newList.items.splice(
                        action.payload.itemIndex,
                        1,
                        state.selectedListItem
                    );
                    state.selectedListItem = newListItem;
                } else {
                    state.newList.items.push(state.newListItem);
                    state.newListItem = newListItem;
                }
            }
        },
        removeListItem: (state, action) => {
            if (action.payload.isEdit) {
                state.selectedList.items.splice(action.payload.index, 1);
            } else {
                state.newList.items.splice(action.payload.index, 1);
            }
        },
        setListItem: (state, action) => {
            state.selectedListItem = action.payload;
        },
        resetNewList: (state) => {
            state.newList = newList;
        },
        resetNewListItem: (state) => {
            state.newListItem = newListItem;
        },
        resetSelectedList: (state) => {
            const selectedList = state.entities.find(
                (entity) => entity.name === state.selectedList.name
            );
            if (!selectedList) return;
            state.selectedList = selectedList;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchLists.pending, (state) => {
            state.loading = LoadingState.Pending;
        });
        builder.addCase(fetchLists.fulfilled, (state, action) => {
            state.loading = LoadingState.Succeeded;
            state.entities = action.payload.data;
            state.form = action.payload.form;
        });
        builder.addCase(fetchLists.rejected, (state) => {
            state.loading = LoadingState.Failed;
        });
        builder.addCase(getListItemDataset.pending, (state) => {
            state.datasetLoading = LoadingState.Pending;
            state.newList.dataset = "";
            state.newList.items = [];
        });
        builder.addCase(getListItemDataset.fulfilled, (state, action) => {
            state.datasetLoading = LoadingState.Succeeded;
            if (action.payload.isEdit) {
                state.selectedList.items = action.payload.dataset;
                state.selectedList.dataset = action.payload.datasetId;
            } else {
                state.newList.items = action.payload.dataset;
                state.newList.dataset = action.payload.datasetId;
            }
        });
        builder.addCase(getListItemDataset.rejected, (state) => {
            state.datasetLoading = LoadingState.Failed;
            state.newList.dataset = "";
            state.selectedList.dataset = "";
        });
        builder.addCase(deleteList.pending, (state) => {
            state.loading = LoadingState.Pending;
        });
        builder.addCase(deleteList.fulfilled, (state, action) => {
            state.loading = LoadingState.Succeeded;
            state.entities = action.payload.lists as ListEntity[];
            state.form = action.payload;
            state.selectedList = newList;
        });
        builder.addCase(deleteList.rejected, (state) => {
            state.loading = LoadingState.Failed;
        });
        builder.addCase(addList.pending, (state) => {
            state.loading = LoadingState.Pending;
        });
        builder.addCase(addList.fulfilled, (state, action) => {
            state.loading = LoadingState.Succeeded;
            state.entities = action.payload.lists as ListEntity[];
            state.form = action.payload;
            state.newList = newList;
        });
        builder.addCase(addList.rejected, (state) => {
            state.loading = LoadingState.Failed;
        });
    },
});

export const {
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
} = listSlice.actions;

export const listSelector = (state: RootState) => state.list;

export default listSlice.reducer;
