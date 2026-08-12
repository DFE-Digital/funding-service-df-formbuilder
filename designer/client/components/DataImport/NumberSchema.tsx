import React, { useContext } from "react";
import {
    RenderMinNumber,
    RenderMaxNumber,
    RenderPrecisionNumber,
} from "../FieldEditors/number-field-edit";

import { ComponentContext } from "../../reducers/component/componentReducer";

function NumberSchema({
    minNumber,
    maxNumber,
    precisionNumber,
    handleNumberSchemaChanges,
}) {
    const { state, dispatch } = useContext(ComponentContext);
    return (
        <div className="mt-20 number-schema-container">
            <RenderMinNumber
                minNumber={minNumber}
                dispatch={dispatch}
                from="DataImport"
                handleChange={handleNumberSchemaChanges}
            />
            <RenderMaxNumber
                maxNumber={maxNumber}
                dispatch={dispatch}
                from="DataImport"
                handleChange={handleNumberSchemaChanges}
            />
            <RenderPrecisionNumber
                precisionNumber={precisionNumber}
                dispatch={dispatch}
                from="DataImport"
                handleChange={handleNumberSchemaChanges}
            />
        </div>
    );
}

export default NumberSchema;
