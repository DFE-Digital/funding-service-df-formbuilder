import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { FormSectionState, ListEntity, LoadingState } from "../types";
import {
    addEditSection,
    deleteSectionFromForm,
    fetchSectionsFromFormId,
} from "../../api/formSectionApi";
import { RootState } from "../store";
import {
    ComponentTypeEnum,
    FormDefinition,
    NumberFieldComponent,
    Section,
    YesNoFieldComponent,
} from "@xgovformbuilder/model";
import randomId from "../../randomId";

export const newSection: Section = {
    title: "",
    name: randomId(),
    repeatableSection: false,
    numberComp: "",
    conditionComp: "",
};

const initialState: FormSectionState = {
    loading: LoadingState.Idle,
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
    newSection: newSection,
    selectedSection: null,
    numberComponents: [],
    conditionalComponents: [],
};

export const fetchSections = createAsyncThunk(
    "formSection/fetchSections",
    async (formId: string, { rejectWithValue }) => {
        const response = await fetchSectionsFromFormId(formId);
        if (response.error) {
            return rejectWithValue(response.error);
        }
        return response;
    }
);

export const deleteSection = createAsyncThunk(
    "formSection/deleteSection",
    async ({ state }: { state: FormSectionState }, { rejectWithValue }) => {
        const response = await deleteSectionFromForm(state);
        if (response.error) {
            return rejectWithValue(response.form);
        }
        return response.form;
    }
);

export const addSection = createAsyncThunk(
    "formSection/addSection",
    async (
        { state, isEdit }: { state: FormSectionState; isEdit: boolean },
        { rejectWithValue }
    ) => {
        const response = await addEditSection(state, isEdit);
        if (response.error) {
            return rejectWithValue(response.form);
        }
        return response.form;
    }
);

export const formSectionSlice = createSlice({
    name: "formSection",
    initialState,
    reducers: {
        updateForm: (state, action) => {
            state.form = action.payload.updatedForm;
            if (typeof action.payload.cb === "function") {
                action.payload.cb();
            }
        },
        selectSection: (state, action) => {
            state.selectedSection = action.payload;
        },
        toggleSectionRepeatable: (state, action) => {
            const isEdit = action.payload.isEdit;
            if (isEdit) {
                state.selectedSection!.repeatableSection = !state.selectedSection!
                    .repeatableSection;
                if (state.selectedSection!.repeatableSection === false) {
                    state.selectedSection!.numberComp = "";
                    state.selectedSection!.conditionComp = "";
                }
            } else {
                state.newSection.repeatableSection = !state.newSection
                    .repeatableSection;
            }
        },
        setSectionTitle: (state, action) => {
            const isEdit = action.payload.isEdit;
            if (isEdit) {
                state.selectedSection!.title = action.payload.title;
            } else {
                state.newSection.title = action.payload.title;
            }
        },
        setSectionName: (state, action) => {
            const isEdit = action.payload.isEdit;
            if (isEdit) {
                state.selectedSection!.name = action.payload.name;
            } else {
                state.newSection.name = action.payload.name;
            }
        },
        selectNumberComp: (state, action) => {
            const isEdit = action.payload.isEdit;
            if (isEdit) {
                state.selectedSection!.numberComp = action.payload.id;
            } else {
                state.newSection.numberComp = action.payload.id;
            }
        },
        selectConditionComp: (state, action) => {
            const isEdit = action.payload.isEdit;
            if (isEdit) {
                state.selectedSection!.conditionComp = action.payload.id;
            } else {
                state.newSection.conditionComp = action.payload.id;
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchSections.pending, (state) => {
            state.loading = LoadingState.Pending;
        });
        builder.addCase(fetchSections.fulfilled, (state, action) => {
            state.loading = LoadingState.Succeeded;
            state.entities = action.payload.data;
            state.form = action.payload.form;
            state.numberComponents = action.payload.form.pages.flatMap(
                (page) => {
                    const numberComponents =
                        page.components?.filter(
                            (component) =>
                                component.type === ComponentTypeEnum.NumberField
                        ) ?? ([] as NumberFieldComponent[]);
                    return numberComponents.map((numberComp) => ({
                        id: numberComp.name,
                        key: numberComp.name,
                        title: numberComp.title,
                    }));
                }
            );
            state.conditionalComponents = action.payload.form.pages.flatMap(
                (page) => {
                    const conditionComponents =
                        page.components?.filter(
                            (component) =>
                                component.type === ComponentTypeEnum.YesNoField
                        ) ?? ([] as YesNoFieldComponent[]);
                    return conditionComponents.map((conditionComp) => ({
                        id: conditionComp.name,
                        key: conditionComp.name,
                        title: conditionComp.title,
                    }));
                }
            );
        });
        builder.addCase(fetchSections.rejected, (state) => {
            state.loading = LoadingState.Failed;
        });
        builder.addCase(addSection.pending, (state) => {
            state.loading = LoadingState.Pending;
        });
        builder.addCase(addSection.fulfilled, (state, action) => {
            state.loading = LoadingState.Succeeded;
            state.entities = action.payload.sections;
            state.form = action.payload;
            state.selectedSection = null;
            state.newSection = { ...newSection, name: randomId() };
        });
        builder.addCase(addSection.rejected, (state) => {
            state.loading = LoadingState.Failed;
            state.selectedSection = null;
            state.newSection = { ...newSection, name: randomId() };
        });
        builder.addCase(deleteSection.pending, (state) => {
            state.loading = LoadingState.Pending;
        });
        builder.addCase(deleteSection.fulfilled, (state, action) => {
            state.loading = LoadingState.Succeeded;
            state.entities = action.payload.sections;
            state.form = action.payload;
            state.selectedSection = null;
            state.newSection = { ...newSection, name: randomId() };
        });
        builder.addCase(deleteSection.rejected, (state) => {
            state.loading = LoadingState.Failed;
            state.selectedSection = null;
            state.newSection = { ...newSection, name: randomId() };
        });
    },
});

export const {
    updateForm,
    selectSection,
    toggleSectionRepeatable,
    setSectionTitle,
    setSectionName,
    selectNumberComp,
    selectConditionComp,
} = formSectionSlice.actions;

export const formSectionSelector = (state: RootState) => state.formSection;

export default formSectionSlice.reducer;
