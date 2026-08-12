import React from "react";

type Props = {
    id: string;
    name: string;
    value: string;
    options: SelectOptions[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    hasError?: boolean;
};

export type SelectOptions = {
    id: string;
    key: string;
    title: string;
};

const SelectInput = (props: Props) => {
    const hasError = props.hasError ?? false;
    return (
        <select
            className={`govuk-select ${hasError && "govuk-select--error"}`}
            id={`${props.name}-${props.id}`}
            name={props.name}
            value={props.value}
            onChange={props.onChange}
            aria-describedby={`${props.name}-hint-${props.id}`}
        >
            <option value="none">Select</option>
            {props.options?.map((option) => {
                return (
                    <option
                        key={option?.key}
                        value={option?.id}
                        data-title={option?.title}
                    >
                        {option?.title}
                    </option>
                );
            })}
        </select>
    );
};

export default SelectInput;
