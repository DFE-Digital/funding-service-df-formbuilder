import { FormDefinition, Section } from "@xgovformbuilder/model";
import { DesignerApi } from "./designerApi";
import { getConfiguration } from "./formConfigurationsApi";
import { FormSectionState } from "../store/types";
import { handleLinkedPropertyEffect, Module, PropertyAction } from "../utils";

type FetchSectionResponse = {
    data: Section[];
    form: FormDefinition;
    error: string;
};

const emptyConfigResponse: FetchSectionResponse = {
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

export const fetchSectionsFromFormId = async (formId: string) => {
    try {
        const response = await getConfiguration(formId);
        if (!response) {
            return emptyConfigResponse;
        }
        const sections = response?.sections ?? [];
        return {
            data: sections,
            form: response,
            error: "",
        } as FetchSectionResponse;
    } catch (e: any) {
        return {
            ...emptyConfigResponse,
            error: e.toString(),
        };
    }
};

export const addEditSection = async (
    state: FormSectionState,
    isEdit: boolean
) => {
    try {
        const designerApi = new DesignerApi();
        if (isEdit) {
            const modifiedForm: FormDefinition = {
                ...state.form,
                sections: state.form.sections.map((section) => {
                    if (section.name === state.selectedSection!.name) {
                        return state.selectedSection!;
                    } else {
                        return section;
                    }
                }),
            };
            await designerApi.save(modifiedForm.id, modifiedForm);
            return {
                form: modifiedForm,
                error: "",
            };
        } else {
            const modifiedForm: FormDefinition = {
                ...state.form,
                sections: [...state.form.sections, state.newSection],
            };
            await designerApi.save(modifiedForm.id, modifiedForm);
            return {
                form: modifiedForm,
                error: "",
            };
        }
    } catch (e: any) {
        return {
            form: state.form,
            error: e.toString(),
        };
    }
};

export const deleteSectionFromForm = async (state: FormSectionState) => {
    try {
        const designerApi = new DesignerApi();
        let modifiedForm: FormDefinition = {
            ...state.form,
            sections: state.form.sections.filter(
                (section) => section.name !== state.selectedSection!.name
            ),
        };
        modifiedForm = handleLinkedPropertyEffect(
            Module.Section,
            state.selectedSection!,
            PropertyAction.Deleted,
            modifiedForm
        );
        await designerApi.save(modifiedForm.id, modifiedForm);
        return {
            form: modifiedForm,
            error: "",
        };
    } catch (e: any) {
        return {
            form: state.form,
            error: e.toString(),
        };
    }
};
