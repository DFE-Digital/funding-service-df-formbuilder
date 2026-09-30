import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { PageControllerBase } from "../../../../../../src/server/plugins/engine/pageControllers";
import { FormModel } from "../../../../../../src/server/plugins/engine/models";

const lab = Lab.script();
exports.lab = lab;

const { expect } = Code;
const { suite, describe, it, beforeEach } = lab;

/**
 * `getNext` narrows a repeating section's state to the current iteration before
 * resolving a condition's field. These tests cover the shapes that are NOT
 * repeating sections, to prove the narrowing leaves them alone: a form with no
 * sections at all, a non-repeating section, and the one case where a value
 * exists in both the root of state and inside a section.
 */
suite("getNext (condition field resolution outside repeating sections)", () => {
    const options = { basePath: "basePath" };

    const buildDef = (sections: any[], pageSection?: string): any => ({
        metadata: {},
        startPage: "/page-a",
        pages: [
            {
                path: "/page-a",
                title: "Page A",
                ...(pageSection ? { section: pageSection } : {}),
                components: [
                    {
                        name: "fldOne",
                        options: {},
                        type: "YesNoField",
                        title: "Field one",
                        schema: {},
                    },
                ],
                next: [
                    { path: "/page-b", condition: "condOne" },
                    { path: "/page-c" },
                ],
            },
            {
                path: "/page-b",
                title: "Page B",
                ...(pageSection ? { section: pageSection } : {}),
                components: [],
                next: [{ path: "/summary" }],
            },
            {
                path: "/page-c",
                title: "Page C",
                ...(pageSection ? { section: pageSection } : {}),
                components: [],
                next: [{ path: "/summary" }],
            },
            {
                path: "/summary",
                title: "Summary",
                controller: "./pages/summary.js",
                components: [],
                next: [],
            },
        ],
        lists: [],
        sections,
        conditions: [
            {
                displayName: "condOne",
                name: "condOne",
                value: {
                    name: "condOne",
                    conditions: [
                        {
                            field: {
                                name: "fldOne",
                                type: "YesNoField",
                                display: "Field one",
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
    });

    const pageFor = async (def: any, path: string) => {
        const model = new FormModel(def, options);
        await model.init();
        const pageDef = model.pages.find((p: any) => p.path === path)?.pageDef;
        return new PageControllerBase(model, pageDef);
    };

    describe("a form with no sections at all", () => {
        let def: any;

        beforeEach(() => {
            def = buildDef([]);
        });

        it("follows the condition when the root value satisfies it", async () => {
            const page = await pageFor(def, "/page-a");

            expect(page.getNext({ fldOne: true })).to.contain("/page-b");
        });

        it("falls through to the default path when it does not", async () => {
            const page = await pageFor(def, "/page-a");

            const next = page.getNext({ fldOne: false });

            expect(next).to.not.contain("/page-b");
            expect(next).to.contain("/page-c");
        });
    });

    describe("a non-repeating section", () => {
        let def: any;

        beforeEach(() => {
            def = buildDef(
                [
                    {
                        name: "secA",
                        title: "Section A",
                        repeatableSection: false,
                    },
                ],
                "secA"
            );
        });

        it("resolves a condition against the section's value", async () => {
            const page = await pageFor(def, "/page-a");

            expect(page.getNext({ secA: { fldOne: true } })).to.contain(
                "/page-b"
            );
        });

        it("falls through when the section value does not satisfy it", async () => {
            const page = await pageFor(def, "/page-a");

            const next = page.getNext({ secA: { fldOne: false } });

            expect(next).to.not.contain("/page-b");
            expect(next).to.contain("/page-c");
        });
    });

    /**
     * Some values are written to both the root of state and into the section -
     * DSIAccess does this with the signed-in organisation's UKPRN. The section
     * copy is the more specific one and is the value the page itself collected,
     * so it is the one a condition resolves against.
     */
    describe("a value present at the root and inside a section", () => {
        it("resolves against the section value", async () => {
            const def = buildDef(
                [
                    {
                        name: "secA",
                        title: "Section A",
                        repeatableSection: false,
                    },
                ],
                "secA"
            );
            const page = await pageFor(def, "/page-a");

            const next = page.getNext({
                fldOne: false,
                secA: { fldOne: true },
            });

            expect(next).to.contain("/page-b");
        });
    });
});
