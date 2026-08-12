import React from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import {
    filterSelector,
    setModifiedOnFilter,
} from "../../../../../store/reducers/dashboardReducer";
import { DateEnum } from "../../../../../store/types";
import { validateDate } from "../../../utils";

type Props = {};

const ModifiedOnFilter = (props: Props) => {
    const dispatch = useAppDispatch();
    const { modifiedOn } = useAppSelector(filterSelector);
    const onFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fromData = modifiedOn.from;
        const name = e.target.name as DateEnum;
        const value = e.target.value;
        const validatedResult = validateDate(name, value, fromData[name]);
        const modifiedFromValue = {
            ...fromData,
            ...validatedResult,
        };
        dispatch(
            setModifiedOnFilter({
                from: modifiedFromValue,
                till: modifiedOn.till,
            })
        );
    };
    const onTillDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const tillData = modifiedOn.till;
        const name = e.target.name as DateEnum;
        const value = e.target.value;
        const validatedResult = validateDate(name, value, tillData[name]);
        const modifiedTillValue = {
            ...tillData,
            ...validatedResult,
        };
        dispatch(
            setModifiedOnFilter({
                from: modifiedOn.from,
                till: modifiedTillValue,
            })
        );
    };
    return (
        <div className="govuk-form-group">
            <fieldset className="govuk-fieldset" role="group">
                <legend className="govuk-fieldset__legend govuk-!-font-size-19 govuk-!-font-weight-bold">
                    Modified on
                </legend>
                <div className="modified-on-filter">
                    <div className="govuk-date-input" id="modified-on">
                        <div className="govuk-date-input__item">
                            <div className="govuk-form-group">
                                <label
                                    className="govuk-label govuk-date-input__label"
                                    htmlFor="modified-on-from-day"
                                >
                                    Day
                                </label>
                                <input
                                    className="govuk-input govuk-date-input__input govuk-input--width-2"
                                    id="modified-on-from-day"
                                    name={DateEnum.Day}
                                    type="text"
                                    inputMode="numeric"
                                    onChange={onFromDateChange}
                                    value={
                                        modifiedOn.from[DateEnum.Day] === 0
                                            ? ""
                                            : modifiedOn.from[DateEnum.Day]
                                    }
                                />
                            </div>
                        </div>
                        <div className="govuk-date-input__item">
                            <div className="govuk-form-group">
                                <label
                                    className="govuk-label govuk-date-input__label"
                                    htmlFor="modified-on-from-month"
                                >
                                    Month
                                </label>
                                <input
                                    className="govuk-input govuk-date-input__input govuk-input--width-2"
                                    id="modified-on-from-month"
                                    name={DateEnum.Month}
                                    type="text"
                                    inputMode="numeric"
                                    onChange={onFromDateChange}
                                    value={
                                        modifiedOn.from[DateEnum.Month] === 0
                                            ? ""
                                            : modifiedOn.from[DateEnum.Month]
                                    }
                                />
                            </div>
                        </div>
                        <div className="govuk-date-input__item">
                            <div className="govuk-form-group">
                                <label
                                    className="govuk-label govuk-date-input__label"
                                    htmlFor="modified-on-from-year"
                                >
                                    Year
                                </label>
                                <input
                                    className="govuk-input govuk-date-input__input govuk-input--width-4"
                                    id="modified-on-from-year"
                                    name={DateEnum.Year}
                                    type="text"
                                    inputMode="numeric"
                                    onChange={onFromDateChange}
                                    value={
                                        modifiedOn.from[DateEnum.Year] === 0
                                            ? ""
                                            : modifiedOn.from[DateEnum.Year]
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <div className="govuk-body till">till</div>
                    <div className="govuk-date-input" id="modified-on">
                        <div className="govuk-date-input__item">
                            <div className="govuk-form-group">
                                <label
                                    className="govuk-label govuk-date-input__label"
                                    htmlFor="modified-on-till-day"
                                >
                                    Day
                                </label>
                                <input
                                    className="govuk-input govuk-date-input__input govuk-input--width-2"
                                    id="modified-on-till-day"
                                    name={DateEnum.Day}
                                    type="text"
                                    inputMode="numeric"
                                    onChange={onTillDateChange}
                                    value={
                                        modifiedOn.till[DateEnum.Day] === 0
                                            ? ""
                                            : modifiedOn.till[DateEnum.Day]
                                    }
                                />
                            </div>
                        </div>
                        <div className="govuk-date-input__item">
                            <div className="govuk-form-group">
                                <label
                                    className="govuk-label govuk-date-input__label"
                                    htmlFor="modified-on-till-month"
                                >
                                    Month
                                </label>
                                <input
                                    className="govuk-input govuk-date-input__input govuk-input--width-2"
                                    id="modified-on-till-month"
                                    name={DateEnum.Month}
                                    type="text"
                                    inputMode="numeric"
                                    onChange={onTillDateChange}
                                    value={
                                        modifiedOn.till[DateEnum.Month] === 0
                                            ? ""
                                            : modifiedOn.till[DateEnum.Month]
                                    }
                                />
                            </div>
                        </div>
                        <div className="govuk-date-input__item">
                            <div className="govuk-form-group">
                                <label
                                    className="govuk-label govuk-date-input__label"
                                    htmlFor="modified-on-till-year"
                                >
                                    Year
                                </label>
                                <input
                                    className="govuk-input govuk-date-input__input govuk-input--width-4"
                                    id="modified-on-till-year"
                                    name={DateEnum.Year}
                                    type="text"
                                    inputMode="numeric"
                                    onChange={onTillDateChange}
                                    value={
                                        modifiedOn.till[DateEnum.Year] === 0
                                            ? ""
                                            : modifiedOn.till[DateEnum.Year]
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

export default ModifiedOnFilter;
