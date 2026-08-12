import {
    Condition,
    FormDefinition,
    Page,
    Section,
} from "@xgovformbuilder/model";
import { RelativeUrl } from "./feedback";
import { HapiRequest, HapiResponseToolkit } from "server/types";
import { FormPayload, FormSubmissionState } from "./types";
import { CacheService } from "src/server/services";
import { trackEvent } from "src/server/logging/customTracker";
import moment from "moment";

export const feedbackReturnInfoKey = "f_t";

const paramsToCopy = [feedbackReturnInfoKey];

/**
 * Proceeds with form navigation based on provided URLs and conditions.
 * Handles both direct navigation and return URL scenarios.
 *
 * @param request - The Hapi request object
 * @param h - The Hapi response toolkit
 * @param nextUrl - The URL to proceed to
 * @param prevUrl - The previous URL (if any)
 */
export function proceed(
    request: HapiRequest,
    h: HapiResponseToolkit,
    nextUrl: string,
    prevUrl: string
) {
    const returnUrl = request.query.returnUrl;
    if (prevUrl) {
        return redirectTo(request, h, nextUrl);
    }

    if (typeof returnUrl === "string" && returnUrl.startsWith("/")) {
        return h.redirect(returnUrl);
    } else {
        return redirectTo(request, h, nextUrl);
    }
}

type Params = { num?: number; returnUrl: string } | {};

/**
 * Constructs a non-relative redirect URL by preserving specified parameters
 * and copying any required parameters from the original request.
 *
 * @param request - The Hapi request object
 * @param targetUrl - The target URL to redirect to
 * @param params - Optional parameters to append to the URL
 */
export function nonRelativeRedirectUrl(
    request: HapiRequest,
    targetUrl: string,
    params: Params = {}
) {
    const url = new URL(targetUrl);

    Object.entries(params)?.forEach(([name, value]) => {
        url.searchParams.append(name, `${value}`);
    });

    paramsToCopy?.forEach((key) => {
        const value = request.query[key];
        if (typeof value === "string") {
            url.searchParams.append(key, value);
        }
    });

    return url.toString();
}

export function redirectUrl(
    request: HapiRequest,
    targetUrl: string,
    params: Params = {}
) {
    const relativeUrl = new RelativeUrl(targetUrl);
    Object.entries(params)?.forEach(([name, value]) => {
        relativeUrl.setParam(name, `${value}`);
    });

    paramsToCopy?.forEach((key) => {
        const value = request.query[key];
        if (typeof value === "string" && !relativeUrl.getParam(key)) {
            relativeUrl.setParam(key, value);
        }
    });

    return relativeUrl.toString();
}

export function redirectTo(
    request: HapiRequest,
    h: HapiResponseToolkit,
    targetUrl: string,
    params = {}
) {
    if (targetUrl.startsWith("http")) {
        return h.redirect(targetUrl);
    }

    const url = redirectUrl(request, targetUrl, params);
    return h.redirect(url);
}

export const idFromFilename = (filename: string) => {
    return filename.replace(/govsite\.|\.json|/gi, "");
};

/**
 * Coerce numeric-like strings in `state` only for keys that appear in `conditions`
 * and whose field.type is Number/Result/YesNo.
 *
 * - Only converts strings (e.g., "42", "  3.14 ")
 * - Skips empty/whitespace strings
 * - Assigns only when Number(trimmed) is finite (not NaN/Infinity)
 *
 * @param value - The runtime state object.
 * @param conditions - The rule's conditions array.
 */
export const coerceNumericStringsForEligibleKeys = (
    value: Record<string, unknown>,
    conditions: Condition[]
): void => {
    if (!value || typeof value !== "object" || !Array.isArray(conditions))
        return;

    // Build the set of keys we are allowed to coerce,
    // based on condition field.name and field.type.
    const eligibleKeys = new Set<string>();
    for (const cond of conditions) {
        const name = cond?.field?.name;
        const type = cond?.field?.type;

        // Only include keys of allowed types and with a valid string name.
        if (
            typeof name === "string" &&
            (type === "NumberField" ||
                type === "Result" ||
                type === "YesNoField")
        ) {
            eligibleKeys.add(name);
        }
    }
    if (eligibleKeys.size === 0) return;

    // For each eligible key, attempt to coerce the value if it's a numeric-like string.
    for (const key of eligibleKeys) {
        const raw = value[key];
        if (typeof raw !== "string") continue;
        const trimmed = raw.trim();
        if (trimmed === "") continue;
        const n = Number(trimmed);
        if (Number.isFinite(n)) {
            value[key] = n;
        }
    }
};

export const coerceDateToISO = (value: Record<string, unknown>): void => {
    for (const key in value) {
        const raw = value[key];
        if (typeof raw !== "string") continue;

        const m = moment(raw, "YYYY/MM/DD HH:mm", true);
        if (!m.isValid()) continue;

        value[key] = m.toISOString();
    }
};

/**
 * Gets all repeatable sections that are actively used within the form definition.
 *
 * This function performs two main operations:
 * 1. Identifies all section names that are referenced by pages in the form
 * 2. Filters the form's sections to find those that are both:
 *    - Referenced by at least one page (actively used)
 *    - Marked as repeatable sections
 *
 * @param formDef - The form definition containing pages and sections
 * @returns {Section[]} Array of sections that are both repeatable and actively used
 *
 * @example
 * const form = {
 *   pages: [
 *     { section: "section1" },
 *     { section: "section2" }
 *   ],
 *   sections: [
 *     { name: "section1", repeatableSection: true },
 *     { name: "section2", repeatableSection: false }
 *   ]
 * };
 * getUsedRepeatableSections(form) // returns [{ name: "section1", repeatableSection: true }]
 */
export const getUsedRepeatableSections = (formDef: FormDefinition) => {
    // Extract all section names referenced by pages
    const usedSectionNames = formDef.pages
        .map((page) => page?.section ?? "")
        .filter((sectionName) => !!sectionName);

    // Filter sections to find those that are both used and repeatable
    const usedRepeatableSections =
        formDef?.sections.filter(
            (section) =>
                usedSectionNames.includes(section.name) &&
                !!section?.repeatableSection
        ) ?? [];

    return usedRepeatableSections;
};

/**
 * Determines if a form contains any repeatable sections that are actively used.
 *
 * This is a convenience function that builds on getUsedRepeatableSections to provide
 * a simple boolean check for the presence of repeatable sections in the form.
 *
 * @param formDef - The form definition to check
 * @returns {boolean} True if the form contains at least one used repeatable section,
 *                    false otherwise
 *
 * @example
 * const form = {
 *   pages: [{ section: "section1" }],
 *   sections: [{ name: "section1", repeatableSection: true }]
 * };
 * isRepeatableSectionForm(form) // returns true
 */
export const isRepeatableSectionForm = (formDef: FormDefinition) => {
    const usedRepeatableSections = getUsedRepeatableSections(formDef);
    return usedRepeatableSections.length > 0;
};

/**
 * Groups pages from a form definition based on their section membership, with special handling for repeatable sections.
 *
 * This function processes pages in a form and organizes them into groups based on whether they belong to repeatable sections.
 * Pages that are part of the same repeatable section are grouped together in arrays, while standalone pages remain as individual items.
 *
 * @param formDef - The form definition containing pages and sections
 * @param usedRepeatableSections - Array of sections that are marked as repeatable and are actually used in the form
 * @returns An array where each item is either:
 *          - A single Page object (for standalone/non-repeatable pages)
 *          - An array of Page objects (for pages belonging to the same repeatable section)
 *
 * The function:
 * 1. Creates lookup maps/sets for efficient processing
 * 2. Processes pages sequentially, following 'next' links
 * 3. Groups consecutive pages belonging to the same repeatable section
 * 4. Maintains the original flow of the form by following page links
 * 5. Handles both repeatable and non-repeatable sections appropriately
 *
 * Example return value:
 * [
 *   Page1,                    // Standalone page
 *   [Page2, Page3, Page4],   // Group of pages from repeatable section 1
 *   Page5,                    // Another standalone page
 *   [Page6, Page7]           // Group of pages from repeatable section 2
 * ]
 */
export const getPagesGroupedBySection = (
    formDef: FormDefinition,
    usedRepeatableSections: Section[],
    isIterationRepeatitionsWithBatchCount: boolean
): (Page | Page[])[] => {
    const { pages } = formDef;
    // Create a Set of repeatable section names for quick lookup
    const repeatableSections = new Set(
        usedRepeatableSections.map((s) => s.name)
    );
    // Map paths to pages for quick lookups
    const pathToPage = new Map<string, Page>();
    pages.forEach((page) => {
        pathToPage.set(page.path, page);
    });
    const visited = new Set<string>(); // To track processed pages
    const sectionGroups: Record<string, Page[]> = {};
    const result: (Page | Page[])[] = [];

    const isOriginalPage = (page) => {
        if (page.pageSequence) return page?.pageSequence === "01";
        else {
            const findPageSequence = getNumberAfterLastHyphen(page?.path);
            return findPageSequence ? false : true;
        }
    };

    // Process pages in order they appear in the form definition
    for (const page of pages) {
        if (visited.has(page?.path)) continue;

        // Handle pages in repeatable sections
        if (page?.section && repeatableSections.has(page?.section)) {
            if (!sectionGroups[page?.section]) {
                sectionGroups[page?.section] = [];
            }

            // Collect all consecutive pages in this repeatable section
            let currentPage: Page | undefined = page;
            while (
                currentPage?.path &&
                !visited.has(currentPage?.path) &&
                isOriginalPage(currentPage)
            ) {
                if (currentPage?.section !== page?.section) break;

                sectionGroups[page?.section].push(currentPage);
                visited.add(currentPage?.path);

                // Follow first next path
                const nextPath = currentPage?.next?.[0]?.path;
                currentPage = nextPath ? pathToPage.get(nextPath) : undefined;
            }
        } else {
            // Handle non-repeatable pages
            result.push(page);
            visited.add(page.path);

            // Follow next links for non-repeatable pages
            let currentPage = page;
            while (currentPage.next?.[0]?.path) {
                const nextPath = currentPage?.next[0].path;
                const nextPage = pathToPage.get(nextPath);

                if (!nextPage || visited.has(nextPath)) break;

                // Check if next page is part of a repeatable section
                if (
                    nextPage?.section &&
                    repeatableSections.has(nextPage?.section) &&
                    isOriginalPage(nextPage)
                ) {
                    if (!sectionGroups[nextPage?.section]) {
                        sectionGroups[nextPage?.section] = [];
                    }
                    sectionGroups[nextPage?.section].push(nextPage);
                } else {
                    result.push(nextPage);
                }

                visited.add(nextPath);
                currentPage = nextPage;
            }
        }
    }

    // Add all repeatable section groups to result
    Object.values(sectionGroups).forEach((group) => {
        if (group.length > 0 && !isIterationRepeatitionsWithBatchCount) {
            result.push(group);
        } else if (group.length > 0 && isIterationRepeatitionsWithBatchCount) {
            group.map((item) => result.push(item));
            result.push(group);
        }
    });

    return result;
};

/**
 * Extracts the next path from the original form definition for a given page path.
 *
 * This function is used during page duplication to maintain proper navigation flow
 * by finding the original next path from the base form definition. It's particularly
 * important when handling the last page of a repeatable section to ensure it links
 * correctly to the next non-repeatable page.
 *
 * @param path - The current page path to look up
 * @param groupedOriginalPages - Array of original pages (either individual pages or arrays of pages grouped by section)
 * @returns {string | undefined} The next path from the original page definition, or undefined if not found
 *
 * @example
 * // Given original pages with paths: page1 -> page2 -> page3
 * const nextPath = extractPathFromOriginal('page2', groupedPages);
 * // Returns 'page3'
 *
 * @throws Will return undefined if the original page or its next path cannot be found
 */
const extractPathFromOriginal = (
    path: string,
    groupedOriginalPages: (Page | Page[])[]
) => {
    // Flatten the grouped pages and find the matching original page
    const originalPage =
        groupedOriginalPages.flat().find((item) => {
            return item?.path === path;
        }) ?? ({} as Page);
    // Return the next path from the original page definition
    return originalPage.next?.[0].path;
};

const updateTriggerCompValue = (section, count, state, request) => {
    if (!section?.conditionComp || !section?.name) return;

    if (section?.conditionComp && section?.numberComp === "") {
        // Get the section state object from the overall state
        const sectionState = state?.[section.name] || {};

        // Collect all keys in request.payload that start with the conditionComp string
        const payload = request?.payload || {};
        const conditionKeys = Object.keys(payload).filter((key) =>
            key.startsWith(section.conditionComp)
        );

        // Sort keys by iteration (e.g., PFnocP, PFnocP-2, ...)
        const sortedKeys = conditionKeys.sort((a, b) => {
            const getIteration = (key) => {
                const match = key.match(/-(\d+)$/);
                return match ? parseInt(match[1], 10) : 1;
            };
            return getIteration(a) - getIteration(b);
        });

        let triggerCompValue = 1;
        let foundFalse = false;

        // for (let i = 0; i < sortedKeys.length; i++) {
        //     const key = sortedKeys[i];
        //     const value = payload[key];
        //     if (value === true || value === "true") {
        //         triggerCompValue = count + 1;
        //     } else if (value === false || value === "false") {
        //         triggerCompValue = count;
        //         foundFalse = true;
        //         break;
        //     }
        // }

        // Special case: If only the base conditionComp is present and true, and sectionState is empty
        if (
            sortedKeys.length === 1 &&
            (payload[section.conditionComp] === true ||
                payload[section.conditionComp] === "true") &&
            Object.keys(sectionState).length === 0
        ) {
            triggerCompValue = 2;
            section.triggerCompValue = triggerCompValue;
            return;
        }

        // If no keys found, check if the base conditionComp exists in state and is false
        if (
            sortedKeys.length === 0 &&
            sectionState[section.conditionComp] === "false"
        ) {
            triggerCompValue = 1;
            section.triggerCompValue = triggerCompValue;
            return;
        } else if (sortedKeys.length === 0 && count) {
            triggerCompValue = count + 1;
            section.triggerCompValue = triggerCompValue;
            return;
        }
        trackEvent(
            `triggerCompValue for section in only condition`,
            {
                section,
                payload,
                triggerCompValue,
            },
            false
        );
        section.triggerCompValue = count;
    }
};

/**
 * Extracts and counts the number of true condition components from both payload and state.
 *
 * This function calculates how many times a condition component appears with a "true" value,
 * handling both the current form payload and existing state. It's particularly important
 * for determining the number of iterations needed in repeatable sections.
 *
 * The function handles two scenarios:
 * 1. Sections with both condition and number components
 * 2. Sections with only condition components (onlyConditionComp)
 *
 * @param payload - The current form payload containing user responses
 * @param section - The section configuration containing the condition component ID
 * @param state - The current form submission state
 * @returns {number} The count of true condition components
 *   - For sections with only condition components: returns count + 1
 *   - For sections with both components: returns the raw count
 *   - Returns 0 if no condition component ID is found
 *
 * @example
 * // For a section with both condition and number components:
 * // payload: { "condition1-1": "true", "condition1-2": "true" }
 * extractConditionCompValue(payload, section, state) // returns 2
 *
 * // For a section with only condition component:
 * // payload: { "condition1-1": "true" }
 * // state: { sectionName: { "condition1-2": "true" } }
 * extractConditionCompValue(payload, section, state) // returns 3 (2 + 1)
 */
export const extractConditionCompValue = (
    payload: FormPayload,
    section: Section,
    state: FormSubmissionState,
    request?: HapiRequest,
    shouldUpdate = true
) => {
    // Check if section has only condition component (no number component)
    const onlyConditionComp = !!section?.conditionComp && !section?.numberComp;
    const conditionCompId = section?.conditionComp;
    if (!conditionCompId) return 0;
    // Track processed components to avoid duplicates
    const conditionCompProcessed = new Set<string>(); // To track processed condition components
    let count = 0;
    // Process payload components
    if (!!payload) {
        Object.entries(payload).forEach(([key, value]) => {
            if (conditionCompProcessed.has(key)) return;
            const compId = key.split("-")[0];
            if (compId === conditionCompId) {
                if (value === "true") {
                    conditionCompProcessed.add(key);
                    count = count + 1;
                }
            }
        });
    }
    // For sections with only condition component, also check state
    if (onlyConditionComp) {
        const sectionState: { [key: string]: string } = state[section.name];
        if (!sectionState) {
            shouldUpdate &&
                updateTriggerCompValue(section, count + 1, state, request);
            return count + 1;
        }
        Object.entries(sectionState).forEach(([key, value]) => {
            if (conditionCompProcessed.has(key)) return;
            const compId = key.split("-")[0];
            if (compId === conditionCompId && value) {
                count = count + 1;
                conditionCompProcessed.add(key);
            }
        });
        shouldUpdate &&
            updateTriggerCompValue(section, count + 1, state, request);
        return count + 1;
    }

    shouldUpdate && updateTriggerCompValue(section, count, state, request);
    return count;
};

/**
 * Creates a duplicate of a page within a repeatable section group with updated paths, components, and navigation.
 *
 * @param group - Array of pages that belong to the same repeatable section
 * @param duplicateIndex - Current iteration number of the repeatable section (1-based)
 * @param duplicateCount - Total number of times the section should be repeated
 * @param groupedFormIndex - Index of the current page within the group (0-based)
 *
 * @returns A new Page object with:
 * - Updated path that includes the iteration number
 * - Modified component names to include iteration markers
 * - Updated 'next' links to maintain proper navigation flow between duplicated pages
 * - Special handling for Result components to update their expressions
 * - Updated title to indicate which iteration it represents
 *
 * The function handles three navigation scenarios:
 * 1. Links to the next page within the same group/iteration
 * 2. Links to the first page of the next iteration (if at end of group)
 * 3. Links to the original next page (if at end of all iterations)
 */
const duplicatePage = (
    group: Page[],
    duplicateIndex: number,
    duplicateCount: number,
    groupedFormIndex: number,
    groupedOriginalPages: (Page | Page[])[],
    numberCompIterations: number,
    section: Section
): Page => {
    const onlyConditionComp = !!section?.conditionComp && !section?.numberComp;
    const forTotal = onlyConditionComp ? numberCompIterations : duplicateCount;
    const page = group[groupedFormIndex];
    const currentPath =
        duplicateIndex === 1 ? page?.path : `${page?.path}-${duplicateIndex}`;
    let nextPath: string | undefined = "";
    // if (groupedFormIndex < group.length - 1) {
    //     // Link to the next page in the group
    //     if (duplicateIndex === 1) {
    //         nextPath = group[groupedFormIndex + 1].path;
    //     } else {
    //         nextPath = `${group[groupedFormIndex + 1].path}-${duplicateIndex}`;
    //     }
    if (
        group.some((currentPage) =>
            currentPage?.path.includes(page?.next?.[0].path!)
        )
    ) {
        if (duplicateIndex === 1) {
            nextPath = page?.next?.[0].path;
        } else {
            nextPath = `${page?.next?.[0].path}-${duplicateIndex}`;
        }
    } else if (duplicateIndex < duplicateCount) {
        // If last in group, link to the first of the next iteration
        nextPath = `${group[0].path}-${duplicateIndex + 1}`;
    } else {
        const nextPathFromOriginal = extractPathFromOriginal(
            page?.path,
            groupedOriginalPages
        );
        nextPath = nextPathFromOriginal!; // Or, default to the original 'next'
    }
    const trimHyphenAndNumber = (input: string) => {
        // Check if the input string is longer than 6 characters
        if (input.length <= 6) {
            return input; // Return the string as is if it's 6 characters or less
        }

        // Use regex to remove the last hyphen and any numbers that follow it
        return input.replace(/-(\d+)$/, "");
    };

    /**
     * Creates a new array of components for the duplicated page with updated names and expressions.
     *
     * The `newRepeatableComponents` variable is generated by mapping over the `components` array of the original page.
     * The purpose of this mapping is to create a new array of components with updated names and, in some cases, updated expressions.
     *
     * - For each component (`comp`) in the `page.components` array:
     *   - A new name (`compName`) is generated for the component:
     *     - If `duplicateIndex` is 1, the `trimHyphenAndNumber` function is used to remove any trailing hyphen and number from the original component name.
     *     - Otherwise, `-duplicateIndex` is appended to the trimmed component name.
     *   - If the component type is `"Result"`, the component's `expression` property is updated:
     *     - A regular expression is used to find and replace any numbers within parentheses in the existing expression, appending `-duplicateIndex` to each number.
     *     - A new component object is returned with the updated name and expression.
     *   - For components that are not of type `"Result"`, a new component object is returned with the updated name (`compName`).
     *
     * The resulting `newRepeatableComponents` array contains components with updated names and, if applicable, updated expressions.
     * This ensures that each component in the duplicated page has a unique identifier and correctly references the current iteration.
     */
    const newRepeatableComponents = page?.components?.map((comp) => {
        let newExpression;
        const compName =
            duplicateIndex === 1
                ? trimHyphenAndNumber(comp.name)
                : `${trimHyphenAndNumber(comp.name)}-${duplicateIndex}`;
        // Special handling for Result (calculation) components in repeatable sections
        if (comp.type === "Result") {
            const existingExpression = comp.expression;
            // For the first iteration (duplicateIndex === 1), keep the original expression
            // For subsequent iterations, update component references in the expression
            // to point to the correct iteration's components
            newExpression =
                duplicateIndex === 1
                    ? existingExpression
                    : existingExpression.replace(/\(([^)]+)\)/g, (match, p1) =>
                          p1.includes("->")
                              ? match
                              : `(${p1}-${duplicateIndex})`
                      );
            return {
                ...comp,
                name: compName,
                expression: newExpression,
            };
        }
        // Return the updated calculation component with:
        // 1. A unique name for this iteration (original name + iteration number)
        // 2. The modified expression that references the correct iteration's components
        return {
            ...comp,
            name: compName,
        };
    });

    // Special handling for condition components on the last page of a repeatable section
    // Only add the condition component when we've reached the final iteration
    if (groupedFormIndex === group.length - 1 && duplicateIndex >= forTotal) {
        // Find the original page from the form definition that matches our current page
        const originalPage =
            groupedOriginalPages.flat().find((item) => {
                return item?.path === page?.path;
            }) ?? ({} as Page);

        // Look for the condition component in the original page
        // This is the component that controls whether additional iterations are needed
        const conditionComp = originalPage.components?.find(
            (comp) => comp.name === section?.conditionComp
        );

        // Check if the current page already has the condition component
        // to avoid duplicate additions
        const alreadyHasCondition = page.components?.find(
            (comp) => comp.name === section?.conditionComp
        );

        // Only add the condition component if:
        // 1. We found it in the original page
        // 2. It hasn't already been added to the current page
        if (conditionComp && !alreadyHasCondition) {
            // Generate the appropriate component name:
            // - For first iteration: use the base name
            // - For subsequent iterations: append the iteration number
            const componentName =
                duplicateIndex === 1
                    ? `${trimHyphenAndNumber(conditionComp?.name)}`
                    : `${trimHyphenAndNumber(
                          conditionComp?.name
                      )}-${duplicateIndex}`;

            // Add the condition component to the page's components
            // with the updated name but preserving all other properties
            newRepeatableComponents?.push({
                ...conditionComp,
                name: componentName,
            });
        }
    }

    const formatNumber = (num) => {
        // Check if the number is a single digit (0-9)
        if (num >= 0 && num < 10) {
            return "0" + num; // Append a zero
        } else if (num >= 10) {
            return num; // Return as is for two-digit numbers
        }
    };

    const nextPathChecksForConditions = (page, nextPath) => {
        const clonePath = [...page?.next];
        console.log(clonePath);
        const generatedPaths = clonePath.map((next) => ({
            ...next,
            path:
                duplicateIndex === 1
                    ? next?.path
                    : `${next?.path}-${duplicateIndex}`,
        }));

        console.log(page, nextPath, generatedPaths);
        return generatedPaths;
    };

    let generateNext;
    if (page?.next && page?.next.length > 1) {
        generateNext = nextPathChecksForConditions(page, nextPath);
    } else {
        generateNext = nextPath
            ? [{ ...page?.next?.[0], path: nextPath }]
            : undefined;
    }
    trackEvent(
        "newRepeatableComponents, nextPath, newly created page, current path",
        {
            nextPath: generateNext,
            newRepeatableComponents,
            page,
            currentPath,
        },
        false
    );

    return {
        ...page,
        title: page?.title,
        pageSequence: `${formatNumber(duplicateIndex)}`,
        path: currentPath,
        components: newRepeatableComponents?.filter((component) => {
            if (
                groupedFormIndex === group.length - 1 &&
                component.name.split("-")[0] === section.conditionComp
            ) {
                return duplicateIndex >= forTotal;
            } else {
                return true;
            }
        }),
        next: generateNext,
    };
};

/**
 * Updates the cache with the incremented value of a numeric component in a repeatable section.
 *
 * This function is responsible for updating the cache with a new value for a numeric component
 * in a repeatable section. It increments the current value of the numeric component and stores
 * the updated value in the cache.
 *
 * @param state - The current form submission state containing the values of form components
 * @param cacheService - The cache service used to store and retrieve state data
 * @param request - The Hapi request object
 * @param section - The section containing the numeric component to be updated
 *
 * The function performs the following steps:
 * 1. Checks if the section has a numeric component (`numberComp`). If not, it returns immediately.
 * 2. Retrieves the current value of the numeric component from the state and increments it by 1.
 * 3. Stores the incremented value in the local storage using the `store` library.
 * 4. Merges the updated state with the existing state using the `cacheService`.
 * 5. Sets the new state in the cache.
 */
export const updateNumberCache = (
    state: FormSubmissionState,
    request: HapiRequest,
    section: Section
) => {
    if (!section.numberComp) return;
    const numbercompValue: number =
        parseInt(state?.[section?.numberComp], 10) ?? 0;
    request.yar.set("numberCompTriggerValue", Number(numbercompValue + 1));
    section.triggerCompValue = Number(numbercompValue + 1);
    trackEvent(
        `triggerCompValue for section in updateNumberCache`,
        {
            section,
            state,
        },
        false
    );
    const newState = { ...state, [section?.numberComp]: numbercompValue + 1 };
    request.yar.set("state", newState);
};

/**
 * Assigns the actual iteration number based on various conditions:
 * - For numeric component values > 5 and modulo 5 = 1
 * - For initial batch (currentBatchStart = 0)
 * - For final remaining iteration
 * - For all other cases
 *
 * @param numCompValue - The numeric component value
 * @param currentBatchStart - The starting index of current batch
 * @param remainingInTotal - Number of remaining iterations
 * @param i - Current iteration index
 */
const assignActualIteration = (
    numCompValue: number,
    currentBatchStart: number,
    remainingInTotal: number,
    i: number
) => {
    trackEvent(`RQ assignActualIteration actualIteration`, {
        numCompValue,
        currentBatchStart,
        remainingInTotal,
        i,
    });
    if (!!numCompValue && numCompValue > 5 && numCompValue % 5 === 1) {
        return currentBatchStart + i;
    } else if (currentBatchStart === 0) {
        return currentBatchStart + i;
    } else if (remainingInTotal === 1) {
        return currentBatchStart + i - 1;
    } else {
        return currentBatchStart + i;
    }
};

/**
 * Expands pages in a form by duplicating repeatable sections based on user input.
 *
 * This function processes grouped pages and creates duplicates of repeatable sections
 * based on a numeric value provided in the form payload. It maintains the flow between
 * pages by updating the navigation paths appropriately.
 *
 * @param groupedPages - An array containing either individual pages or arrays of pages that belong to the same section
 * @param usedRepeatableSections - Array of sections that are marked as repeatable and are used in the form
 * @param payload - The form payload containing user input values, including numbers indicating how many times to repeat sections
 * @returns An array of expanded pages with duplicated sections and updated navigation paths
 *
 * The function handles three main cases:
 * 1. Groups of pages in repeatable sections:
 *    - Creates multiple copies based on the numberComp value in the payload
 *    - Updates page titles, paths and component names to be unique
 *    - Maintains proper navigation flow between duplicated pages
 *
 * 2. Groups of pages in non-repeatable sections:
 *    - Keeps pages as-is without duplication
 *    - Preserves original navigation paths
 *
 * 3. Individual pages:
 *    - Updates navigation paths if they point to repeatable sections
 *    - Otherwise keeps the page unchanged
 *
 * Example:
 * Input groupedPages: [Page1, [Page2, Page3], Page4]
 * If Page2 and Page3 are in a repeatable section with numberComp value of 2:
 * Output: [Page1, Page2-1, Page3-1, Page2-2, Page3-2, Page4]
 */
export const expandPages = (
    iterationCount: number = 5,
    groupedPages: (Page | Page[])[],
    groupedOriginalPages: (Page | Page[])[],
    usedRepeatableSections: Section[],
    payload: FormPayload,
    currentIteration: number,
    state: FormSubmissionState,
    cacheService: CacheService,
    request: HapiRequest
): [Page[], string] => {
    const repeatableSections = new Map<string, Section>(
        usedRepeatableSections.map((s) => [s.name, s])
    );

    let expandedResult: Page[] = [];
    let conditionCompIdToAvoid = "";
    trackEvent(`RQ expandPages called`, repeatableSections);
    for (const item of groupedPages) {
        if (Array.isArray(item)) {
            trackEvent(`RQ expandPages original group pages item`, item);
            const section = repeatableSections.get(item[0]?.section || "")!;
            if (
                section?.repeatableSection &&
                (section?.numberComp || section?.conditionComp)
            ) {
                const onlyConditionComp =
                    !!section?.conditionComp && !section?.numberComp;
                let conditionCompValue = extractConditionCompValue(
                    payload,
                    section,
                    state,
                    request
                );
                const batchSize = 5;
                const numberCompIterations =
                    payload && parseInt(payload[section?.numberComp ?? ""], 10)
                        ? parseInt(payload[section?.numberComp ?? ""], 10)
                        : parseInt(state?.[section?.numberComp ?? ""], 10)
                        ? parseInt(state?.[section?.numberComp ?? ""], 10)
                        : 0;
                const totalIterations =
                    numberCompIterations + conditionCompValue;
                const numCompValue = iterationCount + conditionCompValue;
                if (conditionCompValue > 0 && !onlyConditionComp) {
                    updateNumberCache(state, request, section);
                    conditionCompIdToAvoid = retrieveIdToAvoid(
                        section,
                        payload
                    );
                }
                trackEvent(
                    `RQ expandPages totalIterations, numCompValue, numberCompIterations, onlyConditionComp`,
                    {
                        totalIterations,
                        numCompValue,
                        numberCompIterations,
                        onlyConditionComp,
                    }
                );

                if (!isNaN(numCompValue) && numCompValue > 0) {
                    // Calculate remaining iterations for the current batch
                    const currentBatchStart =
                        Math.floor(currentIteration / batchSize) * batchSize;
                    const remainingInTotal =
                        totalIterations - currentBatchStart;
                    const forRemainingOne =
                        onlyConditionComp ||
                        (conditionCompValue === 1 && !!section.conditionComp);
                    const iterationsThisBatch = forRemainingOne
                        ? remainingInTotal === 1
                            ? currentBatchStart === 0
                                ? 1
                                : 2
                            : Math.min(batchSize, remainingInTotal)
                        : Math.min(batchSize, remainingInTotal);
                    trackEvent(
                        `RQ expandPages currentBatchStart,
                                remainingInTotal,
                                forRemainingOne,
                                iterationsThisBatch,`,
                        {
                            currentBatchStart,
                            remainingInTotal,
                            forRemainingOne,
                            iterationsThisBatch,
                        }
                    );

                    // Only proceed if there are iterations remaining
                    if (remainingInTotal > 0) {
                        // Generate pages for current batch
                        for (let i = 1; i <= iterationsThisBatch; i++) {
                            const actualIteration = assignActualIteration(
                                numberCompIterations,
                                currentBatchStart,
                                remainingInTotal,
                                i
                            );
                            trackEvent(`RQ expandPages actualIteration`, {
                                actualIteration,
                            });
                            for (let j = 0; j < item.length; j++) {
                                const duplicatedPage = duplicatePage(
                                    item,
                                    actualIteration,
                                    totalIterations,
                                    j,
                                    groupedOriginalPages,
                                    numberCompIterations,
                                    section
                                );
                                expandedResult = expandedResult.filter(
                                    (page) => page.path !== duplicatedPage.path
                                );
                                expandedResult.push(duplicatedPage);
                            }
                            trackEvent(
                                `RQ expandPages duplicated page created`,
                                {
                                    expandedResult,
                                },
                                false
                            );
                        }
                        // Update iteration count in store for next batch
                        if (remainingInTotal > batchSize) {
                            trackEvent(
                                `RQ expandPages iterationCount`,
                                {
                                    iterationCount:
                                        currentBatchStart + batchSize,
                                },

                                false
                            );
                            request.yar.set(
                                "iterationCount",
                                currentBatchStart + batchSize
                            );
                        }
                    }

                    item.forEach((pageItem) => {
                        // Ensure the pageItem is not already in expandedResult
                        if (
                            !expandedResult.some(
                                (page) => page.path === pageItem.path
                            )
                        ) {
                            expandedResult.push(pageItem);
                        }
                    });
                } else {
                    // No valid numComp value; keep the page as-is
                    item.forEach((pageItem) => {
                        // Ensure the pageItem is not already in expandedResult
                        if (
                            !expandedResult.some(
                                (page) => page.path === pageItem.path
                            )
                        ) {
                            expandedResult.push(pageItem);
                        }
                    });
                }
            } else {
                // Section is not repeatable; keep the page as-is
                expandedResult.push(...item);
            }
        } else {
            expandedResult.push(item);
        }
    }
    trackEvent(`RQ expandPages expandedResult`, {
        expandedResult,
        conditionCompIdToAvoid,
    });
    return [expandedResult, conditionCompIdToAvoid];
};

/**
 * Checks if a form payload contains a condition component with a "true" value.
 *
 * This function examines the payload to determine if a specific condition component
 * exists and is set to "true". It handles components that may have iteration suffixes
 * by splitting the component ID at the hyphen.
 *
 * @param payload - The form payload containing key-value pairs of component responses
 * @param section - The section configuration containing the condition component ID
 * @returns {boolean} True if the condition component exists and is "true", false otherwise
 *
 * @example
 * // Given a payload { "condition1-1": "true" } and a section with conditionComp: "condition1"
 * payloadHasConditionComp(payload, section) // returns true
 *
 * // Given a payload { "condition1-1": "false" } and a section with conditionComp: "condition1"
 * payloadHasConditionComp(payload, section) // returns false
 */
export const payloadHasConditionComp = (
    payload: FormPayload,
    section: Section
) => {
    if (!payload) return false;
    return Object.entries(payload).some(([key, value]) => {
        const compId = key.split("-")[0];
        if (
            compId === (section?.conditionComp ?? "") &&
            (value === "true" || value === "false")
        ) {
            return true;
        }
        return false;
    });
};

/**
 * Checks if the number of dynamically generated pages matches the expected count based on form configuration.
 *
 * This function verifies that repeatable sections have been properly duplicated according to the values
 * specified in the form payload. It compares the actual number of pages in each repeatable section against
 * the expected number based on the multiplication of original pages and the specified repeat count.
 *
 * @param def - The original form definition containing the base pages and sections
 * @param usedRepeatableSections - Array of sections that are marked as repeatable and used in the form
 * @param payload - Form payload containing values that determine how many times sections should be repeated
 * @param sectionData - Optional form definition containing the actual duplicated pages
 *
 * @returns boolean - Returns true if:
 *   - All repeatable sections have the correct number of duplicated pages based on their numberComp values
 *   - OR if sectionData is null/undefined (indicating no dynamic pages are expected)
 *   Returns false if:
 *   - Any repeatable section has an incorrect number of duplicated pages
 *   - The sectionData is missing when it should contain duplicated pages
 *
 * @example
 * // If a section has 2 original pages and should be repeated 3 times:
 * // originalPages.length = 2, triggerValue = 3
 * // Expected sectionPages.length = 6
 */
export const hasMatchingDynamicPages = (
    def: FormDefinition,
    usedRepeatableSections: Section[],
    payload: FormPayload,
    state: FormSubmissionState,
    sectionData?: FormDefinition | null,
    isIterationRepeatitionsWithBatchCount?: boolean | undefined,
    request?: HapiRequest
): boolean => {
    if (!sectionData || isIterationRepeatitionsWithBatchCount) return false;
    const isSectionProperlyDuplicated = (section: Section): boolean => {
        const triggerValue = parseInt(payload[section?.numberComp || ""], 10);
        const conditionCompValue = extractConditionCompValue(
            payload,
            section,
            state,
            request
        );
        if (
            (isNaN(triggerValue) || triggerValue <= 0) &&
            conditionCompValue === 0
        ) {
            return true; // No duplicated required for this section
        }

        const originalPages = def.pages.filter(
            (page) => page?.section === section?.name
        );
        const sectionPages = sectionData.pages.filter(
            (page) => page?.section === section?.name
        );
        return (
            sectionPages.length ===
            originalPages.length * (triggerValue ? triggerValue : 1) +
                conditionCompValue
        );
    };
    for (const section of usedRepeatableSections) {
        if (
            !payload[section?.numberComp || ""] &&
            !payloadHasConditionComp(payload, section)
        ) {
            continue; // Skip sections without valid numberComp in the payload
        }
        if (!isSectionProperlyDuplicated(section)) {
            return false; // Section is not properly duplicated
        }
    }
    return true;
};

export const getNumberAfterLastHyphen = (url) => {
    if (!url) return null;
    // Find the last occurrence of a hyphen
    const lastHyphenIndex = url.lastIndexOf("-");

    // Check if the last hyphen exists
    if (lastHyphenIndex === -1) {
        return null; // No hyphen found
    }

    // Extract the substring after the last hyphen
    const numberAfterHyphen = url.substring(lastHyphenIndex + 1);

    // Check if the extracted substring is a valid number
    if (!isNaN(numberAfterHyphen) && numberAfterHyphen.trim() !== "") {
        return parseInt(numberAfterHyphen); // Return the number as a string
    }

    return null; // No valid number found
};
// Compares old and new values to detect reduction
export const isNewLessThanOldValue = (
    section: Section,
    payload?: FormPayload,
    state?: FormSubmissionState
) => {
    // Handle sections with only condition components differently
    if (!section?.repeatableSection) return false;
    const onlyCondtionComp = !!section?.conditionComp && !section?.numberComp;
    if (!onlyCondtionComp) {
        // Get old value from state
        const numberCompValueStr: string | null = section?.numberComp
            ? state![section?.numberComp]
            : null;
        const numberCompValue = numberCompValueStr
            ? parseInt(numberCompValueStr, 10)
            : null;
        if (!numberCompValue) return false;
        // Get new value from payload
        const newNumberCompValue = payload![section?.numberComp!]
            ? parseInt(payload![section?.numberComp!], 10)
            : null;
        if (!newNumberCompValue) return false;
        // Return true if new value is less than old value
        if (newNumberCompValue < numberCompValue) return true;
        return false;
    } else {
        const conditionCompId = section?.conditionComp;
        let newConditionCompValue = false;
        let compIdPresesnt = "";
        Object.entries(payload ?? {}).forEach(([key, value]) => {
            const compId = key.split("-")[0];
            if (compId === conditionCompId && value === "false") {
                newConditionCompValue = true;
                compIdPresesnt = key;
            }
        });
        if (!newConditionCompValue) return false;
        let hasConditionCompValue = false;
        const sectionState = state?.[section.name];
        Object.entries(sectionState ?? {}).forEach(([key, value]) => {
            if (compIdPresesnt === key && value) {
                hasConditionCompValue = true;
            }
        });
        return hasConditionCompValue;
    }
};

// Checks if a section's trigger value has been lowered
export const hasSectionTriggerLowered = (
    sections?: Section[],
    payload?: FormPayload,
    state?: FormSubmissionState
): boolean => {
    // Skip if missing required data
    if (
        Object.keys(payload ?? {}).length === 0 ||
        Object.keys(state ?? {}).length === 0 ||
        (sections ?? []).length === 0
    ) {
        return false;
    }
    return !!sections?.some((section) =>
        isNewLessThanOldValue(section, payload, state)
    );
};

/**
 * Callback function for reducing pages when filtering based on section values.
 * Handles both condition-only and numeric+condition scenarios.
 *
 * @param groups - Array of page groups
 * @param section - Current section being processed
 * @param newValue - New value to filter against
 * @param onlyCondition - Whether section only has condition component
 */
const returnCbFn = (
    groups: (Page | Page[])[] | undefined,
    section: Section,
    newValue: number,
    onlyCondition: boolean
) => {
    trackEvent(
        `RQ Step 5: reduceCbFn`,
        { groups, section, newValue, onlyCondition },
        false
    );
    return (accumulator: Page[], currentPage: Page) => {
        if (!currentPage?.section) {
            accumulator.push(currentPage);
            return accumulator;
        }

        const isCurrentSection = currentPage.section === section.name;
        const groupForSection = groups?.find(
            (arr) =>
                Array.isArray(arr) && arr[0]?.section === currentPage.section
        ) as Page[] | undefined;
        const finalPageInGroup = groupForSection?.[groupForSection.length - 1];

        if (isCurrentSection) {
            const iterationNumber = Number(currentPage.pageSequence);

            if (isNaN(iterationNumber) || iterationNumber <= newValue) {
                if (iterationNumber === newValue && finalPageInGroup) {
                    const originalPageName = currentPage.path.replace(
                        `-${iterationNumber}`,
                        ""
                    );

                    if (finalPageInGroup.path === originalPageName) {
                        currentPage.next = finalPageInGroup.next;

                        if (!onlyCondition && section.conditionComp) {
                            const conditionComp = finalPageInGroup.components?.find(
                                (comp) => comp.name === section.conditionComp
                            );

                            if (conditionComp) {
                                const updatedConditionComp = {
                                    ...conditionComp,
                                    name:
                                        iterationNumber === 1
                                            ? conditionComp.name
                                            : `${conditionComp.name}-${iterationNumber}`,
                                };
                                currentPage.components = [
                                    ...(currentPage.components || []),
                                    updatedConditionComp,
                                ];
                            }
                        }
                    }
                }
                accumulator.push(currentPage);
            }
        } else {
            accumulator.push(currentPage);
        }

        return accumulator;
    };
};

// Filters pages based on new lower section value
export const filterPages = (
    def?: FormDefinition | null,
    payload?: FormPayload,
    state?: FormSubmissionState,
    groups?: (Page | Page[])[],
    request?: HapiRequest
): Page[] | null => {
    if (!def) return [];
    const sections = def.sections ?? [];
    if (sections.length === 0) return null;
    let pages: Page[] = def.pages;
    // Process each section
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (isNewLessThanOldValue(section, payload, state)) {
            const onlyCondtionComp =
                !!section?.conditionComp && !section?.numberComp;
            if (!onlyCondtionComp) {
                const newValue = parseInt(payload![section?.numberComp!], 10);
                pages = pages.reduce(
                    returnCbFn(groups, section, newValue, onlyCondtionComp),
                    [] as Page[]
                );
                request?.yar.set("iterationCount", newValue);
            } else {
                const conditionCompId = section?.conditionComp;
                let pageIterationToFilter = 0;
                Object.entries(payload ?? {}).forEach(([key, value]) => {
                    const compId = key.split("-")[0];
                    const isOriginalComp = key.includes("-") ? false : true;
                    const iterationNumber = getNumberAfterLastHyphen(key);
                    if (compId === conditionCompId && value === "false") {
                        if (iterationNumber && !isOriginalComp) {
                            pageIterationToFilter = iterationNumber;
                        } else {
                            pageIterationToFilter = 1;
                        }
                    }
                });
                updateTriggerCompValue(
                    section,
                    pageIterationToFilter,
                    state,
                    request
                );
                //updateNumberCache(state, request, section);
                pages = pages.reduce(
                    returnCbFn(
                        groups,
                        section,
                        pageIterationToFilter,
                        onlyCondtionComp
                    ),
                    [] as Page[]
                );
                request?.yar.set("iterationCount", pageIterationToFilter);
            }
        }
    }
    trackEvent(`RQ Step 6: filterpages`, { pages }, false);
    return pages;
};

export const invalidateCache = (
    pages: Page[],
    sections: Section[],
    state?: FormSubmissionState,
    request?: HapiRequest
) => {
    const finalSectionStates = {};
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const pagesFilteredBySection = pages.filter(
            (page) => page?.section === section?.name
        );
        if (request && state) {
            const sectionState = clearStateFromSection(
                state[section?.name] ?? {},
                pagesFilteredBySection
            );
            finalSectionStates[section?.name] = sectionState;
        }
    }
    if (request) {
        const newState = {
            ...state,
            ...finalSectionStates,
        };
        trackEvent(
            `RQ invalidate cache`,
            {
                newState,
            },
            false
        );
        request.yar.set("state", newState);
        return;
    }
    return;
};

/**
 * Clears state data for a section, retaining only values for components
 * that exist in the provided pages.
 *
 * @param sectionState - Current state for the section
 * @param pages - Pages to check components against
 * @returns Object containing only valid state entries
 */
export const clearStateFromSection = (
    sectionState: { [x: string]: string },
    pages: Page[]
) => {
    const newState = new Map<string, string>();
    const componentNames = pages.flatMap(
        (page) => page.components?.map((component) => component.name) ?? []
    );
    Object.entries(sectionState).forEach(([key, value]) => {
        if (componentNames.includes(key)) {
            newState.set(key, value);
        }
    });
    return Object.fromEntries(newState);
};

/**
 * Retrieves the condition component ID to avoid based on the payload.
 * Used in repeatable section handling to prevent duplicate conditions.
 *
 * @param section - Section containing the condition component
 * @param payload - Form payload to check against
 * @returns The component ID to avoid
 */
const retrieveIdToAvoid = (section: Section, payload: FormPayload) => {
    const conditionCompId = section?.conditionComp!;
    let result = "";
    Object.entries(payload ?? {}).forEach(([key, value]) => {
        const compId = key.split("-")[0];
        if (compId === conditionCompId && value === "true") {
            result = key;
        }
    });
    return result;
};

/**
 * Gets the previous value for a section from the form state.
 * Combines both numeric component value and condition component count.
 *
 * @param state - Current form state
 * @param section - Section to get value for
 * @returns Combined previous value
 */
export const getPreviousValueFromState = (
    state: FormSubmissionState,
    section: Section,
    request?: HapiRequest
): number => {
    const numberCompValueStr: string | null = section?.numberComp
        ? state![section?.numberComp]
        : null;
    const numberCompValue = numberCompValueStr
        ? parseInt(numberCompValueStr, 10)
        : 0;
    let conditionCompValue = 0;
    if (!!section?.conditionComp) {
        conditionCompValue = extractConditionCompValue(
            {} as FormPayload,
            section,
            state,
            request
        );
    }
    return numberCompValue + conditionCompValue;
};
export const getRedisKeyForIdentifier = (
    redisKey: string,
    identifier: string,
    newNumber?: string
): string => {
    // Split the Redis key into parts using the hyphen as a delimiter
    const parts = redisKey.split("-");
    if (parts.length === 1) {
        return `${redisKey}-${identifier}-${newNumber}`;
    }

    // Find the index of the identifier in the parts array
    const identifierIndex = parts.findIndex((part) => part === identifier);

    if (identifierIndex === -1) {
        // If the identifier is not found, return the original Redis key
        // return redisKey;
        return `${redisKey}-${identifier}-${newNumber}`;
    }

    if (newNumber) {
        // If a new number is provided, update the number after the identifier
        parts[identifierIndex + 1] = newNumber;
    }

    // Return the Redis key up to and including the identifier and its number
    return parts.slice(0, identifierIndex + 2).join("-");
};

/**
 * Updates or appends a unique identifier in the Redis session ID.
 *
 * This function is used to modify the Redis session ID stored in the user's session.
 * It either updates an existing identifier (matching a specific substring) with a new number
 * or appends the substring and number to the Redis session ID if no match is found.
 *
 * @param formId - The default form ID to use if no Redis session ID exists.
 * @param identifier - The substring to search for in the Redis session ID.
 * @param newNumber - The new number to associate with the identifier.
 * @param request - The Hapi request object, used to access the session data.
 * @returns {string} - The updated or newly constructed Redis session ID.
 *
 * Example:
 * If the current Redis ID is "form-123" and the identifier is "form", calling this function with
 * a new number of 456 will return "form-456".
 * If the identifier does not exist in the Redis ID, it will append the identifier and number,
 * e.g., "form-123" becomes "form-123-form-456".
 */
export const updateRedisSessionId = (
    defaultFormId: string,
    identifier: string,
    newNumber: string,
    request: HapiRequest
): string => {
    // Retrieve the current Redis session ID from the user's session or use the default form ID.
    const currentRedisId = request?.yar.get("redisID") ?? defaultFormId;
    const RedisKeyIdentifier = getRedisKeyForIdentifier(
        currentRedisId,
        identifier,
        newNumber
    );
    console.log("RedisKeyIdentifier", RedisKeyIdentifier);
    return RedisKeyIdentifier;
};

export const updateSectionTriggerCompValue = (
    validSections: Section[],
    def: FormDefinition,
    state: FormSubmissionState,
    payload: FormPayload
) => {
    validSections.forEach((validSection) => {
        let triggerCompValue = 1;
        if (validSection.triggerCompValue) {
            triggerCompValue = parseInt(
                //@ts-ignore
                validSection.triggerCompValue ?? "1",
                10
            );
        } else {
            // If no triggerCompValue is set, use the numberComp value from state
            const numberCompValueStr: string | null = validSection?.numberComp
                ? state![validSection?.numberComp]
                : null;
            if (numberCompValueStr) {
                const numberCompValue = numberCompValueStr
                    ? parseInt(numberCompValueStr, 10)
                    : 0;
                // If numberCompValue is not set or is less than 1, default to 1
                triggerCompValue = numberCompValue > 0 ? numberCompValue : 1;
            } else {
                // Check conditionComp value
                let conditionCompValue = extractConditionCompValue(
                    payload,
                    validSection,
                    state
                );

                // --- PATCH: Fix for lowered trigger when payload has condition-comp-name-2: "false" and state has condition-comp-name-2: true ---
                // If payload has a conditionComp key (with or without -N) set to "false" and state has the same key as true,
                // decrement the triggerCompValue by 1 for each such case.
                if (validSection.conditionComp) {
                    Object.entries(payload).forEach(([key, value]) => {
                        // Check for keys matching conditionComp or conditionComp-N
                        const compId = key.split("-")[0];
                        if (
                            compId === validSection.conditionComp &&
                            value === "false" &&
                            state?.[validSection.name] &&
                            typeof state[validSection.name][key] !==
                                "undefined" &&
                            state[validSection.name][key] === true
                        ) {
                            // Decrement for each matching lowered iteration
                            conditionCompValue = conditionCompValue - 1;
                        }
                    });
                }
                triggerCompValue =
                    conditionCompValue > 0 ? conditionCompValue : 1;
            }
        }
        const matchingSection = def.sections.find(
            (section) => section.name === validSection.name
        );

        if (
            matchingSection &&
            matchingSection.triggerCompValue !== triggerCompValue
        ) {
            trackEvent(
                `triggerCompValue for section in updateSectionTriggerCompValue`,
                {
                    validSection,
                    matchingSection,
                },
                false
            );
            // Update the triggerCompValue in def.sections
            matchingSection.triggerCompValue = triggerCompValue;
        }
    });
};

export const generateRedisKey = (id, sections, request: HapiRequest) => {
    // Start with the base ID
    let redisKey = id ?? request.yar.get("formId");

    // Iterate through sections and append valid sections with triggerCompValue
    sections
        .filter((section) => section.triggerCompValue !== undefined) // Filter out sections without triggerCompValue
        .forEach((section) => {
            // Append section name and triggerCompValue to the Redis key
            redisKey += section.numberComp
                ? `-${section.numberComp}-${section.triggerCompValue}`
                : `-${section.conditionComp}-${section.triggerCompValue}`;
        });
    trackEvent(
        `redisKey generated in generateRedisKey`,
        {
            redisKey,
        },
        false
    );
    return redisKey;
};
