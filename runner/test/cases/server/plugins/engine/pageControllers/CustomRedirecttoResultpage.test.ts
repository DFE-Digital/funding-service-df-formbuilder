import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { PageControllerBase } from "../../../../../../src/server/plugins/engine/pageControllers";
import { FormModel } from "../../../../../../src/server/plugins/engine/models";

const lab = Lab.script();
exports.lab = lab;

const { expect } = Code;
const { suite, describe, it, beforeEach } = lab;

/**
 * Regression tests for the "Change" link on the summary page redirecting to
 * the wrong page (or bouncing through unrelated pages) when it edits a value
 * inside a repeatable section.
 *
 * Fixture: a repeatable section "repSec" with two already-expanded
 * iterations (page-a/page-b/page-summary and their "-2" duplicates, as the
 * real duplication mechanism produces them), plus a page outside any
 * section that legitimately shares a calculation with the section.
 */
suite("CustomRedirecttoResultpage (edit-from-summary navigation)", () => {
    const options = { basePath: "basePath" };

    const def: any = {
        metadata: {},
        startPage: "/page-a",
        pages: [
            {
                path: "/page-a",
                title: "Page A",
                section: "repSec",
                components: [
                    {
                        name: "numA",
                        options: {},
                        type: "NumberField",
                        title: "Number A",
                        schema: { min: 0, max: 9999 },
                    },
                    {
                        name: "yesNoA",
                        options: {},
                        type: "YesNoField",
                        title: "Yes No A",
                        schema: {},
                    },
                ],
                next: [
                    { path: "/page-b", condition: "condA" },
                    { path: "/page-summary" },
                ],
            },
            {
                path: "/page-b",
                title: "Page B",
                section: "repSec",
                components: [
                    {
                        name: "numB",
                        options: {},
                        type: "NumberField",
                        title: "Number B",
                        schema: { min: 0, max: 9999 },
                    },
                    {
                        name: "yesNoB",
                        options: {},
                        type: "YesNoField",
                        title: "Yes No B",
                        schema: {},
                    },
                ],
                next: [{ path: "/page-summary" }],
            },
            {
                path: "/page-summary",
                title: "Page summary",
                section: "repSec",
                components: [
                    {
                        name: "total",
                        options: {},
                        type: "Result",
                        title: "Total",
                        expression: "(numA) + (numB)",
                        calculationName: "calcTotal",
                        schema: {},
                    },
                ],
                next: [{ path: "/page-a-2" }],
            },
            {
                path: "/page-a-2",
                title: "Page A 2",
                section: "repSec",
                components: [
                    {
                        name: "numA-2",
                        options: {},
                        type: "NumberField",
                        title: "Number A",
                        schema: { min: 0, max: 9999 },
                    },
                    {
                        name: "yesNoA-2",
                        options: {},
                        type: "YesNoField",
                        title: "Yes No A",
                        schema: {},
                    },
                ],
                next: [
                    { path: "/page-b-2", condition: "condA" },
                    { path: "/page-summary-2" },
                ],
            },
            {
                path: "/page-b-2",
                title: "Page B 2",
                section: "repSec",
                components: [
                    {
                        name: "numB-2",
                        options: {},
                        type: "NumberField",
                        title: "Number B",
                        schema: { min: 0, max: 9999 },
                    },
                ],
                next: [{ path: "/page-summary-2" }],
            },
            {
                path: "/page-summary-2",
                title: "Page summary 2",
                section: "repSec",
                components: [
                    {
                        name: "total-2",
                        options: {},
                        type: "Result",
                        title: "Total",
                        expression: "(numA-2) + (numB-2)",
                        calculationName: "calcTotal",
                        schema: {},
                    },
                ],
                next: [{ path: "/outside-page" }],
            },
            {
                path: "/outside-page",
                title: "Outside page",
                components: [
                    {
                        name: "outsideTotal",
                        options: {},
                        type: "Result",
                        title: "Outside total",
                        expression: "(numA) + (numB)",
                        calculationName: "calcTotal",
                        schema: {},
                    },
                ],
                next: [{ path: "/summary" }],
            },
            {
                path: "/summary",
                title: "Summary",
                controller: "./pages/summary.js",
                components: [],
            },
        ],
        lists: [],
        sections: [
            {
                name: "repSec",
                title: "Repeatable section",
                repeatableSection: true,
                conditionComp: "addAnother",
            },
        ],
        conditions: [
            {
                displayName: "condA",
                name: "condA",
                value: {
                    name: "condA",
                    conditions: [
                        {
                            field: {
                                name: "yesNoA",
                                type: "YesNoField",
                                display: "Yes No A",
                            },
                            operator: "is",
                            value: {
                                type: "Value",
                                value: "true",
                                display: "true",
                            },
                        },
                    ],
                },
            },
        ],
        fees: [],
        outputs: [],
        version: 2,
        userId: "ab5e4f5b-16f5-4a4e-a6f6-7d7e43fff7fb",
        createdBy: "UserTest1",
        id: "testForm",
        key: "testForm",
        displayName: "test-form",
        name: "test-form",
        lastModified: "2023/05/12 02:22",
        formStatus: "In development",
        file: "TestFile",
        feedback: {
            url: "/feedback",
            feedbackForm: true,
            emailAddress: "test@abc.com",
        },
        importedDataSets: [],
        lastUpdatedByName: "UserTest1",
        lastUpdatedById: "ab5e4f5b-16f5-4a4e-a6f6-7d7e43fff7fb",
        designedDataSets: [],
        skipSummary: false,
        signInRequired: true,
        documents: [],
        declaration: "",
        calculations: [
            {
                displayName: "Total",
                hint: "",
                type: "arithmetic",
                name: "calcTotal",
                pageLocation: "Page summary",
                components: [
                    {
                        title: "Number A",
                        name: "numA",
                        type: "NumberField",
                        options: {},
                        schema: { min: 0, max: 9999 },
                    },
                    {
                        title: "Number B",
                        name: "numB",
                        type: "NumberField",
                        options: {},
                        schema: { min: 0, max: 9999 },
                    },
                ],
                expression: "(numA) + (numB)",
                title: "Total",
                hideResult: false,
                computeList: [
                    {
                        id: "c1",
                        type: "component",
                        order: 1,
                        value: "numA",
                        entity: "numA",
                    },
                    {
                        id: "c2",
                        type: "operator",
                        order: 2,
                        value: "+",
                        entity: "",
                    },
                    {
                        id: "c3",
                        type: "component",
                        order: 3,
                        value: "numB",
                        entity: "numB",
                    },
                ],
                calculationsMapped: [],
            },
        ],
    };

    const cacheService = { getState: async () => ({}) };
    const services = { cacheService };
    const request: any = {
        query: {},
        yar: { get: () => undefined, set: () => undefined },
        services: () => services,
        server: { logger: { debug: () => null } },
    };
    const h: any = { redirect: (url: any) => url };
    const returnurl = "/basePath/summary";

    let model: FormModel;
    let repSecSection: any;

    beforeEach(async () => {
        model = new FormModel(def, options);
        await model.init();
        repSecSection = model.sections.find((s: any) => s.name === "repSec");
    });

    const pageFor = (path: string) => {
        const pageDef = model.pages.find((p: any) => p.path === path)?.pageDef;
        return new PageControllerBase(model, pageDef);
    };

    describe("Tests", () => {
        it("redirects to the conditionally-required page when a section-scoped Yes/No field changes (iteration 1)", async () => {
            const page = pageFor("/page-a");

            const oldState = {
                repSec: { yesNoA: false, numA: 1, numB: 1 },
            };
            const newState = {
                repSec: { yesNoA: true, numA: 1, numB: 1 },
            };

            const result = await page.CustomRedirecttoResultpage(
                returnurl,
                h,
                repSecSection,
                false,
                null,
                request,
                newState,
                newState,
                oldState
            );

            expect(result).to.equal(
                `/basePath/page-b?returnUrl=${encodeURIComponent(returnurl)}`
            );
        });

        it("redirects to the conditionally-required page of the correct iteration when a duplicated section's Yes/No field changes (iteration 2)", async () => {
            const page = pageFor("/page-a-2");

            const oldState = {
                repSec: { "yesNoA-2": false, "numA-2": 1, "numB-2": 1 },
            };
            const newState = {
                repSec: { "yesNoA-2": true, "numA-2": 1, "numB-2": 1 },
            };

            const result = await page.CustomRedirecttoResultpage(
                returnurl,
                h,
                repSecSection,
                false,
                null,
                request,
                newState,
                newState,
                oldState
            );

            expect(result).to.equal(
                `/basePath/page-b-2?returnUrl=${encodeURIComponent(returnurl)}`
            );
        });

        it("does not redirect based on a different page's route when a stale Yes/No change is detected elsewhere in the section", async () => {
            const page = pageFor("/page-a");

            // yesNoA is unchanged (true both times) and would, on its own,
            // route page-a to page-b. yesNoB changes, but page-b's own next
            // is unconditioned, so nothing should actually redirect because
            // of it.
            const oldState = {
                repSec: {
                    yesNoA: true,
                    yesNoB: false,
                    numA: 1,
                    numB: 1,
                },
            };
            const newState = {
                repSec: {
                    yesNoA: true,
                    yesNoB: true,
                    numA: 1,
                    numB: 1,
                },
            };

            const result = await page.CustomRedirecttoResultpage(
                returnurl,
                h,
                repSecSection,
                false,
                null,
                request,
                newState,
                newState,
                oldState
            );

            expect(result).to.equal(returnurl);
        });

        it("does not redirect when nothing in the section actually changed", async () => {
            const page = pageFor("/page-a");

            const state = {
                repSec: { yesNoA: true, numA: 1, numB: 1 },
            };

            const result = await page.CustomRedirecttoResultpage(
                returnurl,
                h,
                repSecSection,
                false,
                null,
                request,
                state,
                state,
                state
            );

            expect(result).to.equal(returnurl);
        });

        it("does not detour into a same-named Result page belonging to a different iteration of the same section", async () => {
            const page = pageFor("/page-a");

            const oldState = {
                repSec: { yesNoA: false, numA: 1, numB: 1 },
            };
            const newState = {
                repSec: { yesNoA: false, numA: 5, numB: 1 },
            };

            const result = await page.CustomRedirecttoResultpage(
                returnurl,
                h,
                repSecSection,
                false,
                null,
                request,
                newState,
                newState,
                oldState
            );

            expect(result).to.not.include("page-summary-2");
        });

        it("still detours to a Result page outside the section that legitimately depends on the changed value", async () => {
            const page = pageFor("/page-summary");

            const oldState = {
                repSec: { yesNoA: false, numA: 1, numB: 1 },
            };
            const newState = {
                repSec: { yesNoA: false, numA: 5, numB: 1 },
            };

            const result = await page.CustomRedirecttoResultpage(
                returnurl,
                h,
                repSecSection,
                false,
                null,
                request,
                newState,
                newState,
                oldState
            );

            expect(result).to.equal(
                `/basePath/outside-page?returnUrl=${encodeURIComponent(
                    returnurl
                )}`
            );
        });
    });

    /**
     * Covers redirecting to a dependent Result page that belongs to a
     * different section than the page holding the changed value, as
     * distinct from that Result page belonging to the same section or to
     * no section at all.
     */
    describe("Result page belongs to a different section", () => {
        const otherSectionDef: any = {
            metadata: {},
            startPage: "/page-a",
            pages: [
                {
                    path: "/page-a",
                    title: "Page A",
                    section: "secA",
                    components: [
                        {
                            name: "numA",
                            options: {},
                            type: "NumberField",
                            title: "Number A",
                            schema: { min: 0, max: 9999 },
                        },
                        {
                            name: "resA",
                            options: {},
                            type: "Result",
                            title: "Result A",
                            expression: "(numA)",
                            schema: {},
                        },
                    ],
                    next: [{ path: "/page-b" }],
                },
                {
                    path: "/page-b",
                    title: "Page B",
                    section: "secB",
                    components: [
                        {
                            name: "resB",
                            options: {},
                            type: "Result",
                            title: "Result B",
                            expression: "(numA)",
                            schema: {},
                        },
                    ],
                    next: [{ path: "/summary" }],
                },
                {
                    path: "/summary",
                    title: "Summary",
                    controller: "./pages/summary.js",
                    components: [],
                },
            ],
            lists: [],
            sections: [
                { name: "secA", title: "Section A", repeatableSection: false },
                { name: "secB", title: "Section B", repeatableSection: false },
            ],
            conditions: [],
            fees: [],
            outputs: [],
            version: 2,
            userId: "ab5e4f5b-16f5-4a4e-a6f6-7d7e43fff7fb",
            createdBy: "UserTest1",
            id: "otherSectionTest",
            key: "otherSectionTest",
            displayName: "other-section-test",
            name: "other-section-test",
            lastModified: "2023/05/12 02:22",
            formStatus: "In development",
            file: "TestFile",
            feedback: {
                url: "/feedback",
                feedbackForm: true,
                emailAddress: "test@abc.com",
            },
            importedDataSets: [],
            lastUpdatedByName: "UserTest1",
            lastUpdatedById: "ab5e4f5b-16f5-4a4e-a6f6-7d7e43fff7fb",
            designedDataSets: [],
            skipSummary: false,
            signInRequired: true,
            documents: [],
            declaration: "",
            calculations: [
                {
                    displayName: "CalcA",
                    hint: "",
                    type: "arithmetic",
                    name: "calcA",
                    pageLocation: "Page A",
                    components: [
                        {
                            title: "Number A",
                            name: "numA",
                            type: "NumberField",
                            options: {},
                            schema: { min: 0, max: 9999 },
                        },
                    ],
                    expression: "numA",
                    title: "Calc A",
                    hideResult: false,
                    computeList: [
                        {
                            id: "cA1",
                            type: "component",
                            order: 1,
                            value: "numA",
                            entity: "numA",
                        },
                    ],
                    calculationsMapped: [],
                },
            ],
        };

        let otherSectionModel: FormModel;

        beforeEach(async () => {
            otherSectionModel = new FormModel(otherSectionDef, options);
            await otherSectionModel.init();
        });

        const pageForOtherSection = (path: string) => {
            const pageDef = otherSectionModel.pages.find(
                (p: any) => p.path === path
            )?.pageDef;
            return new PageControllerBase(otherSectionModel, pageDef);
        };

        it("redirects to a dependent Result page in a different section before returning to summary", async () => {
            const page = pageForOtherSection("/page-a");
            const secA = otherSectionModel.sections.find(
                (s: any) => s.name === "secA"
            );

            const oldState = { secA: { numA: 10 }, secB: {} };
            const newState = { secA: { numA: 20 }, secB: {} };

            const result = await page.CustomRedirecttoResultpage(
                returnurl,
                h,
                secA,
                false,
                null,
                request,
                newState,
                newState,
                oldState
            );

            expect(result).to.equal(
                `/basePath/page-b?returnUrl=${encodeURIComponent(returnurl)}`
            );
        });
    });
});
