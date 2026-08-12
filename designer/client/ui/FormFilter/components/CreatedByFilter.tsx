import React, { useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";

import { Label, LabelSizes } from "../../Typography";
import { CheckboxInput, TextInput } from "../../Input";
import { DashboardFilters } from "../../../store/types";

type Props = {
    filters: DashboardFilters;
    createdByList: string[];
    setCreatedBy: (createdBy: any) => void;
};

const CreatedByFilter = (props: Props) => {
    const [createdBySearch, setCreatedBySearch] = useState("");
    return (
        <>
            <div className="govuk-form-group">
                <Label
                    text="Created By"
                    size={LabelSizes.S}
                    renderRight={() => {
                        return (
                            <span className="govuk-!-font-weight-regular">{` (only for colleague's forms)`}</span>
                        );
                    }}
                />
                <AiOutlineSearch size={18} className="created-by-search-icon" />
                <TextInput
                    id={"created-by-filter"}
                    name={"created-by-filter"}
                    additionalClasses={"govuk-!-padding-left-7"}
                    value={createdBySearch}
                    onChange={(e) => setCreatedBySearch(e.target.value)}
                />
            </div>
            <CheckboxInput
                id={"created-by"}
                name={"created-by"}
                selectedValue={props.filters.createdBy}
                additionalClasses="created-by-checkboxes govuk-!-padding-left-2"
                options={props.createdByList
                    .filter((name) =>
                        name
                            .toLowerCase()
                            .includes(createdBySearch.toLocaleLowerCase())
                    )
                    .map((name) => ({
                        key: name,
                        value: name,
                        label: name,
                        onChange: (e) => {
                            props.setCreatedBy(e.target.value);
                        },
                    }))}
                isSmall
            />
        </>
    );
};

export default CreatedByFilter;
