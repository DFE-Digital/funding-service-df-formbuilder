import { FormDefinition, Page } from "@xgovformbuilder/model";

export function addPage(data: FormDefinition, page: Page): FormDefinition {
    const index = data.pages.findIndex((pg) => pg.path === page.path);
    if (index > -1) {
        throw Error(`A page with the path ${page.path} already exists`);
    }
    if (page.controller == "./pages/start.js") {
        return {
            ...data,
            pages: [page, ...data.pages],
        };
    }
    return {
        ...data,
        pages: [...data.pages, page],
    };
}
