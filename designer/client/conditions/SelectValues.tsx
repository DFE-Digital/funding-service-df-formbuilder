import React from "react";
import { ConditionValue } from "@xgovformbuilder/model";

export const SelectValues = (props) => {
    const { updateValue, value, values, type, dataset } = props;

    const onChangeSelect = (e) => {
        const input = e.target;
        const newValue = input.value;

        let value;
        if (newValue && newValue?.trim() !== "") {
            const option = values?.find(
                (value) => String(value.fileId) === newValue
            );
            value = new ConditionValue(String(option.fileId), option.fileTitle);
        }

        updateValue(value);
    };

    return (
        <select
            className="govuk-select"
            id="cond-value"
            name="cond-value"
            value={type === "selectDataset" ? dataset : value?.value ?? ""}
            onChange={onChangeSelect}
            data-testid={"cond-value"}
        >
            <option />
            {values?.map((option) => {
                return (
                    <option key={option?.fileId} value={option?.fileId}>
                        {option?.fileTitle}
                    </option>
                );
            })}
        </select>
    );
};
