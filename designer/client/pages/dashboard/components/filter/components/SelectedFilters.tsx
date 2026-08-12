import React from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import {
    clearFilters,
    filterSelector,
    setFormStatusFilter,
    setFormAccessTypeFilter,
    setModifiedOnFilter,
    setCreatedByFilter,
} from "../../../../../store/reducers/dashboardReducer";
import { FilterTypes } from "../../../../../store/types";
import { selectedFilters } from "../../../utils";

type Props = {};

const SelectedFilters = (props: Props) => {
    const dispatch = useAppDispatch();
    const filter = useAppSelector(filterSelector);
    const onClearFilter = (
        e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
    ) => {
        e.preventDefault();
        dispatch(clearFilters());
    };
    const onOptionClear = (filterKey: string, optionKey: string) => {
        if (filterKey === FilterTypes.FormStatus) {
            dispatch(
                setFormStatusFilter({
                    ...filter.formStatus,
                    [optionKey]: false,
                })
            );
            return;
        } else if (filterKey === FilterTypes.FormAccessType) {
            dispatch(
                setFormAccessTypeFilter({
                    ...filter.formAccessType,
                    [optionKey]: false,
                })
            );
            return;
        } else if (filterKey === FilterTypes.ModifiedOn) {
            dispatch(
                setModifiedOnFilter({
                    from: { day: 0, month: 0, year: 0 },
                    till: { day: 0, month: 0, year: 0 },
                })
            );
            return;
        } else if (filterKey === FilterTypes.CreatedBy) {
            dispatch(setCreatedByFilter(optionKey));
            return;
        }
        return;
    };
    return (
        <div className="selected-filter-container">
            <div className="selected-filter-header">
                <h1 className="govuk-body govuk-!-font-weight-bold">
                    Selected filters
                </h1>
                <a className="govuk-link" href="#" onClick={onClearFilter}>
                    Clear filters
                </a>
            </div>
            <div className="selected-filter-body">
                {selectedFilters(filter).map((filterType, idx) => (
                    <div
                        key={idx}
                        className="selected-filter-type-container govuk-!-margin-bottom-6"
                    >
                        <div className="govuk-body">{filterType.title}</div>
                        <div className="selected-filter-options-container">
                            {filterType.selected.map((option, idy) => (
                                <div
                                    key={idy}
                                    className="selected-filter-options"
                                >
                                    <div className="govuk-body govuk-!-margin-0">
                                        {option.title}
                                    </div>
                                    <div
                                        className="selected-filter-options-clear"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onOptionClear(
                                                filterType.key,
                                                option.key
                                            );
                                        }}
                                    >
                                        <AiOutlineClose
                                            size={20}
                                            strokeWidth={40}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SelectedFilters;
