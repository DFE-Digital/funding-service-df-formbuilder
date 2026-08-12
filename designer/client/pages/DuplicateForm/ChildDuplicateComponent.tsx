import React, { useState } from "react";
import {
    Button,
    ButtonVariant,
    CheckboxInput,
    Spacing,
    SpacingUnit,
    TextFormComponent,
} from "../../ui";
import { FormConfigurationWithChild } from "../../store/types";
import { RenderDuplicateGeneric } from "./utils";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    checkName,
    duplicateFormSelector,
    setChildFormDetail,
    setSelectedChildForms,
} from "../../store/reducers/duplicateFormReducer";

type Props = {
    child: FormConfigurationWithChild;
};

const ChildDuplicateComponent = (props: Props) => {
    const { child } = props;
    const dispatch = useAppDispatch();
    const { selectedChildForms, childForms } = useAppSelector(
        duplicateFormSelector
    );

    const childDetail = childForms.find(
        (formDetail) => child.Key === formDetail.id
    )!;

    const [value, setValue] = useState(childDetail?.newName ?? "");
    const onChildFormSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        dispatch(setSelectedChildForms(value));
    };

    const onChildFormNameFinal = (childId: string) => {
        return (e: React.FocusEvent<HTMLInputElement>) => {
            dispatch(
                setChildFormDetail({
                    id: childId,
                    name: e.target.value,
                })
            );
        };
    };

    const onChildFormNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    return (
        <>
            <Spacing mt={SpacingUnit.Two} />
            <CheckboxInput
                key={child.Key}
                id={child.Key}
                name={child.Key}
                selectedValue={selectedChildForms}
                options={[
                    {
                        key: child.Key,
                        value: child.Key,
                        label: `Duplicate: ${child.DisplayName}`,
                        onChange: onChildFormSelect,
                        renderConditional: () => {
                            return (
                                <div className="duplicate-text-container">
                                    <TextFormComponent
                                        name={`rename-child-form-${child.Key}`}
                                        label={""}
                                        hint="Rename form: Please enter a unique name for this form"
                                        error={childDetail.error}
                                        value={value}
                                        onChange={onChildFormNameChange}
                                        onBlur={onChildFormNameFinal(child.Key)}
                                    />
                                    <Spacing mr={SpacingUnit.Four} />
                                    <div className="legend-button-container">
                                        <div>
                                            <RenderDuplicateGeneric
                                                hasUniqueName={
                                                    childDetail.isChecked
                                                }
                                            />
                                        </div>
                                        <Spacing mr={SpacingUnit.Four} />
                                        <div>
                                            <Button
                                                name={`check-for-duplicate-child-${child.Key}`}
                                                text={"Check for duplicate"}
                                                variant={
                                                    ButtonVariant.Secondary
                                                }
                                                isDisabled={
                                                    !!childDetail.error ||
                                                    childDetail.isChecked
                                                }
                                                onButtonClick={() => {
                                                    dispatch(
                                                        checkName({
                                                            formName:
                                                                childDetail.newName,
                                                            id: childDetail.id,
                                                        })
                                                    );
                                                }}
                                                additionalClasses="button-margin-bottom"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        },
                    },
                ]}
            />
            <Spacing mb={SpacingUnit.Two} />
        </>
    );
};

export default ChildDuplicateComponent;
