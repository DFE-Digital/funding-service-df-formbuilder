import { ComponentTypeEnum } from "@xgovformbuilder/model";
import {
    checkIfAllEntitiesSelected,
    getPageDatasetOptions,
    getCalculationOptions,
} from "../utils";

describe("Calculation page utils", () => {
    test("checkIfAllEntitiesSelected returns false when inputs empty", () => {
        expect(checkIfAllEntitiesSelected([], [], undefined)).toBe(false);
    });

    test("checkIfAllEntitiesSelected returns true when all number/result components selected", () => {
        const allEntities: any[] = [
            { name: "a", type: ComponentTypeEnum.NumberField },
            { name: "b", type: ComponentTypeEnum.Result },
        ];
        const selectedEntities: any[] = [
            { name: "a", isComponent: true },
            { name: "b", isComponent: true },
        ];

        expect(checkIfAllEntitiesSelected(selectedEntities, allEntities)).toBe(
            true
        );
        // partial selection -> false
        expect(
            checkIfAllEntitiesSelected(
                [{ name: "a", isComponent: true } as any],
                allEntities
            )
        ).toBe(false);
    });

    test("checkIfAllEntitiesSelected returns true for dataset entries when matching designedDatasetId", () => {
        const allEntities: any[] = [
            { index: "1", value: "v1", calc: true },
            { index: "2", value: "v2", calc: false },
        ];
        const selectedEntities: any[] = [
            { index: "1", designedDataSetId: "ds1", isComponent: false },
        ];

        expect(
            checkIfAllEntitiesSelected(selectedEntities, allEntities, "ds1")
        ).toBe(true);
        // wrong dataset id -> false
        expect(
            checkIfAllEntitiesSelected(selectedEntities, allEntities, "other")
        ).toBe(false);
    });

    test("getPageDatasetOptions returns combined dataset and page options", () => {
        const form: any = {
            designedDataSets: [{ id: "ds1", title: "DS One" }],
            pages: [{ path: "/p1", title: "Page One" }],
        };
        const opts = getPageDatasetOptions(form);
        expect(opts.some((o) => o.id === "ds1" && o.title === "DS One")).toBe(
            true
        );
        expect(opts.some((o) => o.id === "/p1" && o.title === "Page One")).toBe(
            true
        );
    });

    test("getCalculationOptions returns options and filters out already-added calculations when computeList contains them", () => {
        const state: any = {
            form: {
                calculations: [
                    { name: "c1", displayName: "Calc One" },
                    { name: "c2", title: "Calc Two" },
                ],
            },
            newCalculation: {
                addedCalculations: null,
                computeList: [],
            },
        };

        // when addedCalculations is null, all options returned
        const allOpts = getCalculationOptions(state);
        expect(allOpts.length).toBe(2);

        // when addedCalculations is set and computeList already includes calculation c1, filter it out
        state.newCalculation.addedCalculations = { name: "c1" };
        state.newCalculation.computeList = [
            { id: "u1", type: "calculation", value: "c1" },
        ];
        const filtered = getCalculationOptions(state);
        expect(filtered.length).toBe(1);
        expect(filtered[0].id).toBe("c2");
    });
});
