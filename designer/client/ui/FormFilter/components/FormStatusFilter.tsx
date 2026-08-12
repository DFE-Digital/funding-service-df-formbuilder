import React from "react";
import { FormStatus } from "@xgovformbuilder/model";

import { CheckboxFormComponent } from "../../Input";
import { LegendSizes } from "../../Typography";
import { DashboardFilters } from "../../../store/types";

type Props = {
    filters: DashboardFilters;
    setFormStatus: (formStatus: any) => void;
};

const FormStatusFilter = (props: Props) => {
    const onFormStatusCheckboxCheck = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const formStatus = props.filters.formStatus;
        const updatedFormStatusFilter = {
            ...formStatus,
            [e.target.value]: !formStatus[e.target.value],
        };
        props.setFormStatus(updatedFormStatusFilter);
    };
    return (
        <CheckboxFormComponent
            name={"form-status-filter"}
            value={Object.keys(props.filters.formStatus).filter(
                (status) => props.filters.formStatus[status]
            )}
            label={"Form status"}
            labelSize={LegendSizes.S}
            options={[
                {
                    key: "in-development",
                    value: FormStatus.InDevelopment,
                    label: "In development",
                    onChange: onFormStatusCheckboxCheck,
                    additionalClasses: "form-status-checkboxes",
                },
                {
                    key: "uat",
                    value: FormStatus.UAT,
                    label: "UAT",
                    onChange: onFormStatusCheckboxCheck,
                    additionalClasses: "form-status-checkboxes",
                },
                {
                    key: "published",
                    value: FormStatus.Published,
                    label: "Published",
                    onChange: onFormStatusCheckboxCheck,
                    additionalClasses: "form-status-checkboxes",
                },
                {
                    key: "closed",
                    value: FormStatus.Closed,
                    label: "Closed",
                    onChange: onFormStatusCheckboxCheck,
                    additionalClasses: "form-status-checkboxes",
                },
            ]}
            isInline
            isSmall
        />
    );
};

export default FormStatusFilter;
