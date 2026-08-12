import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { LoadingState, UsersState } from "../types";
import { getCurrentUserData } from "../../api";

const initialState: UsersState = {
    currentUser: {
        loading: LoadingState.Idle,
        data: {
            id: "",
            name: "",
            isSessionActive: false,
            homeAccountId: "",
        },
    },
};

export const getCurrentUserInfo = createAsyncThunk(
    "users/getCurrentUserInfo",
    async () => {
        const data = await getCurrentUserData();
        return data;
    }
);

export const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getCurrentUserInfo.pending, (state) => {
            state.currentUser.loading = LoadingState.Pending;
        });
        builder.addCase(getCurrentUserInfo.fulfilled, (state, action) => {
            state.currentUser.loading = LoadingState.Succeeded;
            state.currentUser.data = action.payload;
        });
        builder.addCase(getCurrentUserInfo.rejected, (state) => {
            state.currentUser.loading = LoadingState.Failed;
        });
    },
});

export const currentUserSelector = (state: RootState) => ({
    loading: state.users.currentUser.loading,
    data: state.users.currentUser.data,
});

export default usersSlice.reducer;
