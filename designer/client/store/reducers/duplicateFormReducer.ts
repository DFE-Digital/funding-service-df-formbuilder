import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import {
    DuplicateFormState,
    FormConfigurationWithChild,
    LoadingState,
} from "../types";
import {
    checkIfNameIsValid,
    duplicateForm,
    duplicateMultipleFormConfiguration,
    getFormConfigWithChildByListFormForDuplicate,
} from "../../api";
import { checkNameExistsInState } from "../utils";

const initialState: DuplicateFormState = {
    loading: LoadingState.Idle,
    showRedirect: false,
    selectedFormConfig: null,
    parentForm: {
        newName: "",
        isChecked: false,
        error: "",
    },
    isChild: false,
    selectedChildForms: [],
    childForms: [],
    details: {
        show: false,
        data: null,
    },
};

const DUPLICATE_ERROR_MESSAGE =
    "Please enter a different form name. This one is already in use.";

const SPECIAL_CHARS_ERROR_MESSAGE =
    "Form name should not contain special characters";

export const getFormConfigWithChild = createAsyncThunk(
    "duplicateForm/getFormConfigWithChild",
    async (formId: string, { rejectWithValue }) => {
        const data = await getFormConfigWithChildByListFormForDuplicate(formId);
        if (!data) {
            return rejectWithValue(null);
        }
        return data;
    }
);

export const checkName = createAsyncThunk(
    "duplicateForm/checkName",
    async (
        { formName, id }: { formName: string; id: string },
        { rejectWithValue }
    ) => {
        const data = await checkIfNameIsValid(formName);
        if (data.error === "special-character-error") {
            return rejectWithValue({ error: data.error, formId: id });
        }
        return { exists: data.exists, formId: id, name: formName };
    }
);

export const duplicateParentForm = createAsyncThunk(
    "duplicateForm/duplicateParentForm",
    async (
        {
            state,
            currentUser,
        }: {
            state: DuplicateFormState;
            currentUser: {
                id: string;
                name: string;
                isSessionActive: boolean;
                homeAccountId: string;
            };
        },
        { rejectWithValue }
    ) => {
        const data = await duplicateForm(state, currentUser);
        if (data.error) {
            return rejectWithValue(data.error);
        }
        return data;
    }
);

export const duplicateMutipleForms = createAsyncThunk(
    "duplicateForm/duplicateMutipleForms",
    async (
        {
            state,
            currentUser,
        }: {
            state: DuplicateFormState;
            currentUser: {
                id: string;
                name: string;
                isSessionActive: boolean;
                homeAccountId: string;
            };
        },
        { rejectWithValue }
    ) => {
        const data = await duplicateMultipleFormConfiguration(
            state,
            currentUser
        );
        if (!!data.error) {
            return rejectWithValue(data.error);
        }
        return data;
    }
);

export const duplicateFormSlice = createSlice({
    name: "duplicateForm",
    initialState,
    reducers: {
        setSelectedFormConfig: (state, action) => {
            state.selectedFormConfig = action.payload.form;
            state.isChild = action.payload.isChild;
        },
        setParentNewName: (state, action) => {
            state.parentForm.newName = action.payload;
            state.parentForm.error = "";
            state.parentForm.isChecked = false;
        },
        setSelectedChildForms: (state, action) => {
            const childId = action.payload as string;
            const index = state.selectedChildForms.findIndex(
                (id) => id === childId
            );
            if (index !== -1) {
                state.selectedChildForms.splice(index, 1);
                state.childForms.splice(index, 1);
            } else {
                state.selectedChildForms.push(childId);
                state.childForms.push({
                    id: childId,
                    newName: "",
                    isChecked: false,
                    error: "",
                });
            }
        },
        setChildFormDetail: (state, action) => {
            const { id, name } = action.payload;
            const index = state.childForms.findIndex(
                (child) => id === child.id
            );
            state.childForms[index].newName = name;
            state.childForms[index].error = "";
            state.childForms[index].isChecked = false;
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
        resetDuplicateFormState: (state) => {
            state.loading = LoadingState.Idle;
            state.selectedFormConfig = null;
            state.details.data = null;
            state.details.show = false;
            state.selectedChildForms = [];
            state.parentForm = {
                newName: "",
                isChecked: false,
                error: "",
            };
            state.childForms = [];
            state.isChild = false;
            state.showRedirect = false;
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
        builder.addCase(checkName.pending, (state) => {});
        builder.addCase(checkName.fulfilled, (state, action) => {
            const { exists, formId, name } = action.payload;
            const isParent = formId === state.selectedFormConfig?.Key;
            const existsInState = checkNameExistsInState(name, state);
            const isChecked = !(exists || existsInState);
            if (isParent) {
                state.parentForm.isChecked = isChecked;
                state.parentForm.error = isChecked
                    ? ""
                    : DUPLICATE_ERROR_MESSAGE;
            } else {
                const index = state.childForms.findIndex(
                    (child) => formId === child.id
                );
                state.childForms[index].isChecked = isChecked;
                state.childForms[index].error = isChecked
                    ? ""
                    : DUPLICATE_ERROR_MESSAGE;
            }
        });
        builder.addCase(checkName.rejected, (state, action) => {
            const { formId, error } = action.payload as {
                formId: string;
                error: string;
            };
            const isParent = formId === state.selectedFormConfig?.Key;

            if (isParent) {
                state.parentForm.isChecked = false;
                state.parentForm.error = SPECIAL_CHARS_ERROR_MESSAGE;
            } else {
                const index = state.childForms.findIndex(
                    (child) => formId === child.id
                );
                state.childForms[index].isChecked = false;
                state.childForms[index].error = SPECIAL_CHARS_ERROR_MESSAGE;
            }
        });
        builder.addCase(duplicateParentForm.fulfilled, (state) => {
            state.showRedirect = true;
        });
        builder.addCase(duplicateParentForm.rejected, (state, action) => {
            state.parentForm.error =
                action.payload === "duplicate-name-error"
                    ? DUPLICATE_ERROR_MESSAGE
                    : SPECIAL_CHARS_ERROR_MESSAGE;
        });
        builder.addCase(duplicateMutipleForms.fulfilled, (state) => {
            state.showRedirect = true;
        });
    },
});

export const {
    setSelectedFormConfig,
    toggleDetailModal,
    resetDuplicateFormState,
    setParentNewName,
    setChildFormDetail,
    setSelectedChildForms,
} = duplicateFormSlice.actions;

export const duplicateFormSelector = (state: RootState) => state.duplicateForm;

export default duplicateFormSlice.reducer;
