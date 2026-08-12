import React, { useContext } from "react";
import { RenderMaxLength } from "../FieldEditors/text-field-edit";
import { ComponentContext } from "../../reducers/component/componentReducer";

function TextSchema({ maxLength, handleTextSchemaChanges }) {
    const { state, dispatch } = useContext(ComponentContext);
    return (
        <div>
            <RenderMaxLength
                value={maxLength}
                dispatch={dispatch}
                from="DataImport"
                handleChange={handleTextSchemaChanges}
            />
        </div>
    );
}

export default TextSchema;
