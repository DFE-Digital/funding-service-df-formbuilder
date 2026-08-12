import React from "react";
import "./filter.scss";
import {
    FormStatusFilter,
    FormAccessTypeFilter,
    ModifiedOnFilter,
} from "./components";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
    filterSelector,
    toggleFilters,
} from "../../../../store/reducers/dashboardReducer";
import CreatedByFilter from "./components/CreatedByFilter";
import SelectedFilters from "./components/SelectedFilters";
import { isFilterEmpty } from "../../utils";

type Props = {};

const Filter = (props: Props) => {
    const dispatch = useAppDispatch();
    const filters = useAppSelector(filterSelector);
    return (
        <div
            data-testid="dashboard-filter-container"
            className="filter-container govuk-!-margin-bottom-5"
        >
            <div className="filter-header">
                <div className="govuk-heading-s govuk-!-margin-bottom-0">
                    Filters
                </div>
                <a
                    id="filter-close-link"
                    className="govuk-link govuk-body govuk-!-margin-bottom-0"
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        dispatch(toggleFilters());
                    }}
                >
                    Close
                </a>
            </div>
            {!isFilterEmpty(filters) && <SelectedFilters />}
            <div className="filter-body">
                <FormStatusFilter />
                <FormAccessTypeFilter />
                <ModifiedOnFilter />
                <CreatedByFilter />
            </div>
        </div>
    );
};

export default Filter;
