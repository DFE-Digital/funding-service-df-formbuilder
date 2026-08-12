import { DeleteFormState } from "../store/types";
import {
    deleteMultipleFormConfig,
    fetchAllformConfigs,
} from "./formConfigurationsApi";
import { mapChildFormConfigToParent } from "../store/utils";

export const getFormConfigWithChildByListFormForDelete = async (
    formId: string
) => {
    let isChild = false;
    const response = await fetchAllformConfigs();
    const entities = mapChildFormConfigToParent(response.data);
    let selectedFormConfig = entities.find((entity) => entity.Key === formId);
    if (!selectedFormConfig) {
        const childs = entities.flatMap((entity) => entity.childs);
        selectedFormConfig = childs.find((child) => child.Key === formId);
        isChild = true;
    }
    return { form: selectedFormConfig, isChild };
};

export const deleteMultipleFormConfiguration = async (
    state: DeleteFormState,
    hasChild: boolean
) => {
    let payload: string[] = [];
    if (hasChild) {
        if (state.isParentSelected) {
            payload.push(state.selectedFormConfig!.Key);
        }
        state.selectedFormConfig!.childs.forEach((child) => {
            if (state.selectedChildForms.includes(child.Key)) {
                payload.push(child.Key);
            }
        });
    } else {
        payload.push(state.selectedFormConfig!.Key);
    }
    return await deleteMultipleFormConfig(payload);
};
