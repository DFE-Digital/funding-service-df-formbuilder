import { Path } from "..";
import { Calculation, FormDefinition, Page } from "@xgovformbuilder/model";

export function updateLinksTo(
    data: FormDefinition,
    oldPath: Path,
    newPath: Path
): FormDefinition {
    return {
        ...data,
        pages: data.pages.map(
            (page): Page => ({
                ...page,
                path: page.path === oldPath ? newPath : page.path,
                next:
                    page.next?.map((link) => ({
                        ...link,
                        path: link.path === oldPath ? newPath : link.path,
                    })) ?? [],
            })
        ),
        calculations: data.calculations?.map(
            (calculation): Calculation => ({
                ...calculation,
                pageLocation:
                    calculation.pageLocation === oldPath
                        ? newPath
                        : calculation.pageLocation,
            })
        ),
    };
}
