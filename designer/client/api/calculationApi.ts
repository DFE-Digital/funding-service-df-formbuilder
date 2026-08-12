import { FormDefinition, Calculation, nanoid } from "@xgovformbuilder/model";
import { getConfiguration, updateForm } from "./formConfigurationsApi";
import { DesignerApi } from "./designerApi";
import { CalculationBuilderState } from "../store/types";
import { mapStateToForm } from "./utils";
import { handleLinkedPropertyEffect, Module, PropertyAction } from "../utils";

type FetchCalculationResponse = {
    data: Calculation[];
    form: FormDefinition;
    error: string;
};

const emptyConfigResponse: FetchCalculationResponse = {
    data: [],
    form: {
        id: "",
        key: "",
        displayName: "",
        lastModified: "",
        lastDownloaded: "",
        pages: [],
        conditions: [],
        lists: [],
        sections: [],
        confirmationMsg: "",
        fees: [],
        calculations: [],
    },
    error: "",
};

export const fetchCalculationFromFormId = async (formId: string) => {
    try {
        const response = await getConfiguration(formId);
        if (!response) {
            return emptyConfigResponse;
        }
        const calculations = response?.calculations ?? [];
        return {
            data: calculations,
            form: response,
            error: "",
        } as FetchCalculationResponse;
    } catch (e: any) {
        return {
            ...emptyConfigResponse,
            error: String(e),
        };
    }
};

export const saveCalculationToForm = async (
    state: CalculationBuilderState,
    isEdit: boolean
) => {
    const formToBeSaved: FormDefinition = mapStateToForm(state, isEdit);
    try {
        const savedFormResponse = await updateForm(formToBeSaved);
        const savedForm = await savedFormResponse.json();
        return savedForm as FormDefinition;
    } catch (e) {
        console.error("Error saving calculation to form:", e);
        return null;
    }
};

export const deleteCalculationFromForm = async (
    calcId: string,
    form: FormDefinition
) => {
    try {
        const designerApi = new DesignerApi();
        const filterescalc = form.calculations.filter(
            (calc) => calc.name !== calcId
        );
        let modifiedForm = {
            ...form,
            calculations: filterescalc,
        };
        modifiedForm = handleLinkedPropertyEffect(
            Module.Calculation,
            form.calculations.find((calc) => calc.name === calcId)!,
            PropertyAction.Deleted,
            modifiedForm
        );
        await designerApi.save(form.id, modifiedForm);
        return {
            form: modifiedForm,
            error: false,
        };
    } catch (err: any) {
        return {
            form,
            error: true,
        };
    }
};
