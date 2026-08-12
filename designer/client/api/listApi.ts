import { FormDefinition, List, nanoid } from "@xgovformbuilder/model";
import { ListEntity, ListItem } from "../store/types";
import { validateListItemDataSet } from "../pages/list/utils";
import { DesignerApi } from "./designerApi";
import randomId from "../randomId";
import { getConfiguration } from "./formConfigurationsApi";
import { handleLinkedPropertyEffect, Module, PropertyAction } from "../utils";

type FetchListResponse = {
    data: ListEntity[];
    form: FormDefinition;
    error: string;
};

const emptyConfigRespoonse: FetchListResponse = {
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

export const fetchListFromFormId = async (formId: string) => {
    try {
        const response = await getConfiguration(formId);
        if (!response) {
            return emptyConfigRespoonse;
        }
        const lists = response?.lists ?? [];
        return {
            data: lists,
            form: response,
            error: "",
        } as FetchListResponse;
    } catch (e: any) {
        return {
            ...emptyConfigRespoonse,
            error: e.toString(),
        };
    }
};

type DataSetResponse = {
    dataset: ListItem[];
    datasetId: string;
    error: boolean;
};

export const fetchListItemDataset = async (
    id: string
): Promise<DataSetResponse> => {
    if (!id)
        return {
            dataset: [],
            datasetId: "",
            error: true,
        };
    try {
        const response = await window.fetch(`/api/${id}/getDataSet`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        const responseJson = await response.json();
        if (responseJson.error)
            return {
                dataset: [],
                datasetId: id,
                error: true,
            };
        const validatedListItems = await validateListItemDataSet(responseJson);
        return {
            dataset: validatedListItems,
            datasetId: id,
            error: false,
        };
    } catch (err: any) {
        return {
            dataset: [],
            datasetId: "",
            error: true,
        };
    }
};

export const deleteFormList = async (listId: string, form: FormDefinition) => {
    try {
        const designerApi = new DesignerApi();
        const filteresLists = form.lists.filter((list) => list.name !== listId);
        let modifiedForm: FormDefinition = {
            ...form,
            lists: filteresLists,
        };
        modifiedForm = handleLinkedPropertyEffect(
            Module.List,
            form.lists.find((list) => list.name === listId)!,
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

export const addListToForm = async (list: ListEntity, form: FormDefinition) => {
    try {
        const designerApi = new DesignerApi();
        const existingForm = form.lists.some((obj) => obj.name === list.name);
        let modifiedLists = [...form.lists];
        if (existingForm) {
            modifiedLists = modifiedLists.map((item) =>
                item.name === list.name ? (list as List) : item
            );
        } else {
            const newListId = randomId();
            const listWithId = { ...list, name: newListId, type: "string" };
            modifiedLists.push(listWithId as List);
        }
        const modifiedForm = {
            ...form,
            lists: modifiedLists,
        };
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
