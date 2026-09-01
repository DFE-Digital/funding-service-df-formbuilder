import {
    Calculation,
    DesignedDataSet,
    FormDefinition,
    Section,
} from "@xgovformbuilder/model";
import { ComponentCollectionViewModel, ViewModel } from "../plugins/engine/components/types";
import { PageControllerBase } from "../plugins/engine/pageControllers";
import {
    FormSubmissionErrors,
    FormSubmissionState,
} from "../plugins/engine/types";
import { HapiResponseObject } from "../types";
import { getBlobContent } from "./tableTabService";
import { create, all } from "mathjs";
import { numberWithCommas } from "../plugins/engine/pageControllers/utils";
import { FormModel } from "../plugins/engine/models";
import { getNumberAfterLastHyphen } from "../plugins/engine/helpers";

const confg = {};
const math = create(all, confg);

type PageViewModel = {
    page: PageControllerBase;
    name: string;
    pageTitle: string;
    sectionTitle: string;
    showTitle: boolean;
    components: ComponentCollectionViewModel;
    errors: FormSubmissionErrors;
    isStartPage: boolean;
    isAuthenticated: boolean;
    startPage?: HapiResponseObject;
    backLink?: string;
    phaseTag?: string | undefined;
};

type ExpObjType = {
    variables: string[];
    calcs: string[];
    datasets: string[];
    expression: string;
};

type DataSetsValue = {
    [x: string]: string;
};

type DataSetsInCache = {
    [id: string]: DataSetsValue[];
};

type Organizations = {
    ukprn: string;
    urn: string;
    DistrictAdministrative_code: string;
    DistrictAdministrativeCode: string;
};

type ResultComponent = {
    type: string;
    isFormComponent: boolean;
    model: ViewModel;
}
/**
 * Holds the dataset values which are to be used in calculations
 */
class DataSetCache {
    datasets: DataSetsInCache = {};
    designedDataSets: DesignedDataSet[] = [];
    constructor(datasets: DataSetsInCache, designedSets: DesignedDataSet[]) {
        this.datasets = datasets;
        this.designedDataSets = designedSets;
    }

    async fetchDataset(datasetId: string) {
        const selectedDataset = this.designedDataSets.find(
            (dds) => dds.id === datasetId
        );
        if (!selectedDataset) return;
        if (this.datasets[datasetId] && this.datasets[datasetId].length > 0)
            return;
        const data = (await getBlobContent(
            selectedDataset.csvUsed
        )) as DataSetsValue[];
        this.datasets[datasetId] = data;
    }

    getValueForExpression(
        orgDetail: Organizations,
        datasetId: string,
        key: string
    ) {
        if (!orgDetail) return "0";
        const selectedDataset = this.designedDataSets.find(
            (dds) => dds.id === datasetId
        );
        if (!selectedDataset) return "0";
        const keyIdent = selectedDataset.keyIdentifier;
        let orgId = "";
        switch (keyIdent.toLowerCase()) {
            case "ukprn":
                orgId = orgDetail.ukprn;
                break;
            case "urn":
                orgId = orgDetail.urn;
                break;
            case "district_administrative_code":
                orgId =
                    orgDetail.DistrictAdministrative_code ??
                    orgDetail.DistrictAdministrativeCode;
                break;
        }
        const values = this.datasets[datasetId];
        const filterByOrgId = values.find((obj) => {
            const val = obj[keyIdent];
            return val.toString() === orgId.toString();
        });
        if (!filterByOrgId) return "0";
        return filterByOrgId[key];
    }
}

const containsAnyLetter = (str: string) => {
    return /[a-zA-Z]/.test(str);
};

const isNumeric = (keyStr: string) => {
    return /^-?\d+(\.\d+)?$/.test(keyStr.replace(/,/g, ""));
}

/**
 * Used to check if number components used in calculations are within a section
 * @param state
 * @param sections
 * @param key
 * @returns
 */
const checkValueFromSection = (state: FormSubmissionState, sections: Section[], key: string) => {
    if (sections.length === 0) return null;
    for (let index = 0; index < sections.length; index++) {
        const section = sections[index];
        if (state[section.name] && state[section.name][key]) {
            return section.name;
        }
    }
    return null;
}

/**
 * Find the section name (e.g., "rZXxWw") for a given component name by scanning def.pages.
 */
function findSectionForComponent(def: any, componentName: string): string | null {
    for (const page of def.pages || []) {
        if (!page?.components) continue;
        for (const comp of page.components) {
            if (comp?.name === componentName) {
                return page.section || null; // may be undefined for non-section pages
            }
        }
    }
    return null;
}

/**
 * Get every component that belongs to a given section (across all pages with that section).
 */
function getSectionComponents(def: any, sectionName: string | null): any[] {
    if (!sectionName) return [];
    const comps: any[] = [];
    for (const page of def.pages || []) {
        if (page.section !== sectionName) continue;
        if (!page?.components) continue;
        comps.push(...page.components);
    }
    return comps;
}

/**
 * Extract the iteration number from a component name.
 * No suffix => iteration "1".
 */
function getIteration(name: string): string {
    const m = name.match(/-(\d+)$/);
    return m ? m[1] : "1";
}

/**
 * Map a base component name to the correct iteration
 */
function mapToIteration(base: string, iter: string, sectionComps: any[]): string {
    if (iter === "1") return base;
    const candidate = `${base}-${iter}`;
    return sectionComps.some(c => c.name === candidate)
        ? candidate
        : base;
}

/**
 * Parses the expression string into variable names
 * Also, removes '-Value' from the designed data variable in expressions
 *
 * Note: For dataset key with curved brakets ('(' and ')') in them, this might break.
 * @param exp
 * @returns
 */
const convertExpressionToObj = (
    exp: string,
    resultComponents: ResultComponent[],
    calculations: Calculation[],
    state: FormSubmissionState,
    def: FormDefinition,
    resultComponentName?: string
): ExpObjType => {
    let expression = "" + exp; // Copies the expression string
    // Reg Exp used to select string value between two curved brackets i.e '(' and ')'.
    const reBrackets = /\((.*?)\)/g;
    let listOfVariables: string[] = [];
    let listOfCalcs: string[] = [];
    const datasets: string[] = [];

    const sectionName = findSectionForComponent(def, resultComponentName ?? "");
    const sectionComponents = getSectionComponents(def, sectionName);
    const currentIteration = getIteration(resultComponentName ?? "");

    const normaliseToken = (token: string): string => {
        if (!token.endsWith("~R+")) return token;
        const base = token.slice(0, -3); // remove "~R+"
        const iterName = mapToIteration(base, currentIteration, sectionComponents);

        return iterName;
    };

    let found: RegExpExecArray | null;
    while ((found = reBrackets.exec(exp))) {
        const token = found[1];

        if (calculations.find((calc) => token.includes(calc.name)) && !state[token]) {
            listOfCalcs.push(token);
        } else {
            const normalised = normaliseToken(token);
            listOfVariables.push(normalised);

            if (token.endsWith("~R+")) {
                if (sectionComponents.find(c => c.name === normalised)) {
                    expression = expression.split(token).join(normalised);
                }
            }
        }
    }
    listOfVariables = listOfVariables.map((variable) => {
        if (variable.includes("->")) {
            const strArr = variable.split("->");
            const datasetId = strArr[0];
            const keyStr = strArr[1];
            const keyArr = keyStr.split("-");
            if (isNumeric(keyStr) || keyArr.length === 1) {
                const varRe = new RegExp(variable, "g");
                // Replaces custom dataset value with just valid number value
                expression = expression.replace(
                    varRe,
                    `${containsAnyLetter(strArr[1]) ? "0" : strArr[1].replace(/,/g, "")}`
                );
                return keyStr;
            } else if (keyArr.length > 1) {
                // Pushes to datasets since we need this value from blob
                datasets.push(datasetId);
                const varRe = new RegExp(variable, "g");
                // Removes the suffix '-Value' from the string
                keyArr.pop();
                expression = expression.replace(
                    varRe,
                    `${datasetId}->${keyArr.join("-")}`
                );
                return variable;
            }
        }
        return variable;
    });
    // Loops and removes result component ids from listOfVariables
    listOfVariables = listOfVariables?.filter((variable) => {
        return !resultComponents?.some((comp) => comp.model.id === variable)
    })
    return {
        variables: listOfVariables,
        calcs: listOfCalcs,
        datasets,
        expression,
    };
};

/**
 * Sums all values in the state object for keys matching the pattern:
 *   variable, variable-2, variable-3, etc.
 * It searches recursively in nested objects.
 * 
 * @param state The state object to search
 * @param variable The variable name to match (e.g., "eYWQBR")
 * @returns The sum of all matching values
 */
function sumAllVariableInstances(state: any, variable: string): number {
    let sum = 0;
    const regex = new RegExp(`^${variable}(-\\d+)?$`);

    function search(obj: any) {
        if (typeof obj !== "object" || obj === null) return;
        for (const [key, value] of Object.entries(obj)) {
            if (regex.test(key) && typeof value === "number" && !isNaN(value)) {
                sum += value;
            } else if (typeof value === "object" && value !== null) {
                search(value);
            }
        }
    }

    search(state);
    return sum;
}

/**
 * Checks if the given expression contains a repeatable variable (with ~R+).
 * @param expression The expression string to check.
 * @returns true if a repeatable variable is found, false otherwise.
 */
export function isRepeatableExpression(expression: string): boolean {
    // Matches patterns like (variable~R+)
    const repeatablePattern = /\(\w+~R\+\)/;
    return repeatablePattern.test(expression);
}

/**
 * Recursively expands a calculation expression:
 *  - Converts the current `expression` into an object via `convertExpressionToObj`.
 *  - Finds any referenced calculations (`expObj.calcs`) and expands each one recursively,
 *    replacing calculation names with the associated expression.
 *
 * The returned object has the following shape:
 *  - `expression: string` — the fully expanded expression string.
 *  - `variables: string[]` — all variable identifiers referenced by the expanded expression.
 *  - `calcs: string[]` — any calc names referenced at this level (empty after full expansion).
 *  - `datasets: string[]` — any dataset identifiers referenced by the expanded expression.
 *
 * @param expression The expression to expand.
 * @param resultComponents Result components on the current page.
 * @param calculations All available calculations.
 * @param state Form submission state.
 * @returns An object with `{ expression, variables, calcs, datasets }`, with nested calcs expanded.
 */
function expandCalculationExpressions(
    expression: string,
    resultComponents: any,
    calculations: any[],
    state: FormSubmissionState,
    def: FormDefinition,
    resultComponentName?: string
): ExpObjType {
    let expObj = convertExpressionToObj(
        expression,
        resultComponents,
        calculations,
        state,
        def,
        resultComponentName
    );

    // If there are calcs referenced, expand them recursively
    if (expObj.calcs && expObj.calcs.length > 0) {
        for (const calcName of expObj.calcs) {
            const calc = calculations.find((c) => calcName.includes(c.name));
            if (calc) {
                const regex = /(?:\d+(?:\.\d+)?|\w[\w-]*->(?:.*?-Value\b|\d+(?:\.\d+)?|\w[\w-]*)|\w[\w-]*(?:~R\+)?)/g;

                const wrapIfNotAlready = (match: string, offset: number, full: string) => {
                    const start = offset;
                    const end = offset + match.length;

                    // Find nearest non-whitespace char before/after the match
                    let left = start - 1;
                    while (left >= 0 && /\s/.test(full[left])) left--;

                    let right = end;
                    while (right < full.length && /\s/.test(full[right])) right++;

                    const alreadyWrapped = left >= 0 && right < full.length && full[left] === "(" && full[right] === ")";
                    return alreadyWrapped ? match : `(${match})`;
                };

                const inner = expandCalculationExpressions(
                    calc.expression.replace(regex, wrapIfNotAlready),
                    resultComponents,
                    calculations,
                    state,
                    def,
                    resultComponentName
                );
                expObj.expression = expObj.expression.replace(
                    calcName,
                    inner.expression
                );
                expObj.variables = expObj.variables.concat(inner.variables);
                expObj.datasets = expObj.datasets.concat(inner.datasets);
            }
        }
    }

    return expObj;
}

/**
 * Deals with 'Result' Components.
 * Replaces the expression string with user submitted value
 * @param viewModel
 * @param state
 */
export const replaceExpressionWithValue = async (
    viewModel: PageViewModel,
    state: FormSubmissionState,
    def: FormDefinition,
    organizationDetails: Organizations
) => {
    let expObj: ExpObjType;
    if (!state?.result) {
        if (state) {
            // If result doesn't exist, sets an empty object
            state.result = {};
        }
    }
    const designedDataSets = def.designedDataSets ?? [];
    const dataSetCache = new DataSetCache({}, designedDataSets);
    const resultComponents = viewModel.components?.filter(
        (comp) => comp?.type == "Result"
    );
    const calculations = def.calculations;
    for (const component of resultComponents ?? []) {
        let expression = component.model.attributes.expression ?? "";
        let expressionTemp = expression; // Start with the original expression

        const expandedExpression = expandCalculationExpressions(
            expression,
            resultComponents,
            calculations,
            state,
            def,
            component.model.name
        ).expression;
        let handledRepeatable = false;
        if (isRepeatableExpression(expandedExpression)) {
            handledRepeatable = true;
            expression = expandedExpression;
            expressionTemp = expression;
            // Find all variables with ~R+ in the expression, including dataset references
            const repeatableMatches = [...expression.matchAll(/\(([\w\-]+(?:->[\w\-]+)?)~R\+\)/g)];

            for (const match of repeatableMatches) {
                const variable = match[1];
                // Standard repeatable variable sum
                const sum = sumAllVariableInstances(state, variable);
                expression = expression.replace(
                    new RegExp(`\\(${variable}~R\\+\\)`, "g"),
                    sum.toString()
                );
                expressionTemp = expressionTemp.replace(
                    new RegExp(`\\(${variable}~R\\+\\)`, "g"),
                    sum.toString()
                );
            }
            const variableMatches = [...expressionTemp.matchAll(/\(([\w\-]+(?:->[^()]+)?)\)/g)];
            for (const match of variableMatches) {
                const variable = match[1];
                if (variable.includes("->")) {
                    const [datasetId, key] = variable.split("->");
                    const actualKey = key.replace(/-Value$/, "");
                    await dataSetCache.fetchDataset(datasetId);
                    const value = dataSetCache.getValueForExpression(
                        organizationDetails,
                        datasetId,
                        actualKey
                    );
                    expression = expression.replace(
                        new RegExp(`\\(${datasetId}->${key}\\)`, "g"),
                        value
                    );
                    expressionTemp = expressionTemp.replace(
                        new RegExp(`\\(${datasetId}->${key}\\)`, "g"),
                        value
                    );
                } else if (containsAnyLetter(variable)) {
                    const section = checkValueFromSection(state, def.sections ?? [], variable);
                    if (section) {
                        const value = state[section][variable] ?? 0;
                        if (typeof value === "number" || (typeof value === "string" && value !== "")) {
                            expression = expression.replace(
                                new RegExp(`\\(${variable}\\)`, "g"),
                                value.toString()
                            );
                            const comp = viewModel.components.find(
                                (c) => c?.model.id == variable
                            );
                            if (comp == undefined) {
                                expressionTemp = expressionTemp.replace(
                                    new RegExp(`\\(${variable}\\)`, "g"),
                                    value.toString()
                                );
                            }
                        }   
                    } else {
                        const value = state[variable] ?? 0;
                        if (typeof value === "number" || (typeof value === "string" && value !== "")) {
                            expression = expression.replace(
                                new RegExp(`\\(${variable}\\)`, "g"),
                                value.toString()
                            );
                            const comp = viewModel.components.find(
                                (c) => c?.model.id == variable
                            );
                            if (comp == undefined) {
                                expressionTemp = expressionTemp.replace(
                                    new RegExp(`\\(${variable}\\)`, "g"),
                                    value.toString()
                                );
                            }
                        }
                    }
                }
            }
        }

        else {
            // If the expression doesn't contain a repeatable variable, process it as before
            expression = expression.replace(/~R\+/g, "");
            expressionTemp = expression;
        }

        // ...rest of your logic for handling datasets, variables, etc.

        // At the end, store both expressions in state.result
        if (expression && expressionTemp && handledRepeatable) {
            state.result[`${component.model.id}`] = expression;
            state.result[`${component.model.id}-temp`] = expressionTemp;
            continue;
        }
        // let expressionTemp = component.model.attributes.expression ?? "";
        if (!expression) return;
        // expObj = convertExpressionToObj(expression, resultComponents);
        expObj = expandCalculationExpressions(
            expression,
            resultComponents,
            calculations,
            state,
            def,
            component.model.name
        );
        expression = expObj.expression;
        expressionTemp = expObj.expression;
        await Promise.all(
            expObj.datasets.map(async (id) => {
                await dataSetCache.fetchDataset(id);
            })
        );

        const varWithValues: { [x: string]: string } = {};
        expObj.variables?.forEach((variable) => {
            if (variable.includes("->")) {
                const strArr = variable.split("->");
                const datasetId = strArr[0];
                const key = strArr[1];
                const keyArr = key.split("-");
                // Removes the suffix '-Value' from the string
                keyArr.pop();
                const actualKey = keyArr.join("-");
                const value = dataSetCache.getValueForExpression(
                    organizationDetails,
                    datasetId,
                    actualKey
                );
                if (typeof value === "string") {
                    const cleanedValue = value.replace(/,/g, "");
                    varWithValues[`${datasetId}->${actualKey}`] = (cleanedValue == null || cleanedValue === "") ? "0" : cleanedValue;
                } else {
                    varWithValues[`${datasetId}->${actualKey}`] = value ?? "0";
                }
            } else if (containsAnyLetter(variable)) {
                const section = checkValueFromSection(state, def.sections ?? [], variable);
                if (section) {
                    varWithValues[variable] = state[section][variable] ?? "0";
                } else {
                    varWithValues[variable] = state[variable] ?? "0";
                }
            }
        });
        // Replaces the expression with user submitted value
        for (const [compKey, compVal] of Object.entries(varWithValues)) {
            if (expression.includes(compKey)) {
                const re = new RegExp(compKey, "g");
                if (
                    Number(compVal) > 0 ||
                    (compVal !== undefined &&
                        compVal !== "" &&
                        compVal !== null)
                ) {
                    expression = expression.replace(re, compVal);
                } else {
                    expression = expression?.replace(re, "0");
                }
                const comp = viewModel.components.find(
                    (c) => c?.model.id == compKey
                );
                if (comp == undefined) {
                    expressionTemp = expressionTemp?.replace(re, compVal);
                }
            }
        }
        // Replaces variable with value from other calculated results
        for (const [calcKey, calcValue] of Object.entries(
            state?.result ?? {}
        )) {
            if (expression?.includes(calcKey)) {
                const re = new RegExp(calcKey, "g");
                if (
                    !containsAnyLetter(calcValue) ||
                    (calcValue !== undefined &&
                        calcValue !== "" &&
                        calcValue !== null)
                ) {
                    expression = expression?.replace(re, calcValue);
                } else {
                    expression = expression?.replace(re, "0");
                }
                const comp = viewModel.components.find(
                    (c) => c?.model.id == calcKey
                );
                if (comp == undefined) {
                    expressionTemp = expressionTemp?.replace(re, calcValue);
                }
            }
        }
        if (expression && expressionTemp) {
            state.result[`${component.model.id}`] = expression;
            state.result[`${component.model.id}-temp`] = expressionTemp;
        }
    }
};

export const setExpressionDataAndConditionEvaluation = async (
    state: FormSubmissionState,
    containsAnyLetter: (str: string) => boolean,
    viewModel: PageViewModel,
    form: FormDefinition,
    formModel: FormModel,
    organizationDetails: Organizations
) => {
    await replaceExpressionWithValue(
        viewModel,
        state,
        form,
        organizationDetails
    );
    const sections = formModel.sections;
    const sectionState = sections?.reduce((acc, { name }) => {
        Object.assign(acc, state[name] ?? {});
        return acc;
    }, {});

    const pagePath = viewModel.page.path;
    let sectionComponents = {};
    for (const compId in sectionState) {
        const compIdPart = compId.includes("-")
            ? Number(compId.split("-")[1])
            : null;

        if (
            compIdPart === getNumberAfterLastHyphen(pagePath) ||
            (compIdPart === 1 &&
                getNumberAfterLastHyphen(pagePath) === null)
        ) {
            const compName = compId.split("-")[0];
            sectionComponents = {
                ...sectionComponents,
                [compName]: sectionState[compId],
            };
        }
    }

    const conditionState = {
        ...state,
        ...sectionState,
        ...sectionComponents
    };
    viewModel.components = viewModel?.components?.map((component) => {
        const evaluatedComponent = component;
        const content = evaluatedComponent.model.content;
        const type = evaluatedComponent?.type;
        if (content instanceof Array) {
            evaluatedComponent.model.content = content?.filter(
                (item) =>
                    item.condition
                        ? formModel.conditions[item.condition].fn(
                            conditionState
                        )
                        : true
            );
        }

        if (type === "Result") {
            if (
                !containsAnyLetter(
                    state.result[`${component.model.id}`]
                )
            ) {
                let resultValue = math.evaluate(
                    state.result[`${component.model.id}`]
                );
                if (
                    isNaN(resultValue) ||
                    !Number.isFinite(resultValue)
                ) {
                    resultValue = "0";
                }
                evaluatedComponent.model.value = parseFloat(
                    resultValue
                ).toFixed(
                    //@ts-ignore
                    evaluatedComponent.model.attributes?.precision ?? 0
                );
                if (
                    evaluatedComponent.model.options.prefixValue ===
                    "£" ||
                    evaluatedComponent.model.options.prefixValue === "€"
                ) {
                    evaluatedComponent.model.displayValue = numberWithCommas(
                        evaluatedComponent.model.value
                    );
                } else {
                    evaluatedComponent.model.displayValue =
                        evaluatedComponent.model.value;
                }
            }
            evaluatedComponent.model.attributes.expressionData =
                state.result[`${component.model.id}-temp`];
        }

        // apply condition to items for radios, checkboxes etc
        const items = evaluatedComponent.model.items;

        if (items instanceof Array) {
            evaluatedComponent.model.items = items?.filter((item) =>
                item.condition
                    ? formModel.conditions[item.condition].fn(
                        conditionState
                    )
                    : true
            );
        }

        return evaluatedComponent;
    });

    viewModel.components = viewModel.components?.filter(
        (component) => {
            if (
                ((component.model.content ||
                    component?.type === "Details") &&
                    component.model.condition) ||
                (component?.type === "Filedownload" &&
                    component.model.condition)
            ) {
                const condition = formModel.conditions[
                    component.model.condition
                ];
                return condition.fn(conditionState);
            }
            if (
                component?.type === "Result" &&
                component.model.condition
            ) {
                const condition = formModel.conditions[
                    component.model.condition
                ];
                const resultName = component.model.name;
                let resultValue = component.model.value;
                resultValue = Number.parseFloat(resultValue);
                return condition.fn({
                    ...conditionState,
                    ...{
                        //@ts-ignore
                        [resultName]: resultValue,
                    },
                });
            }
            return true;
        }
    );
}