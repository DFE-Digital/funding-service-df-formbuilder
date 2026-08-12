import { createEntityAdapter, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { ApiState, LoadingState } from "../types";
import { RootState } from "../store";

import { listFormConfigurations } from "./formConfigurationsReducer";
import {
    getFormConfigWithChild,
    updateMutipleStatus,
} from "./changeStatusReducer";
import { getFormConfigWithChild as getFormConfigForChangeAccess } from "./changeAccessTypeReducer";
import {
    deleteMutipleForms,
    getFormConfigWithChild as getFormConfigWithChildForDelete,
} from "./deleteFormReducer";

import { addList, deleteList } from "./listReducer";
import {
    addParentChild,
    getFormData,
    removeChildFromParent,
} from "./parentChildReducer";
import {
    duplicateMutipleForms,
    duplicateParentForm,
} from "./duplicateFormReducer";
import {
    fetchCalculations,
    saveCalculations,
    deleteCalculation,
} from "./calculationBuilderReducer";
const apiAdapter = createEntityAdapter<ApiState>();

const initialState = apiAdapter.getInitialState({
    status: LoadingState.Idle,
    message: "",
});

const APIThunks = [
    {
        method: listFormConfigurations,
        message: "Please wait a moment, while we fetch all forms",
    },
    {
        method: getFormConfigWithChild,
        message: "Please wait a moment, while we fetch form details",
    },
    {
        method: updateMutipleStatus,
        message: "Processing your request, this should take a few moments...",
    },
    {
        method: getFormConfigWithChildForDelete,
        message: "Please wait a moment, while we fetch form details",
    },
    {
        method: deleteMutipleForms,
        message: "Processing your request, this should take a few moments...",
    },
    {
        method: addList,
        message: "Processing your request, this should take a few moments...",
    },
    {
        method: deleteList,
        message: "Processing your request, this should take a few moments...",
    },
    {
        method: addParentChild,
        message: "Processing your request, this should take a few moments...",
    },
    {
        method: getFormData,
        message: "Please wait a moment, while we fetch form details",
    },
    {
        method: removeChildFromParent,
        message: "Processing your request, this should take a few moments...",
    },
    {
        method: getFormConfigForChangeAccess,
        message: "Processing your request, this should take a few moments...",
    },
    {
        method: duplicateParentForm,
        message: "Processing your request, this should take a few moments...",
    },
    {
        method: duplicateMutipleForms,
        message: "Processing your request, this should take a few moments...",
    },
    {
        method: fetchCalculations,
        message: "Processing your request, this should take a few moments...",
    },
    {
        method: saveCalculations,
        message: "Processing your request, this should take a few moments...",
    },
    {
        method: deleteCalculation,
        message: "Processing your request, this should take a few moments...",
    },
];

const apiSlice = createSlice({
    name: "api",
    initialState,
    reducers: {
        clearApi: (state) => {
            state.status = LoadingState.Idle;
            state.message = "";
        },
        setApiStatus: (state, action) => {
            state.status = action.payload.status;
            state.message = action.payload.message;
        },
    },
    extraReducers: (builder) => {
        APIThunks.forEach((thunk) => {
            builder
                .addMatcher(isAnyOf(thunk.method.fulfilled), (state) => {
                    state.status = LoadingState.Succeeded;
                    state.message = "";
                })
                .addMatcher(isAnyOf(thunk.method.rejected), (state) => {
                    state.status = LoadingState.Failed;
                    state.message = "";
                })
                .addMatcher(isAnyOf(thunk.method.pending), (state) => {
                    state.status = LoadingState.Pending;
                    state.message = thunk.message;
                });
        });
    },
});
export const { clearApi, setApiStatus } = apiSlice.actions;
export default apiSlice.reducer;
export const getApiStatus = (state: RootState) => state.api;
