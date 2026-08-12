import React from "react";
import { DateEnum } from "../../../store/types";

export type DateTimeValue = {
    day: number;
    month: number;
    year: number;
};

type Props = {
    name: string;
    value: DateTimeValue;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const DateInput = (props: Props) => {
    const { day, month, year } = props.value;
    return (
        <div className="govuk-date-input" id={`${props.name}`}>
            <div className="govuk-date-input__item">
                <div className="govuk-form-group">
                    <label
                        className="govuk-label govuk-date-input__label"
                        htmlFor={`${props.name}-day`}
                    >
                        Day
                    </label>
                    <input
                        className="govuk-input govuk-date-input__input govuk-input--width-2"
                        id={`${props.name}-day`}
                        name={DateEnum.Day}
                        type="text"
                        inputMode="numeric"
                        onChange={props.onChange}
                        value={day === 0 ? "" : day}
                    />
                </div>
            </div>
            <div className="govuk-date-input__item">
                <div className="govuk-form-group">
                    <label
                        className="govuk-label govuk-date-input__label"
                        htmlFor={`${props.name}-month`}
                    >
                        Month
                    </label>
                    <input
                        className="govuk-input govuk-date-input__input govuk-input--width-2"
                        id={`${props.name}-month`}
                        name={DateEnum.Month}
                        type="text"
                        inputMode="numeric"
                        onChange={props.onChange}
                        value={month === 0 ? "" : month}
                    />
                </div>
            </div>
            <div className="govuk-date-input__item">
                <div className="govuk-form-group">
                    <label
                        className="govuk-label govuk-date-input__label"
                        htmlFor={`${props.name}-year`}
                    >
                        Year
                    </label>
                    <input
                        className="govuk-input govuk-date-input__input govuk-input--width-4"
                        id={`${props.name}-year`}
                        name={DateEnum.Year}
                        type="text"
                        inputMode="numeric"
                        onChange={props.onChange}
                        value={year === 0 ? "" : year}
                    />
                </div>
            </div>
        </div>
    );
};

export default DateInput;
