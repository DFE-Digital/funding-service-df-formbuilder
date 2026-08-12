import React from "react";

import { DateInput } from "../../Input";
import { Label, LabelSizes, Para } from "../../Typography";
import Spacing, { SpacingUnit } from "../../Spacing";
import { DashboardFilters, DateEnum } from "../../../store/types";
import { validateDate } from "../../../pages/dashboard/utils";

type Props = {
    filters: DashboardFilters;
    setModifedOn: (modifiedOn: any) => void;
};

const ModifiedOnFilter = (props: Props) => {
    const { modifiedOn } = props.filters;
    const onFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fromData = modifiedOn.from;
        const nameArr = e.target.name.split("-");
        const name = nameArr[nameArr.length - 1] as DateEnum;
        const value = e.target.value;
        const validatedResult = validateDate(name, value, fromData[name]);
        const modifiedFromValue = {
            ...fromData,
            ...validatedResult,
        };

        props.setModifedOn({
            from: modifiedFromValue,
            till: modifiedOn.till,
        });
    };
    const onTillDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const tillData = modifiedOn.till;
        const nameArr = e.target.name.split("-");
        const name = nameArr[nameArr.length - 1] as DateEnum;
        const value = e.target.value;
        const validatedResult = validateDate(name, value, tillData[name]);
        const modifiedTillValue = {
            ...tillData,
            ...validatedResult,
        };

        props.setModifedOn({
            from: modifiedOn.from,
            till: modifiedTillValue,
        });
    };
    return (
        <>
            <Label text={"Modified On"} size={LabelSizes.S} />
            <Spacing mb={SpacingUnit.Three} />
            <div className="modified-on-filter-input-container">
                <DateInput
                    name={"modified-on-from"}
                    onChange={onFromDateChange}
                    value={modifiedOn.from}
                />
                <Para text="till" additionalClasses="till" />
                <DateInput
                    name={"modified-on-till"}
                    onChange={onTillDateChange}
                    value={modifiedOn.till}
                />
            </div>
        </>
    );
};

export default ModifiedOnFilter;
