import {
    Calculation,
    ComponentTypeEnum,
    FormDefinition,
    NumberFieldComponent,
    ResultComponent,
} from "@xgovformbuilder/model";
import { CalculationBuilderState, DataSetEntity } from "../store/types";
import { nanoid } from "nanoid";
import { computeExpression } from "../components/FieldEditors/utility/expression";

type csvProviderMappingData = {
    establishment_URN: string;
    establishment_UKPRN: string;
    establishment_name: string;
    district_administrative_code: string;
};

export const convertProviderMappingData = (
    id: string,
    data: csvProviderMappingData[]
) => {
    let UKPRN: string[] = [];
    let URN: string[] = [];
    let ADMINS: string[] = [];
    data.forEach((result) => {
        if (
            result.establishment_UKPRN !== "" &&
            result.establishment_UKPRN !== undefined
        )
            UKPRN.push(result.establishment_UKPRN);
        else if (
            result.establishment_URN !== "" &&
            result.establishment_URN !== undefined
        ) {
            URN.push(result.establishment_URN);
        } else if (
            result.district_administrative_code !== undefined &&
            result.district_administrative_code !== ""
        ) {
            ADMINS.push(result.district_administrative_code);
        }
    });
    const providersMapping = {
        id: id,
        providers: {
            UKPRN: UKPRN,
            URN: URN,
            adminCode: ADMINS,
        },
    };
    const allProviders = [
        ...providersMapping.providers.UKPRN,
        ...providersMapping.providers.URN,
        ...providersMapping.providers.adminCode,
    ];
    const modifiedProvidersMapping = {
        id: id,
        providers: allProviders.join(","),
    };
    return modifiedProvidersMapping;
};

export const mapStateToForm = (
    state: CalculationBuilderState,
    isEdit: boolean
): FormDefinition => {
    const formToBeSaved: FormDefinition = {
        ...state.form,
    };
    const calculationState = isEdit
        ? state.editCalculation
        : state.newCalculation;
    const newCalculation = ({
        title: calculationState.title,
        name: isEdit ? state.selectedCalculation?.name : nanoid(5),
        components: calculationState.selectedEntities
            .filter((ent) => ent.isComponent)
            .map((comp) => {
                const { isComponent, ...rest } = comp;
                return rest;
            }) as (NumberFieldComponent | ResultComponent)[],
        datasets: calculationState.selectedEntities
            .filter((ent) => !ent.isComponent)
            .map((ds) => {
                const { isComponent, ...rest } = ds;
                return rest;
            }),
        calculationsMapped: calculationState.computeList
            .filter((unit) => unit.type === "calculation")
            .map((unit) => unit.value),
        computeList: calculationState.computeList.map((unit) => {
            let entity = "";
            if (unit.type === "component") {
                if (unit.entity.isComponent) {
                    entity = unit.entity.name;
                } else {
                    const dsEntity = unit.entity;
                    entity = `${dsEntity.designedDataSetId}-${dsEntity.index}`;
                }
            } else if (unit.type === "calculation") {
                entity = unit.entity.name;
            } else if (unit.type === "number") {
                entity = "";
            } else if (unit.type === "operator") {
                entity = "";
            }
            return {
                id: unit.id,
                type: unit.type,
                order: unit.order,
                value: unit.value,
                entity: entity,
            };
        }),
        expression: calculationState.computeList
            .map((unit) =>
                unit.type === "component" &&
                unit.entity.isComponent &&
                unit.entity.isRepeatable
                    ? `${unit.value}~R+`
                    : unit.value
            )
            .join(" "),
    } as unknown) as Calculation;
    if (isEdit) {
        const replaceIndex = formToBeSaved.calculations.findIndex(
            (calc) => calc.name === newCalculation.name
        );
        if (replaceIndex === -1) {
            throw Error("Issue with saving calculation");
        }
        const updatedForm = {
            ...formToBeSaved,
            pages: formToBeSaved.pages.map((pg) => ({
                ...pg,
                components: pg.components?.map((c) => {
                    if (
                        c.type === ComponentTypeEnum.Result &&
                        c.calculationName === newCalculation.name
                    ) {
                        return {
                            ...c,
                            expression: computeExpression(
                                newCalculation,
                                pg.path,
                                formToBeSaved.pages,
                                formToBeSaved.sections
                            )!,
                        };
                    }
                    return c;
                }),
            })),
            calculations: formToBeSaved.calculations.map((calc, index) =>
                index === replaceIndex ? newCalculation : calc
            ),
        };
        return updatedForm;
    } else {
        formToBeSaved.calculations = [
            ...formToBeSaved.calculations,
            newCalculation,
        ];
        return formToBeSaved;
    }
};
