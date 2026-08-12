import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import {
    ChangeStatusState,
    FormConfigurationWithChild,
    LoadingState,
} from "../types";
import {
    getFormConfigWithChildByListForm,
    multipleFormStatusUpdate,
} from "../../api";

const initialState: ChangeStatusState = {
    loading: LoadingState.Idle,
    selectedFormConfig: null,
    selectedStatus: null,
    isParentSelected: null,
    selectedChildForms: [],
    details: {
        show: false,
        data: null,
    },
};

export const getFormConfigWithChild = createAsyncThunk(
    "changeStatus/getFormConfigWithChild",
    async (formId: string, { rejectWithValue }) => {
        const data = await getFormConfigWithChildByListForm(formId);
        if (!data) {
            return rejectWithValue(null);
        }
        return data;
    }
);

export const updateMutipleStatus = createAsyncThunk(
    "changeStatus/updateMutipleStatus",
    async (
        { state, hasChild }: { state: ChangeStatusState; hasChild: boolean },
        { rejectWithValue }
    ) => {
        const data = await multipleFormStatusUpdate(state, hasChild);
        if (!data) {
            return rejectWithValue(null);
        }
        return data;
    }
);

export const changeStatusSlice = createSlice({
    name: "changeStatus",
    initialState,
    reducers: {
        setSelectedFormConfig: (state, action) => {
            state.selectedFormConfig = action.payload;
            if (!action.payload?.childs?.length) {
                state.selectedStatus = action.payload.FormStatus;
            }
        },
        setSelectedStatus: (state, action) => {
            state.selectedStatus = action.payload;
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
        resetChangeStatusState: (state) => {
            state.loading = LoadingState.Idle;
            state.selectedFormConfig = null;
            state.details.data = null;
            state.details.show = false;
            state.selectedStatus = null;
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
                state.selectedStatus = action.payload.FormStatus ?? null;
            }
        });
        builder.addCase(getFormConfigWithChild.rejected, (state) => {
            state.loading = LoadingState.Failed;
        });
        builder.addCase(updateMutipleStatus.pending, (state) => {
            state.loading = LoadingState.Pending;
        });
        builder.addCase(updateMutipleStatus.fulfilled, (state) => {
            state.loading = LoadingState.Succeeded;
        });
        builder.addCase(updateMutipleStatus.rejected, (state) => {
            state.loading = LoadingState.Failed;
        });
    },
});

export const {
    setSelectedFormConfig,
    setSelectedStatus,
    toggleDetailModal,
    resetChangeStatusState,
    setIsParentSelected,
    setSelectedChildForms,
} = changeStatusSlice.actions;

export const changeStatusSelector = (state: RootState) => state.changeStatus;

export default changeStatusSlice.reducer;
