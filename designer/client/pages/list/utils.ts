import Joi from "joi";
import { ListEntity, ListItem } from "../../store/types";

import type { Root } from "joi";

type ListItemDataSet = {
    list_item_name: string;
    help_text: string;
    value: string;
    links: string;
};

const JoiStringAdjustable: Root = Joi.extend((joi) => ({
    type: "string",
    base: joi.string(),
    coerce: {
        from: "number",
        method(value) {
            return { value: value.toString() };
        },
    },
}));

const listItemSchema = JoiStringAdjustable.object<ListItemDataSet>({
    list_item_name: JoiStringAdjustable.string().required(),
    help_text: JoiStringAdjustable.string().allow("").optional(),
    value: JoiStringAdjustable.string().required(),
    links: JoiStringAdjustable.string().allow("").optional(),
});

export const validateListItemDataSet = async (
    obj: any
): Promise<ListItem[]> => {
    const validatedSchema: ListItemDataSet[] = await Joi.array()
        .items(listItemSchema)
        .validateAsync(obj);
    const result = validatedSchema.map((obj) => ({
        text: obj.list_item_name,
        value: obj.value,
        description: obj.help_text ?? "",
        links: obj.links ?? "",
    }));
    return result;
};

export const constructPathFromData = (
    listId: string,
    formId: string
): string => {
    let result = "";
    const basePath = `/list-module/${formId}`;
    if (listId) {
        result = basePath + `/edit/${listId}`;
    } else {
        result = basePath + "/new";
    }
    return result;
};

const objectsEqual = (o1, o2) =>
    Object.keys(o1).length === Object.keys(o2).length &&
    Object.keys(o1).every((p) => o1[p] === o2[p]);

export const isListEdited = (
    originalList: ListEntity,
    newList: ListEntity
): boolean => {
    if (originalList.title === newList.title) {
        if (originalList.items.length === newList.items.length) {
            if (
                // Ensure all the items content are same
                originalList.items.every((obj, idx) => {
                    return objectsEqual(obj, newList.items[idx]);
                })
            ) {
                return false;
            }
        }
    }
    return true;
};

export const isListItemEdited = (
    originalListItem: ListItem,
    newListItem: ListItem
): boolean => {
    if (objectsEqual(originalListItem, newListItem)) {
        return false;
    }
    return true;
};
