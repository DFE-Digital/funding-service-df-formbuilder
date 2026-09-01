import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import {
    DesignedDataSet,
    FormDefinition,
    Section,
} from "@xgovformbuilder/model";
import {
    replaceExpressionWithValue,
    setExpressionDataAndConditionEvaluation,
} from "../../../../src/server/utils/calculationService";
import { FormSubmissionState } from "../../../../src/server/plugins/engine/types";
import * as tableTabService from "../../../../src/server/utils/tableTabService";
import * as utils from "../../../../src/server/plugins/engine/pageControllers/utils";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test, beforeEach, afterEach } = lab;

// Test helper to create minimal PageViewModel
const createPageViewModel = (components: any[] = []) => ({
    page: {} as any,
    name: "test-page",
    pageTitle: "Test Page",
    sectionTitle: "Test Section",
    showTitle: true,
    components,
    errors: {
        titleText: "There is a problem",
        errorList: [],
    },
    isStartPage: false,
    isAuthenticated: false,
});

// Test helper to create minimal Component
const createComponent = (overrides: any = {}) => ({
    type: "Result",
    isFormComponent: true,
    model: {
        id: "component1",
        name: "component1",
        attributes: {
            expression: "(variable1) + (variable2)",
            precision: 2,
        },
        options: {},
        value: "",
        displayValue: "",
        content: [],
        items: [],
        condition: null,
        ...overrides.model,
    },
    ...overrides,
});

// Test helper to create FormSubmissionState with required properties
const createFormSubmissionState = (overrides: any = {}) =>
    ({
        progress: [],
        dataImportStatus: {},
        result: {},
        ...overrides,
    } as FormSubmissionState);

// Test helper to create minimal FormDefinition
const createFormDefinition = (overrides: any = {}): FormDefinition => ({
    id: "test-form",
    key: "test-key",
    basePath: "/",
    pages: [],
    sections: [],
    startPage: "/",
    name: "Test Form",
    feedback: {
        emailAddress: "",
        url: "",
    },
    conditions: [],
    lists: [],
    paymentSkip: false,
    declaration: "",
    pdfTemplate: "",
    displayName: "Test Form",
    skipSummary: false,
    version: 1,
    lastModified: "2025-05-12",
    email: "",
    feeOptions: {},
    logger: console,
    specialPages: {
        confirmationPage: {},
        startPage: {},
        summaryPage: {},
    },
    designedDataSets: [],
    calculations: [],
    ...overrides,
});

// Test helper to create minimal Organizations
const createOrganizations = (overrides: any = {}) => ({
    ukprn: "12345678",
    urn: "87654321",
    DistrictAdministrative_code: "E123",
    DistrictAdministrativeCode: "E123",
    ...overrides,
});

// Test helper to create minimal DesignedDataSet
const createDesignedDataSet = (overrides: any = {}): DesignedDataSet => ({
    id: "dataset1",
    name: "Test Dataset",
    csvUsed: "test-file-id",
    keyIdentifier: "ukprn",
    data: [],
    ...overrides,
});

suite("CalculationService", () => {
    let getBlobContentStub: sinon.SinonStub;
    let numberWithCommasStub: sinon.SinonStub;

    beforeEach(() => {
        getBlobContentStub = sinon.stub(tableTabService, "getBlobContent");
        numberWithCommasStub = sinon.stub(utils, "numberWithCommas");
    });

    afterEach(() => {
        sinon.restore();
    });

    suite("Internal Functions", () => {
        suite("sumAllVariableInstances", () => {
            test("sums basic variable instances", async () => {
                const component = createComponent({
                    model: {
                        id: "result1",
                        attributes: {
                            expression: "(variable1~R+)",
                        },
                    },
                });
                const viewModel = createPageViewModel([component]);
                const state: FormSubmissionState = {
                    progress: [],
                    dataImportStatus: {},
                    result: {},
                    variable1: 10,
                    "variable1-2": 20,
                    "variable1-3": 30,
                };
                const formDefinition = createFormDefinition();
                const organizations = createOrganizations();

                await replaceExpressionWithValue(
                    viewModel,
                    state,
                    formDefinition,
                    organizations
                );

                expect(state.result["result1"]).to.equal("60");
            });

            test("handles nested objects when searching for variables", async () => {
                const component = createComponent({
                    model: {
                        id: "result1",
                        attributes: {
                            expression: "(variable1~R+)",
                        },
                    },
                });
                const viewModel = createPageViewModel([component]);
                const state: FormSubmissionState = {
                    progress: [],
                    dataImportStatus: {},
                    result: {},
                    variable1: 5,
                    nested: {
                        "variable1-2": 15,
                        "variable1-3": 25,
                    },
                };
                const formDefinition = createFormDefinition();
                const organizations = createOrganizations();

                await replaceExpressionWithValue(
                    viewModel,
                    state,
                    formDefinition,
                    organizations
                );

                expect(state.result["result1"]).to.equal("45");
            });

            test("ignores non-numeric values", async () => {
                const component = createComponent({
                    model: {
                        id: "result1",
                        attributes: {
                            expression: "(variable1~R+)",
                        },
                    },
                });
                const viewModel = createPageViewModel([component]);
                const state: FormSubmissionState = {
                    progress: [],
                    dataImportStatus: {},
                    result: {},
                    variable1: 10,
                    "variable1-2": "not a number",
                    "variable1-3": 20,
                };
                const formDefinition = createFormDefinition();
                const organizations = createOrganizations();

                await replaceExpressionWithValue(
                    viewModel,
                    state,
                    formDefinition,
                    organizations
                );

                expect(state.result["result1"]).to.equal("30");
            });

            test("ignores NaN values", async () => {
                const component = createComponent({
                    model: {
                        id: "result1",
                        attributes: {
                            expression: "(variable1~R+)",
                        },
                    },
                });
                const viewModel = createPageViewModel([component]);
                const state: FormSubmissionState = {
                    progress: [],
                    dataImportStatus: {},
                    result: {},
                    variable1: 10,
                    "variable1-2": NaN,
                    "variable1-3": 20,
                };
                const formDefinition = createFormDefinition();
                const organizations = createOrganizations();

                await replaceExpressionWithValue(
                    viewModel,
                    state,
                    formDefinition,
                    organizations
                );

                expect(state.result["result1"]).to.equal("30");
            });

            test("handles null and undefined objects", async () => {
                const component = createComponent({
                    model: {
                        id: "result1",
                        attributes: {
                            expression: "(variable1~R+)",
                        },
                    },
                });
                const viewModel = createPageViewModel([component]);
                const state: FormSubmissionState = {
                    progress: [],
                    dataImportStatus: {},
                    result: {},
                    variable1: 10,
                    nullValue: null,
                    undefinedValue: undefined,
                };
                const formDefinition = createFormDefinition();
                const organizations = createOrganizations();

                await replaceExpressionWithValue(
                    viewModel,
                    state,
                    formDefinition,
                    organizations
                );

                expect(state.result["result1"]).to.equal("10");
            });
        });

        suite("convertExpressionToObj", () => {
            test("handles dataset variables with single key", async () => {
                const component = createComponent({
                    model: {
                        id: "result1",
                        attributes: {
                            expression: "(dataset1->123)",
                        },
                    },
                });
                const viewModel = createPageViewModel([component]);
                const state: FormSubmissionState = {
                    progress: [],
                    dataImportStatus: {},
                    result: {},
                };
                const formDefinition = createFormDefinition();
                const organizations = createOrganizations();

                await replaceExpressionWithValue(
                    viewModel,
                    state,
                    formDefinition,
                    organizations
                );

                expect(state.result["result1"]).to.exist();
            });
        });
    });

    suite("replaceExpressionWithValue", () => {
        test("processes expression with dataset variables", async () => {
            const designedDataSet = createDesignedDataSet({
                id: "dataset1",
                keyIdentifier: "ukprn",
            });
            const component = createComponent({
                model: {
                    id: "result1",
                    attributes: {
                        expression: "(dataset1->field1-Value)",
                    },
                },
            });
            const viewModel = createPageViewModel([component]);
            const state: FormSubmissionState = {
                progress: [],
                dataImportStatus: {},
            };
            const formDefinition = createFormDefinition({
                designedDataSets: [designedDataSet],
            });
            const organizations = createOrganizations();

            getBlobContentStub.resolves([{ ukprn: "12345678", field1: "100" }]);

            await replaceExpressionWithValue(
                viewModel,
                state,
                formDefinition,
                organizations
            );

            expect(getBlobContentStub.calledOnce).to.be.true();
            expect(state.result["result1"]).to.exist();
        });

        test("processes repeatable expression with ~R+", async () => {
          const component = createComponent({
            model: {
              id: "result1",
              attributes: {
                expression: "(variable1~R+)"
              }
            }
          });
          const viewModel = createPageViewModel([component]);
          const state: FormSubmissionState = {
            progress: [],
            dataImportStatus: {},
            variable1: 10,
            "variable1-2": 20,
            "variable1-3": 30
          };
          const formDefinition = createFormDefinition();
          const organizations = createOrganizations();

          await replaceExpressionWithValue(viewModel, state, formDefinition, organizations);

          expect(state.result["result1"]).to.equal("60");
          expect(state.result["result1-temp"]).to.equal("60");
        });

        // test("processes repeatable expression with dataset variables", async () => {
        //     const designedDataSet = createDesignedDataSet({
        //         id: "dataset1",
        //         keyIdentifier: "ukprn",
        //     });
        //     const component = createComponent({
        //         model: {
        //             id: "result1",
        //             attributes: {
        //                 expression: "(dataset1->field1~R+)",
        //             },
        //         },
        //     });
        //     const viewModel = createPageViewModel([component]);
        //     const state: FormSubmissionState = {
        //         progress: [],
        //         dataImportStatus: {},
        //     };
        //     const formDefinition = createFormDefinition({
        //         designedDataSets: [designedDataSet],
        //     });
        //     const organizations = createOrganizations();

        //     getBlobContentStub.resolves([{ ukprn: "12345678", field1: "100" }]);

        //     await replaceExpressionWithValue(
        //         viewModel,
        //         state,
        //         formDefinition,
        //         organizations
        //     );

        //     expect(state.result["result1"]).to.equal("100");
        //     expect(state.result["result1-temp"]).to.equal("100");
        // });

        test("handles expressions with variables from sections", async () => {
            const section: Section = {
                name: "section1",
                title: "Section 1",
            };
            const component = createComponent({
                model: {
                    id: "result1",
                    attributes: {
                        expression: "(sectionVar)",
                    },
                },
            });
            const viewModel = createPageViewModel([component]);
            const state: FormSubmissionState = {
                progress: [],
                dataImportStatus: {},
                section1: {
                    sectionVar: 50,
                },
            };
            const formDefinition = createFormDefinition({
                sections: [section],
            });
            const organizations = createOrganizations();

            await replaceExpressionWithValue(
                viewModel,
                state,
                formDefinition,
                organizations
            );

            expect(state.result["result1"]).to.equal("(50)");
        });

        test("handles empty or undefined expressions", async () => {
            const component = createComponent({
                model: {
                    id: "result1",
                    attributes: {
                        expression: "",
                    },
                },
            });
            const viewModel = createPageViewModel([component]);
            const state: FormSubmissionState = {
                progress: [],
                dataImportStatus: {},
            };
            const formDefinition = createFormDefinition();
            const organizations = createOrganizations();

            await replaceExpressionWithValue(
                viewModel,
                state,
                formDefinition,
                organizations
            );

            expect(state.result).to.exist();
            expect(state.result["result1"]).to.not.exist();
        });

        test("handles dataset with URN key identifier", async () => {
            const designedDataSet = createDesignedDataSet({
                id: "dataset1",
                keyIdentifier: "urn",
            });
            const component = createComponent({
                model: {
                    id: "result1",
                    attributes: {
                        expression: "(dataset1->field1-Value)",
                    },
                },
            });
            const viewModel = createPageViewModel([component]);
            const state: FormSubmissionState = {
                progress: [],
                dataImportStatus: {},
            };
            const formDefinition = createFormDefinition({
                designedDataSets: [designedDataSet],
            });
            const organizations = createOrganizations();

            getBlobContentStub.resolves([{ urn: "87654321", field1: "200" }]);

            await replaceExpressionWithValue(
                viewModel,
                state,
                formDefinition,
                organizations
            );

            expect(state.result["result1"]).to.exist();
        });

        test("handles dataset with district administrative code key identifier", async () => {
            const designedDataSet = createDesignedDataSet({
                id: "dataset1",
                keyIdentifier: "district_administrative_code",
            });
            const component = createComponent({
                model: {
                    id: "result1",
                    attributes: {
                        expression: "(dataset1->field1-Value)",
                    },
                },
            });
            const viewModel = createPageViewModel([component]);
            const state: FormSubmissionState = {
                progress: [],
                dataImportStatus: {},
            };
            const formDefinition = createFormDefinition({
                designedDataSets: [designedDataSet],
            });
            const organizations = createOrganizations();

            getBlobContentStub.resolves([
                { district_administrative_code: "E123", field1: "300" },
            ]);

            await replaceExpressionWithValue(
                viewModel,
                state,
                formDefinition,
                organizations
            );

            expect(state.result["result1"]).to.exist();
        });

        test("returns 0 for missing organization details", async () => {
            const designedDataSet = createDesignedDataSet();
            const component = createComponent({
                model: {
                    id: "result1",
                    attributes: {
                        expression: "(dataset1->field1-Value)",
                    },
                },
            });
            const viewModel = createPageViewModel([component]);
            const state: FormSubmissionState = {
                progress: [],
                dataImportStatus: {},
            };
            const formDefinition = createFormDefinition({
                designedDataSets: [designedDataSet],
            });

            await replaceExpressionWithValue(
                viewModel,
                state,
                formDefinition,
                null as any
            );

            expect(state.result["result1"]).to.exist();
        });

        test("handles missing dataset", async () => {
            const component = createComponent({
                model: {
                    id: "result1",
                    attributes: {
                        expression: "(nonexistent->field1-Value)",
                    },
                },
            });
            const viewModel = createPageViewModel([component]);
            const state: FormSubmissionState = {
                progress: [],
                dataImportStatus: {},
            };
            const formDefinition = createFormDefinition();
            const organizations = createOrganizations();

            await replaceExpressionWithValue(
                viewModel,
                state,
                formDefinition,
                organizations
            );

            expect(state.result["result1"]).to.exist();
        });

        test("handles missing data in dataset", async () => {
            const designedDataSet = createDesignedDataSet();
            const component = createComponent({
                model: {
                    id: "result1",
                    attributes: {
                        expression: "(dataset1->field1-Value)",
                    },
                },
            });
            const viewModel = createPageViewModel([component]);
            const state: FormSubmissionState = {
                progress: [],
                dataImportStatus: {},
            };
            const formDefinition = createFormDefinition({
                designedDataSets: [designedDataSet],
            });
            const organizations = createOrganizations();

            getBlobContentStub.resolves([
                { ukprn: "99999999", field1: "100" }, // Different UKPRN
            ]);

            await replaceExpressionWithValue(
                viewModel,
                state,
                formDefinition,
                organizations
            );

            expect(state.result["result1"]).to.exist();
        });

        test("handles edge case with expression and expressionTemp different", async () => {
            const component = createComponent({
                model: {
                    id: "result1",
                    attributes: {
                        expression: "(variable1~R+) + (variable2)",
                    },
                },
            });
            const viewModel = createPageViewModel([component]);
            const state: FormSubmissionState = {
                progress: [],
                dataImportStatus: {},
                variable1: 10,
                "variable1-2": 20,
                variable2: 5,
            };
            const formDefinition = createFormDefinition();
            const organizations = createOrganizations();

            await replaceExpressionWithValue(
                viewModel,
                state,
                formDefinition,
                organizations
            );

            expect(state.result["result1"]).to.equal("30 + 5");
            expect(state.result["result1-temp"]).to.equal("30 + 5");
        });
    });

    suite("setExpressionDataAndConditionEvaluation", () => {
        test("evaluates mathematical expressions and sets display values", async () => {
            const component = createComponent({
                model: {
                    id: "result1",
                    attributes: {
                        expression: "(variable1) + (variable2)",
                        precision: 2,
                    },
                    options: {
                        prefixValue: "£",
                    },
                },
            });
            const viewModel = createPageViewModel([component]);
            const state: FormSubmissionState = {
                progress: [],
                dataImportStatus: {},
                variable1: 10,
                variable2: 20,
                result: {
                    result1: "10 + 20",
                },
            };
            const formDefinition = createFormDefinition();
            const formModel = {
                conditions: {},
            } as any;
            const organizations = createOrganizations();

            numberWithCommasStub.returns("30.00");

            await setExpressionDataAndConditionEvaluation(
                state,
                (str: string) => /[a-zA-Z]/.test(str),
                viewModel,
                formDefinition,
                formModel,
                organizations
            );

            expect(component.model.value).to.equal("30.00");
            expect(numberWithCommasStub.calledOnce).to.be.true();
        });

        test("handles NaN and infinite results", async () => {
            const component = createComponent({
                type: "Result",
                model: {
                    id: "result1",
                    attributes: {
                        expression: "10 / 0",
                        precision: 0,
                    },
                    options: {},
                },
            });
            const viewModel = createPageViewModel([component]);
            const state = createFormSubmissionState();
            const formDefinition = createFormDefinition();
            const formModel = {
                conditions: {},
            } as any;
            const organizations = createOrganizations();

            await setExpressionDataAndConditionEvaluation(
                state,
                (str: string) => /[a-zA-Z]/.test(str),
                viewModel,
                formDefinition,
                formModel,
                organizations
            );

            expect(component.model.value).to.equal("0");
        });

        test("filters content based on conditions", async () => {
            const component = createComponent({
                type: "Html",
                model: {
                    id: "html1",
                    content: [
                        { text: "Always shown" },
                        {
                            text: "Conditionally shown",
                            condition: "condition1",
                        },
                    ],
                },
            });
            const viewModel = createPageViewModel([component]);
            const state: FormSubmissionState = {
                progress: [],
                dataImportStatus: {},
                result: {},
            };
            const formDefinition = createFormDefinition();
            const formModel = {
                conditions: {
                    condition1: {
                        fn: sinon.stub().returns(true),
                    },
                },
            } as any;
            const organizations = createOrganizations();

            await setExpressionDataAndConditionEvaluation(
                state,
                (str: string) => /[a-zA-Z]/.test(str),
                viewModel,
                formDefinition,
                formModel,
                organizations
            );

            expect(component.model.content).to.have.length(2);
            expect(formModel.conditions.condition1.fn.calledOnce).to.be.true();
        });

        test("filters items based on conditions", async () => {
            const component = createComponent({
                type: "RadiosField",
                model: {
                    id: "radios1",
                    items: [
                        { text: "Option 1", value: "1" },
                        {
                            text: "Option 2",
                            value: "2",
                            condition: "condition1",
                        },
                    ],
                },
            });
            const viewModel = createPageViewModel([component]);
            const state: FormSubmissionState = {
                progress: [],
                dataImportStatus: {},
                result: {},
            };
            const formDefinition = createFormDefinition();
            const formModel = {
                conditions: {
                    condition1: {
                        fn: sinon.stub().returns(false),
                    },
                },
            } as any;
            const organizations = createOrganizations();

            await setExpressionDataAndConditionEvaluation(
                state,
                (str: string) => /[a-zA-Z]/.test(str),
                viewModel,
                formDefinition,
                formModel,
                organizations
            );

            expect(component.model.items).to.have.length(1);
            expect(component.model.items[0].text).to.equal("Option 1");
        });

        test("filters components based on conditions", async () => {
            const component1 = createComponent({
                type: "Html",
                model: {
                    id: "html1",
                    content: ["Always shown"],
                    condition: "condition1",
                },
            });
            const component2 = createComponent({
                type: "Html",
                model: {
                    id: "html2",
                    content: ["No condition"],
                },
            });
            const viewModel = createPageViewModel([component1, component2]);
            const state: FormSubmissionState = {
                progress: [],
                dataImportStatus: {},
                result: {},
            };
            const formDefinition = createFormDefinition();
            const formModel = {
                conditions: {
                    condition1: {
                        fn: sinon.stub().returns(false),
                    },
                },
            } as any;
            const organizations = createOrganizations();

            await setExpressionDataAndConditionEvaluation(
                state,
                (str: string) => /[a-zA-Z]/.test(str),
                viewModel,
                formDefinition,
                formModel,
                organizations
            );

            expect(viewModel.components).to.have.length(1);
            expect(viewModel.components[0].model.id).to.equal("html2");
        });

        suite("repeated section conditions (second iteration)", () => {
            test("evaluates condition using the current iteration's value, not the first iteration's", async () => {
                const section: Section = {
                    name: "repeatSection",
                    title: "Repeat Section",
                };
                const component = createComponent({
                    type: "Html",
                    model: {
                        id: "html1",
                        content: [
                            { text: "Always shown" },
                            {
                                text: "Shown when threshold met",
                                condition: "condition1",
                            },
                        ],
                    },
                });
                const viewModel = createPageViewModel([component]);
                viewModel.page = { path: "/repeat-section-2" } as any;

                const state: FormSubmissionState = {
                    progress: [],
                    dataImportStatus: {},
                    result: {},
                    repeatSection: {
                        eYWQBR: 10, // iteration 1 value
                        "eYWQBR-2": 20, // iteration 2 value
                    },
                } as any;

                const formDefinition = createFormDefinition({
                    sections: [section],
                });
                const formModel = {
                    sections: [section],
                    conditions: {
                        condition1: {
                            fn: sinon
                                .stub()
                                .callsFake(
                                    (conditionState: any) =>
                                        conditionState.eYWQBR > 15
                                ),
                        },
                    },
                } as any;
                const organizations = createOrganizations();

                await setExpressionDataAndConditionEvaluation(
                    state,
                    (str: string) => /[a-zA-Z]/.test(str),
                    viewModel,
                    formDefinition,
                    formModel,
                    organizations
                );

                // On iteration 2, eYWQBR should resolve to 20 (>15), so the
                // conditional item must be present, not filtered out.
                expect(component.model.content).to.have.length(2);
            });

            test("still evaluates condition using the first iteration's value on the first iteration", async () => {
                const section: Section = {
                    name: "repeatSection",
                    title: "Repeat Section",
                };
                const component = createComponent({
                    type: "Html",
                    model: {
                        id: "html1",
                        content: [
                            { text: "Always shown" },
                            {
                                text: "Shown when threshold met",
                                condition: "condition1",
                            },
                        ],
                    },
                });
                const viewModel = createPageViewModel([component]);
                viewModel.page = { path: "/repeat-section" } as any;

                const state: FormSubmissionState = {
                    progress: [],
                    dataImportStatus: {},
                    result: {},
                    repeatSection: {
                        eYWQBR: 10, // iteration 1 value
                        "eYWQBR-2": 20, // iteration 2 value
                    },
                } as any;

                const formDefinition = createFormDefinition({
                    sections: [section],
                });
                const formModel = {
                    sections: [section],
                    conditions: {
                        condition1: {
                            fn: sinon
                                .stub()
                                .callsFake(
                                    (conditionState: any) =>
                                        conditionState.eYWQBR > 15
                                ),
                        },
                    },
                } as any;
                const organizations = createOrganizations();

                await setExpressionDataAndConditionEvaluation(
                    state,
                    (str: string) => /[a-zA-Z]/.test(str),
                    viewModel,
                    formDefinition,
                    formModel,
                    organizations
                );

                // On iteration 1, eYWQBR should resolve to 10 (<=15), so the
                // conditional item must be filtered out.
                expect(component.model.content).to.have.length(1);
            });
        });

        test("handles currency prefix values (Euro)", async () => {
            const component = createComponent({
                model: {
                    id: "result1",
                    attributes: {
                        expression: "(variable1)",
                        precision: 2,
                    },
                    options: {
                        prefixValue: "€",
                    },
                },
            });
            const viewModel = createPageViewModel([component]);
            const state: FormSubmissionState = {
                progress: [],
                dataImportStatus: {},
                variable1: 50,
                result: {
                    result1: "50",
                },
            };
            const formDefinition = createFormDefinition();
            const formModel = {
                conditions: {},
            } as any;
            const organizations = createOrganizations();

            numberWithCommasStub.returns("50.00");

            await setExpressionDataAndConditionEvaluation(
                state,
                (str: string) => /[a-zA-Z]/.test(str),
                viewModel,
                formDefinition,
                formModel,
                organizations
            );

            expect(numberWithCommasStub.calledOnce).to.be.true();
            expect(component.model.displayValue).to.equal("50.00");
        });
    });
});
