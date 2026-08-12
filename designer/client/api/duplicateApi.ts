import { DuplicateFormState } from "../store/types";
import {
    checkIfFormNameExists,
    duplicateFormConfiguration,
    fetchAllformConfigs,
} from "./formConfigurationsApi";
import { mapChildFormConfigToParent } from "../store/utils";

export const getFormConfigWithChildByListFormForDuplicate = async (
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

export const checkIfNameIsValid = async (formName: string) => {
    const result = await checkIfFormNameExists(formName);
    return result;
};

export const duplicateMultipleFormConfiguration = async (
    state: DuplicateFormState,
    currentUser: {
        id: string;
        name: string;
        isSessionActive: boolean;
        homeAccountId: string;
    }
) => {
    const childIdMap: { [formId: string]: { id: string; name: string } } = {};
    for (const child of state.childForms) {
        const result = await duplicateFormConfiguration({
            formId: child.id,
            name: child.newName,
            userName: currentUser.name,
            userId: currentUser.id,
            duplicatedWithChild: false,
        });
        childIdMap[child.id] = { id: result.id, name: child.newName };
    }
    const parentId = state.selectedFormConfig?.Key!;
    const result = await duplicateFormConfiguration({
        formId: parentId,
        name: state.parentForm.newName,
        userName: currentUser.name,
        userId: currentUser.id,
        duplicatedWithChild: true,
        childIdMap,
    });
    return result;
};

export const duplicateForm = async (
    state: DuplicateFormState,
    currentUser: {
        id: string;
        name: string;
        isSessionActive: boolean;
        homeAccountId: string;
    }
) => {
    const parentId = state.selectedFormConfig?.Key!;
    const result = await duplicateFormConfiguration({
        formId: parentId,
        name: state.parentForm.newName,
        userName: currentUser.name,
        userId: currentUser.id,
        duplicatedWithChild: false,
    });
    return result;
};
