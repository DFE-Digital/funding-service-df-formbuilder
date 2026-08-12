import { FormDefinition } from "@xgovformbuilder/model";
import {
    generateFormulaExpressionString,
    updateDataObject,
    updateDataObjectForDeleteCalculation,
} from "../utility/helperFunctions";
describe("helper functions", () => {
    it("check generateFormulaExpressionString", () => {
        const selectedComponents = [
            {
                title: "Number 1",
                name: "pRhCyg",
                type: "NumberField",
                options: {},
                checked: true,
                schema: {},
            },
            {
                title: "Number 2",
                name: "test",
                type: "NumberField",
                options: {},
                checked: true,
                schema: {},
            },
        ];
        const expStr = generateFormulaExpressionString(selectedComponents);
        expect(expStr).toEqual("(pRhCyg) (test)");
    });

    it("check for deleting calculation", () => {
        const data = {
            metadata: {},
            startPage: "/first-page",
            pages: [
                {
                    title: "First page",
                    path: "/first-page",
                    components: [
                        {
                            name: "pRhCyg",
                            options: {},
                            type: "NumberField",
                            title: "Number 1",
                            schema: {},
                            checked: false,
                        },
                        {
                            name: "mkJDox",
                            options: {},
                            type: "NumberField",
                            title: "Number 2",
                            schema: {},
                            checked: true,
                        },
                    ],
                    next: [
                        {
                            path: "/sample-page",
                        },
                    ],
                },
                {
                    path: "/second-page",
                    title: "Second page",
                    components: [
                        {
                            name: "ZPdPOk",
                            displayName: "Design Data Calc",
                            options: {
                                hideResult: false,
                            },
                            type: "Result",
                            title: "Complex",
                            hint: "",
                            expression:
                                "(pRhCyg) + (XkGzEE) + (czFstr->Value-Value) + (czFstr->100) + (IUeiAw->Value-Value)",
                            schema: {},
                            checked: true,
                        },
                        {
                            name: "iyhbDR",
                            displayName: "Calc with Diff Key",
                            options: {
                                hideResult: false,
                            },
                            type: "Result",
                            title: "Design Data Complex",
                            hint: "",
                            expression:
                                "(bdsBwA->Value - 2-Value) + (pGXryQ->Cuurent Value-Value)",
                            schema: {},
                        },
                        {
                            name: "OdEsYy",
                            displayName: "qwe",
                            options: {
                                hideResult: false,
                            },
                            type: "Result",
                            title: "asd",
                            hint: "",
                            expression: "(czFstr->Value-Value) + (czFstr->100)",
                            schema: {},
                        },
                        {
                            name: "MjrzHK",
                            options: {},
                            type: "NumberField",
                            title: "Number 3",
                            checked: false,
                            schema: {},
                        },
                    ],
                    next: [
                        {
                            path: "/third-page",
                        },
                    ],
                },
                {
                    title: "Summary",
                    path: "/summary",
                    controller: "./pages/summary.js",
                    components: [],
                },
                {
                    path: "/sample-page",
                    title: "Sample Page",
                    components: [
                        {
                            name: "XkGzEE",
                            displayName: "Simple Calc",
                            options: {
                                hideResult: false,
                            },
                            type: "Result",
                            title: "Addition",
                            hint: "",
                            expression: "(pRhCyg) + (mkJDox)",
                            schema: {},
                            checked: false,
                        },
                    ],
                    next: [
                        {
                            path: "/second-page",
                        },
                    ],
                },
                {
                    path: "/third-page",
                    title: "Third Page",
                    components: [
                        {
                            name: "tfMNwd",
                            displayName: "Duplicate",
                            options: {
                                hideResult: false,
                            },
                            type: "Result",
                            title: "Duplicate",
                            hint: "",
                            expression:
                                "(pRhCyg) + (XkGzEE) + (MjrzHK) (czFstr->Value-Value) + (czFstr->100) + (IUeiAw->Value-Value)",
                            schema: {},
                        },
                        {
                            name: "cJRVzJ",
                            displayName: "Test123",
                            options: {
                                hideResult: false,
                            },
                            type: "Result",
                            title: "Copy",
                            hint: "",
                            expression: "(ZPdPOk) + (MjrzHK)",
                            schema: {},
                        },
                    ],
                    next: [
                        {
                            path: "/summary",
                        },
                    ],
                },
            ],
            lists: [],
            sections: [],
            conditions: [],
            fees: [],
            outputs: [],
            version: 2,
            userId: "TestUserId",
            createdBy: "TestUser",
            id: "TestFormId",
            key: "TestFormId",
            displayName: "TestingHelperFunc",
            name: "TestingHelperFunc",
            lastModified: "2023/06/07 09:25",
            formStatus: "In development",
            lastUpdatedByName: "TestUser",
            lastUpdatedById: "TestUserId",
            skipSummary: false,
            signInRequired: true,
            file: {},
            calculations: [
                {
                    displayName: "Design Data Calc",
                    hint: "",
                    type: "arithmetic",
                    name: "ZPdPOk",
                    pageLocation: "Second page",
                    components: [
                        {
                            title: "Number 1",
                            name: "pRhCyg",
                            type: "NumberField",
                            options: {},
                            checked: false,
                            schema: {},
                        },
                        {
                            title: "Addition",
                            name: "XkGzEE",
                            type: "Result",
                            options: {
                                hideResult: false,
                            },
                            checked: true,
                            schema: {},
                        },
                    ],
                    datasets: [
                        {
                            index: "2-2",
                            type: "select_value",
                            value: "czFstr->Value-Value",
                            checked: false,
                            bold: false,
                            calc: true,
                        },
                        {
                            index: "3-2",
                            type: "custom_text",
                            value: "czFstr->100",
                            checked: false,
                            bold: false,
                            calc: true,
                        },
                        {
                            index: "2-3",
                            type: "select_value",
                            value: "IUeiAw->Value-Value",
                            checked: true,
                            bold: false,
                            calc: true,
                        },
                    ],
                    expression:
                        "(pRhCyg) + (XkGzEE) + (czFstr->Value-Value) + (czFstr->100) + (IUeiAw->Value-Value)",
                    title: "Complex",
                    hideResult: false,
                },
                {
                    displayName: "Calc with Diff Key",
                    hint: "",
                    type: "arithmetic",
                    name: "iyhbDR",
                    pageLocation: "Second page",
                    components: [],
                    datasets: [
                        {
                            index: "2-2",
                            type: "select_value",
                            value: "bdsBwA->Value - 2-Value",
                            checked: true,
                            bold: false,
                            calc: true,
                        },
                        {
                            index: "2-2",
                            type: "select_value",
                            value: "pGXryQ->Cuurent Value-Value",
                            checked: true,
                            bold: false,
                            calc: true,
                        },
                    ],
                    expression:
                        "(bdsBwA->Value - 2-Value) + (pGXryQ->Cuurent Value-Value)",
                    title: "Design Data Complex",
                    hideResult: false,
                },
                {
                    displayName: "qwe",
                    hint: "",
                    type: "arithmetic",
                    name: "OdEsYy",
                    pageLocation: "Second page",
                    components: [],
                    datasets: [
                        {
                            index: "2-2",
                            type: "select_value",
                            value: "czFstr->Value-Value",
                            checked: false,
                            bold: false,
                            calc: true,
                        },
                        {
                            index: "3-2",
                            type: "custom_text",
                            value: "czFstr->100",
                            checked: false,
                            bold: false,
                            calc: true,
                        },
                    ],
                    expression: "(czFstr->Value-Value) + (czFstr->100)",
                    title: "asd",
                    hideResult: false,
                },
                {
                    displayName: "Duplicate",
                    hint: "",
                    type: "arithmetic",
                    name: "tfMNwd",
                    pageLocation: "Third Page",
                    components: [
                        {
                            title: "Number 1",
                            name: "pRhCyg",
                            type: "NumberField",
                            options: {},
                            checked: true,
                            schema: {},
                        },
                        {
                            title: "Addition",
                            name: "XkGzEE",
                            type: "Result",
                            options: {
                                hideResult: false,
                            },
                            checked: false,
                            schema: {},
                        },
                        {
                            title: "Number 3",
                            name: "MjrzHK",
                            type: "NumberField",
                            options: {},
                            checked: true,
                            schema: {},
                        },
                    ],
                    datasets: [
                        {
                            index: "2-2",
                            type: "select_value",
                            value: "czFstr->Value-Value",
                            checked: false,
                            bold: false,
                            calc: true,
                        },
                        {
                            index: "3-2",
                            type: "custom_text",
                            value: "czFstr->100",
                            checked: false,
                            bold: false,
                            calc: true,
                        },
                        {
                            index: "2-3",
                            type: "select_value",
                            value: "IUeiAw->Value-Value",
                            checked: true,
                            bold: false,
                            calc: true,
                        },
                    ],
                    expression:
                        "(pRhCyg) + (XkGzEE) + (MjrzHK) (czFstr->Value-Value) + (czFstr->100) + (IUeiAw->Value-Value)",
                    title: "Duplicate",
                    hideResult: false,
                },
                {
                    displayName: "Test123",
                    hint: "",
                    type: "arithmetic",
                    name: "cJRVzJ",
                    pageLocation: "Third Page",
                    components: [
                        {
                            title: "Complex",
                            name: "ZPdPOk",
                            type: "Result",
                            options: {
                                hideResult: false,
                            },
                            checked: true,
                            schema: {},
                        },
                        {
                            title: "Number 3",
                            name: "MjrzHK",
                            type: "NumberField",
                            options: {},
                            checked: false,
                            schema: {},
                        },
                    ],
                    datasets: [],
                    expression: "(ZPdPOk) + (MjrzHK)",
                    title: "Copy",
                    hideResult: false,
                },
            ],
        };
        const result: FormDefinition = updateDataObjectForDeleteCalculation({
            data,
            calculationNameToDelete: "cJRVzJ",
            calculationToDeletePage: "Third Page",
        });
        const findCalc = result.calculations.find(
            (calc) => calc.name === "cJRVzJ"
        );
        expect(findCalc).toBeUndefined();
    });

    it("check for adding new calculation", () => {
        const data = {
            isNewCalculation: true,
            calculationToEdit: undefined,
            calculationDetails: {
                calculationName: "Test Calc",
                title: "Test Calc",
                helpText: "",
                hideResult: false,
            },
            page: {
                path: "/second-page",
                title: "Second page",
                components: [],
                next: [
                    {
                        path: "/summary",
                    },
                ],
            },
            selectedComponents: [
                {
                    title: "Test Number",
                    name: "XlpgOd",
                    type: "NumberField",
                    options: {},
                    checked: true,
                    schema: {},
                },
            ],
            selectedDatasets: [],
            calculationResult: "(XlpgOd) + 10",
            data: {
                metadata: {},
                startPage: "/first-page",
                pages: [
                    {
                        title: "First page",
                        path: "/first-page",
                        components: [
                            {
                                name: "XlpgOd",
                                options: {},
                                type: "NumberField",
                                title: "Test Number",
                                checked: true,
                            },
                        ],
                        next: [
                            {
                                path: "/second-page",
                            },
                        ],
                    },
                    {
                        path: "/second-page",
                        title: "Second page",
                        components: [],
                        next: [
                            {
                                path: "/summary",
                            },
                        ],
                    },
                    {
                        title: "Summary",
                        path: "/summary",
                        controller: "./pages/summary.js",
                        components: [],
                    },
                ],
                lists: [],
                sections: [],
                conditions: [],
                fees: [],
                outputs: [],
                version: 2,
                userId: "TestUserId",
                createdBy: "TestUser",
                id: "7xxb5lRkuh",
                key: "7xxb5lRkuh",
                displayName: "test-helper",
                name: "test-helper",
                lastModified: "2023/06/07 09:46",
                formStatus: "In development",
                lastUpdatedByName: "TestUser",
                lastUpdatedById: "TestUserId",
            },
        };
        const result = updateDataObject(data);
        expect(result.calculations.length).toEqual(1);
    });

    it("check for adding new calculation", () => {
        const data = {
            isNewCalculation: false,
            calculationToEdit: {
                displayName: "Test Calc",
                hint: "",
                type: "arithmetic",
                name: "kBHfmx",
                pageLocation: "Second page",
                components: [
                    {
                        title: "Test Number",
                        name: "XlpgOd",
                        type: "NumberField",
                        options: {},
                        checked: true,
                        schema: {},
                    },
                ],
                datasets: [],
                expression: "(XlpgOd) + 10",
                title: "Test Calc",
                hideResult: false,
            },
            calculationDetails: {
                calculationName: "Test Calc",
                title: "Test Calc",
                helpText: "",
                hideResult: false,
            },
            page: {
                path: "/second-page",
                title: "Second page",
                components: [
                    {
                        name: "kBHfmx",
                        displayName: "Test Calc",
                        options: {
                            hideResult: false,
                        },
                        type: "Result",
                        title: "Test Calc",
                        hint: "",
                        expression: "(XlpgOd) + 10",
                        schema: {},
                    },
                ],
                next: [
                    {
                        path: "/summary",
                    },
                ],
            },
            selectedComponents: [
                {
                    title: "Test Number",
                    name: "XlpgOd",
                    type: "NumberField",
                    options: {},
                    checked: true,
                    schema: {},
                },
            ],
            selectedDatasets: [],
            calculationResult: "(XlpgOd) + 40",
            data: {
                metadata: {},
                startPage: "/first-page",
                pages: [
                    {
                        title: "First page",
                        path: "/first-page",
                        components: [
                            {
                                name: "XlpgOd",
                                options: {},
                                type: "NumberField",
                                title: "Test Number",
                                checked: true,
                            },
                        ],
                        next: [
                            {
                                path: "/second-page",
                            },
                        ],
                    },
                    {
                        path: "/second-page",
                        title: "Second page",
                        components: [],
                        next: [
                            {
                                path: "/summary",
                            },
                        ],
                    },
                    {
                        title: "Summary",
                        path: "/summary",
                        controller: "./pages/summary.js",
                        components: [],
                    },
                ],
                lists: [],
                sections: [],
                conditions: [],
                fees: [],
                outputs: [],
                version: 2,
                userId: "TestUserId",
                createdBy: "TestUser",
                id: "7xxb5lRkuh",
                key: "7xxb5lRkuh",
                displayName: "test-helper",
                name: "test-helper",
                lastModified: "2023/06/07 09:46",
                formStatus: "In development",
                lastUpdatedByName: "TestUser",
                lastUpdatedById: "TestUserId",
                calculations: [
                    {
                        displayName: "Test Calc",
                        hint: "",
                        type: "arithmetic",
                        name: "kBHfmx",
                        pageLocation: "Second page",
                        components: [
                            {
                                title: "Test Number",
                                name: "XlpgOd",
                                type: "NumberField",
                                options: {},
                                checked: true,
                                schema: {},
                            },
                        ],
                        datasets: [],
                        expression: "(XlpgOd) + 10",
                        title: "Test Calc",
                        hideResult: false,
                    },
                ],
            },
        };
        const result = updateDataObject(data);
        expect(result.calculations[0].expression).toEqual("(XlpgOd) + 40");
    });
});
