import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    CalculationBuilderState,
    CalculationFormState,
    ComputeCalculationUnit,
    ComputeComponentUnit,
    ComputeList,
    LoadingState,
    SelectedEntity,
} from "../types";
import {
    deleteCalculationFromForm,
    fetchCalculationFromFormId,
    saveCalculationToForm,
} from "../../api/calculationApi";
import { RootState } from "../store";
import {
    ComponentTypeEnum,
    DataSet,
    DesignedDataSet,
    NumberFieldComponent,
    Page,
    ResultComponent,
    FormDefinition,
    Calculation,
} from "@xgovformbuilder/model";
import { checkIfAllEntitiesSelected } from "../../pages/Calculation/utils";
import { nanoid } from "nanoid";
import { populateEditCalculationState } from "../utils";

// Helper to compute the next order number for an ordered list of units.
const nextOrderFor = (list: { order: number }[] | undefined) => {
    const orders = (list ?? []).map((c) => c.order);
    return orders.length ? Math.max(...orders) + 1 : 1;
};

export const newCalculation: CalculationFormState = {
    title: "",
    selectedPageOrDataset: null,
    selectedCalculation: null,
    isSelectedPage: false,
    selectAllEntity: "0",
    selectedEntities: [],
    computeList: [],
    addedCalculations: null,
    repeatableSection: null,
};

const initialState: CalculationBuilderState = {
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
    selectedCalculation: null,
    newCalculation: {
        title: "",
        selectedPageOrDataset: null,
        selectedCalculation: null,
        isSelectedPage: false,
        selectAllEntity: "0",
        selectedEntities: [],
        computeList: [],
        addedCalculations: null,
        repeatableSection: null,
    },
    editCalculation: {
        title: "",
        selectedPageOrDataset: null,
        selectedCalculation: null,
        isSelectedPage: false,
        selectAllEntity: "0",
        selectedEntities: [],
        computeList: [],
        addedCalculations: null,
        repeatableSection: null,
    },
};

export const deleteCalculation = createAsyncThunk(
    "calculation/deleteCalculation",
    async (
        { calcId, data }: { calcId: string; data: FormDefinition },
        { rejectWithValue }
    ) => {
        const response = await deleteCalculationFromForm(calcId, data);
        if (response.error) {
            return rejectWithValue(response.form);
        }
        return response.form;
    }
);
export const fetchCalculations = createAsyncThunk(
    "calculation/fetchCalculations",
    async (formId: string, { rejectWithValue }) => {
        const response = await fetchCalculationFromFormId(formId);
        if (response.error) {
            return rejectWithValue(response.error);
        }
        return response;
    }
);

export const saveCalculations = createAsyncThunk(
    "calculation/saveCalculations",
    async (
        { state, isEdit }: { state: CalculationBuilderState; isEdit: boolean },
        { rejectWithValue }
    ) => {
        const response = await saveCalculationToForm(state, isEdit);
        if (!response) {
            return rejectWithValue("Error saving calculation to form");
        }
        return response;
    }
);

export const calculationBuilderSlice = createSlice({
    name: "calculationBuilder",
    initialState,
    reducers: {
        updateForm: (state, action) => {
            state.form = action.payload.updatedForm;
            if (typeof action.payload.cb === "function") {
                action.payload.cb();
            }
        },
        setSelectedCalculation: (state, action) => {
            state.selectedCalculation = action.payload;
            state.editCalculation = populateEditCalculationState(
                action.payload,
                state.form
            );
        },
        setTitle: (state, action) => {
            const { isEdit, title } = action.payload;
            if (isEdit) {
                state.editCalculation.title = title;
            } else {
                state.newCalculation.title = title;
            }
        },
        setSelectedPageOrDataset: (state, action) => {
            // payload may be string (selectedEntityId) or { selectedEntityId, isEdit }
            const payload: any = action.payload;
            const selectedEntityId: string = payload.selectedEntityId;
            const isEdit: boolean = !!payload.isEdit;
            const target = isEdit
                ? state.editCalculation
                : state.newCalculation;

            const selectedPage = state.form.pages.find(
                (pg) => pg.path === selectedEntityId
            ) as Page | undefined;
            if (selectedPage) {
                target.isSelectedPage = true;
            }
            const selectedDataset = state.form.designedDataSets?.find(
                (ds) => ds.id === selectedEntityId
            ) as DesignedDataSet | undefined;
            if (selectedDataset) {
                target.isSelectedPage = false;
            }
            target.selectedPageOrDataset =
                selectedPage ?? selectedDataset ?? null;

            // Ensure all variable entries in computeList are present in selectedEntities
            const variableEntities = target.computeList
                .filter((u) => u.type === "component")
                .map((u) => (u as any).entity as SelectedEntity);

            const alreadyHas = (ent: SelectedEntity) =>
                target.selectedEntities.some((e) => {
                    if (e.isComponent && ent.isComponent) {
                        return e.name === ent.name;
                    }
                    if (!e.isComponent && !ent.isComponent) {
                        return (
                            e.index === ent.index &&
                            e.designedDataSetId! === ent.designedDataSetId!
                        );
                    }
                    return false;
                });

            variableEntities.forEach((ent) => {
                if (!alreadyHas(ent)) {
                    target.selectedEntities.push(ent);
                }
            });

            // Recalculate selectAllEntity for the newly selected page/dataset
            const allEntitiesForCheck = target.isSelectedPage
                ? (target.selectedPageOrDataset as Page)?.components ?? []
                : (target.selectedPageOrDataset as DesignedDataSet)?.data?.flat() ??
                  [];

            if (
                checkIfAllEntitiesSelected(
                    target.selectedEntities,
                    allEntitiesForCheck,
                    target.isSelectedPage
                        ? undefined
                        : (target.selectedPageOrDataset as DesignedDataSet)?.id
                )
            ) {
                target.selectAllEntity = "1";
            } else {
                target.selectAllEntity = "0";
            }
        },
        setRepeatableSection: (state, action) => {
            const payload: any = action.payload;
            const selectedEntityId: string = payload.selectedEntityId;
            const isEdit: boolean = !!payload.isEdit;
            const target = isEdit
                ? state.editCalculation
                : state.newCalculation;

            const selectedPage = state.form.pages.find(
                (pg) => pg.path === selectedEntityId
            ) as Page | undefined;
            if (!selectedPage) return;
            const sections = state.form.sections;
            const section = sections.find(
                (sec) => sec.name === selectedPage.section
            );
            const isRepeatableSection = section?.repeatableSection;
            target.repeatableSection = !!isRepeatableSection ? section : null;
        },
        toggleCalculationSelect: (state, action) => {
            if (state.selectedCalculation?.name === action.payload) {
                state.selectedCalculation = null;
            } else {
                state.selectedCalculation =
                    state.entities.find(
                        (calculation) => calculation.name === action.payload
                    ) || null;
            }
        },
        setPageDataset: (state, action) => {
            const payload: any = action.payload;
            const { selectedEntity, isPage } = payload;
            const isEdit: boolean = !!payload.isEdit;
            const target = isEdit
                ? state.editCalculation
                : state.newCalculation;
            target.selectedPageOrDataset = selectedEntity;
            target.isSelectedPage = isPage;
            if (
                checkIfAllEntitiesSelected(
                    target.selectedEntities,
                    isPage
                        ? selectedEntity?.components || []
                        : selectedEntity?.data?.flat() || []
                )
            ) {
                target.selectAllEntity = "1";
            } else {
                target.selectAllEntity = "0";
            }
        },
        toggleEntitySelect: (state, action) => {
            const payload: any = action.payload;
            const {
                id,
                isComponent,
                isRepeatable,
                designedDataSetId,
            }: {
                id: string;
                isComponent: boolean;
                isRepeatable: boolean;
                designedDataSetId: string;
            } = payload;
            const isEdit: boolean = !!payload.isEdit;
            const target = isEdit
                ? state.editCalculation
                : state.newCalculation;

            if (isComponent) {
                // selected is a ComponentDef
                const page = target.selectedPageOrDataset as Page | null;
                const selected = page?.components?.find(
                    (comp) => comp.name === id
                ) as NumberFieldComponent | ResultComponent | undefined;
                if (!selected) return;

                const exists = target.selectedEntities.find(
                    (e) => e.isComponent && e.name === selected.name
                );
                if (exists) {
                    target.selectedEntities = target.selectedEntities.filter(
                        (e) => !(e.isComponent && e.name === selected.name)
                    );
                    target.selectAllEntity = "0";
                } else {
                    const newEntity = {
                        ...selected,
                        isComponent: true,
                        isRepeatable,
                    } as SelectedEntity;
                    target.selectedEntities.push(newEntity);

                    if (
                        checkIfAllEntitiesSelected(
                            target.selectedEntities,
                            page?.components || []
                        )
                    ) {
                        target.selectAllEntity = "1";
                    }
                }
            } else {
                // selected is a DataSet
                const ds = target.selectedPageOrDataset as DesignedDataSet | null;
                const selected = ds?.data
                    ?.flat()
                    .find((d) => d.index === id) as DataSet | undefined;
                if (!selected) return;

                const exists = target.selectedEntities.find(
                    (e) =>
                        !e.isComponent &&
                        e.designedDataSetId === designedDataSetId &&
                        e.index === selected.index
                );
                if (exists) {
                    target.selectedEntities = target.selectedEntities.filter(
                        (e) =>
                            !(
                                !e.isComponent &&
                                e.designedDataSetId === designedDataSetId &&
                                e.index === selected.index
                            )
                    );
                    target.selectAllEntity = "0";
                } else {
                    const newEntity = {
                        ...selected,
                        isComponent: false,
                        designedDataSetId: designedDataSetId,
                        // keep original index or namespace it elsewhere if needed
                    } as SelectedEntity;
                    target.selectedEntities.push(newEntity);
                    if (
                        checkIfAllEntitiesSelected(
                            target.selectedEntities,
                            ds?.data?.flat() || [],
                            ds?.id || ""
                        )
                    ) {
                        target.selectAllEntity = "1";
                    }
                }
            }
        },
        addEntityToComputeList: (state, action) => {
            const payload: any = action.payload;
            const isEdit: boolean = !!payload.isEdit;
            const target = isEdit
                ? state.editCalculation
                : state.newCalculation;
            const selectedEntities = target.selectedEntities;
            const getNextOrder = () => nextOrderFor(target.computeList);
            // When adding multiple selected entities, ensure operator units
            // are inserted between them and that the compute list ends with an operator.
            const ensureEndsWithOperator = () => {
                // Only insert a separator operator if the computeList already
                // contains at least one unit (avoid leading operator on empty list).
                if (target.computeList.length === 0) return;
                const last = target.computeList.slice(-1)[0];
                if (!last || last.type !== "operator") {
                    target.computeList.push({
                        id: nanoid(5),
                        type: "operator",
                        order: getNextOrder(),
                        value: null,
                    });
                }
            };

            selectedEntities.forEach((sel) => {
                const alreadyExists = target.computeList.some((unit) => {
                    if (unit.type !== "component") return false;
                    const e = (unit as any).entity as SelectedEntity;
                    if (sel.isComponent) {
                        return e.isComponent && e.name === sel.name;
                    } else {
                        return (
                            !e.isComponent &&
                            e.designedDataSetId === sel.designedDataSetId &&
                            e.index === sel.index
                        );
                    }
                });

                if (!alreadyExists) {
                    // Before adding a component, ensure there is an operator at the end
                    // so components are separated by operators.
                    ensureEndsWithOperator();

                    const unit: ComputeComponentUnit = {
                        id: nanoid(5),
                        type: "component",
                        order: getNextOrder(),
                        value: sel.isComponent
                            ? sel.name
                            : `${sel.designedDataSetId}->${sel.value}`,
                        entity: sel,
                    };
                    target.computeList.push(unit);
                }
            });
        },
        toggleSelectAllEntity: (state, action) => {
            const payload: any = action.payload;
            const isEdit: boolean = !!payload.isEdit;
            const target = isEdit
                ? state.editCalculation
                : state.newCalculation;

            target.selectAllEntity = target.selectAllEntity === "1" ? "0" : "1";
            const isSelectAll = target.selectAllEntity === "1";
            if (isSelectAll) {
                if (target.isSelectedPage) {
                    const page = target.selectedPageOrDataset as Page | null;
                    if (page) {
                        // only push entities that are not already selected
                        const existingNames = new Set(
                            target.selectedEntities
                                .filter((e) => e.isComponent)
                                .map((e) => e.name)
                        );
                        page.components?.forEach((comp) => {
                            if (
                                !existingNames.has(comp.name) &&
                                (comp.type === ComponentTypeEnum.NumberField ||
                                    comp.type === ComponentTypeEnum.Result)
                            ) {
                                target.selectedEntities.push({
                                    ...comp,
                                    isComponent: true,
                                    isRepeatable:
                                        target.repeatableSection
                                            ?.repeatableSection,
                                } as SelectedEntity);
                            }
                        });
                    }
                } else {
                    const ds = target.selectedPageOrDataset as DesignedDataSet | null;
                    if (ds) {
                        // only push entities that are not already selected
                        const existingIndexes = new Set(
                            target.selectedEntities
                                .filter((e) => !e.isComponent)
                                .map((e) => `${e.designedDataSetId}-${e.index}`)
                        );
                        ds.data?.flat()?.forEach((data) => {
                            if (
                                !existingIndexes.has(
                                    `${ds.id}-${data.index}`
                                ) &&
                                data.calc
                            ) {
                                target.selectedEntities.push({
                                    ...data,
                                    index: data.index,
                                    isComponent: false,
                                    designedDataSetId: ds.id,
                                } as SelectedEntity);
                            }
                        });
                    }
                }
            }
        },
        onAddNewNumberInputBox: (state, action) => {
            const payload: any = action.payload;
            const isEdit: boolean = !!payload.isEdit;
            const target = isEdit
                ? state.editCalculation
                : state.newCalculation;
            const getNextOrder = () => nextOrderFor(target.computeList);

            // Ensure there's an operator before adding a number (so it separates from
            // previous term) and add an operator after the number as a placeholder.
            // Only insert a separator operator if computeList already has items
            // (avoid inserting a leading operator when computeList is empty).
            if (target.computeList.length > 0) {
                const last = target.computeList.slice(-1)[0];
                if (!last || last.type !== "operator") {
                    target.computeList.push({
                        id: nanoid(5),
                        type: "operator",
                        order: getNextOrder(),
                        value: null,
                    });
                }
            }

            target.computeList.push({
                id: nanoid(5),
                type: "number",
                order: getNextOrder(),
                value: null,
            });
        },
        onAddNewOperatorBox: (state, action) => {
            const payload: any = action.payload;
            const isEdit: boolean = !!payload.isEdit;
            const target = isEdit
                ? state.editCalculation
                : state.newCalculation;
            const getNextOrder = () => nextOrderFor(target.computeList);
            target.computeList.push({
                id: nanoid(5),
                type: "operator",
                order: getNextOrder(),
                value: null,
            });
        },
        setComputeList: (state, action) => {
            // payload can be newList array or { newList, isEdit }
            const payload: any = action.payload;
            const newList: ComputeList = payload.newList;
            const isEdit: boolean = !!payload.isEdit;
            const target = isEdit
                ? state.editCalculation
                : state.newCalculation;
            const oldList = target.computeList;

            // If the incoming list is shorter, remove any selectedEntities that
            // were tied to compute component units that no longer exist.
            if (newList.length < oldList.length) {
                const computeEntities = newList
                    .filter((u) => u.type === "component")
                    .map((u) => (u as any).entity as SelectedEntity);

                const matchesEntity = (
                    a: SelectedEntity,
                    b: SelectedEntity
                ) => {
                    if (a.isComponent && b.isComponent) {
                        return a.name === b.name;
                    }
                    if (!a.isComponent && !b.isComponent) {
                        return (
                            a.index === b.index &&
                            a.designedDataSetId === b.designedDataSetId
                        );
                    }
                    return false;
                };

                target.selectedEntities = target.selectedEntities.filter(
                    (sel) => computeEntities.some((e) => matchesEntity(sel, e))
                );
            }

            target.computeList = newList;
            // Recalculate selectAllEntity for the newly selected page/dataset
            const allEntitiesForCheck = target.isSelectedPage
                ? (target.selectedPageOrDataset as Page)?.components ?? []
                : (target.selectedPageOrDataset as DesignedDataSet)?.data?.flat() ??
                  [];

            if (
                checkIfAllEntitiesSelected(
                    target.selectedEntities,
                    allEntitiesForCheck,
                    target.isSelectedPage
                        ? undefined
                        : (target.selectedPageOrDataset as DesignedDataSet)?.id
                )
            ) {
                target.selectAllEntity = "1";
            } else {
                target.selectAllEntity = "0";
            }
        },
        updateNumberValue: (state, action) => {
            // payload: { id: string, value: number | null, isEdit?: boolean }
            const payload: any = action.payload;
            const id: string = payload.id;
            const value: number | null =
                typeof payload.value === "number" ? payload.value : null;
            const isEdit: boolean = !!payload.isEdit;
            const target = isEdit
                ? state.editCalculation
                : state.newCalculation;

            target.computeList = target.computeList.map((unit) => {
                if (unit.id !== id) return unit;
                if (unit.type === "number") {
                    return { ...(unit as any), value };
                }
                return unit;
            });
        },
        updateOperatorValue: (state, action) => {
            // payload: { id: string, value: string | null, isEdit?: boolean }
            const payload: any = action.payload;
            const id: string = payload.id;
            const value: string | null =
                typeof payload.value === "string" ? payload.value : null;
            const isEdit: boolean = !!payload.isEdit;
            const target = isEdit
                ? state.editCalculation
                : state.newCalculation;

            target.computeList = target.computeList.map((unit) => {
                if (unit.id !== id) return unit;
                if (unit.type === "operator") {
                    return { ...(unit as any), value };
                }
                return unit;
            });
        },
        setAddedCalculation: (state, action) => {
            const payload: any = action.payload;
            const calculationId: string = payload.calculationId;
            const isEdit: boolean = !!payload.isEdit;
            const target = isEdit
                ? state.editCalculation
                : state.newCalculation;
            const calculation = state.entities.find(
                (calc) => calc.name === calculationId
            );
            target.addedCalculations = calculation!;
        },
        onAddCalculationToComputeBlock: (state, action) => {
            const payload: any = action.payload;
            const isEdit: boolean = !!payload.isEdit;
            const target = isEdit
                ? state.editCalculation
                : state.newCalculation;
            const selectedCalculations = target.addedCalculations;
            const getNextOrder = () => nextOrderFor(target.computeList);
            const alreadyExists = target.computeList.some((unit) => {
                if (unit.type !== "calculation") return false;
                const e = (unit as any).entity as Calculation;
                return e.name === selectedCalculations?.name;
            });
            if (!alreadyExists) {
                // Ensure operator separation before calculation
                if (target.computeList.length > 0) {
                    const last = target.computeList.slice(-1)[0];
                    if (!last || last.type !== "operator") {
                        target.computeList.push({
                            id: nanoid(5),
                            type: "operator",
                            order: getNextOrder(),
                            value: null,
                        });
                    }
                }

                const unit: ComputeCalculationUnit = {
                    id: nanoid(5),
                    type: "calculation",
                    order: getNextOrder(),
                    value: selectedCalculations!.name,
                    entity: selectedCalculations!,
                };
                target.computeList.push(unit);
            }
        },
        resetNewCalculation: (state) => {
            state.newCalculation = newCalculation;
        },
        resetSelectedCalculation: (state) => {
            const selectedCalculation = state.entities.find(
                (entity) => entity.name === state.selectedCalculation?.name
            );
            if (!selectedCalculation) return;
            state.selectedCalculation = selectedCalculation;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchCalculations.pending, (state) => {
            state.loading = LoadingState.Pending;
        });
        builder.addCase(fetchCalculations.fulfilled, (state, action) => {
            state.loading = LoadingState.Succeeded;
            state.entities = action.payload.data;
            state.form = action.payload.form;
        });
        builder.addCase(fetchCalculations.rejected, (state) => {
            state.loading = LoadingState.Failed;
        });
        builder.addCase(saveCalculations.pending, (state) => {
            state.loading = LoadingState.Pending;
        });
        builder.addCase(saveCalculations.fulfilled, (state, action) => {
            state.loading = LoadingState.Succeeded;
            state.entities = action.payload.calculations;
            state.form = action.payload;
            state.newCalculation = newCalculation;
            const selectedCalculation = state.entities.find(
                (entity) => entity.name === state.selectedCalculation?.name
            );
            if (selectedCalculation)
                state.selectedCalculation = selectedCalculation;
        });
        builder.addCase(saveCalculations.rejected, (state) => {
            state.loading = LoadingState.Failed;
        });
        builder.addCase(deleteCalculation.pending, (state) => {
            state.loading = LoadingState.Pending;
        });
        builder.addCase(deleteCalculation.fulfilled, (state, action) => {
            state.loading = LoadingState.Succeeded;
            state.entities = action.payload.calculations;
            state.form = action.payload;
        });
        builder.addCase(deleteCalculation.rejected, (state) => {
            state.loading = LoadingState.Failed;
        });
    },
});

export const {
    updateForm,
    setSelectedCalculation,
    setTitle,
    setSelectedPageOrDataset,
    setRepeatableSection,
    toggleCalculationSelect,
    toggleEntitySelect,
    toggleSelectAllEntity,
    addEntityToComputeList,
    onAddNewNumberInputBox,
    onAddNewOperatorBox,
    setComputeList,
    setAddedCalculation,
    onAddCalculationToComputeBlock,
    updateNumberValue,
    updateOperatorValue,
    resetNewCalculation,
    resetSelectedCalculation,
} = calculationBuilderSlice.actions;

export const calculationBuilderSelector = (state: RootState) =>
    state.calculation;

export default calculationBuilderSlice.reducer;
