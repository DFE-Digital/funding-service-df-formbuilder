import React from "react";
import { CheckboxFormComponent } from "../../Input";
import { LegendSizes } from "../../Typography";
import { FormAccessType } from "@xgovformbuilder/model";
import { DashboardFilters } from "../../../store/types";

type Props = {
    filters: DashboardFilters;
    setFormAccessType: (formAccessType: any) => void;
};

const FormAccessTypeFilter = (props: Props) => {
    const onFormAccessTypeCheckboxCheck = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const formAccessType = props.filters.formAccessType;
        const updatedFormAccessTypeFilter = {
            ...formAccessType,
            [e.target.value]: !formAccessType[e.target.value],
        };
        props.setFormAccessType(updatedFormAccessTypeFilter);
    };
    return (
        <CheckboxFormComponent
            name={"form-access-type-filter"}
            value={Object.keys(props.filters.formAccessType).filter(
                (accessType) => props.filters.formAccessType[accessType]
            )}
            label={"Access type"}
            labelSize={LegendSizes.S}
            options={[
                {
                    key: "public",
                    value: FormAccessType.Public,
                    label: "Public",
                    onChange: onFormAccessTypeCheckboxCheck,
                    additionalClasses: "form-status-checkboxes",
                },
                {
                    key: "dfe-sign-in",
                    value: FormAccessType.DFESignIn,
                    label: "DFE SignIn",
                    onChange: onFormAccessTypeCheckboxCheck,
                    additionalClasses: "form-status-checkboxes",
                },
            ]}
            isInline
            isSmall
        />
    );
};

export default FormAccessTypeFilter;
