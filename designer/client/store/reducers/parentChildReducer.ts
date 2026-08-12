import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { LoadingState } from "../types";
import {
    addParentChildToForm,
    getParentChildFormData,
} from "../../api/parentChildApi";
import { FormDefinition } from "@xgovformbuilder/model";
import type { RootState } from "../store";
import type { ParentChildState, DependentForm, ChildConfig } from "../types";
import { DependentFormStatus } from "../../utils";
import { getConfiguration, updateForm } from "../../api/formConfigurationsApi";

export const emptyChildConfig: ChildConfig = {
    childId: "",
    childFormName: "",
    childFormTitle: "",
    cardOrder: 0,
    dependentforms: [],
    dateComponent: "",
    helpText: "",
    parentId: "",
    condition: "",
    conditionName: "",
    isMainChild: true,
};

const initialState: ParentChildState = {
    loading: LoadingState.Idle,
    // Info on parent form
    selectedParentForm: null,
    selectedFormData: null,
    // Info on child and dependent forms
    isEdit: false,
    originalParentChildDetails: null,
    markAsParent: "0",
    description: "",
    childHeading: "",
    childConfigs: [],
    isChildEdit: false,
    editChild: null,
    editChildIndex: null,
    newChildConfig: {
        childId: "",
        childFormName: "",
        childFormTitle: "",
        cardOrder: 0,
        dependentforms: [],
        conditionName: "",
        dateComponent: "",
        helpText: "",
        parentId: "",
        condition: "",
        isMainChild: true,
    },
    parentDetails: null,
    selectedDependents: [],
};

export const getFormData = createAsyncThunk(
    "formData/fetchFormData",
    async (formId: string) => {
        const response = await getParentChildFormData(formId);
        return response;
    }
);

export const addParentChild = createAsyncThunk(
    "parentChild/addParentChild",
    async (updatedForm: FormDefinition, { rejectWithValue }) => {
        const response = await addParentChildToForm(updatedForm);
        if (response?.error) {
            return rejectWithValue(response.form);
        }
        return response?.form;
    }
);

export const removeChildFromParent = createAsyncThunk(
    "parentChild/removeChildFromParent",
    async (
        { childId, parentId }: { childId: string; parentId: string },
        { rejectWithValue }
    ) => {
        const parentForm = await getConfiguration(parentId);
        const childConfigs =
            parentForm?.parentChild?.parentChildConfig?.childConfigs;
        let filteredChilds: ChildConfig[] = [];
        (childConfigs?.length ?? 0) > 0 &&
            childConfigs?.forEach((child) => {
                if (child.dependentforms.length > 0) {
                    child.dependentforms = child.dependentforms?.filter(
                        (child) => {
                            return child.id !== childId;
                        }
                    );
                }
                if (child.childId !== childId) {
                    filteredChilds.push(child);
                }
            });
        const removeChildFromParent: FormDefinition = {
            ...parentForm!,
            parentChild: {
                ...parentForm?.parentChild!,
                parentChildConfig: {
                    ...parentForm!.parentChild!.parentChildConfig,
                    childConfigs: filteredChilds,
                },
            },
        };
        delete removeChildFromParent.parentDetails;
        if (
            removeChildFromParent.parentChild!.parentChildConfig.childConfigs
                .length === 0
        ) {
            delete removeChildFromParent.parentChild;
        }
        const updatedParentForm = removeChildFromParent;
        //@ts-ignore
        await updateForm(updatedParentForm);
    }
);

export const parentChildSlice = createSlice({
    name: "parentChild",
    initialState,
    reducers: {
        setSelectedParentForm: (state, action) => {
            state.selectedParentForm = action.payload;
        },

        /** CHILD LIST ACTIONS */
        toggleMarkAsParent: (state) => {
            state.markAsParent = state.markAsParent === "0" ? "1" : "0";
        },
        setDescription: (state, action) => {
            state.description = action.payload;
        },
        setChildHeading: (state, action) => {
            state.childHeading = action.payload;
        },

        setChildCondition: (state, action) => {
            const isEdit = action.payload.isEdit as boolean;
            const value = action.payload.value as string;
            const title = action.payload.title as string;
            if (isEdit && state.editChild) {
                state.editChild.condition = value === "none" ? "" : value;
                state.editChild.conditionName = title;
            } else {
                state.newChildConfig.condition = value === "none" ? "" : value;
                state.newChildConfig.conditionName = title;
            }
        },

        /** CHILD AND DEPENDENT FORM TABLE ACTIONS */
        addChildFromNew: (state) => {
            state.childConfigs.push(state.newChildConfig);
            const newDependentAsChild = state.newChildConfig.dependentforms?.map(
                (form) => ({
                    childId: form.id!,
                    childFormName: form.name!,
                    childFormTitle: form.title!,
                    cardOrder: 0,
                    dependentforms: [] as DependentForm[],
                    dateComponent: "",
                    helpText: "",
                    parentId: state.selectedParentForm?.Key ?? "",
                    condition: "",
                    conditionName: "",
                    isMainChild: false,
                })
            );
            newDependentAsChild?.forEach((childConfig) => {
                return state.childConfigs.push(childConfig);
            });

            state.newChildConfig = emptyChildConfig;
        },
        setNewChildConfig: (state, action) => {
            state.newChildConfig = action.payload;
        },
        addDependentToNewChild: (state, action) => {
            const newDependents = [...(action.payload as DependentForm[])];
            newDependents.forEach((d, idx) => {
                const found = state.newChildConfig!.dependentforms?.find(
                    (existing) => existing.id === d.id
                );
                if (!found) return;
                newDependents[idx].status = found.status;
            });
            state.newChildConfig.dependentforms = action.payload;
        },
        editChildDependent: (state, action) => {
            const newDependents = [...(action.payload as DependentForm[])];
            newDependents.forEach((d, idx) => {
                const found = state.editChild!.dependentforms?.find(
                    (existing) => existing.id === d.id
                );
                if (!found) return;
                newDependents[idx].status = found.status;
            });
            state.editChild!.dependentforms = action.payload;
        },

        /** CHILD CARD ACTIONS */
        resetNewChildConfig: (state) => {
            state.newChildConfig = {
                ...state.newChildConfig,
                childId: "",
                childFormName: "",
                childFormTitle: "",
                parentId: "",
                isMainChild: true,
            };
        },
        setEditChild: (state, action) => {
            const editChild = action.payload.item as ChildConfig;
            state.editChild = editChild;
            state.editChildIndex = action.payload.index as number;
            state.isChildEdit = true;
        },
        resetEditChild: (state) => {
            state.editChild = null;
            state.editChildIndex = null;
            state.isChildEdit = false;
        },
        setDependentFormStatus: (state, action) => {
            const isEdit = action.payload.isEdit as boolean;
            const status = action.payload.status as DependentFormStatus;
            const index = action.payload.index as number;
            if (isEdit && state.editChild) {
                state.editChild.dependentforms[index].status = status;
            } else {
                state.newChildConfig.dependentforms[index].status = status;
            }
        },
        removeDependentForm: (state, action) => {
            const isEdit = action.payload.isEdit as boolean;
            const index = action.payload.index as number;
            if (isEdit && state.editChild) {
                const dependentId = state.editChild.dependentforms[index].id;
                state.editChild.dependentforms.splice(index, 1);
                state.childConfigs = state.childConfigs.filter(
                    (child) => child.childId !== dependentId
                );
            } else {
                state.newChildConfig.dependentforms.splice(index, 1);
            }
        },
        setChildConfigHelpText: (state, action) => {
            const isEdit = action.payload.isEdit as boolean;
            const value = action.payload.value as string;
            if (isEdit && state.editChild) {
                state.editChild.helpText = value;
            } else {
                state.newChildConfig.helpText = value;
            }
        },
        setChildConfigTimeDependency: (state, action) => {
            const isEdit = action.payload.isEdit as boolean;
            const value = action.payload.value as string;
            if (isEdit && state.editChild) {
                state.editChild.dateComponent = value;
            } else {
                state.newChildConfig.dateComponent = value;
            }
        },
        removeChildConfig: (state, action) => {
            const index = action.payload as number;
            // Remove childs which are dependents of the child to be removed
            const dependentIds = state.childConfigs[
                index
            ].dependentforms.flatMap((dependent) => dependent.id);
            state.childConfigs = state.childConfigs.filter(
                (childConfig) => !dependentIds.includes(childConfig.childId)
            );
            // Remove dependent form which is the child to be removed
            let dependentChildIndex: number | null = null;
            let dependentIndex: number | null = null;
            state.childConfigs.some((config, idx) => {
                dependentChildIndex = idx;
                return config.dependentforms.some((dpnForms, idy) => {
                    dependentIndex = idy;
                    return dpnForms.id === state.childConfigs[index].childId;
                });
            });
            if (dependentChildIndex !== null && dependentIndex !== null) {
                state.childConfigs[dependentChildIndex].dependentforms.splice(
                    dependentIndex,
                    1
                );
            }
            // Remove child
            state.childConfigs.splice(index, 1);
        },
        saveEditChildConfig: (state) => {
            if (state.editChild && state.editChildIndex !== null) {
                state.childConfigs[state.editChildIndex] = state.editChild;
                if (state.editChild.dependentforms) {
                    const editDependentAsChild = state.editChild.dependentforms?.map(
                        (form) => ({
                            childId: form.id!,
                            childFormName: form.name!,
                            childFormTitle: form.title!,
                            cardOrder: 0,
                            dependentforms: [] as DependentForm[],
                            condition: "",
                            conditionName: "",
                            dateComponent: "",
                            helpText: "",
                            parentId: state.selectedParentForm?.Key ?? "",
                            isMainChild: false,
                        })
                    );
                    editDependentAsChild?.forEach((childConfig) => {
                        // Only adds for new and replaces for existing
                        const idx = state.childConfigs.findIndex(
                            (child) => child.childId === childConfig.childId
                        );
                        if (idx !== -1) {
                            return null;
                        }
                        return state.childConfigs.push(childConfig);
                    });
                }

                state.editChild = null;
                state.editChildIndex = null;
                state.isChildEdit = false;
            }
        },
        cancelEditChildConfig: (state) => {
            state.editChild = null;
            state.editChildIndex = null;
        },
        setChildConfigs: (state, action) => {
            state.childConfigs = action.payload;
        },
        resetParentChild: (state) => {
            state.selectedParentForm = null;
            state.selectedFormData = null;
            state.markAsParent = "0";
            state.childHeading = "";
            state.description = "";
            state.childConfigs = [];
            state.parentDetails = null;
            state.selectedDependents = [];
            state.isEdit = false;
            state.isChildEdit = false;
            state.loading = LoadingState.Idle;
            state.editChildIndex = null;
            state.editChild = null;
            state.newChildConfig = {
                childFormName: "",
                childFormTitle: "",
                childId: "",
                dependentforms: [] as DependentForm[],
                conditionName: "",
                dateComponent: "",
                helpText: "",
                cardOrder: 0,
                parentId: "",
                condition: "",
                isMainChild: true,
            };
        },
        resetChildDetails: (state) => {
            state.markAsParent = "0";
            state.childHeading = "";
            state.description = "";
            state.childConfigs = [];
            state.parentDetails = null;
            state.selectedDependents = [];
            state.isEdit = false;
            state.isChildEdit = false;
            state.loading = LoadingState.Idle;
            state.editChildIndex = null;
            state.editChild = null;
            state.newChildConfig = {
                childFormName: "",
                childFormTitle: "",
                childId: "",
                dependentforms: [] as DependentForm[],
                dateComponent: "",
                helpText: "",
                cardOrder: 0,
                parentId: "",
                condition: "",
                conditionName: "",
                isMainChild: true,
            };
        },
        setSelectedDependentForms: (state, action) => {
            state.selectedDependents = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getFormData.pending, (state) => {
            state.loading = LoadingState.Pending;
        });
        builder.addCase(getFormData.fulfilled, (state, action) => {
            const form = action.payload as FormDefinition;
            state.loading = LoadingState.Succeeded;
            state.selectedFormData = action.payload;
            if (form?.parentChild) {
                state.isEdit = true;
                state.originalParentChildDetails = form.parentChild;
                state.markAsParent = "1";
                state.childHeading =
                    form.parentChild.parentChildConfig.childHeading;
                state.description =
                    form.parentChild.parentChildConfig.description;
                state.childConfigs =
                    form.parentChild.parentChildConfig.childConfigs;
            } else if (form?.parentDetails) {
                state.parentDetails = form.parentDetails;
            }
        });
        builder.addCase(getFormData.rejected, (state) => {
            state.loading = LoadingState.Failed;
        });
        builder.addCase(removeChildFromParent.pending, (state) => {
            state.loading = LoadingState.Pending;
        });
        builder.addCase(removeChildFromParent.fulfilled, (state) => {
            state.loading = LoadingState.Succeeded;
        });
        builder.addCase(removeChildFromParent.rejected, (state) => {
            state.loading = LoadingState.Failed;
        });
    },
});

export const {
    setSelectedParentForm,
    toggleMarkAsParent,
    setChildHeading,
    setDescription,
    addChildFromNew,
    saveEditChildConfig,
    cancelEditChildConfig,
    setChildConfigTimeDependency,
    setNewChildConfig,
    addDependentToNewChild,
    setEditChild,
    resetEditChild,
    setDependentFormStatus,
    removeDependentForm,
    setChildConfigHelpText,
    resetNewChildConfig,
    removeChildConfig,
    setChildConfigs,
    resetParentChild,
    resetChildDetails,
    editChildDependent,
    setSelectedDependentForms,
    setChildCondition,
} = parentChildSlice.actions;

export const parentChildSelector = (state: RootState) => state.parentChild;

export const newChildConfigSelector = (state: RootState) =>
    state.parentChild.newChildConfig;

export const editChildConfigSelector = (state: RootState) => ({
    editChild: state.parentChild.editChild,
    editChildIndex: state.parentChild.editChildIndex,
    isChildEdit: state.parentChild.isChildEdit,
});

export default parentChildSlice.reducer;
