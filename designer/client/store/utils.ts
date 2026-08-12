import {
    Calculation,
    FormConfiguration,
    FormStatus,
    FormDefinition,
    Page,
    DesignedDataSet,
    ComponentTypeEnum,
} from "@xgovformbuilder/model";
import {
    CalculationFormState,
    ComputeComponentUnit,
    ComputeList,
    ComputeNumberUnit,
    ComputeOperatorUnit,
    DuplicateFormState,
    FormConfigurationWithChild,
    LoadingState,
    SelectedEntity,
} from "./types";
import { nanoid } from "nanoid";

const descSortFn = (
    a: FormConfigurationWithChild,
    b: FormConfigurationWithChild
) => {
    const getLatestModifiedTime = (form: FormConfigurationWithChild) => {
        const parentTime = new Date(form.LastModified ?? 0).getTime();

        if (form.childs.length > 0) {
            const childTimes = form.childs.map((child) =>
                new Date(child.LastModified ?? 0).getTime()
            );

            const latestChildTime = Math.max(...childTimes);

            return Math.max(parentTime, latestChildTime);
        }

        return parentTime;
    };

    const aModifiedTime = getLatestModifiedTime(a);
    const bModifiedTime = getLatestModifiedTime(b);
    // const aModifiedTime = new Date(a.LastModified ?? 0).getTime();
    // const bModifiedTime = new Date(b.LastModified ?? 0).getTime();
    return bModifiedTime - aModifiedTime;
};

export const extractDashboardData = ({
    formConfigs,
    userId,
}: {
    formConfigs: { loading: LoadingState; data: FormConfigurationWithChild[] };
    userId: string;
}) => {
    if (!userId) return null;
    if (formConfigs.loading === LoadingState.Succeeded) {
        const createdBy: string[] = [];
        const total = formConfigs.data.length;
        const myForms: FormConfigurationWithChild[] = [];
        const colForms: FormConfigurationWithChild[] = [];
        const myCounts = {
            total: 0,
            in_dev: 0,
            uat: 0,
            published: 0,
            closed: 0,
        };
        const colCounts = {
            total: 0,
            in_dev: 0,
            uat: 0,
            published: 0,
            closed: 0,
        };
        // Traverse through available form configs
        // and classify them accordingly
        formConfigs.data.forEach((form) => {
            if (form.CreatedBy && !createdBy.includes(form.CreatedBy)) {
                createdBy.push(form.CreatedBy!);
            }
            if (form.UserId === userId) {
                myCounts.total = myCounts.total + 1;
                myForms.push(form);
                if (form.FormStatus) {
                    if (form.FormStatus === FormStatus.InDevelopment) {
                        myCounts.in_dev = myCounts.in_dev + 1;
                    } else if (form.FormStatus === FormStatus.UAT) {
                        myCounts.uat = myCounts.uat + 1;
                    } else if (form.FormStatus === FormStatus.Published) {
                        myCounts.published = myCounts.published + 1;
                    } else if (form.FormStatus === FormStatus.Closed) {
                        myCounts.closed = myCounts.closed + 1;
                    }
                }
            } else {
                colCounts.total = colCounts.total + 1;
                colForms.push(form);
                if (form.FormStatus) {
                    if (form.FormStatus === FormStatus.InDevelopment) {
                        colCounts.in_dev = colCounts.in_dev + 1;
                    } else if (form.FormStatus === FormStatus.UAT) {
                        colCounts.uat = colCounts.uat + 1;
                    } else if (form.FormStatus === FormStatus.Published) {
                        colCounts.published = colCounts.published + 1;
                    } else if (form.FormStatus === FormStatus.Closed) {
                        colCounts.closed = colCounts.closed + 1;
                    }
                }
            }
        });
        const result = {
            total: {
                title: "All forms",
                total: total,
                my_forms: myCounts.total,
                col_forms: colCounts.total,
            },
            [FormStatus.InDevelopment]: {
                title: "Status - In development",
                total: myCounts.in_dev + colCounts.in_dev,
                my_forms: myCounts.in_dev,
                col_forms: colCounts.in_dev,
            },
            [FormStatus.UAT]: {
                title: "Status - UAT",
                total: myCounts.uat + colCounts.uat,
                my_forms: myCounts.uat,
                col_forms: colCounts.uat,
            },
            [FormStatus.Published]: {
                title: "Status - Published",
                total: myCounts.published + colCounts.published,
                my_forms: myCounts.published,
                col_forms: colCounts.published,
            },
            [FormStatus.Closed]: {
                title: "Status - Closed",
                total: myCounts.closed + colCounts.closed,
                my_forms: myCounts.closed,
                col_forms: colCounts.closed,
            },
        };
        return {
            myForms: myForms.sort(descSortFn),
            colForms: colForms.sort(descSortFn),
            summaryInfo: result,
            createdBy,
        };
    }
    return null;
};

/**
 * Maps form configurations to a tree structure with parent-child relationships.
 *
 * Takes an array of FormConfiguration objects and returns an array of FormConfigurationWithChild
 * objects that represent the parent-child hierarchy.
 *
 * For each form config:
 * - If it has childAndDependentsForms, creates child objects from those IDs
 * - Tracks all child form IDs in existingChilds array
 * - Returns parent forms with their child forms nested in the childs property
 * - Filters out any forms that are children (in existingChilds array) to avoid duplication
 *
 * @param formConfigs - Array of form configurations to process
 * @returns Array of FormConfigurationWithChild with parent-child relationships
 */
export const mapChildFormConfigToParent = (
    formConfigs: FormConfiguration[]
): FormConfigurationWithChild[] => {
    const existingChilds: string[] = [];
    return formConfigs
        .map((config) => {
            return {
                childs:
                    config?.childAndDependentsForms?.map((childId) => {
                        existingChilds.push(childId);
                        return {
                            ...formConfigs.find(
                                (form) => form.Key === childId
                            )!,
                            childs: [],
                        };
                    }) ?? [],
                ...config,
            };
        })
        .filter((config) => !existingChilds.includes(config.Key));
};

export const checkNameExistsInState = (
    name: string,
    state: DuplicateFormState
) => {
    let counter = 0;
    if (name === state.parentForm.newName) {
        counter = counter + 1;
    }
    state.childForms.forEach((child) => {
        if (name === child.newName) {
            counter = counter + 1;
        }
    });
    return counter > 1;
};

export const populateEditCalculationState = (
    selectedCalculation: Calculation,
    form?: FormDefinition
): CalculationFormState => {
    const title =
        selectedCalculation.title ??
        selectedCalculation.displayName ??
        selectedCalculation.name ??
        "";

    const isSelectedPage = !!selectedCalculation.pageLocation;

    const componentEntities: SelectedEntity[] = [];
    if (
        selectedCalculation.components &&
        selectedCalculation.components.length > 0
    ) {
        for (const c of selectedCalculation.components) {
            const isRepeatable = selectedCalculation.expression.includes(
                `${c.name}~R+`
            );

            componentEntities.push({
                ...(c as object),
                isComponent: true,
                isRepeatable,
            } as SelectedEntity);
        }
    }

    const datasetEntities: SelectedEntity[] = [];
    if (
        selectedCalculation.datasets &&
        selectedCalculation.datasets.length > 0
    ) {
        for (const d of selectedCalculation.datasets) {
            datasetEntities.push({
                ...(d as object),
                isComponent: false,
                designedDataSetId:
                    (d as any).designedDataSetId ??
                    ((d as any).value.includes("->")
                        ? (d as any).value.split("->")[0]
                        : null),
                value: (d as any).value.includes("->")
                    ? (d as any).value.split("->")[1]
                    : (d as any).value,
            } as SelectedEntity);
        }
    }

    const selectedEntities: SelectedEntity[] = [];
    selectedEntities.push(...componentEntities);
    selectedEntities.push(...datasetEntities);

    // resolve selectedPageOrDataset when form is provided
    let selectedPageOrDataset: Page | DesignedDataSet | null = null;
    // if (form) {
    //     if (selectedCalculation.pageLocation) {
    //         const foundPage = form.pages.find(
    //             (p) => p.path === selectedCalculation.pageLocation
    //         );
    //         selectedPageOrDataset = foundPage ? foundPage : null;
    //     } else if (
    //         selectedCalculation.datasets &&
    //         selectedCalculation.datasets.length > 0
    //     ) {
    //         // pick the designed dataset that matches by id if present on the first dataset
    //         const ds = selectedCalculation.datasets[0] as any;
    //         if (ds && ds.designedDataSetId && form.designedDataSets) {
    //             const foundDs = form.designedDataSets.find(
    //                 (d) => d.id === ds.designedDataSetId
    //             );
    //             selectedPageOrDataset = foundDs ? foundDs : null;
    //         }
    //     }
    // }

    // try to map model computeList to client shape when available and form is provided
    let computedList: ComputeList = [];
    if ((selectedCalculation.computeList ?? []).length > 0 && form) {
        computedList =
            selectedCalculation.computeList
                ?.map((m: any) => {
                    if (m.type === "operator") {
                        return {
                            id: m.id,
                            type: "operator",
                            order: m.order,
                            value: m.value,
                        } as any;
                    }
                    if (m.type === "number") {
                        return {
                            id: m.id,
                            type: "number",
                            order: m.order,
                            value: m.value,
                        } as any;
                    }
                    if (m.type === "component") {
                        // try to find matching selected entity by name or index
                        const found = selectedEntities.find((se) => {
                            const anye = se as any;
                            return (
                                anye.name === m.entity ||
                                `${anye.designedDataSetId}-${anye.index}` ===
                                    m.entity
                            );
                        });
                        if (found) {
                            return {
                                id: m.id,
                                type: "component",
                                order: m.order,
                                entity: found,
                                value:
                                    ((found as any).name ||
                                        `${(found as any).designedDataSetId}->${
                                            (found as any).value
                                        }`) ??
                                    "",
                            } as any;
                        }
                        return null;
                    }
                    if (m.type === "calculation") {
                        const calc = (form.calculations || []).find(
                            (c) =>
                                c.name === m.entity ||
                                c.displayName === m.entity
                        );
                        if (calc) {
                            return {
                                id: m.id,
                                type: "calculation",
                                order: m.order,
                                entity: calc,
                                value: calc.name,
                            } as any;
                        }
                        return null;
                    }
                    return null;
                })
                .filter(Boolean as any) ?? [];
    } else if (
        (!selectedCalculation.computeList ||
            selectedCalculation.computeList.length === 0) &&
        form &&
        selectedCalculation.expression.length > 0
    ) {
        // backward compatibility: build compute list from expression string
        const expression = selectedCalculation.expression;
        if (!!expression) {
            computedList = computeFromExpression(expression, form);
        }
    }
    return {
        title,
        selectedPageOrDataset,
        selectedCalculation,
        isSelectedPage,
        selectedEntities,
        selectAllEntity: "",
        computeList: computedList,
        addedCalculations: null,
        repeatableSection: null,
    };
};

/**
 * Parse an expression string into a computed list of tokens and typed items.
 *
 * The function implements a small scanner/tokenizer and a lightweight
 * classification into three token types: operator, number, and component.
 * It intentionally keeps identifiers/components intact even when they contain
 * punctuation such as '+' (trailing plus), '->' (arrow) and embedded hyphens
 * (e.g. `-Value`) while still recognising arithmetic operators in ordinary
 * contexts.
 *
 * Cases handled:
 * - Whitespace separates tokens. Parentheses are removed before tokenization.
 * - '*' and '/' are always treated as operators.
 * - '+' is treated as an operator only when the next non-space character is a
 *   digit (so `+23` or `+ 23` produce '+' operator followed by number). A '+'
 *   that is part of an identifier (e.g. `basbQ~R+`) is kept inside the
 *   component token.
 * - '-' handling is nuanced:
 *   - A '->' sequence (no space) is considered part of an identifier and kept
 *     inside the component token (e.g. `cQQAz->ukprn...`).
 *   - A hyphen immediately followed by digits (no space) is split into an
 *     operator '-' and a number token (e.g. `-10` becomes ['-', '10']). This
 *     matches cases like `...-Value-10` where the trailing `-10` should be
 *     separated.
 *   - If a hyphen has a space before or after it in the original expression
 *     it is treated as an operator (e.g. `a - b`).
 *   - Otherwise (hyphen glued to identifier, not followed by digits), the
 *     hyphen remains part of the identifier (e.g. `name-Value`).
 * - Numbers are detected by testing token content with Number(); pure numeric
 *   tokens become number items.
 *
 * Example
 * -------
 * Input expression:
 *   " (aqvRt + 23 )  * ( basbQ~R+ -  7 ) / cQQAz->ukprn_establishment_name-Value-10 "
 *
 * Tokens produced (conceptually):
 *   [
 *     'aqvRt', '+', '23', '*', 'basbQ~R+', '-', '7', '/',
 *     'cQQAz->ukprn_establishment_name-Value', '-', '10'
 *   ]
 *
 * The returned computedList is an array of items like:
 *   { id, type: 'component'|'operator'|'number', order, value }
 *
 * @param expression - input expression string
 * @returns computedList - array of classified tokens with ids
 */
export function computeFromExpression(
    expression: string,
    form: FormDefinition
): ComputeList {
    // remove only parentheses; keep spaces so we can detect hyphens with/without
    // surrounding spaces.
    // Tokenize using a scanner that keeps spaces to decide whether a hyphen is an operator
    // or part of an identifier. This allows identifiers like `cQQAz->ukprn_establishment_name-Value`
    // to remain a single token while `... + - 7` still treats '-' as subtraction.
    const raw = expression.replace(/\(/g, "").replace(/\)/g, "");
    const tokens: string[] = [];
    let buffer = "";

    /**
     * Attempt to merge the current tail buffer (which may be '...-Value') with the
     * most recent preceding span that starts with a token containing '->' (and not '-Value'),
     * Returns true if a merge occurred (tail consumed), false otherwise.
     */
    function tryBackwardMerge(tokens: string[], tail: string): boolean {
        // Only consider merging when tail has -Value but not ->
        if (!(tail.includes("-Value") && !tail.includes("->"))) return false;

        for (let i = tokens.length - 1; i >= 0; i--) {
            const t = tokens[i];
            if (t.includes("->") && !t.includes("-Value")) {
                const merged = tokens.slice(i).concat(tail).join(" ");
                tokens.splice(i, tokens.length - i, merged);
                return true;
            }
        }
        return false;
    }
    const isHardBoundaryAt = (s: string, k: number): boolean => {
        if (k >= s.length) return true; // end of string
        const c = s[k];
        if (c === " " || c === "\t" || c === "\n" || c === "\r") return true;
        if (c === "+" || c === "*" || c === "/" || c === "(" || c === ")")
            return true;
        if (c === "-" && s[k + 1] === ">") return true;
        return false;
    };
    for (let i = 0; i < raw.length; i++) {
        const ch = raw[i];
        // whitespace separates tokens
        if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
            if (buffer.length) {
                if (buffer.length) {
                    // If buffer has '-Value' but not '->', try to merge backward
                    if (tryBackwardMerge(tokens, buffer)) {
                        buffer = "";
                    } else {
                        tokens.push(buffer);
                        buffer = "";
                    }
                }
            }
            continue;
        }

        if (ch === "+") {
            // 1) If the two immediately preceding characters are "~R", keep '+' in the identifier.
            // 2) Otherwise, treat '+' as an operator.
            const isPrecededByTildeR =
                i >= 2 && raw[i - 2] === "~" && raw[i - 1] === "R";

            if (isPrecededByTildeR) {
                // Keep '+' as part of the current identifier
                buffer += "+";
            } else {
                // Treat '+' as operator
                if (buffer.length) {
                    if (tryBackwardMerge(tokens, buffer)) {
                        buffer = "";
                    } else {
                        tokens.push(buffer);
                        buffer = "";
                    }
                }
                tokens.push("+");
            }
        } else if (ch === "-") {
            // If it's an arrow '->' (no space), include as part of identifier.
            if (raw[i + 1] === ">") {
                buffer += "->";
                i++; // skip '>'
                continue;
            }
            let j = i;
            while (j < raw.length && !isHardBoundaryAt(raw, j)) {
                j++;
            }
            const span = raw.slice(i, j);
            if (span.includes("-Value")) {
                buffer += "-";
                continue;
            }
            // If hyphen is immediately followed by digits (e.g. -10), treat it as
            // operator '-' plus a number token even if there's no space (split here).
            const immediateNext = raw[i + 1];
            if (immediateNext && /\d/.test(immediateNext)) {
                if (buffer.length) {
                    if (tryBackwardMerge(tokens, buffer)) {
                        buffer = "";
                    } else {
                        tokens.push(buffer);
                        buffer = "";
                    }
                }
                tokens.push("-");
                continue;
            }
            // If hyphen is immediately followed by letters (e.g. -lMNop), treat it as
            // operator '-' plus a component token. But if the following literal is
            // 'Value' we intentionally keep '-Value' attached to the identifier.
            if (immediateNext && /[A-Za-z]/.test(immediateNext)) {
                // preserve '-Value' (do not split) when the substring starts with 'Value'
                if (raw.slice(i + 1, i + 1 + 5) === "Value") {
                    buffer += "-";
                    continue;
                }

                if (buffer.length) {
                    if (tryBackwardMerge(tokens, buffer)) {
                        buffer = "";
                    } else {
                        tokens.push(buffer);
                        buffer = "";
                    }
                }
                tokens.push("-");
                continue;
            }

            // Otherwise, if hyphen has a space immediately before or after in the original string,
            // treat it as an operator; otherwise keep it as part of the identifier
            const prev = i - 1 >= 0 ? raw[i - 1] : null;
            const next = i + 1 < raw.length ? raw[i + 1] : null;
            const prevIsSpace =
                prev === " " ||
                prev === "\t" ||
                prev === "\n" ||
                prev === "\r" ||
                prev === null;
            const nextIsSpace =
                next === " " ||
                next === "\t" ||
                next === "\n" ||
                next === "\r" ||
                next === null;

            if (prevIsSpace || nextIsSpace) {
                if (buffer.length) {
                    if (tryBackwardMerge(tokens, buffer)) {
                        buffer = "";
                    } else {
                        tokens.push(buffer);
                        buffer = "";
                    }
                }
                tokens.push("-");
            } else {
                buffer += "-";
            }
        } else if (ch === "*" || ch === "/") {
            if (buffer.length) {
                if (tryBackwardMerge(tokens, buffer)) {
                    buffer = "";
                } else {
                    tokens.push(buffer);
                    buffer = "";
                }
            }
            tokens.push(ch);
        } else {
            buffer += ch;
        }
    }

    if (buffer.length) {
        if (tryBackwardMerge(tokens, buffer)) {
        } else {
            tokens.push(buffer);
        }
    }
    // Build computed list: assign ids and types
    let order = 0;
    const computedList: ComputeList = tokens.map((token: string) => {
        order = order + 1;
        if (["+", "-", "*", "/"].includes(token)) {
            return {
                id: nanoid(5),
                type: "operator",
                order: order,
                value: token,
            } as ComputeOperatorUnit;
        } else if (!isNaN(Number(token))) {
            return {
                id: nanoid(5),
                type: "number",
                order: order,
                value: Number(token),
            } as ComputeNumberUnit;
        } else {
            const tokenContainsArrow = token.includes("->");
            if (!tokenContainsArrow) {
                const isRepeatable = token.includes("~R+");
                const componentName = token.split("~R+")[0];
                const components = form.pages
                    .map((p) => p.components ?? [])
                    .flat()
                    .filter(
                        (c) =>
                            c.type === ComponentTypeEnum.NumberField ||
                            c.type === ComponentTypeEnum.Result
                    );
                const component = components.find(
                    (c) => c.name === componentName
                )!;
                return {
                    id: nanoid(5),
                    type: "component",
                    order: order,
                    entity: {
                        ...component,
                        isComponent: true,
                        isRepeatable: isRepeatable,
                    },
                    value: componentName,
                } as ComputeComponentUnit;
            } else {
                const ddsId = token.split("->")[0];
                const datasetValue = token.split("->")[1];
                const dds = (form.designedDataSets || []).find(
                    (d) => d.id === ddsId
                );
                const dataset = dds!.data
                    .flat()
                    .find((d) => d.value === datasetValue && d.calc)!;
                return {
                    id: nanoid(5),
                    type: "component",
                    order: order,
                    entity: {
                        ...dataset,
                        designedDataSetId: dds!.id,
                        isComponent: false,
                        isRepeatable: false,
                    },
                    value: token,
                } as ComputeComponentUnit;
            }
        }
    });
    console.log("computedList from expression:", computedList);
    return computedList;
}
