import React from "react";
import { AiOutlineSearch } from "react-icons/ai";

import { TextFormComponent, TextInputWidth } from "../Input";

import "./SearchInput.scss";
import { GridColumn, GridColumnType, GridRow } from "../Layout";

type Props = {
    name: string;
    label: string;
    value: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    additionalClasses?: string;
};

const SearchInput = (props: Props) => {
    return (
        <GridColumn
            type={GridColumnType.OneHalf}
            additionalClasses={`govuk-!-padding-right-0 ${props.additionalClasses}`}
        >
            <TextFormComponent
                name={props.name}
                label={props.label}
                inputWidth={TextInputWidth.W20}
                value={props.value}
                onChange={props.onSearchChange}
            />
            <AiOutlineSearch className="search-input-icon-box" />
        </GridColumn>
    );
};

export default SearchInput;
