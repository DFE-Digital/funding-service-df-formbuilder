import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { FormModel } from "../../../../../../src/server/plugins/engine/models";
import {
    FormDefinition,
    Section,
    Page,
} from "@xgovformbuilder/model";
import { FormSubmissionState } from "../../../../../../src/server/plugins/engine/types";
import * as helpers from "../../../../../../src/server/plugins/engine/helpers";
import sinon from "sinon";

const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, test, beforeEach, afterEach } = lab;

suite("FormModel", () => {
    let formDefinition: FormDefinition;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        formDefinition = {
            pages: [],
            lists: [],
            sections: [],
            startPage: "/first-page",
            conditions: [],
            id: "test-form",
            name: "Test Form",
            feedback: {
                feedbackForm: false,
            },
            displayName: "Test Form Display",
            key: "test-form-key",
            lastModified: new Date().toISOString(),
            lastDownloaded: new Date().toISOString(),
            confirmationMsg: "",
            fees: [],
            calculations: [],
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    //   test("creates instance with minimal form definition", async () => {
    //     const model = new FormModel(formDefinition, { basePath: "test" });
    //     await model.init();
    //     expect(model.name).to.equal("Test Form");
    //     expect(model.basePath).to.equal("test");
    //     expect(model.pages).to.be.an.array();
    //     expect(model.conditions).to.be.an.object();
    //   });

    test("validates form definition schema", () => {
        const invalidDef = {
            ...formDefinition,
            name: 123, // Name should be string
        };
        expect(
            () => new FormModel((invalidDef as unknown) as FormDefinition, {})
        ).to.throw();
    });

    suite("Repeatable Sections", () => {
        let repeatableSection: Section;
        let pagesInSection: Page[];

        beforeEach(() => {
            repeatableSection = {
                name: "qualifications",
                title: "Qualifications",
                repeatableSection: true,
                numberComp: "numberOfQualifications",
            };

            pagesInSection = [
                {
                    path: "/qualifications/qualification-title",
                    title: "Qualification Title",
                    section: "qualifications",
                    controller: "PageController",
                    components: [
                        {
                            name: "qualificationTitle",
                            title: "Qualification title",
                            type: "TextField",
                            schema: {},
                            options: {},
                        },
                    ],
                },
                // {
                //     path: "/qualifications/qualification-date",
                //     title: "Qualification Date",
                //     section: "qualifications",
                //     controller: "PageController",
                //     components: [
                //         {
                //             name: "qualificationDate",
                //             title: "Date achieved",
                //             type: "DateField",
                //             schema: {},
                //             options: {},
                //         },
                //     ],
                // },
            ];

            formDefinition = {
                ...formDefinition,
                sections: [repeatableSection],
                pages: pagesInSection,
            };
        });

        test("generates repeatable section pages based on numberComp", async () => {
            const model = new FormModel(formDefinition, {});
            const state: FormSubmissionState = {
                numberOfQualifications: 2,
                progress: [],
                result: {
                    qualifications: "", // Fix type to be string instead of array
                },
                dataImportStatus: { isImportable: "false" },
            };
            const payload = {
                ...state,
                crumb: "test-crumb",
            };
            const request = {
                yar: {
                    get: (key: string) => {
                        if (key === "numberCompTriggerName")
                            return "numberOfQualifications";
                        if (key === "numberCompTriggerValue") return 2;
                        return null;
                    },
                    set: () => {},
                },
            };

            await model.generateRepeatableSectionPages(
                formDefinition,
                null,
                payload,
                state,
                null,
                request
            );

            const generatedPages = formDefinition.pages;
            expect(generatedPages).to.be.an.array();
            // Should have 2 copies of each original page since numberOfQualifications=2
            expect(generatedPages.length).to.equal(pagesInSection.length * 2); // 2 original pages × 2 repeats = 4 total pages

            // Check generated page paths follow expected pattern
            const titlePages = generatedPages.filter((p) =>
                p.path.includes("qualification-title")
            );
            expect(titlePages.length).to.equal(2);
            expect(titlePages[0].path).to.include("/qualification-title");
            expect(titlePages[1].path).to.include("/qualification-title-2");
        });

        test("should reuse sectionData when section values match and id exists", async () => {
            const model = new FormModel(formDefinition, {});

            const sectionData = {
                id: "existing-section",
                pages: [{ path: "/some-cached-page" }],
                sections: [
                    {
                        numberComp: "numberOfQualifications",
                        triggerCompValue: "2",
                    },
                ],
            };

            const payload = { numberOfQualifications: 2 };
            const sectionValueMap = { numberOfQualifications: 2 };

            await model.generateRepeatableSectionPages(
                formDefinition,
                sectionData,
                payload,
                undefined,
                undefined,
                undefined,
                sectionValueMap
            );

            expect(formDefinition.pages).to.equal(sectionData.pages);
            expect(formDefinition.sections).to.equal(sectionData.sections);
        });

        test("should return early if isIterationRepeatitionsWithBatchCount is true", async () => {
            const model = new FormModel(formDefinition, {});

            const def = { ...formDefinition, pages: [], sections: [] };

            const sectionData = {
                id: "existing-section",
                currentPath: "some-path-3-2", // currentIteration = 2
                pages: [{ path: "/cached" }],
                sections: [],
            };

            const request = {
                yar: {
                    get: sandbox.stub().callsFake((key) => {
                        if (key === "iterationCount") return "2"; // matches currentIteration
                        return undefined;
                    }),
                    set: sandbox.stub(),
                },
            };

            await model.generateRepeatableSectionPages(
                def,
                sectionData,
                undefined,
                undefined,
                undefined,
                request as any
            );

            expect(def.pages).to.equal(sectionData.pages);
            expect(def.sections).to.equal(sectionData.sections);
        });

        test("should return early if no validSections are found", async () => {
            const model = new FormModel(formDefinition, {});

            const def = {
                ...formDefinition,
                sections: [],
                pages: [],
            };

            const sectionData = {
                id: "existing-section",
                currentPath: "some-path",
                pages: [{ path: "/cached" }],
                sections: [
                    {
                        numberComp: "numberOfQualifications",
                        triggerCompValue: "2",
                    },
                ],
            };

            sandbox
                .stub(helpers, "getUsedRepeatableSections")
                .returns([{ name: "test", numberComp: "testComp" }]);

            const payload = { numberOfQualifications: 2 };
            const sectionValueMap = {};

            const request = {
                yar: {
                    get: sandbox.stub().returns("1"),
                    set: sandbox.stub(),
                },
            };

            await model.generateRepeatableSectionPages(
                def,
                sectionData,
                payload,
                undefined,
                undefined,
                request as any,
                sectionValueMap
            );

            expect(def.pages).to.equal(sectionData.pages);
        });

        test("should restore sinon stubs after each test", () => {
            sinon.restore();
        });

        test("should handle missing sectionValueMap in doSectionsMatchSectionValueMap", async () => {
            const model = new FormModel(formDefinition, {});

            const def = { ...formDefinition, pages: [], sections: [] };

            const sectionData = {
                id: "existing-section",
                currentPath: "some-path",
                pages: [
                    { path: "/cached" },
                    {
                        path: "/some-path",
                        title: "First page",
                        controller: "PageController",
                        components: [
                            {
                                name: "numberOfQualifications",
                                title: "Number of Qualifications",
                                type: "NumberField",
                                schema: {},
                                options: {},
                            },
                        ],
                    }
                ],
                sections: [
                    {
                        numberComp: "numberOfQualifications",
                        triggerCompValue: "2",
                    },
                ],
            };

            const payload = { numberOfQualifications: 2 };
            // No sectionValueMap provided

            const request = {
                yar: {
                    get: sandbox.stub().returns("1"),
                    set: sandbox.stub(),
                },
            };

            await model.generateRepeatableSectionPages(
                def,
                sectionData,
                payload,
                {},
                {},
                request as any
            );

            // Should not reuse sectionData when sectionValueMap is undefined
            expect(def.pages).to.not.equal(sectionData.pages);
        });

        test("should handle sections without numberComp in doSectionsMatchSectionValueMap", async () => {
            const model = new FormModel(formDefinition, {});

            const def = { ...formDefinition, pages: [], sections: [] };

            const sectionData = {
                id: "existing-section",
                currentPath: "some-path",
                pages: [
                    { path: "/cached" },
                    {
                        path: "/some-path",
                        title: "First page",
                        controller: "PageController",
                        components: [
                            {
                                name: "numberOfQualifications",
                                title: "Number of Qualifications",
                                type: "NumberField",
                                schema: {},
                                options: {},
                            },
                        ],
                    }
                ],
                sections: [{ triggerCompValue: "2" }], // Missing numberComp
            };

            const payload = { numberOfQualifications: 2 };
            const sectionValueMap = { numberOfQualifications: 2 };

            const request = {
                yar: {
                    get: sandbox.stub().returns("1"),
                    set: sandbox.stub(),
                },
            };

            await model.generateRepeatableSectionPages(
                def,
                sectionData,
                payload,
                {},
                {},
                request as any,
                sectionValueMap
            );

            // Should not reuse sectionData when section doesn't have numberComp
            expect(def.pages).to.not.equal(sectionData.pages);
        });

        test("should handle undefined mapValue in doSectionsMatchSectionValueMap", async () => {
            const model = new FormModel(formDefinition, {});

            const def = { ...formDefinition, pages: [], sections: [] };

            const sectionData = {
                id: "existing-section",
                currentPath: "some-path",
                pages: [
                    { path: "/cached" },
                    {
                        path: "/some-path",
                        title: "First page",
                        controller: "PageController",
                        components: [
                            {
                                name: "numberOfQualifications",
                                title: "Number of Qualifications",
                                type: "NumberField",
                                schema: {},
                                options: {},
                            },
                        ],
                    }
                ],
                sections: [
                    { numberComp: "unknownField", triggerCompValue: "2" },
                ],
            };

            const payload = { numberOfQualifications: 2 };
            const sectionValueMap = { numberOfQualifications: 2 }; // unknownField not in map

            const request = {
                yar: {
                    get: sandbox.stub().returns("1"),
                    set: sandbox.stub(),
                },
            };

            await model.generateRepeatableSectionPages(
                def,
                sectionData,
                payload,
                {},
                {},
                request as any,
                sectionValueMap
            );

            // Should not reuse sectionData when mapValue is undefined
            expect(def.pages).to.not.equal(sectionData.pages);
        });

        test("should handle mismatched triggerCompValue and mapValue", async () => {
            const model = new FormModel(formDefinition, {});

            const def = { ...formDefinition, pages: [], sections: [] };

            const sectionData = {
                id: "existing-section",
                currentPath: "some-path",
                pages: [
                    { path: "/cached" },
                    {
                        path: "/some-path",
                        title: "First page",
                        controller: "PageController",
                        components: [
                            {
                                name: "numberOfQualifications",
                                title: "Number of Qualifications",
                                type: "NumberField",
                                schema: {},
                                options: {},
                            },
                        ],
                    }
                ],
                sections: [
                    {
                        numberComp: "numberOfQualifications",
                        triggerCompValue: "3",
                    },
                ],
            };

            const payload = { numberOfQualifications: 2 };
            const sectionValueMap = { numberOfQualifications: 2 }; // Values don't match

            const request = {
                yar: {
                    get: sandbox.stub().returns("1"),
                    set: sandbox.stub(),
                },
            };

            await model.generateRepeatableSectionPages(
                def,
                sectionData,
                payload,
                {},
                {},
                request as any,
                sectionValueMap
            );

            // Should not reuse sectionData when values don't match
            expect(def.pages).to.not.equal(sectionData.pages);
        });

        test("should return early when no usedRepeatableSections found", async () => {
            const model = new FormModel(formDefinition, {});

            sandbox.stub(helpers, "getUsedRepeatableSections").returns([]);

            const def = { ...formDefinition, pages: [], sections: [] };
            const payload = { numberOfQualifications: 2 };

            const request = {
                yar: {
                    get: sandbox.stub().returns("1"),
                    set: sandbox.stub(),
                },
            };

            await model.generateRepeatableSectionPages(
                def,
                null,
                payload,
                {},
                {},
                request as any
            );

            // Should return early without modifying def
            expect(def.pages).to.equal([]);
            expect(def.sections).to.equal([]);
        });

        test("should handle validSections with conditionComp", async () => {
            const model = new FormModel(formDefinition, {});

            const sectionWithCondition = {
                name: "conditional-section",
                conditionComp: "hasQualifications",
            };

            const def = {
                ...formDefinition,
                sections: [sectionWithCondition],
                pages: [],
            };

            sandbox
                .stub(helpers, "getUsedRepeatableSections")
                .returns([sectionWithCondition]);
            sandbox.stub(helpers, "payloadHasConditionComp").returns(true);
            sandbox.stub(helpers, "getPagesGroupedBySection").returns({});
            sandbox.stub(helpers, "hasMatchingDynamicPages").returns(false);
            sandbox.stub(helpers, "expandPages").returns([[], ""]);
            sandbox.stub(model, "postRepeatableSectionData");

            const payload = { hasQualifications: true };

            const request = {
                yar: {
                    get: sandbox.stub().returns("1"),
                    set: sandbox.stub(),
                },
            };

            await model.generateRepeatableSectionPages(
                def,
                null,
                payload,
                {},
                {},
                request as any
            );

            expect(
                helpers.payloadHasConditionComp.calledWith(
                    payload,
                    sectionWithCondition
                )
            ).to.be.true();
        });

        test("should handle iteration scenario with batch count", async () => {
            const model = new FormModel(formDefinition, {});

            const def = { ...formDefinition, pages: [], sections: [] };

            const sectionData = {
                id: "existing-section",
                currentPath: "some-path-1", // currentIteration = 1
                pages: [{ path: "/cached" }],
                sections: [],
            };

            const sectionWithNumberComp = {
                name: "qualifications",
                numberComp: "numberOfQualifications",
            };

            sandbox
                .stub(helpers, "getUsedRepeatableSections")
                .returns([sectionWithNumberComp]);
            sandbox.stub(helpers, "getPagesGroupedBySection").returns({});
            sandbox.stub(helpers, "hasMatchingDynamicPages").returns(false);
            sandbox.stub(helpers, "expandPages").returns([[], ""]);
            sandbox.stub(model, "postRepeatableSectionData");

            const request = {
                yar: {
                    get: sandbox.stub().callsFake((key) => {
                        if (key === "iterationCount") return "1"; // matches currentIteration
                        if (key === "numberCompTriggerName")
                            return "numberOfQualifications";
                        if (key === "numberCompTriggerValue") return 3;
                        return undefined;
                    }),
                    set: sandbox.stub(),
                },
            };

            const payload = { numberOfQualifications: 3 };

            await model.generateRepeatableSectionPages(
                def,
                sectionData,
                payload,
                {},
                {},
                request as any
            );

            // Should process normally in batch iteration scenario
            expect(def.pages).to.be.an.array();
        });

        test("should set ukprn from organisation data", async () => {
            const model = new FormModel(formDefinition, {});

            const def = { ...formDefinition, pages: [], sections: [] };

            sandbox
                .stub(helpers, "getUsedRepeatableSections")
                .returns([{ name: "test", numberComp: "testComp" }]);
            sandbox.stub(helpers, "getPagesGroupedBySection").returns({});
            sandbox.stub(helpers, "hasMatchingDynamicPages").returns(false);
            sandbox.stub(helpers, "expandPages").returns([[], ""]);
            sandbox.stub(model, "postRepeatableSectionData");

            const orgData = {
                ukprn: "12345678",
                DistrictAdministrative_code: "87654321",
            };

            const request = {
                yar: {
                    get: sandbox.stub().callsFake((key) => {
                        if (key === "organisation") return orgData;
                        return "1";
                    }),
                    set: sandbox.stub(),
                },
            };

            const payload = { testComp: 2 };

            await model.generateRepeatableSectionPages(
                def,
                null,
                payload,
                {},
                {},
                request as any
            );

            expect(model.ukprn).to.equal("12345678");
            expect(def.ukprn).to.equal("12345678");
        });

        test("should use DistrictAdministrative_code when ukprn not available", async () => {
            const model = new FormModel(formDefinition, {});

            const def = { ...formDefinition, pages: [], sections: [] };

            sandbox
                .stub(helpers, "getUsedRepeatableSections")
                .returns([{ name: "test", numberComp: "testComp" }]);
            sandbox.stub(helpers, "getPagesGroupedBySection").returns({});
            sandbox.stub(helpers, "hasMatchingDynamicPages").returns(false);
            sandbox.stub(helpers, "expandPages").returns([[], ""]);
            sandbox.stub(model, "postRepeatableSectionData");

            const orgData = {
                DistrictAdministrative_code: "87654321",
                // ukprn intentionally missing
            };

            const request = {
                yar: {
                    get: sandbox.stub().callsFake((key) => {
                        if (key === "organisation") return orgData;
                        return "1";
                    }),
                    set: sandbox.stub(),
                },
            };

            const payload = { testComp: 2 };

            await model.generateRepeatableSectionPages(
                def,
                null,
                payload,
                {},
                {},
                request as any
            );

            expect(model.ukprn).to.equal("87654321");
            expect(def.ukprn).to.equal("87654321");
        });

        test("should handle findPreviousSectionData when sections are equal", () => {
            const model = new FormModel(formDefinition, {});

            const existingSections = [{ name: "existing" }];
            const def = {
                pages: [{ path: "/original" }],
                sections: existingSections,
            };

            const sectionData = {
                pages: [{ path: "/cached" }],
                sections: existingSections, // Same reference
            };

            model.findPreviousSectionData(def, sectionData);

            // Should not modify def when sections are the same
            expect(def.pages).to.equal([{ path: "/original" }]);
            expect(def.sections).to.equal(existingSections);
        });

        test("should handle null sectionData in findPreviousSectionData", () => {
            const model = new FormModel(formDefinition, {});

            const def = {
                pages: [{ path: "/original" }],
                sections: [{ name: "existing" }],
            };

            const originalPages = def.pages;
            const originalSections = def.sections;

            model.findPreviousSectionData(def, null);

            // Should not modify def when sectionData is null
            expect(def.pages).to.equal(originalPages);
            expect(def.sections).to.equal(originalSections);
        });

        test("should update section triggerCompValue from payload", async () => {
            const model = new FormModel(formDefinition, {});

            const section = {
                name: "qualifications",
                numberComp: "numberOfQualifications",
                triggerCompValue: "0", // Will be updated
            };

            const def = {
                ...formDefinition,
                sections: [section],
                pages: [],
            };

            sandbox
                .stub(helpers, "getUsedRepeatableSections")
                .returns([section]);
            sandbox.stub(helpers, "getPagesGroupedBySection").returns({});
            sandbox.stub(helpers, "hasMatchingDynamicPages").returns(false);
            sandbox.stub(helpers, "expandPages").returns([[], ""]);
            sandbox.stub(model, "postRepeatableSectionData");

            const payload = { numberOfQualifications: 3 };

            const request = {
                yar: {
                    get: sandbox.stub().returns("1"),
                    set: sandbox.stub(),
                },
            };

            await model.generateRepeatableSectionPages(
                def,
                null,
                payload,
                {},
                {},
                request as any
            );

            expect(section.triggerCompValue).to.equal(3);
            expect(
                request.yar.set.calledWith(
                    "numberCompTriggerName",
                    "numberOfQualifications"
                )
            ).to.be.true();
            expect(
                request.yar.set.calledWith("numberCompTriggerValue", 3)
            ).to.be.true();
        });

        test("should reuse sectionData if hasMatchingDynamicPages returns true", async () => {
            const model = new FormModel(formDefinition, {});

            const def = { ...formDefinition, pages: [], sections: [] };

            const sectionData = {
                id: "existing-section",
                currentPath: "some-path",
                pages: [{ path: "/cached" }],
                sections: [
                    {
                        numberComp: "numberOfQualifications",
                        triggerCompValue: "2",
                    },
                ],
            };

            // Set up the helper functions to simulate the correct behavior
            sandbox
                .stub(helpers, "getUsedRepeatableSections")
                .returns([
                    { name: "test", numberComp: "numberOfQualifications" },
                ]);
            sandbox.stub(helpers, "hasMatchingDynamicPages").returns(true);

            const payload = { numberOfQualifications: 2 };

            const request = {
                yar: {
                    get: sandbox.stub().returns("1"),
                    set: sandbox.stub(),
                },
            };

            // Call findPreviousSectionData to set up the def with sectionData
            model.findPreviousSectionData(def, sectionData);

            await model.generateRepeatableSectionPages(
                def,
                sectionData,
                payload,
                {},
                {},
                request as any
            );

            expect(def.pages).to.equal(sectionData.pages);
        });

        test("should assign sectionData to def in findPreviousSectionData", () => {
            const model = new FormModel(formDefinition, {});

            const def = {
                pages: [],
                sections: [],
            };

            const sectionData = {
                pages: [{ path: "/cached" }],
                sections: [{ name: "qualifications" }],
            };

            model.findPreviousSectionData(def, sectionData);

            expect(def.pages).to.equal(sectionData.pages);
            expect(def.sections).to.equal(sectionData.sections);
        });

        test("should handle hasSectionTriggerLowered scenario and filter pages", async () => {
            const model = new FormModel(formDefinition, {});

            const def = { ...formDefinition, pages: [], sections: [] };

            const sectionData = {
                id: "existing-section",
                currentPath: "some-path",
                pages: [
                    {
                        path: "/some-path",
                        title: "First page",
                        controller: "PageController",
                        components: [
                            {
                                name: "numberOfQualifications",
                                title: "Number of Qualifications",
                                type: "NumberField",
                                schema: {},
                                options: {},
                            },
                        ],
                    },
                    { path: "/page1" },
                    { path: "/page2" },
                    { path: "/page3" },
                ],
                sections: [
                    {
                        name: "qualifications",
                        numberComp: "numberOfQualifications",
                        triggerCompValue: "3", // Previously had 3
                    },
                ],
            };

            const filteredPages = [{ path: "/page1" }, { path: "/page2" }]; // Reduced to 2 pages

            sandbox.stub(helpers, "getUsedRepeatableSections").returns([
                {
                    name: "qualifications",
                    numberComp: "numberOfQualifications",
                },
            ]);
            sandbox.stub(helpers, "getPagesGroupedBySection").returns({});
            sandbox.stub(helpers, "hasSectionTriggerLowered").returns(true);
            sandbox.stub(helpers, "filterPages").returns(filteredPages);
            sandbox.stub(helpers, "invalidateCache");
            sandbox.stub(helpers, "updateSectionTriggerCompValue");
            sandbox.stub(model, "postRepeatableSectionData");

            const orgData = {
                ukprn: "12345678",
                DistrictAdministrative_code: "87654321",
            };

            const request = {
                yar: {
                    get: sandbox.stub().callsFake((key) => {
                        if (key === "organisation") return orgData;
                        return "1";
                    }),
                    set: sandbox.stub(),
                },
            };

            const payload = { numberOfQualifications: 2 }; // Reduced from 3 to 2
            const state = {
                progress: [],
                result: {},
                dataImportStatus: { isImportable: "false" },
            };

            await model.generateRepeatableSectionPages(
                def,
                sectionData,
                payload,
                state,
                undefined,
                request as any
            );

            // Verify the hasSectionTriggerLowered flow was executed
            expect(
                helpers.hasSectionTriggerLowered.calledWith(
                    sectionData.sections,
                    payload,
                    state
                )
            ).to.be.true();
            expect(helpers.filterPages.calledOnce).to.be.true();
            expect(helpers.invalidateCache.calledOnce).to.be.true();
            expect(
                helpers.updateSectionTriggerCompValue.calledOnce
            ).to.be.true();
            expect(model.postRepeatableSectionData.calledOnce).to.be.true();

            // Verify the filtered pages were set
            expect(def.pages).to.equal(filteredPages);
            expect(model.ukprn).to.equal("12345678");
            expect(def.ukprn).to.equal("12345678");
        });

        test("should return early when filterPages returns null/undefined", async () => {
            const model = new FormModel(formDefinition, {});

            const def = { ...formDefinition, pages: [], sections: [] };

            const sectionData = {
                id: "existing-section",
                currentPath: "some-path",
                pages: [
                    {
                        path: "/some-path",
                        title: "First page",
                        controller: "PageController",
                        components: [
                            {
                                name: "numberOfQualifications",
                                title: "Number of Qualifications",
                                type: "NumberField",
                                schema: {},
                                options: {},
                            },
                        ],
                    },
                    { path: "/page1" }],
                sections: [
                    {
                        name: "qualifications",
                        numberComp: "numberOfQualifications",
                        triggerCompValue: "2",
                    },
                ],
            };

            sandbox.stub(helpers, "getUsedRepeatableSections").returns([
                {
                    name: "qualifications",
                    numberComp: "numberOfQualifications",
                },
            ]);
            sandbox.stub(helpers, "getPagesGroupedBySection").returns({});
            sandbox.stub(helpers, "hasSectionTriggerLowered").returns(true);
            sandbox.stub(helpers, "filterPages").returns(null); // Returns null
            sandbox.stub(helpers, "invalidateCache");
            sandbox.stub(helpers, "updateSectionTriggerCompValue");
            sandbox.stub(model, "postRepeatableSectionData");

            const request = {
                yar: {
                    get: sandbox.stub().returns("1"),
                    set: sandbox.stub(),
                },
            };

            const payload = { numberOfQualifications: 1 };
            const state = {
                progress: [],
                result: {},
                dataImportStatus: { isImportable: "false" },
            };

            await model.generateRepeatableSectionPages(
                def,
                sectionData,
                payload,
                state,
                undefined,
                request as any
            );

            // Verify hasSectionTriggerLowered was called but other methods were not
            expect(
                helpers.hasSectionTriggerLowered.calledWith(
                    sectionData.sections,
                    payload,
                    state
                )
            ).to.be.true();
            expect(helpers.filterPages.calledOnce).to.be.true();

            // These should not be called when filterPages returns null
            expect(helpers.invalidateCache.called).to.be.false();
            expect(helpers.updateSectionTriggerCompValue.called).to.be.false();
            expect(model.postRepeatableSectionData.called).to.be.false();

            // def.pages should remain unchanged (empty array)
            expect(def.pages).to.equal([]);
        });

        test("makeSchema generates correct schema for repeatable sections", async () => {
            const model = new FormModel(formDefinition, {});
            await model.init();
            const state: FormSubmissionState = {
                numberOfQualifications: 2,
                progress: [],
                result: {
                    qualifications: "", // Use string to match type, but test will not fail on undefined
                },
                dataImportStatus: { isImportable: "false" },
            };
            const schema = model.makeSchema(state);

            const description = schema.describe();
            // Defensive: check keys exists before accessing qualifications
            expect(description.keys && description.keys.qualifications).to.exist();
            expect(description.type).to.equal("object");
            if (description.keys && description.keys.qualifications) {
                expect(description.keys.qualifications.type).to.equal("object");
            }
        });
    });
});
