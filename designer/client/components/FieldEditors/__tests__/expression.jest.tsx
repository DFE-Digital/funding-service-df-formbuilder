import { computeExpression } from "../utility/expression";
import type { Calculation, Page, Section } from "@xgovformbuilder/model";

const mkSection = (name: string, repeatableSection: boolean): Section =>
    (({ name, repeatableSection } as unknown) as Section);

const mkPage = (
    path: string,
    section: string,
    componentNames: string[] = []
): Page =>
    (({
        path,
        section,
        components: componentNames.map((n) => ({ name: n })),
    } as unknown) as Page);

const mkCalc = (
    name: string,
    componentNames: string[],
    computeList: Array<{ type: string; value: string }> = [],
    expression?: string
): Calculation =>
    (({
        name,
        components: componentNames.map((n) => ({ name: n })),
        computeList,
        expression,
    } as unknown) as Calculation);

describe("computeExpression", () => {
    // Sections: repeatable and non-repeatable
    const sections: Section[] = [
        mkSection("section-1", true), // repeatable
        mkSection("section-2", false), // non-repeatable
        mkSection("section-3", true), // repeatable
    ];

    // Pages mapped to sections and with components
    const pages: Page[] = [
        mkPage("/page-1", "section-1", ["comp-1", "comp-2"]),
        mkPage("/page-2", "section-2", []),
        mkPage("/page-3", "section-3", []),
    ];

    it("returns undefined when calculation is undefined", () => {
        const result = computeExpression(undefined, "/page-2", pages, sections);
        expect(result).toBeUndefined();
    });

    it("returns calculation.expression when computeList is empty", () => {
        const calc = mkCalc("CalcA", ["comp-1"], [], "(comp-1) + (5)");
        expect(computeExpression(calc, "/page-2", pages, sections)).toBe(
            "(comp-1) + (5)"
        );
    });

    it("returns calculation.expression when computeList is missing", () => {
        const calc = mkCalc("CalcB", ["comp-1"], undefined as any, "(comp-1)");
        expect(computeExpression(calc, "/page-2", pages, sections)).toBe(
            "(comp-1)"
        );
    });

    it("applies ~R+ when source section is repeatable, target is different & non-repeatable", () => {
        const calc = mkCalc(
            "CalcC",
            ["comp-1"],
            [{ type: "component", value: "comp-1" }]
        );
        const expr = computeExpression(calc, "/page-2", pages, sections);
        expect(expr).toBe("(comp-1~R+)"); // section-1 -> section-2
    });

    it("keeps plain formatting when target page is in the same section", () => {
        const calc = mkCalc(
            "CalcD",
            ["comp-1"],
            [{ type: "component", value: "comp-1" }]
        );
        const expr = computeExpression(calc, "/page-1", pages, sections);
        expect(expr).toBe("(comp-1)"); // section-1 -> section-1 (same section)
    });

    it("keeps plain formatting when target section is repeatable", () => {
        const calc = mkCalc(
            "CalcE",
            ["comp-1"],
            [{ type: "component", value: "comp-1" }]
        );
        const expr = computeExpression(calc, "/page-3", pages, sections);
        expect(expr).toBe("(comp-1)"); // section-1 -> section-3 (target repeatable)
    });

    it("treats missing target page path as non-repeatable mapping and applies ~R+", () => {
        const calc = mkCalc(
            "CalcF",
            ["comp-1"],
            [{ type: "component", value: "comp-1" }]
        );
        const expr = computeExpression(calc, "/missing", pages, sections);
        expect(expr).toBe("(comp-1~R+)"); // targetSection is null => condition true
    });

    it("falls back to plain formatting when component has no source page mapping", () => {
        const pagesWithoutComp3: Page[] = [
            mkPage("/page-1", "section-1", ["comp-1"]), // no "comp-3"
            mkPage("/page-2", "section-2", []),
        ];
        const calc = mkCalc(
            "CalcG",
            ["comp-3"],
            [{ type: "component", value: "comp-3" }]
        );

        const expr = computeExpression(
            calc,
            "/page-2",
            pagesWithoutComp3,
            sections
        );
        expect(expr).toBe("(comp-3)");
    });

    it("passes operators through and wraps numbers", () => {
        const calc = mkCalc(
            "CalcH",
            ["comp-1"],
            [
                { type: "component", value: "comp-1" },
                { type: "operator", value: "+" },
                { type: "number", value: "5" }, // any non-"component" token is wrapped
            ]
        );

        const expr = computeExpression(calc, "/page-2", pages, sections);
        expect(expr).toBe("(comp-1~R+) + (5)");
    });

    it("handles multiple components and operators", () => {
        const calc = mkCalc(
            "CalcJ",
            ["comp-1", "comp-2"],
            [
                { type: "component", value: "comp-1" },
                { type: "operator", value: "-" },
                { type: "component", value: "comp-2" },
            ]
        );

        const expr = computeExpression(calc, "/page-2", pages, sections);
        expect(expr).toBe("(comp-1~R+) - (comp-2~R+)");
    });

    it("same-section target keeps all components plain", () => {
        const calc = mkCalc(
            "CalcK",
            ["comp-1", "comp-2"],
            [
                { type: "component", value: "comp-1" },
                { type: "operator", value: "+" },
                { type: "component", value: "comp-2" },
            ]
        );

        const expr = computeExpression(calc, "/page-1", pages, sections);
        expect(expr).toBe("(comp-1) + (comp-2)");
    });

    it("empty string targetPagePath behaves like unmapped target (applies ~R+ when source is repeatable)", () => {
        const calc = mkCalc(
            "CalcL",
            ["comp-1"],
            [{ type: "component", value: "comp-1" }]
        );
        const expr = computeExpression(calc, "", pages, sections);
        expect(expr).toBe("(comp-1~R+)");
    });
});
