import {
    Calculation,
    ComponentDef,
    ComponentTypeEnum,
    DataSet,
    FormDefinition,
    NumberFieldComponent,
    Page,
    ResultComponent,
    Section,
} from "@xgovformbuilder/model";
import {
    CalculationBuilderState,
    ComputeNumberUnit,
    ComputeOperatorUnit,
    ComputeUnit,
    ComputeComponentUnit,
    SelectedEntity,
    CalculationFormState,
} from "../../store/types";
import { AutocompleteOptions } from "../../ui/Input/Autocomplete";

export const checkIfAllEntitiesSelected = (
    selectedEntities: SelectedEntity[],
    allEntities: (ComponentDef | DataSet)[],
    designedDatasetId?: string
) => {
    if (selectedEntities.length === 0 || allEntities.length === 0) return false;

    // Type guards
    const isComponentDef = (e: ComponentDef | DataSet): e is ComponentDef =>
        "name" in (e as any) && typeof (e as any).name === "string";
    const isDataSet = (e: ComponentDef | DataSet): e is DataSet =>
        "index" in (e as any) && typeof (e as any).index !== "undefined";

    const isNumberOrResultComponent = (
        e: ComponentDef | DataSet
    ): e is NumberFieldComponent | ResultComponent =>
        isComponentDef(e) &&
        (e.type === ComponentTypeEnum.NumberField ||
            e.type === ComponentTypeEnum.Result);

    const isCalcDataset = (e: ComponentDef | DataSet): e is DataSet =>
        isDataSet(e) && !!e.calc;

    // Only consider relevant entities: number components OR dataset entries
    const relevantEntities = allEntities.filter(
        (e) => isNumberOrResultComponent(e) || isCalcDataset(e)
    );

    if (relevantEntities.length === 0) return false;

    return relevantEntities.every((entity) =>
        selectedEntities.some((sel) => {
            if (sel.isComponent) {
                if (!isNumberOrResultComponent(entity)) return false;
                return sel.name === entity.name;
            } else {
                if (!isCalcDataset(entity)) return false;
                return (
                    sel.index === entity.index &&
                    sel.designedDataSetId === designedDatasetId
                );
            }
        })
    );
};

export const getPageDatasetOptions = (form: FormDefinition) => {
    if (!form) return [];
    const options: AutocompleteOptions[] = [];
    form.designedDataSets
        ?.filter((ds) =>
            ds.data.some((row) => row.some((cell) => cell.calc === true))
        )
        .forEach((ds) => {
            options.push({ id: ds.id, title: ds.title, key: ds.id });
        });
    form.pages
        ?.filter((pg) =>
            pg.components?.some(
                (c) =>
                    c.type === ComponentTypeEnum.NumberField ||
                    c.type === ComponentTypeEnum.Result
            )
        )
        .forEach((pg) => {
            options.push({ id: pg.path, title: pg.title, key: pg.path });
        });
    return options;
};

export const getCalculationOptions = (state: CalculationBuilderState) => {
    const form = state.form;
    const options: AutocompleteOptions[] = [];
    form.calculations?.forEach((calc) => {
        options.push({
            id: calc.name,
            title: calc.displayName ?? calc.title,
            key: calc.name,
        });
    });
    if (!state.newCalculation.addedCalculations) return options;
    return options.filter(
        (opt) =>
            !state.newCalculation
                .computeList!.filter((unit) => unit.type === "calculation")
                .find((unit) => unit.value === opt.id)
    );
};

export const getAllEntitiesId = (allEntities: SelectedEntity[]) => {
    return allEntities.map((e) =>
        e.isComponent ? e.name : `${e.designedDataSetId}-${e.index}`
    );
};

export const retrieveComponents = (page: Page) => {
    const components: (NumberFieldComponent | ResultComponent)[] = [];
    page?.components
        ?.filter(
            (c): c is NumberFieldComponent | ResultComponent =>
                c.type === ComponentTypeEnum.NumberField ||
                c.type === ComponentTypeEnum.Result
        )
        ?.forEach((c) => {
            components.push(c);
        });
    return components;
};

export const isComponentCompute = (u: ComputeUnit): u is ComputeComponentUnit =>
    u.type === "component";
export const isNumber = (u: ComputeUnit): u is ComputeNumberUnit =>
    u.type === "number";
export const isOperator = (u: ComputeUnit): u is ComputeOperatorUnit =>
    u.type === "operator";

export const checkIfAddToComputeBlockDisabled = (
    target: CalculationFormState,
    isCalculation: boolean
) => {
    if (isCalculation) {
        const selected = target.addedCalculations;
        return selected === null;
    } else {
        const selected = target.selectedEntities || [];
        const computeList = target.computeList || [];

        // nothing selected -> disabled
        if (selected.length === 0) return true;

        // extract variable-unit entities currently in computeList
        const variableEntities = computeList
            .filter(isComponentCompute)
            .map((u) => u.entity as SelectedEntity);

        const matches = (a: SelectedEntity, b: SelectedEntity) => {
            if (a.isComponent && b.isComponent) {
                return a.name === b.name;
            }
            if (!a.isComponent && !b.isComponent) {
                return (
                    a.index === b.index &&
                    (a.designedDataSetId ?? "") === (b.designedDataSetId ?? "")
                );
            }
            return false;
        };

        // if every selected entity already exists in variableEntities -> disabled
        const allAlreadyAdded = selected.every((sel) =>
            variableEntities.some((ve) => matches(sel, ve))
        );

        return allAlreadyAdded;
    }
};

export const validateStateToAllowSave = (target: CalculationFormState) => {
    if (target.title.trim() === "") return false;
    if (target.computeList.length === 0) return false;

    const list = target.computeList;
    const isVariable = (t: string) =>
        t === "calculation" || t === "component" || t === "number";
    const isOperator = (t: string) => t === "operator";

    if (isOperator(list[0]?.type)) return false;
    if (isOperator(list[list.length - 1]?.type)) return false;

    for (let i = 0; i < list.length; i++) {
        if (list[i].value === null) return false;

        const current = list[i]?.type;
        const next = list[i + 1]?.type;

        // same type adjacent => invalid
        if (current === next) return false;

        // two adjacent variables (non-operator) => invalid
        if (isVariable(current) && isVariable(next)) return false;
    }
    return validateComputeList(target.computeList);
};

export const validateComputeList = (computeList: ComputeUnit[]) => {
    if (computeList.length === 0) return false;
    return true;
};
