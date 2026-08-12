import React from "react";

import { ListContextProvider } from "../../reducers/listReducer";
import { ListsEditorContextProvider } from "../../reducers/list/listsEditorReducer";
import { RenderInPortal } from "../RenderInPortal";
import ComponentListSelect from "../ComponentListSelect/ComponentListSelect";
import { ComponentTypeEnum } from "@xgovformbuilder/model";
import ListFormatEdit from "./list-format-edit";
import ListFieldActionButtons from "./list-field-action-buttons";

type Props = {
    children: any; // TODO
    page: any; // TODO
    type: string;
    isEdit: boolean;
    toggleShowEditor: () => void;
};

function ListFieldEdit({
    children,
    page,
    type,
    isEdit,
    toggleShowEditor,
}: Props) {
    return (
        <ListsEditorContextProvider>
            <ListContextProvider>
                <ComponentListSelect />
                {type === ComponentTypeEnum.List && <ListFormatEdit />}
                {children}
                {type === ComponentTypeEnum.List && (
                    <ListFieldActionButtons
                        isEdit={isEdit}
                        toggleShowEditor={toggleShowEditor}
                        page={page}
                    />
                )}
            </ListContextProvider>
        </ListsEditorContextProvider>
    );
}

export default ListFieldEdit;
