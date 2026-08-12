import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import {
    ChangeAccessTypeState,
    FormConfigurationWithChild,
    LoadingState,
} from "../types";
import { getFormConfigWithChildByListForm } from "../../api";
import { FormAccessType } from "@xgovformbuilder/model";

const initialState: ChangeAccessTypeState = {
    loading: LoadingState.Idle,
    selectedFormConfig: null,
    selectedAccessType: null,
    isParentSelected: null,
    selectedChildForms: [],
    details: {
        show: false,
        data: null,
    },
};

export const getFormConfigWithChild = createAsyncThunk(
    "changeAccessType/getFormConfigWithChild",
    async (formId: string, { rejectWithValue }) => {
        const data = await getFormConfigWithChildByListForm(formId);
        if (!data) {
            return rejectWithValue(null);
        }
        return data;
    }
);

export const changeAccessTypeSlice = createSlice({
    name: "changeAccessType",
    initialState,
    reducers: {
        setSelectedFormConfig: (state, action) => {
            state.selectedFormConfig = action.payload;
            if (!action.payload?.childs?.length) {
                state.selectedAccessType = action.payload.signInRequired
                    ? FormAccessType.DFESignIn
                    : FormAccessType.Public;
            }
        },
        setSelectedAccessType: (state, action) => {
            state.selectedAccessType = action.payload;
        },
        setIsParentSelected: (state, action) => {
            if (state.isParentSelected) {
                state.isParentSelected = null;
            } else {
                state.isParentSelected = action.payload;
                state.selectedFormConfig?.childs.forEach((child) => {
                    state.selectedChildForms.push(child.Key);
                });
            }
        },
        setSelectedChildForms: (state, action) => {
            const childId = action.payload as string;
            const index = state.selectedChildForms.findIndex(
                (id) => id === childId
            );
            if (index !== -1) {
                state.selectedChildForms.splice(index, 1);
            } else {
                state.selectedChildForms.push(childId);
            }
        },
        toggleDetailModal: (state, action?) => {
            if (state.details.show && state.details.data) {
                state.details.show = false;
                state.details.data = null;
            } else {
                state.details.show = true;
                state.details.data = action?.payload as FormConfigurationWithChild;
            }
        },
        resetState: (state) => {
            state.loading = LoadingState.Idle;
            state.selectedFormConfig = null;
            state.details.data = null;
            state.details.show = false;
            state.selectedAccessType = null;
            state.selectedChildForms = [];
            state.isParentSelected = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getFormConfigWithChild.pending, (state) => {
            state.loading = LoadingState.Pending;
        });
        builder.addCase(getFormConfigWithChild.fulfilled, (state, action) => {
            state.loading = LoadingState.Succeeded;
            state.selectedFormConfig = action.payload;
            if (!action.payload.childs.length) {
                state.selectedAccessType = action.payload.signInRequired
                    ? FormAccessType.DFESignIn
                    : FormAccessType.Public;
            }
        });
    },
});

export const {
    setSelectedFormConfig,
    setSelectedAccessType,
    toggleDetailModal,
    resetState,
    setIsParentSelected,
    setSelectedChildForms,
} = changeAccessTypeSlice.actions;

export const changeAccessTypeSelector = (state: RootState) =>
    state.changeAccessType;

export default changeAccessTypeSlice.reducer;
