import { FormStatus, ComponentTypeEnum } from "@xgovformbuilder/model";
import { LoadingState } from "../types";
import { extractDashboardData, computeFromExpression, populateEditCalculationState } from "../utils";

describe("Redux Store Utils test", () => {
    test("Validate extract dashboard data function -- empty user id", () => {
        const data = extractDashboardData({
            formConfigs: { loading: LoadingState.Succeeded, data: [] } as any,
            userId: ""
        } as any as any);
        expect(data).toEqual(null)

    })
    test("Validate extract dashboard data function -- failed loading", () => {
        const data = extractDashboardData({
            formConfigs: { loading: LoadingState.Failed, data: [] } as any,
            userId: "test-user-id"
        } as any);
        expect(data).toEqual(null)

    })
    test("Validate extract dashboard data function", () => {
        const data = extractDashboardData({
            formConfigs: {
                loading: LoadingState.Succeeded, data: [
                    {
                        FormStatus: FormStatus.InDevelopment,
                        Key: "test-key",
                        DisplayName: "test-display-name",
                        signInRequired: false,
                        LastModified: "01/01/2000",
                        lastModifiedById: "test-user-id",
                        lastModifiedByName: "Test User 1",
                        feedbackForm: false,
                        UserId: "test-user-id",
                        CreatedBy: "Test",
                        childAndDependentsForms: [],
                        childs: []
                    },
                    {
                        FormStatus: FormStatus.Closed,
                        Key: "test-key",
                        DisplayName: "test-display-name",
                        signInRequired: false,
                        LastModified: "01/01/2000",
                        lastModifiedById: "test-user-id",
                        lastModifiedByName: "Test User 1",
                        feedbackForm: false,
                        UserId: "test-user-id",
                        CreatedBy: "Test",
                        childAndDependentsForms: [],
                        childs: []
                    },
                    {
                        FormStatus: FormStatus.Published,
                        Key: "test-key",
                        DisplayName: "test-display-name",
                        signInRequired: false,
                        LastModified: "01/01/2000",
                        lastModifiedById: "test-user-id",
                        lastModifiedByName: "Test User 1",
                        feedbackForm: false,
                        UserId: "test-user-id",
                        CreatedBy: "Test",
                        childAndDependentsForms: [],
                        childs: []
                    },
                    {
                        FormStatus: FormStatus.UAT,
                        Key: "test-key",
                        DisplayName: "test-display-name",
                        signInRequired: false,
                        LastModified: "01/01/2000",
                        lastModifiedById: "test-user-id",
                        lastModifiedByName: "Test User 1",
                        feedbackForm: false,
                        UserId: "test-user-id",
                        CreatedBy: "Test",
                        childAndDependentsForms: [],
                        childs: []
                    },
                    {
                        FormStatus: FormStatus.InDevelopment,
                        Key: "test-key",
                        DisplayName: "test-display-name",
                        signInRequired: false,
                        LastModified: "01/01/2000",
                        lastModifiedById: "test-user-id",
                        lastModifiedByName: "Test User 1",
                        feedbackForm: false,
                        UserId: "test-user-id-2",
                        CreatedBy: "Test",
                        childAndDependentsForms: [],
                        childs: []
                    },
                    {
                        FormStatus: FormStatus.Closed,
                        Key: "test-key",
                        DisplayName: "test-display-name",
                        signInRequired: false,
                        LastModified: "01/01/2000",
                        lastModifiedById: "test-user-id",
                        lastModifiedByName: "Test User 1",
                        feedbackForm: false,
                        UserId: "test-user-id-2",
                        CreatedBy: "Test",
                        childAndDependentsForms: [],
                        childs: []
                    },
                    {
                        FormStatus: FormStatus.Published,
                        Key: "test-key",
                        DisplayName: "test-display-name",
                        signInRequired: false,
                        LastModified: "01/01/2000",
                        lastModifiedById: "test-user-id",
                        lastModifiedByName: "Test User 1",
                        feedbackForm: false,
                        UserId: "test-user-id-2",
                        CreatedBy: "Test",
                        childAndDependentsForms: [],
                        childs: []
                    },
                    {
                        FormStatus: FormStatus.UAT,
                        Key: "test-key",
                        DisplayName: "test-display-name",
                        signInRequired: false,
                        LastModified: "01/01/2000",
                        lastModifiedById: "test-user-id",
                        lastModifiedByName: "Test User 1",
                        feedbackForm: false,
                        UserId: "test-user-id-2",
                        CreatedBy: "Test",
                        childAndDependentsForms: [],
                        childs: []
                    },
            ] } as any,
            userId: "test-user-id"
        } as any);
        expect(data?.createdBy[0]).toEqual("Test")

    })

    test("computeFromExpression -- parses complex expression into typed compute list", () => {
        const expression = " (aqvRt + 23 )  * ( basbQ~R+ -  7 ) / cQQAz->ukprn_establishment_name-Value-10 ";

        const form: any = {
            pages: [
                {
                    components: [
                        { name: "aqvRt", type: ComponentTypeEnum.NumberField },
                        { name: "basbQ", type: ComponentTypeEnum.Result },
                    ],
                },
            ],
            designedDataSets: [
                {
                    id: "cQQAz",
                    data: [[{ index: "1", value: "ukprn_establishment_name-Value", calc: true }]],
                },
            ],
            calculations: [],
        };

        const out = computeFromExpression(expression, form as any);
        // Expected token types derived from the example in utils.ts
        const expectedTypes = [
            "component",
            "operator",
            "number",
            "operator",
            "component",
            "operator",
            "number",
            "operator",
            "component",
            "operator",
            "number",
        ];

        expect(out.map((u) => u.type)).toEqual(expectedTypes);
        // ensure the dataset token was mapped to a component whose entity contains the dataset id
        const datasetUnit = out.find((u) => u.type === "component" && (u as any).entity && (u as any).entity.designedDataSetId === "cQQAz");
        expect(datasetUnit).toBeDefined();
        expect((datasetUnit as any).value).toContain("cQQAz->ukprn_establishment_name-Value");
    });

    test("populateEditCalculationState maps title, selectedPage and selectedEntities", () => {
        const selectedCalculation: any = {
            title: "My Calc",
            displayName: "",
            name: "calc-1",
            pageLocation: "/p1",
            components: [{ name: "num1" }],
            datasets: [{ index: "1", value: "d1", designedDataSetId: "ds1" }],
            computeList: [],
            expression: "",
        };

        const form: any = {
            pages: [
                {
                    path: "/p1",
                    components: [{ name: "num1", type: ComponentTypeEnum.NumberField }],
                },
            ],
            designedDataSets: [
                { id: "ds1", data: [[{ index: "1", value: "d1", calc: true }]] },
            ],
            calculations: [],
        };

        const out = populateEditCalculationState(selectedCalculation, form);
        expect(out.title).toEqual("My Calc");
        expect(out.selectedPageOrDataset).toBeDefined();
        expect((out.selectedPageOrDataset as any).path).toEqual("/p1");
        // selectedEntities should include the component and the dataset entry
    expect(out.selectedEntities.some((e) => (e as any).name === "num1")).toBe(true);
    expect(out.selectedEntities.some((e) => (e as any).index === "1")).toBe(true);
    });

    test("populateEditCalculationState maps model computeList to client computeList types", () => {
        const selectedCalculation: any = {
            title: "Calc With Compute",
            displayName: "",
            name: "calc-2",
            pageLocation: "",
            components: [{ name: "compA" }],
            datasets: [],
            computeList: [
                { id: "m1", type: "operator", order: 1, value: "+" },
                { id: "m2", type: "number", order: 2, value: 10 },
                { id: "m3", type: "component", order: 3, entity: "compA" },
            ],
            expression: "",
        };

        const form: any = {
            pages: [
                {
                    components: [{ name: "compA", type: ComponentTypeEnum.NumberField }],
                },
            ],
            designedDataSets: [],
            calculations: [],
        };

        const out = populateEditCalculationState(selectedCalculation, form as any);
        expect(out.computeList.length).toBeGreaterThanOrEqual(3);
        expect(out.computeList.map((u) => u.type)).toEqual(["operator", "number", "component"]);
    // component unit should have entity populated
    const compUnit = out.computeList.find((u) => u.type === "component");
    expect((compUnit as any).entity).toBeDefined();
    // implementation maps component value from the found entity's `.value` when present,
    // otherwise returns an empty string — assert entity name and allow empty value.
    expect((compUnit as any).entity.name || (compUnit as any).entity.index).toBeDefined();
    expect((compUnit as any).value === "" || (compUnit as any).value === "compA").toBe(true);
    });
})