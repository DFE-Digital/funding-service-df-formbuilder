import calculationReducer, {
    fetchCalculations,
    deleteCalculation,
    saveCalculations,
    updateForm,
    setSelectedCalculation,
    setTitle,
    setSelectedPageOrDataset,
    setRepeatableSection,
    toggleCalculationSelect,
    toggleEntitySelect,
    addEntityToComputeList,
    toggleSelectAllEntity,
    onAddNewNumberInputBox,
    onAddNewOperatorBox,
    setComputeList,
    updateNumberValue,
    updateOperatorValue,
    setAddedCalculation,
    onAddCalculationToComputeBlock,
} from "../reducers/calculationBuilderReducer";
import { LoadingState } from "../types";
import {
    deleteCalculationFromForm,
    fetchCalculationFromFormId,
    saveCalculationToForm,
} from "../../api/calculationApi";

jest.mock("../../api/calculationApi");

describe("Reducer - calculation builder thunks", () => {
    const mockForm = {
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
    };

    const mockResponse: any = {
        form: mockForm,
        error: "",
    };

    test("fetch calculations thunk - success and error dispatches", async () => {
        // @ts-ignore
        fetchCalculationFromFormId.mockImplementationOnce(() => mockResponse);
        const action = await fetchCalculations("test-form-id");
        const mockDispatch = jest.fn();
        const mockGetState = jest.fn().mockReturnValue({});
        await action(mockDispatch, mockGetState, undefined);
        expect(mockDispatch).toHaveBeenCalled();

        // error case
        // @ts-ignore
        fetchCalculationFromFormId.mockImplementationOnce(() => ({ ...mockResponse, error: "server error" }));
        const actionErr = await fetchCalculations("test-form-id");
        const mockDispatchErr = jest.fn();
        const mockGetStateErr = jest.fn().mockReturnValue({});
        await actionErr(mockDispatchErr, mockGetStateErr, undefined);
        expect(mockDispatchErr).toHaveBeenCalled();
    });

    test("delete calculation thunk - success and error dispatches", async () => {
        // @ts-ignore
        deleteCalculationFromForm.mockImplementationOnce(() => ({ form: mockForm, error: "" }));
        const action = await deleteCalculation({ calcId: "test-calc-id", data: mockForm });
        const mockDispatch = jest.fn();
        const mockGetState = jest.fn().mockReturnValue({});
        await action(mockDispatch, mockGetState, undefined);
        expect(mockDispatch).toHaveBeenCalled();

        // error case
        // @ts-ignore
        deleteCalculationFromForm.mockImplementationOnce(() => ({ form: mockForm, error: "server error" }));
        const actionErr = await deleteCalculation({ calcId: "test-calc-id", data: mockForm });
        const mockDispatchErr = jest.fn();
        const mockGetStateErr = jest.fn().mockReturnValue({});
        await actionErr(mockDispatchErr, mockGetStateErr, undefined);
        expect(mockDispatchErr).toHaveBeenCalled();
    });

    test("save calculations thunk - success and error dispatches", async () => {
        // @ts-ignore
        saveCalculationToForm.mockImplementationOnce(() => (true));
        const fakeState: any = { some: "state" };
        const action = await saveCalculations({ state: fakeState, isEdit: false });
        const mockDispatch = jest.fn();
        const mockGetState = jest.fn().mockReturnValue({});
        await action(mockDispatch, mockGetState, undefined);
        expect(mockDispatch).toHaveBeenCalled();

        // error case - mock save returning falsy triggers rejectWithValue path
        // @ts-ignore
        saveCalculationToForm.mockImplementationOnce(() => (false));
        const actionErr = await saveCalculations({ state: fakeState, isEdit: true });
        const mockDispatchErr = jest.fn();
        const mockGetStateErr = jest.fn().mockReturnValue({});
        await actionErr(mockDispatchErr, mockGetStateErr, undefined);
        expect(mockDispatchErr).toHaveBeenCalled();
    });

    test("extraReducers loading states for thunks", () => {
        expect(calculationReducer(undefined, { type: "calculation/fetchCalculations/pending" }).loading).toEqual(LoadingState.Pending);
        expect(calculationReducer(undefined, { type: "calculation/fetchCalculations/rejected" }).loading).toEqual(LoadingState.Failed);
        expect(calculationReducer(undefined, { type: "calculation/fetchCalculations/fulfilled", payload: mockResponse }).loading).toEqual(LoadingState.Succeeded);

        expect(calculationReducer(undefined, { type: "calculation/deleteCalculation/pending" }).loading).toEqual(LoadingState.Pending);
        expect(calculationReducer(undefined, { type: "calculation/deleteCalculation/rejected" }).loading).toEqual(LoadingState.Failed);
        expect(calculationReducer(undefined, { type: "calculation/deleteCalculation/fulfilled", payload: { form: mockForm, error: "" } }).loading).toEqual(LoadingState.Succeeded);

        expect(calculationReducer(undefined, { type: "calculation/saveCalculations/pending" }).loading).toEqual(LoadingState.Pending);
        expect(calculationReducer(undefined, { type: "calculation/saveCalculations/rejected" }).loading).toEqual(LoadingState.Failed);
        expect(calculationReducer(undefined, { type: "calculation/saveCalculations/fulfilled", payload: {} }).loading).toEqual(LoadingState.Succeeded);
    });

    test("action: updateForm sets form and calls callback", () => {
        const cb = jest.fn();
        const newState = calculationReducer(undefined, updateForm({ updatedForm: mockForm, cb }));
        expect(newState.form).toEqual(mockForm);
        expect(cb).toHaveBeenCalled();
    });

    test("action: setSelectedCalculation sets selectedCalculation and populates editCalculation", () => {
        const calc = {
            name: "calc1",
            title: "Calculation 1",
            expression: "(a) + (b)",
            components: [],
            datasets: [],
            pageLocation: "",
        } as any;
        const stateAfter = calculationReducer(undefined, setSelectedCalculation(calc));
        expect(stateAfter.selectedCalculation).toEqual(calc);
        // populateEditCalculationState should populate title from calculation
        expect(stateAfter.editCalculation.title).toEqual("Calculation 1");
    });

    test("action: setTitle updates newCalculation and editCalculation based on isEdit", () => {
        const s1 = calculationReducer(undefined, setTitle({ isEdit: false, title: "New title" }));
        expect(s1.newCalculation.title).toEqual("New title");

        const s2 = calculationReducer(undefined, setTitle({ isEdit: true, title: "Edited title" }));
        expect(s2.editCalculation.title).toEqual("Edited title");
    });

    test("action: setSelectedPageOrDataset selects page or dataset into target based on isEdit", () => {
        const initial = {
            ...calculationReducer(undefined, { type: "@@INIT" }),
            form: {
                ...mockForm,
                pages: [
                    { title: "P1", path: "/p1", components: [{ name: "c1", type: "NumberField" }] },
                ],
                designedDataSets: [
                    { id: "ds1", data: [[{ index: "1", value: "v1", calc: true }]] },
                ],
            },
        } as any;

        const out = calculationReducer(initial, setSelectedPageOrDataset({ selectedEntityId: "/p1", isEdit: false }));
        expect(out.newCalculation.selectedPageOrDataset).toBeDefined();
        expect(out.newCalculation.isSelectedPage).toBe(true);

        const outDs = calculationReducer(initial, setSelectedPageOrDataset({ selectedEntityId: "ds1", isEdit: false }));
        expect(outDs.newCalculation.selectedPageOrDataset).toBeDefined();
        expect(outDs.newCalculation.isSelectedPage).toBe(false);
    });

    test("action: setRepeatableSection assigns repeatable section when page maps to a section", () => {
        const initial = {
            ...calculationReducer(undefined, { type: "@@INIT" }),
            form: {
                ...mockForm,
                pages: [{ title: "P1", path: "/p1", section: "sec1", components: [] }],
                sections: [{ name: "sec1", repeatableSection: true }],
            },
        } as any;

        const out = calculationReducer(initial, setRepeatableSection({ selectedEntityId: "/p1", isEdit: false }));
        expect(out.newCalculation.repeatableSection).toBeDefined();
    expect(out.newCalculation.repeatableSection!.name).toEqual("sec1");
    });

    test("action: toggleCalculationSelect selects and deselects calculation", () => {
        const base = calculationReducer(undefined, { type: "@@INIT" }) as any;
        const stateWithEntities = { ...base, entities: [{ name: "c1" }, { name: "c2" }] } as any;
        const afterSelect = calculationReducer(stateWithEntities, toggleCalculationSelect("c1" as any));
        expect(afterSelect.selectedCalculation).toEqual({ name: "c1" });

        const afterDeselect = calculationReducer(afterSelect, toggleCalculationSelect("c1" as any));
        expect(afterDeselect.selectedCalculation).toBeNull();
    });

    // setPageDataset is not exported as an action creator from the slice; use setSelectedPageOrDataset above

    test("action: toggleEntitySelect adds and removes components/dataset entities", () => {
        const base = calculationReducer(undefined, { type: "@@INIT" }) as any;
        const page = { title: "Page1", path: "/p1", components: [{ name: "comp1" }] };
        const state = { ...base, newCalculation: { ...base.newCalculation, selectedPageOrDataset: page, isSelectedPage: true } } as any;

        // add component
        const afterAdd = calculationReducer(state, toggleEntitySelect({ id: "comp1", isComponent: true, isRepeatable: false, designedDataSetId: "" } as any));
        expect(afterAdd.newCalculation.selectedEntities.some((e: any) => e.name === "comp1")).toBe(true);

        // remove component
        const afterRemove = calculationReducer(afterAdd, toggleEntitySelect({ id: "comp1", isComponent: true, isRepeatable: false, designedDataSetId: "" } as any));
        expect(afterRemove.newCalculation.selectedEntities.some((e: any) => e.name === "comp1")).toBe(false);
    });

    test("action: addEntityToComputeList adds component units to computeList", () => {
        const base = calculationReducer(undefined, { type: "@@INIT" }) as any;
        const sel = { name: "comp1", isComponent: true };
        const state = { ...base, newCalculation: { ...base.newCalculation, selectedEntities: [sel], computeList: [] } } as any;
        const out = calculationReducer(state, addEntityToComputeList({ isEdit: false } as any));
        expect(out.newCalculation.computeList.length).toBeGreaterThan(0);
        expect(out.newCalculation.computeList[0].type).toBe("component");
    });

    test("action: toggleSelectAllEntity when page selected populates selectedEntities", () => {
        const base = calculationReducer(undefined, { type: "@@INIT" }) as any;
        const page = { title: "P1", path: "/p1", components: [{ name: "a", type: "NumberField" }, { name: "b", type: "NumberField" }] };
        const state = { ...base, newCalculation: { ...base.newCalculation, selectedPageOrDataset: page, isSelectedPage: true, selectedEntities: [] } } as any;
        const out = calculationReducer(state, toggleSelectAllEntity({ isEdit: false } as any));
        expect(out.newCalculation.selectAllEntity).toBe("1");
        expect(out.newCalculation.selectedEntities.length).toBeGreaterThan(0);
    });

    test("action: onAddNewNumberInputBox and onAddNewOperatorBox add units", () => {
        const base = calculationReducer(undefined, { type: "@@INIT" }) as any;
        const state = { ...base, newCalculation: { ...base.newCalculation, computeList: [] } } as any;
        const withNumber = calculationReducer(state, onAddNewNumberInputBox({ isEdit: false } as any));
        expect(withNumber.newCalculation.computeList.some((u: any) => u.type === "number")).toBe(true);

        const withOperator = calculationReducer(state, onAddNewOperatorBox({ isEdit: false } as any));
        expect(withOperator.newCalculation.computeList.some((u: any) => u.type === "operator")).toBe(true);
    });

    test("action: setComputeList replaces computeList and removes orphaned selectedEntities", () => {
        const base = calculationReducer(undefined, { type: "@@INIT" }) as any;

        // two selected entities that map to component units
        const selA = { name: "compA", isComponent: true } as any;
        const selB = { name: "compB", isComponent: true } as any;

        const unitA = { id: "uA", type: "component", order: 1, value: "compA", entity: selA } as any;
        const unitB = { id: "uB", type: "component", order: 2, value: "compB", entity: selB } as any;

        const state = {
            ...base,
            newCalculation: {
                ...base.newCalculation,
                selectedEntities: [selA, selB],
                computeList: [unitA, unitB],
            },
        } as any;

        // newList contains only unitA (simulate removing unitB)
        const newList = [unitA];
        const out = calculationReducer(state, setComputeList({ newList, isEdit: false } as any));

        expect(out.newCalculation.computeList).toEqual(newList);
        // selectedEntities should be filtered to only those still represented by computeList
        expect(out.newCalculation.selectedEntities.some((e: any) => e.name === "compA")).toBe(true);
        expect(out.newCalculation.selectedEntities.some((e: any) => e.name === "compB")).toBe(false);
    });

    test("action: updateNumberValue updates specific number unit by id", () => {
        const base = calculationReducer(undefined, { type: "@@INIT" }) as any;
        const numberUnit = { id: "n1", type: "number", order: 1, value: null } as any;
        const state = { ...base, newCalculation: { ...base.newCalculation, computeList: [numberUnit] } } as any;

    const out = calculationReducer(state, updateNumberValue({ id: "n1", value: 42, isEdit: false } as any));
    const foundN = out.newCalculation.computeList.find((u: any) => u.id === "n1");
    expect(foundN).toBeDefined();
    expect(foundN!.value).toEqual(42);
    });

    test("action: updateOperatorValue updates specific operator unit by id (accepts '/'),", () => {
        const base = calculationReducer(undefined, { type: "@@INIT" }) as any;
        const opUnit = { id: "o1", type: "operator", order: 1, value: null } as any;
        const state = { ...base, newCalculation: { ...base.newCalculation, computeList: [opUnit] } } as any;

    const out = calculationReducer(state, updateOperatorValue({ id: "o1", value: "/", isEdit: false } as any));
    const foundO = out.newCalculation.computeList.find((u: any) => u.id === "o1");
    expect(foundO).toBeDefined();
    expect(foundO!.value).toEqual("/");
    });

    test("action: setAddedCalculation picks calculation from entities into addedCalculations", () => {
        const base = calculationReducer(undefined, { type: "@@INIT" }) as any;
        const calc = { name: "calc1", title: "Calc 1" } as any;
        const state = { ...base, entities: [calc] } as any;

        const out = calculationReducer(state, setAddedCalculation({ calculationId: "calc1", isEdit: false } as any));
        expect(out.newCalculation.addedCalculations).toEqual(calc);
    });

    test("action: onAddCalculationToComputeBlock adds calculation unit and prepends operator when needed", () => {
        const base = calculationReducer(undefined, { type: "@@INIT" }) as any;
        const calc = { name: "calcX", title: "Calc X" } as any;

        // case 1: empty computeList -> should add calculation unit only
        const stateEmpty = { ...base, entities: [calc], newCalculation: { ...base.newCalculation, addedCalculations: calc, computeList: [] } } as any;
        const outEmpty = calculationReducer(stateEmpty, onAddCalculationToComputeBlock({ isEdit: false } as any));
        expect(outEmpty.newCalculation.computeList.length).toBeGreaterThanOrEqual(1);
        const added = outEmpty.newCalculation.computeList.slice(-1)[0];
        expect(added.type).toEqual("calculation");
        expect((added as any).entity.name).toEqual("calcX");

        // case 2: computeList ends with number -> should insert operator then calculation
        const numUnit = { id: "n10", type: "number", order: 1, value: 5 } as any;
        const stateWithNumber = { ...base, entities: [calc], newCalculation: { ...base.newCalculation, addedCalculations: calc, computeList: [numUnit] } } as any;
        const outWithNumber = calculationReducer(stateWithNumber, onAddCalculationToComputeBlock({ isEdit: false } as any));
        const tail = outWithNumber.newCalculation.computeList.slice(-2);
        expect(tail[0].type).toEqual("operator");
        expect(tail[1].type).toEqual("calculation");
        expect((tail[1] as any).entity.name).toEqual("calcX");
    });
});

