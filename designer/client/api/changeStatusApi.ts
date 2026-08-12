import { FormStatus } from "@xgovformbuilder/model";
import { ChangeStatusState } from "../store/types";
import { mapChildFormConfigToParent } from "../store/utils";
import { UPDATE_MULTIPLE_FORM_STATUS } from "./constants";
import { fetchAllformConfigs } from "./formConfigurationsApi";

export const getFormConfigWithChildByListForm = async (formId: string) => {
    const response = await fetchAllformConfigs();
    const entities = mapChildFormConfigToParent(response.data);
    let selectedFormConfig = entities.find((entity) => entity.Key === formId);
    if (!selectedFormConfig) {
        const childs = entities.flatMap((entity) => entity.childs);
        selectedFormConfig = childs.find((child) => child.Key === formId);
    }
    return selectedFormConfig;
};

export type MultipleFormStatusAPIResponse = {
    Key: string;
    Value: boolean;
};

export type MultipleFormStatusResponse = {
    status: boolean;
    data: MultipleFormStatusAPIResponse[];
};

type MultipleFormStatusPayload = {
    FormId: string;
    Status: FormStatus;
};

export const multipleFormStatusUpdate = async (
    state: ChangeStatusState,
    hasChild: boolean
) => {
    let payload: MultipleFormStatusPayload[] = [];
    if (hasChild) {
        if (state.isParentSelected) {
            payload.push({
                FormId: state.selectedFormConfig!.Key,
                Status: state.selectedStatus!,
            });
        }
        state.selectedFormConfig!.childs.forEach((child) => {
            if (state.selectedChildForms.includes(child.Key)) {
                payload.push({
                    FormId: child!.Key,
                    Status: state.selectedStatus!,
                });
            }
        });
    } else {
        payload.push({
            FormId: state.selectedFormConfig!.Key,
            Status: state.selectedStatus!,
        });
    }
    try {
        const response = await fetch(UPDATE_MULTIPLE_FORM_STATUS, {
            method: "POST",
            headers: {
                Accept: "application/json",
                ["Content-Type"]: "application/json",
            },
            body: JSON.stringify(payload),
        });
        const result = (response.json() as unknown) as MultipleFormStatusAPIResponse[];
        return { status: true, data: result } as MultipleFormStatusResponse;
    } catch (e: any) {
        return {
            status: false,
            data: [],
        } as MultipleFormStatusResponse;
    }
};
