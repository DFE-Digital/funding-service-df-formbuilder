import React, { useState } from "react";
import {
    createdBySelector,
    filterSelector,
    setCreatedByFilter,
} from "../../../../../store/reducers/dashboardReducer";
import { AiOutlineSearch } from "react-icons/ai";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";

type Props = {};

const CreatedByFilter = (props: Props) => {
    const dispatch = useAppDispatch();
    const createdByList = useAppSelector(createdBySelector);
    const { createdBy } = useAppSelector(filterSelector);
    const [createdBySearch, setCreatedBySearch] = useState("");
    return (
        <div className="created-by-filter">
            <div className="govuk-form-group govuk-!-margin-bottom-4">
                <label
                    className="govuk-label govuk-!-font-weight-bold govuk-!-margin-bottom-2"
                    htmlFor="created-by"
                >
                    Created by
                    <span className="govuk-!-font-weight-regular govuk-!-margin-left-1">{`(only for colleague's form)`}</span>
                </label>
                <div className="created-by-input-container">
                    <AiOutlineSearch
                        size={18}
                        className="created-by-search-icon"
                    />
                    <input
                        className="govuk-input govuk-!-padding-left-7"
                        id="created-by"
                        name="created-by-search"
                        type="search"
                        spellCheck={false}
                        onChange={(e) => setCreatedBySearch(e.target.value)}
                    />
                </div>
            </div>
            <div className="govuk-form-group govuk-!-margin-bottom-0">
                <fieldset className="govuk-fieldset">
                    <ul
                        className="govuk-checkboxes govuk-checkboxes--small govuk-!-padding-left-0 govuk-!-margin-top-0 govuk-!-margin-bottom-0 created-by-checkboxes"
                        data-module="govuk-checkboxes"
                    >
                        {createdByList
                            .filter((name) =>
                                name
                                    .toLowerCase()
                                    .includes(
                                        createdBySearch.toLocaleLowerCase()
                                    )
                            )
                            .map((name, index) => (
                                <li
                                    className="govuk-checkboxes__item"
                                    key={index}
                                >
                                    <input
                                        className="govuk-checkboxes__input"
                                        id={`created-by-${index}`}
                                        name="created-by-checkbox"
                                        type="checkbox"
                                        value={name}
                                        checked={createdBy.includes(name)}
                                        onChange={(e) =>
                                            dispatch(
                                                setCreatedByFilter(
                                                    e.target.value
                                                )
                                            )
                                        }
                                    />
                                    <label
                                        className="govuk-label govuk-checkboxes__label"
                                        htmlFor={`created-by-${index}`}
                                    >
                                        {name}
                                    </label>
                                </li>
                            ))}
                    </ul>
                </fieldset>
            </div>
        </div>
    );
};

export default CreatedByFilter;
