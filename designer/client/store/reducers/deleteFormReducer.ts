import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import {
    DeleteFormState,
    FormConfigurationWithChild,
    LoadingState,
} from "../types";
import {
    deleteMultipleFormConfiguration,
    getFormConfigWithChildByListFormForDelete,
} from "../../api";

const initialState: DeleteFormState = {
    loading: LoadingState.Idle,
    selectedFormConfig: null,
    isParentSelected: null,
    isChild: false,
    selectedChildForms: [],
    details: {
        show: false,
        data: null,
    },
};

export const getFormConfigWithChild = createAsyncThunk(
    "deleteForm/getFormConfigWithChild",
    async (formId: string, { rejectWithValue }) => {
        const data = await getFormConfigWithChildByListFormForDelete(formId);
        if (!data) {
            return rejectWithValue(null);
        }
        return data;
    }
);

export const deleteMutipleForms = createAsyncThunk(
    "deleteForm/deleteMutipleForms",
    async (
        { state, hasChild }: { state: DeleteFormState; hasChild: boolean },
        { rejectWithValue }
    ) => {
        const data = await deleteMultipleFormConfiguration(state, hasChild);
        if (!data) {
            return rejectWithValue(null);
        }
        return data;
    }
);

export const deleteFormSlice = createSlice({
    name: "deleteForm",
    initialState,
    reducers: {
        setSelectedFormConfig: (state, action) => {
            state.selectedFormConfig = action.payload.form;
            state.isChild = action.payload.isChild;
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
        resetDeleteFormState: (state) => {
            state.loading = LoadingState.Idle;
            state.selectedFormConfig = null;
            state.details.data = null;
            state.details.show = false;
            state.selectedChildForms = [];
            state.isParentSelected = null;
            state.isChild = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getFormConfigWithChild.pending, (state) => {
            state.loading = LoadingState.Pending;
        });
        builder.addCase(getFormConfigWithChild.fulfilled, (state, action) => {
            state.loading = LoadingState.Succeeded;
            state.selectedFormConfig = action.payload.form!;
            state.isChild = action.payload.isChild;
        });
        builder.addCase(getFormConfigWithChild.rejected, (state) => {
            state.loading = LoadingState.Failed;
        });
        builder.addCase(deleteMutipleForms.pending, (state) => {
            state.loading = LoadingState.Pending;
        });
        builder.addCase(deleteMutipleForms.fulfilled, (state) => {
            state.loading = LoadingState.Succeeded;
        });
        builder.addCase(deleteMutipleForms.rejected, (state) => {
            state.loading = LoadingState.Failed;
        });
    },
});

export const {
    setSelectedFormConfig,
    toggleDetailModal,
    resetDeleteFormState,
    setIsParentSelected,
    setSelectedChildForms,
} = deleteFormSlice.actions;

export const deleteFormSelector = (state: RootState) => state.deleteForm;

export default deleteFormSlice.reducer;
