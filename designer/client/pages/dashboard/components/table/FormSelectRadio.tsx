import { CellContext } from "@tanstack/react-table";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
    getSelectedFormConfig,
    selectFormConfig,
} from "../../../../store/reducers/dashboardReducer";
import { FormConfigurationWithChild } from "../../../../store/types";
import { RadioInput } from "../../../../ui";

const FormSelectRadio = (
    props: CellContext<FormConfigurationWithChild, unknown>
) => {
    const dispatch = useAppDispatch();
    const formId = props.row.original.Key;
    const formConfig = props.row.original;
    const { selectedFormConfig } = useAppSelector(getSelectedFormConfig);
    const isChild = !!props.row.parentId;
    if (isChild) {
        return (
            <RadioInput
                id={"select-form"}
                name={"select-form"}
                selectedValue={selectedFormConfig?.Key}
                isSmall={true}
                options={[
                    {
                        key: props.row.original.Key,
                        label: "",
                        value: props.row.original.Key,
                        onChange: () => {
                            dispatch(
                                selectFormConfig({ form: formConfig, isChild })
                            );
                        },
                    },
                ]}
                additionalClasses="govuk-!-padding-left-5"
            />
        );
    } else {
        return (
            <div
                className="govuk-radios govuk-!-padding-left-2"
                data-module="govuk-radios"
            >
                <div className="govuk-radios__item">
                    <input
                        className="govuk-radios__input"
                        id={`select-form`}
                        name={`select-form`}
                        type="radio"
                        value={formId}
                        checked={
                            formConfig.Key === selectedFormConfig?.Key ?? ""
                        }
                        onChange={() => {
                            dispatch(
                                selectFormConfig({ form: formConfig, isChild })
                            );
                        }}
                    />
                    <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="where-do-you-live"
                    ></label>
                </div>
            </div>
        );
    }
};

export default FormSelectRadio;
