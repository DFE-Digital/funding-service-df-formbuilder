import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchAllformConfigs, deleteFormConfig } from "../../api";
import type { RootState } from "../store";
import { LoadingState, FormConfigurationState } from "../types";
import { mapChildFormConfigToParent } from "../utils";

const initialState: FormConfigurationState = {
    loading: LoadingState.Idle,
    entities: [],
};

export const listFormConfigurations = createAsyncThunk(
    "formConfigurations/listFormConfigurations",
    async (_, { rejectWithValue }) => {
        const response = await fetchAllformConfigs();
        if (response.error) {
            return rejectWithValue(response.error);
        }
        return response;
    }
);

export const deleteFormConfigurations = createAsyncThunk(
    "formConfigurations/deleteFormConfigurations",
    async (formId: string, { rejectWithValue }) => {
        const response = await deleteFormConfig(formId);
        if (!response.status) {
            return rejectWithValue(formId);
        }
        return formId;
    }
);

export const formConfigurationsSlice = createSlice({
    name: "formConfigurations",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(listFormConfigurations.pending, (state) => {
            state.loading = LoadingState.Pending;
        });
        builder.addCase(listFormConfigurations.fulfilled, (state, action) => {
            state.loading = LoadingState.Succeeded;
            state.entities = mapChildFormConfigToParent(action.payload.data);
        });
        builder.addCase(listFormConfigurations.rejected, (state, action) => {
            state.loading = LoadingState.Failed;
        });
        builder.addCase(deleteFormConfigurations.pending, (state) => {
            state.loading = LoadingState.Pending;
        });
        builder.addCase(deleteFormConfigurations.fulfilled, (state, action) => {
            state.loading = LoadingState.Succeeded;
            state.entities = state.entities.filter(
                (form) => form.Key !== action.payload
            );
        });
        builder.addCase(deleteFormConfigurations.rejected, (state, action) => {
            state.loading = LoadingState.Failed;
        });
    },
});

export const formConfigurationsSelector = (state: RootState) => ({
    loading: state.formConfigurations.loading,
    data: state.formConfigurations.entities,
});

export default formConfigurationsSlice.reducer;
