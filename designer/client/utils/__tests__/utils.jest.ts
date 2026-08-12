import { CheckboxesFieldComponent, Condition, ConditionField, Coordinator, FormDefinition, FormStatus, InputType, NotifyOutputConfiguration, Output, OutputType } from "@xgovformbuilder/model";
import { handleLinkedPropertyEffect, Module, PropertyAction } from "../index";

const formSample: FormDefinition = {
    id: "form1",
    key: "form1",
    displayName: "Form name 1",
    createdBy: "John Doe",
    formStatus: FormStatus.InDevelopment,
    lastModified: new Date().toString(),
    lastDownloaded: new Date().toString(),
    lastUpdatedByName: "John Doe",
    lastUpdatedById: "local-account-id",
    feedbackForm: false,
    userId: "local-account-id",
    signInRequired: false,
    pages: [{
        title: "First page",
        path: "/first-page",
        components: [],
        next: [
            {
                path: "/second-page",
                condition: "lvrXRK",
            }
        ],
        controller: "./pages/start.js",
        section: "Introduction"
    },
    {
        title: "Second page",
        path: "/second-page",
        components: [
            {
                name: "nkKBIH",
                options: {},
                type: "NumberField",
                title: "Number 1",
                schema: {},
                hint: "Enter a number",
                prefixType: "none",
                prefixValue: "",
                suffixValue: "",
                precision: 2,
            },
            {
                name: "lvrXRK",
                options: {},
                type: "YesNoField",
                title: "YesNo1",
                schema: {},
            },
            {
                type: "Filedownload",
                name: "fileDownload",
                title: "File Download",
                displayName: "File Download",
                content: "document1",
                expression: "",
                selectedDocument: "document1",
                //@ts-ignore
                hint: "",
                options: {},
            },
            {
                type: "DataImport",
                name: "dataImport",
                title: "Data Import",
                selectedDocument: "document1",
                //@ts-ignore
                hint: "",
                options: {},
                schema: {},
                documentName: "",
                columns: [],
                columnNames: [],
            },
            {
                name: "lvrXRK",
                options: {
                    condition: "lvrXRK",
                },
                type: "InsetText",
                title: "YesNo1",
                schema: {},
                content: "Inset text content",
            },
            {
                name: "gEzCdW",
                options: {},
                type: "EmailAddressField",
                title: "Email",
                schema: {},
            }
        ],
        next: [
            {
                path: "/third-page"
            }
        ],
        controller: "",
        section: "iNNSWg"
    },
    {
        title: "Third page",
        path: "/third-page",
        components: [
            {
                name: "DAxPlb",
                options: {
                    hideResult: false
                },
                type: "Result",
                title: "plus20",
                schema: {},
                displayName: "plus20",
                expression: "(QbuHNQ) + 20 + (JLxPIl->UKPRN-Value)",
                content: ""
            },
            {
                type: "TableDataset",
                name: "designedDataSetTable",
                title: "Designed DataSet Table",
                options: {},
                content: "JLxPIl",
                schema: {},
            },
            {
                name: "lpqSVG",
                options: {},
                type: "CheckboxesField",
                title: "Checkboxes",
                schema: {},
                list: "list1",
            },
        ],
        next: [{
            path: "/summary"
        }],
        controller: "",
        section: ""
    },
    {
        title: "Summary",
        path: "/summary",
        components: [],
        next: [],
        controller: "./pages/summary.js",
        section: "Conclusion"
    }],
    conditions: [
        {
            name: "lvrXRK",
            value: {
                name: "lvrXRK",
                conditions: [
                    {
                        value: {
                            value: "yes",
                            display: "yes",
                            toPresentationString: () => "yes",
                            toExpression: () => "yes",
                            clone: function () {
                                return this as unknown as import("@xgovformbuilder/model").ConditionValue;
                            },
                            type: "string"
                        },
                        field: new ConditionField("lvrXRK", "YesNoField", "YesNo1"),
                        operator: "",
                        asFirstCondition: function (): Condition {
                            throw new Error("Function not implemented.");
                        },
                        conditionString: function (): string {
                            throw new Error("Function not implemented.");
                        },
                        conditionExpression: function () {
                            throw new Error("Function not implemented.");
                        },
                        clone: function (): Condition {
                            throw new Error("Function not implemented.");
                        },
                        coordinator: undefined,
                        coordinatorString: function (): string {
                            throw new Error("Function not implemented.");
                        },
                        getCoordinator: function (): Coordinator | undefined {
                            throw new Error("Function not implemented.");
                        },
                        setCoordinator: function (coordinator: Coordinator | undefined): void {
                            throw new Error("Function not implemented.");
                        },
                        isGroup: function (): boolean {
                            throw new Error("Function not implemented.");
                        },
                        getGroupedConditions: function (): Condition[] {
                            throw new Error("Function not implemented.");
                        },
                        _asFirstCondition: function (): void {
                            throw new Error("Function not implemented.");
                        }
                    }
                ]
            },
            displayName: "Condition lvrXRK",
        }
    ],
    lists: [
        {
            name: "list1",
            items: [
                {
                    value: "item1",
                    text: "Item 1",
                    condition: "lvrXRK",
                },
                {
                    value: "item2",
                    text: "Item 2",
                    condition: "lvrXRK",
                }
            ],
            title: "List 1",
            type: "string",
            id: "list1"
        }
    ],
    sections: [
        {
            name: "iNNSWg",
            title: "Repeatable section 1",
            conditionComp: "lvrXRK",
            numberComp: "nkKBIH",
            repeatableSection: true
        }
    ],
    fees: [],
    outputs: [
        {
            name: "NVpEeB",
            title: "Output",
            type: OutputType.Notify,
            outputConfiguration: {
                personalisation: [],
                templateId: "Template",
                apiKey: "API",
                emailField: "gEzCdW",
                addReferencesToPersonalisation: false
            }
        }
    ],
    confirmationMsg: "Confirmation message",
    documents: [
        {
            id: "document1",
            type: "pdf",
            title: "",
            uploadedDate: new Date(),
            fileName: "",
            path: ""
        }
    ],
    parentChild: {
        id: "parentChild1",
        isMainParent: false,
        parentChildConfig: {
            description: "description",
            childHeading: "heading",
            childConfigs: [
                {
                    childId: "child1",
                    childFormName: "Child Form Name",
                    childFormTitle: "Child Form Title",
                    cardOrder: 1,
                    parentId: "parentField1",
                    dependentforms: [],
                    dateComponent: "",
                    helpText: "",
                    condition: "lvrXRK",
                    conditionName: "Condition lvrXRK",
                    isMainChild: false
                }
            ]
        }
    },
    designedDataSets: [
        {
            id: "JLxPIl",
            title: "terst1",
            uploadedDate: new Date("2025-06-27T05:47:41.517"),
            csvUsed: "BPxozQ",
            keyIdentifier: "UKPRN",
            data: [
                [
                    {
                        index: "1-1",
                        type: InputType.SELECT,
                        value: "UKPRN-Header",
                        bold: false,
                        calc: false,
                        checked: false,
                        numeric: false
                    },
                    {
                        index: "1-2",
                        type: InputType.SELECT,
                        value: "Institution_Name_Legal_Name-Header",
                        bold: false,
                        calc: false,
                        checked: false,
                        numeric: false
                    }
                ],
                [
                    {
                        index: "2-1",
                        type: InputType.SELECT,
                        value: "UKPRN-Value",
                        bold: false,
                        numeric: false,
                        calc: true,
                        checked: false
                    },
                    {
                        index: "2-2",
                        type: InputType.SELECT,
                        value: "Institution_Name_Legal_Name-Value",
                        bold: false,
                        numeric: false,
                        calc: true,
                        checked: false
                    }
                ]
            ]
        }
    ],
    importedDataSets: [
        {
            fileTitle: "test",
            fileName: "Dataset ukprn.csv",
            uploadedDate: new Date("2024-12-08T19:38:35.383"),
            fileId: "BPxozQ"
        }
    ],
    calculations: [
        {
            displayName: "plus20",
            type: "arithmetic",
            name: "DAxPlb",
            pageLocation: "/fourth-page",
            components: [
                {
                    name: "QbuHNQ",
                    type: "NumberField",
                    title: "Same page number comp",
                    options: {},
                    hint: "",
                    prefixType: "none",
                    prefixValue: "",
                    suffixValue: "",
                    precision: 2,
                    schema: {}
                }
            ],
            expression: "(QbuHNQ) + 20 + (JLxPIl->UKPRN-Value)",
            title: "plus20",
            hideResult: false,
            datasets: [
                {
                    index: "2-1",
                    type: InputType.SELECT,
                    value: "JLxPIl->UKPRN-Value",
                    bold: false,
                    calc: true,
                    checked: true,
                    numeric: false
                }
            ],
            prefixValue: "",
            suffixValue: "",
            precision: 0
        }]
}

describe("Common Utils test", () => {
    test("Validate handle linked property function -- remove number component", () => {
        const formResult = handleLinkedPropertyEffect(
            Module.Component,
            formSample?.pages?.[1]?.components?.[0] ?? null,
            PropertyAction.Deleted,
            formSample
        );
        expect(formResult.sections[0].numberComp).toBeUndefined();
        expect(formResult.sections[0].repeatableSection).toBe(true);
    })
    test("Validate handle linked property function -- remove yesno component", () => {
        const formResult = handleLinkedPropertyEffect(
            Module.Component,
            formSample?.pages?.[1]?.components?.[1] ?? null,
            PropertyAction.Deleted,
            formSample
        );
        expect(formResult.sections[0].conditionComp).toBeUndefined();
        expect(formResult.sections[0].repeatableSection).toBe(true);
    })
    test("Validate handle linked property function -- remove both number and yesno component", () => {
        let formResult = handleLinkedPropertyEffect(
            Module.Component,
            formSample?.pages?.[1]?.components?.[0] ?? null,
            PropertyAction.Deleted,
            formSample
        );
        formResult = handleLinkedPropertyEffect(
            Module.Component,
            formSample?.pages?.[1]?.components?.[1] ?? null,
            PropertyAction.Deleted,
            formResult
        );
        expect(formResult.sections[0].numberComp).toBeUndefined();
        expect(formResult.sections[0].conditionComp).toBeUndefined();
        expect(formResult.sections[0].repeatableSection).toBe(false);
    })
    test("Validate handle linked property function -- remove email component", () => {
        const formResult = handleLinkedPropertyEffect(
            Module.Component,
            formSample?.pages?.[1]?.components?.[5] ?? null,
            PropertyAction.Deleted,
            formSample
        );
        expect(((formResult.outputs![0] as Output).outputConfiguration as NotifyOutputConfiguration).emailField).toBeUndefined();
    })
    test("Validate handle linked property function -- edit yesno component", () => {
        const editedComponent = {
            name: "lvrXRK",
            options: {},
            type: "YesNoField",
            title: "YesNo",
            schema: {},
        }
        const formResult = handleLinkedPropertyEffect(
            Module.Component,
            editedComponent,
            PropertyAction.Edited,
            formSample
        );
        expect((formResult.conditions[0].value as any).conditions[0].field.display).toEqual("YesNo");
    })
    test("Validate handle linked property function -- remove section reference in page", () => {
        const formResult = handleLinkedPropertyEffect(
            Module.Section,
            formSample?.sections?.[0] ?? null,
            PropertyAction.Deleted,
            formSample
        );
        expect(formResult.pages[1].section).toBeUndefined();
    })
    test("Validate handle linked property function -- remove file download/data import components in page", () => {
        const formResult = handleLinkedPropertyEffect(
            Module.Document,
            formSample?.documents?.[0] ?? null,
            PropertyAction.Deleted,
            formSample
        );
        expect(formResult.pages[1].components?.length).toEqual(4);
    })
    test("Validate handle linked property function -- handle condition delete", () => {
        expect(formSample.pages[1]?.components?.[4]?.options?.["condition"]).toEqual("lvrXRK");
        expect(formSample.parentChild?.parentChildConfig?.childConfigs[0]?.condition).toEqual("lvrXRK");
        const formResult = handleLinkedPropertyEffect(
            Module.Condition,
            formSample?.conditions?.[0] ?? null,
            PropertyAction.Deleted,
            formSample
        );
        expect(formResult.pages[1]?.components?.[4]?.options?.["condition"]).toEqual(undefined);
        expect(formResult.parentChild?.parentChildConfig?.childConfigs[0]?.condition).toEqual("");
    });
    test("Validate handle linked property function -- handle imported dataset delete", () => {
        const formResult = handleLinkedPropertyEffect(
            Module.ImportedDataSet,
            formSample?.importedDataSets?.[0] ?? null,
            PropertyAction.Deleted,
            formSample
        );
        expect(formResult.designedDataSets?.length).toEqual(0);
        expect(formResult.pages[2]?.components?.length).toEqual(2);
    });
    test("Validate handle linked property function -- handle designed dataset delete", () => {
        const formResult = handleLinkedPropertyEffect(
            Module.DesignedDataSet,
            formSample?.designedDataSets?.[0] ?? null,
            PropertyAction.Deleted,
            formSample
        );
        expect(formResult.pages[2]?.components?.length).toEqual(2);
        expect(formResult.calculations[0].datasets.length).toEqual(0);
    });
    test("Validate handle linked property function -- handle list delete", () => {
        const formResult = handleLinkedPropertyEffect(
            Module.List,
            formSample?.lists?.[0] ?? null,
            PropertyAction.Deleted,
            formSample
        );
        expect((formResult.pages[2]?.components?.[2] as CheckboxesFieldComponent)?.list).toBeUndefined();
    });
});