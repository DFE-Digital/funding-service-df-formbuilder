import { Calculation, Page, Section } from "@xgovformbuilder/model";

type Indices = {
    pagesByPath: Map<string, Page>;
    sectionsByName: Map<string, Section>;
    pageByComponentName: Map<string, Page>;
};

const buildIndices = (pages: Page[], sections: Section[]): Indices => {
    const pagesByPath = new Map(pages.map((p) => [p.path, p]));
    const sectionsByName = new Map(sections.map((s) => [s.name, s]));
    const pageByComponentName = new Map<string, Page>();

    for (const p of pages) {
        for (const c of p.components ?? []) {
            pageByComponentName.set(c.name, p);
        }
    }

    return { pagesByPath, sectionsByName, pageByComponentName };
};

const getSectionByPagePath = (
    indices: Indices,
    pagePath?: string
): Section | null => {
    if (!pagePath) return null;
    const page = indices.pagesByPath.get(pagePath);
    if (!page) return null;
    return indices.sectionsByName.get(page.section) ?? null;
};

const getPageByComponent = (
    indices: Indices,
    compName: string
): Page | null => {
    return indices.pageByComponentName.get(compName) ?? null;
};

const formatRepeatable = (compName: string): string => {
    return `(${compName}~R+)`;
};
const formatPlain = (compName: string): string => {
    return `(${compName})`;
};

const createComponentExpression = (
    compName: string,
    targetPagePath: string,
    indices: Indices
): string => {
    const sourcePage = getPageByComponent(indices, compName);
    const sourceSection = sourcePage
        ? getSectionByPagePath(indices, sourcePage.path)
        : null;
    const targetSection = getSectionByPagePath(indices, targetPagePath);

    const shouldUseRPlus =
        !!sourceSection &&
        sourceSection.repeatableSection === true &&
        sourceSection?.name !== targetSection?.name &&
        (!targetSection || targetSection.repeatableSection === false);

    return shouldUseRPlus ? formatRepeatable(compName) : formatPlain(compName);
};

export const computeExpression = (
    calculation: Calculation | undefined,
    targetPagePath: string,
    pages: Page[],
    sections: Section[]
): string | undefined => {
    if (!calculation) return undefined;

    if (!calculation.computeList?.length) {
        return calculation.expression;
    }

    const indices = buildIndices(pages, sections);

    const parts = calculation.computeList.map((token) => {
        if (token.type === "operator") return token.value;

        const isKnownComponent = calculation.components.some(
            (c) => c.name === token.value
        );
        return isKnownComponent && token.type === "component"
            ? createComponentExpression(token.value, targetPagePath, indices)
            : `(${token.value})`;
    });

    return parts.join(" ");
};
