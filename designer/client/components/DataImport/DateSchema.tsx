import React, { useContext } from "react";
import {
    RenderMaxDaysInPast,
    RenderMaxDaysInFuture,
} from "../FieldEditors/date-field-edit";

import { ComponentContext } from "../../reducers/component/componentReducer";

function DateSchema({
    maxDaysInPast,
    maxDaysInFuture,
    handleDateSchemaChanges,
    // columnData,
}) {
    const { state, dispatch } = useContext(ComponentContext);
    return (
        <div className="mt-20 date-schema-container">
            <RenderMaxDaysInPast
                value={maxDaysInPast}
                dispatch={dispatch}
                from="DataImport"
                handleChange={handleDateSchemaChanges}
            />
            <RenderMaxDaysInFuture
                value={maxDaysInFuture}
                dispatch={dispatch}
                from="DataImport"
                handleChange={handleDateSchemaChanges}
            />
        </div>
    );
}

export default DateSchema;
