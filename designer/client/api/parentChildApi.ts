import { getConfiguration, updateForm } from "./formConfigurationsApi";
import { FormDefinition } from "@xgovformbuilder/model";

export const getParentChildFormData = async (formId: string) => {
    const response = await getConfiguration(formId);
    return response;
};

export const addParentChildToForm = async (form: FormDefinition) => {
    try {
        const response = await updateForm(form);
        if (!response.ok) {
            throw Error(response.statusText);
        }
    } catch (err: any) {
        return {
            form,
            error: true,
        };
    }
};
