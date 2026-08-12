import React, { useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { useAppDispatch } from "../../../../store/hooks";
import {
    searchForms,
    toggleFilters,
} from "../../../../store/reducers/dashboardReducer";
import "./search.scss";

function SearchComponent() {
    const dispatch = useAppDispatch();
    const [searchString, setSearchString] = useState("");

    useEffect(() => {
        if (!searchString) {
            dispatch(searchForms(searchString));
        }
    }, [dispatch, searchString]);

    return (
        <div className="search-container">
            <div className="govuk-form-group">
                <label
                    className="govuk-heading-s govuk-!-margin-0"
                    htmlFor="width-20"
                >
                    Search forms
                </label>
                <input
                    className="govuk-input govuk-input--width-20"
                    id="width-20"
                    name="width-20"
                    type="search"
                    value={searchString}
                    onChange={(e) => {
                        setSearchString(e.target.value);
                    }}
                    onKeyPress={(event) => {
                        if (event.key === "Enter") {
                            dispatch(searchForms(searchString));
                        }
                    }}
                />
                <AiOutlineSearch
                    className="searchBox"
                    onClick={() => {
                        dispatch(searchForms(searchString));
                    }}
                />
                <button
                    className="govuk-button govuk-button--secondary govuk-!-margin-left-6 govuk-!-margin-top-3 govuk-!-margin-bottom-0 filter-toggle-button"
                    data-module="govuk-button"
                    data-testid="dashboard-show-filters"
                    onClick={() => {
                        dispatch(toggleFilters());
                    }}
                >
                    Show filters
                </button>
            </div>
        </div>
    );
}

export default SearchComponent;
