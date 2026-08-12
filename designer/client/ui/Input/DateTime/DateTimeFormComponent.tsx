/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import DateTimeInput from "./DateTimeInput";
import { Label, LabelSizes } from "../../Typography";
import { useUid } from "../../../hooks";
import { useAppDispatch } from "../../../store/hooks";
import { setChildConfigTimeDependency } from "../../../store/reducers/parentChildReducer";
import { getTimestampStr } from "../../../utils/date-time-fns";

type Props = {
    name: string;
    label: string;
    labelSize?: LabelSizes;
    hint?: string;
    error?: string;
    isFuture?: boolean;
    noValidate?: boolean;
    isEdit?: boolean;
    setIncomplete?: (bool: boolean) => void;
    setError?: (bool: boolean) => void;
    // getData: ({ day, month, year, hour, minute }) => void;
    value?: {
        day: string | number;
        month: string | number;
        year: string | number;
        hour: string | number;
        minute: string | number;
    };
};

const DateTimeFormComponent = (props: Props) => {
    const dispatch = useAppDispatch();
    const noValidate = props.noValidate ?? false;
    const hasHint = !!props.hint;
    const labelSize = props.labelSize ?? LabelSizes.S;
    const id = useUid();
    const isFuture = props.isFuture ?? false;
    const [errorMsg, setErrorMsg] = useState("");
    const [day, setDay] = useState(props.value?.day ?? "");
    const [month, setMonth] = useState(props.value?.month ?? "");
    const [year, setYear] = useState(props.value?.year ?? "");
    const [hour, setHour] = useState(props.value?.hour ?? "");
    const [minute, setMinute] = useState(props.value?.minute ?? "");

    useEffect(() => {
        checkIfIncomplete();
        const date = getDateValue({
            day,
            month,
            year,
            hour,
            minute,
        });
        if (date.toString() !== "Invalid Date") {
            dispatch(
                setChildConfigTimeDependency({
                    isEdit: props.isEdit,
                    value: getTimestampStr(date),
                })
            );
        }
    }, [day, month, year, hour, minute]);

    useEffect(() => {
        if (errorMsg) {
            props?.setError?.(true);
        } else {
            props?.setError?.(false);
        }
    }, [errorMsg]);

    const checkIfIncomplete = () => {
        if (day || month || year || hour || minute) {
            if (day && month && year && hour && minute) {
                props?.setIncomplete?.(false);
            } else {
                props?.setIncomplete?.(true);
            }
        } else {
            props?.setIncomplete?.(false);
        }
    };

    const getDateValue = ({ day, month, year, hour, minute }) => {
        return new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hour),
            parseInt(minute)
        );
    };

    const checkErrors = (value, max, message) => {
        parseInt(value) > parseInt(max) && !noValidate
            ? setErrorMsg(message)
            : setErrorMsg("");
    };

    const onHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dayMonthYear = e.target.name.split("-");
        const lastItem = dayMonthYear[dayMonthYear.length - 1];
        const value = e.target.value;
        const currentYear = new Date().getFullYear().toString();
        const max = e.target.max;
        const febMaxDays = "29";
        const maxLength = e.target.maxLength;
        switch (lastItem) {
            case "day":
                setDay(value);
                checkErrors(value, max, "Date is invalid");
                return;
            case "month":
                setMonth(value);
                checkErrors(value, max, "Month is invalid");
                if (value === "2" || value === "02") {
                    checkErrors(
                        day,
                        febMaxDays,
                        "Date is invalid for February"
                    );
                }
                return;
            case "year":
                setYear(value);
                if (value.length == maxLength) {
                    isFuture &&
                    parseInt(value) < parseInt(currentYear) &&
                    !noValidate
                        ? setErrorMsg("Year is invalid")
                        : setErrorMsg("");
                }
                return;
            case "hour":
                setHour(value);
                checkErrors(value, max, "Hour is invalid");
                return;
            case "minute":
                setMinute(value);
                checkErrors(value, max, "Minute is invalid");
                return;
            default:
                return;
        }
    };

    return (
        <div
            className={`govuk-form-group ${
                errorMsg !== "" ? "govuk-form-group--error" : ""
            } govuk-!-margin-0`}
        >
            <h1 className="govuk-label-wrapper">
                <Label
                    text={props.label}
                    for={`${props.name}-${id}`}
                    size={labelSize}
                />
            </h1>
            {hasHint && (
                <div id={`${props.name}-hint-${id}`} className="govuk-hint">
                    {props.hint ?? ""}
                </div>
            )}
            {errorMsg !== "" && (
                <p
                    id={`${props.name}-error-${id}`}
                    className="govuk-error-message"
                >
                    <span className="govuk-visually-hidden">Error:</span>{" "}
                    {errorMsg ?? ""}
                </p>
            )}
            <DateTimeInput
                name={props.name}
                isFuture={props.isFuture}
                onChange={onHandleChange}
                day={day}
                month={month}
                year={year}
                hour={hour}
                minute={minute}
            />
        </div>
    );
};

export default DateTimeFormComponent;
