import React from "react";
import Spacing, { SpacingUnit } from "../../Spacing";

type Props = {
    name: string;
    isFuture?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    day: string | number;
    month: string | number;
    year: string | number;
    hour: string | number;
    minute: string | number;
};

const DateTimeInput = (props: Props) => {
    const { day, month, year, hour, minute } = props;

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
                        name={`${props.name}-day`}
                        type="text"
                        inputMode="numeric"
                        min={"1"}
                        max={"31"}
                        onChange={props.onChange}
                        value={day}
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
                        name={`${props.name}-month`}
                        type="text"
                        inputMode="numeric"
                        min={"1"}
                        max={"12"}
                        onChange={props.onChange}
                        value={month}
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
                        name={`${props.name}-year`}
                        type="text"
                        inputMode="numeric"
                        onChange={props.onChange}
                        value={year}
                        maxLength={4}
                    />
                </div>
            </div>
            <Spacing additionalClasses="govuk-date-input__item" />
            <div className="govuk-date-input__item">
                <div className="govuk-form-group">
                    <label
                        className="govuk-label govuk-date-input__label"
                        htmlFor={`${props.name}-hour`}
                    >
                        Hour
                    </label>
                    <input
                        className="govuk-input govuk-date-input__input govuk-input--width-2"
                        id={`${props.name}-hour`}
                        name={`${props.name}-hour`}
                        onChange={props.onChange}
                        type="text"
                        value={hour}
                        inputMode="numeric"
                        max={"24"}
                    />
                </div>
            </div>
            <div className="govuk-date-input__item">
                <div className="govuk-form-group">
                    <label
                        className="govuk-label govuk-date-input__label"
                        htmlFor={`${props.name}-minute`}
                    >
                        Minute
                    </label>
                    <input
                        className="govuk-input govuk-date-input__input govuk-input--width-2"
                        id={`${props.name}-minute`}
                        name={`${props.name}-minute`}
                        onChange={props.onChange}
                        type="text"
                        value={minute}
                        inputMode="numeric"
                        max={"59"}
                    />
                </div>
            </div>
        </div>
    );
};

export default DateTimeInput;
