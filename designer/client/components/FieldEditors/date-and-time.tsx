import React, {
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef,
} from "react";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Actions } from "../../reducers/component/types";
import { CssClasses } from "../CssClasses";
import { i18n } from "../../i18n";
import { Spacing, SpacingUnit } from "../../ui";
import "./date-and-time.scss";

type Props = {
    context: any; // TODO
};
export const AdditionalSettings = ({
    dateConfigType,
    setDateConfigType,
    rangeStartDay,
    rangeStartMonth,
    rangeStartYear,
    rangeEndDay,
    rangeEndMonth,
    rangeEndYear,
    setRangeStartDay,
    setRangeStartMonth,
    setRangeStartYear,
    setRangeEndDay,
    setRangeEndMonth,
    setRangeEndYear,
}) => {
    return (
        <div className="date-and-time-field govuk-!-margin-bottom-5">
            <h4 className="govuk-label-wrapper">
                <label
                    className="govuk-label govuk-label--s"
                    htmlFor="date-config-legend"
                >
                    {i18n("dateTime.additionalSettings.title")}
                </label>
            </h4>
            <div className="govuk-radios" data-module="govuk-radios">
                {/* Date must be before today */}
                <div className="govuk-radios__item">
                    <input
                        className="govuk-radios__input"
                        id="date-before-today"
                        name="date-config"
                        type="radio"
                        value="past"
                        checked={dateConfigType === "past"}
                        onChange={() => setDateConfigType("past")}
                    />
                    <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="date-before-today"
                    >
                        {i18n(
                            "dateTime.additionalSettings.pastDatesOption.title"
                        )}
                    </label>
                    <span className="govuk-hint govuk-radios__hint">
                        {i18n(
                            "dateTime.additionalSettings.pastDatesOption.helpText"
                        )}
                    </span>
                </div>

                {/* Date must be after today */}
                <div className="govuk-radios__item">
                    <input
                        className="govuk-radios__input"
                        id="date-after-today"
                        name="date-config"
                        type="radio"
                        value="future"
                        checked={dateConfigType === "future"}
                        onChange={() => setDateConfigType("future")}
                    />
                    <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="date-after-today"
                    >
                        {i18n(
                            "dateTime.additionalSettings.futureDatesOption.title"
                        )}
                    </label>
                    <span className="govuk-hint govuk-radios__hint">
                        {i18n(
                            "dateTime.additionalSettings.futureDatesOption.helpText"
                        )}
                    </span>
                </div>

                {/* Date must be within this date range */}
                <div className="govuk-radios__item date-range-options">
                    <input
                        className="govuk-radios__input"
                        id="date-range"
                        name="date-config"
                        type="radio"
                        value="range"
                        checked={dateConfigType === "range"}
                        onChange={() => setDateConfigType("range")}
                    />
                    <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="date-range"
                    >
                        {i18n("dateTime.additionalSettings.dateRange.title")}
                    </label>
                    <span className="govuk-hint govuk-radios__hint">
                        {i18n("dateTime.additionalSettings.dateRange.helpText")}
                    </span>

                    {dateConfigType === "range" && (
                        <div className="govuk-radios__conditional date-time-container">
                            <Spacing mb={SpacingUnit.Three} />

                            <div className="govuk-form-group">
                                <div className="date-range-container">
                                    {/* Start Date */}
                                    <div className="date-group">
                                        <div className="govuk-form-group">
                                            <label
                                                htmlFor="range-start-day"
                                                className="govuk-label govuk-body"
                                            >
                                                Day
                                            </label>
                                            <input
                                                className="govuk-input govuk-input--width-2"
                                                id="range-start-day"
                                                name="range-start-day"
                                                type="text"
                                                inputMode="numeric"
                                                value={rangeStartDay}
                                                onChange={(e) =>
                                                    setRangeStartDay(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="govuk-form-group">
                                            <label
                                                htmlFor="range-start-month"
                                                className="govuk-label govuk-body"
                                            >
                                                Month
                                            </label>
                                            <input
                                                className="govuk-input govuk-input--width-2"
                                                id="range-start-month"
                                                name="range-start-month"
                                                type="text"
                                                inputMode="numeric"
                                                value={rangeStartMonth}
                                                onChange={(e) =>
                                                    setRangeStartMonth(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="govuk-form-group">
                                            <label
                                                htmlFor="range-start-year"
                                                className="govuk-label govuk-body"
                                            >
                                                Year
                                            </label>
                                            <input
                                                className="govuk-input govuk-input--width-4"
                                                id="range-start-year"
                                                name="range-start-year"
                                                type="text"
                                                inputMode="numeric"
                                                value={rangeStartYear}
                                                onChange={(e) =>
                                                    setRangeStartYear(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* "and" separator */}
                                    <div className="date-separator">
                                        <span className="govuk-body">and</span>
                                    </div>

                                    {/* End Date */}
                                    <div className="date-group">
                                        <div className="govuk-form-group">
                                            <label
                                                htmlFor="range-end-day"
                                                className="govuk-label govuk-body"
                                            >
                                                Day
                                            </label>
                                            <input
                                                className="govuk-input govuk-input--width-2"
                                                id="range-end-day"
                                                name="range-end-day"
                                                type="text"
                                                inputMode="numeric"
                                                value={rangeEndDay}
                                                onChange={(e) =>
                                                    setRangeEndDay(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="govuk-form-group">
                                            <label
                                                htmlFor="range-end-month"
                                                className="govuk-label govuk-body"
                                            >
                                                Month
                                            </label>
                                            <input
                                                className="govuk-input govuk-input--width-2"
                                                id="range-end-month"
                                                name="range-end-month"
                                                type="text"
                                                inputMode="numeric"
                                                value={rangeEndMonth}
                                                onChange={(e) =>
                                                    setRangeEndMonth(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="govuk-form-group">
                                            <label
                                                htmlFor="range-end-year"
                                                className="govuk-label govuk-body"
                                            >
                                                Year
                                            </label>
                                            <input
                                                className="govuk-input govuk-input--width-4"
                                                id="range-end-year"
                                                name="range-end-year"
                                                type="text"
                                                inputMode="numeric"
                                                value={rangeEndYear}
                                                onChange={(e) =>
                                                    setRangeEndYear(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="govuk-form-group govuk-!-margin-left-3">or</div>

                {/* Date must be none */}
                <div className="govuk-radios__item">
                    <input
                        className="govuk-radios__input"
                        id="date-none"
                        name="date-config"
                        type="radio"
                        value="future"
                        checked={dateConfigType === "none"}
                        onChange={() => setDateConfigType("none")}
                    />
                    <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="date-none"
                    >
                        {i18n("dateTime.additionalSettings.none.title")}
                    </label>
                </div>
            </div>
        </div>
    );
};

const DateAndTimeFieldEdit = ({ context = ComponentContext }: Props) => {
    // If you are editing a component, the default context will be ComponentContext because props.context is undefined,
    // but if you editing a component which is a children of a list based component, then the props.context is the ListContext.
    const { state, dispatch } = useContext(context);
    const { selectedComponent } = state;

    const existingDate = selectedComponent?.date || {};

    const [addDate, setAddDate] = useState<boolean>(
        Object.keys(existingDate).length > 0
    );
    const [hideDay, setHideDay] = useState<boolean>(!!existingDate.hideDay);
    const [hideMonth, setHideMonth] = useState<boolean>(
        !!existingDate.hideMonth
    );
    const [hideYear, setHideYear] = useState<boolean>(!!existingDate.hideYear);
    const [addTime, setAddTime] = useState<boolean>(
        !!selectedComponent?.addTime
    );
    const [hint, setHint] = useState<string>(selectedComponent?.hint || "");

    const existingAdditionalSettings = selectedComponent?.options || {};
    const [dateConfigType, setDateConfigType] = useState<string>(
        existingAdditionalSettings?.maxDaysInPast === "false" &&
            existingAdditionalSettings?.maxDaysInFuture === "false"
            ? "none"
            : existingAdditionalSettings?.maxDaysInPast === "true"
            ? "past"
            : existingAdditionalSettings?.maxDaysInFuture === "true"
            ? "future"
            : existingAdditionalSettings?.dateRangeStart ||
              existingAdditionalSettings?.dateRangeEnd
            ? "range"
            : ""
    );
    const [rangeStartDay, setRangeStartDay] = useState<string>("");
    const [rangeStartMonth, setRangeStartMonth] = useState<string>("");
    const [rangeStartYear, setRangeStartYear] = useState<string>("");
    const [rangeEndDay, setRangeEndDay] = useState<string>("");
    const [rangeEndMonth, setRangeEndMonth] = useState<string>("");
    const [rangeEndYear, setRangeEndYear] = useState<string>("");

    // Ref to prevent re-dispatching our own changes
    const isSyncingRef = useRef(false);

    // Build payload without componentEdited - create fresh object
    const buildPayload = useCallback(
        (overrides: any = {}) => {
            // Build a completely fresh payload object - DO NOT spread selectedComponent
            const freshPayload: any = {};

            // Only add the base properties we care about
            if (selectedComponent?.name) {
                freshPayload.name = selectedComponent.name;
            }
            if (selectedComponent?.type) {
                freshPayload.type = selectedComponent.type;
            }
            if (selectedComponent?.title) {
                freshPayload.title = selectedComponent.title;
            }
            if (selectedComponent?.hint) {
                freshPayload.hint = selectedComponent.hint;
            }

            // Handle options - create fresh object, never include componentEdited
            freshPayload.options = {};
            if (
                selectedComponent?.options &&
                typeof selectedComponent.options === "object"
            ) {
                Object.keys(selectedComponent.options).forEach((key) => {
                    if (key !== "componentEdited") {
                        freshPayload.options[key] =
                            selectedComponent.options[key];
                    }
                });
            }

            // Handle date - create fresh object
            if (
                selectedComponent?.date &&
                typeof selectedComponent.date === "object"
            ) {
                freshPayload.date = {};
                Object.keys(selectedComponent.date).forEach((key) => {
                    if (key !== "componentEdited") {
                        freshPayload.date[key] = selectedComponent.date[key];
                    }
                });
            }

            // Add addTime if it exists
            if (selectedComponent?.addTime !== undefined) {
                freshPayload.addTime = selectedComponent.addTime;
            }

            // Safely handle overrides - never allow componentEdited
            if (overrides && typeof overrides === "object") {
                Object.keys(overrides).forEach((key) => {
                    if (key === "componentEdited") {
                        return; // Skip componentEdited entirely
                    }

                    const value = overrides[key];

                    // Handle nested objects
                    if (
                        value &&
                        typeof value === "object" &&
                        !Array.isArray(value)
                    ) {
                        // For objects like options or date, merge carefully
                        if (key === "options" || key === "date") {
                            freshPayload[key] = {};
                            // First merge existing
                            if (
                                freshPayload[key] &&
                                typeof freshPayload[key] === "object"
                            ) {
                                Object.keys(freshPayload[key]).forEach((k) => {
                                    if (k !== "componentEdited") {
                                        freshPayload[key][k] =
                                            freshPayload[key][k];
                                    }
                                });
                            }
                            // Then merge overrides
                            Object.keys(value).forEach((k) => {
                                if (k !== "componentEdited") {
                                    freshPayload[key][k] = value[k];
                                }
                            });
                        } else {
                            freshPayload[key] = value;
                        }
                    } else {
                        freshPayload[key] = value;
                    }
                });
            }

            // Final safety: ensure componentEdited doesn't exist anywhere
            delete freshPayload.componentEdited;
            if (freshPayload.options) {
                delete freshPayload.options.componentEdited;
            }
            if (freshPayload.date) {
                delete freshPayload.date.componentEdited;
            }

            return freshPayload;
        },
        [selectedComponent]
    );

    // Only sync state when selectedComponent changes from outside (not our dispatch)
    useEffect(() => {
        if (isSyncingRef.current) {
            isSyncingRef.current = false;
            return;
        }

        // Safety: ensure selectedComponent doesn't have nested componentEdited - if it does, dispatch a clean version
        if (selectedComponent?.componentEdited) {
            // Use buildPayload to create a completely clean payload
            const cleanedPayload = buildPayload();
            isSyncingRef.current = true;
            dispatch({
                type: Actions.SET_COMPONENT,
                payload: cleanedPayload,
            });
            return;
        }

        const d = selectedComponent?.date || {};
        setAddDate(Object.keys(d).length > 0);
        setHideDay(!!d.hideDay);
        setHideMonth(!!d.hideMonth);
        setHideYear(!!d.hideYear);
        setAddTime(!!selectedComponent?.addTime);
        setHint(selectedComponent?.hint || "");

        const additionalSettings = selectedComponent?.options || {};
        const newDateConfigType =
            additionalSettings?.maxDaysInPast === "false" &&
            additionalSettings?.maxDaysInFuture === "false"
                ? "none"
                : additionalSettings?.maxDaysInPast === "true"
                ? "past"
                : additionalSettings?.maxDaysInFuture === "true"
                ? "future"
                : additionalSettings?.dateRangeStart ||
                  additionalSettings?.dateRangeEnd
                ? "range"
                : "";
        setDateConfigType(newDateConfigType);

        // Populate range date fields from existing values
        if (newDateConfigType === "range") {
            const startDate = additionalSettings?.dateRangeStart;
            const endDate = additionalSettings?.dateRangeEnd;

            if (startDate) {
                const [startDay, startMonth, startYear] = startDate.split("/");
                setRangeStartDay(startDay || "");
                setRangeStartMonth(startMonth || "");
                setRangeStartYear(startYear || "");
            } else {
                setRangeStartDay("");
                setRangeStartMonth("");
                setRangeStartYear("");
            }

            if (endDate) {
                const [endDay, endMonth, endYear] = endDate.split("/");
                setRangeEndDay(endDay || "");
                setRangeEndMonth(endMonth || "");
                setRangeEndYear(endYear || "");
            } else {
                setRangeEndDay("");
                setRangeEndMonth("");
                setRangeEndYear("");
            }
        } else {
            // Clear range values if not in range mode
            setRangeStartDay("");
            setRangeStartMonth("");
            setRangeStartYear("");
            setRangeEndDay("");
            setRangeEndMonth("");
            setRangeEndYear("");
        }
    }, [selectedComponent, dispatch, buildPayload]);

    // Handler for date config type radio button changes
    const handleDateConfigTypeChange = useCallback(
        (newType: string) => {
            setDateConfigType(newType);

            const payload = buildPayload({
                options: {
                    ...selectedComponent?.options,
                },
            });

            // Clear all date-related options first
            delete payload.options.maxDaysInPast;
            delete payload.options.maxDaysInFuture;
            delete payload.options.dateRangeStart;
            delete payload.options.dateRangeEnd;

            // Set options based on selected config type
            if (newType === "none") {
                payload.options.maxDaysInPast = false;
                payload.options.maxDaysInFuture = false;
            } else if (newType === "past") {
                payload.options.maxDaysInPast = true;
                payload.options.maxDaysInFuture = false;
            } else if (newType === "future") {
                payload.options.maxDaysInPast = false;
                payload.options.maxDaysInFuture = true;
            } else if (newType === "range") {
                const hasDateValue =
                    rangeStartDay ||
                    rangeStartMonth ||
                    rangeStartYear ||
                    rangeEndDay ||
                    rangeEndMonth ||
                    rangeEndYear;

                if (hasDateValue) {
                    payload.options.dateRangeStart =
                        rangeStartDay && rangeStartMonth && rangeStartYear
                            ? `${rangeStartDay}/${rangeStartMonth}/${rangeStartYear}`
                            : null;
                    payload.options.dateRangeEnd =
                        rangeEndDay && rangeEndMonth && rangeEndYear
                            ? `${rangeEndDay}/${rangeEndMonth}/${rangeEndYear}`
                            : null;
                }
            }

            isSyncingRef.current = true;
            dispatch({
                type: Actions.SET_COMPONENT,
                payload,
            });
        },
        [
            selectedComponent,
            buildPayload,
            rangeStartDay,
            rangeStartMonth,
            rangeStartYear,
            rangeEndDay,
            rangeEndMonth,
            rangeEndYear,
            dispatch,
        ]
    );

    // Handlers for range date inputs
    const handleRangeStartDayChange = useCallback(
        (value: string) => {
            setRangeStartDay(value);

            if (dateConfigType === "range") {
                const payload = buildPayload({
                    options: {
                        ...selectedComponent?.options,
                        dateRangeStart:
                            value && rangeStartMonth && rangeStartYear
                                ? `${value}/${rangeStartMonth}/${rangeStartYear}`
                                : null,
                    },
                });

                isSyncingRef.current = true;
                dispatch({
                    type: Actions.SET_COMPONENT,
                    payload,
                });
            }
        },
        [
            dateConfigType,
            selectedComponent,
            buildPayload,
            rangeStartMonth,
            rangeStartYear,
            dispatch,
        ]
    );

    const handleRangeStartMonthChange = useCallback(
        (value: string) => {
            setRangeStartMonth(value);

            if (dateConfigType === "range") {
                const payload = buildPayload({
                    options: {
                        ...selectedComponent?.options,
                        dateRangeStart:
                            rangeStartDay && value && rangeStartYear
                                ? `${rangeStartDay}/${value}/${rangeStartYear}`
                                : null,
                    },
                });

                isSyncingRef.current = true;
                dispatch({
                    type: Actions.SET_COMPONENT,
                    payload,
                });
            }
        },
        [
            dateConfigType,
            selectedComponent,
            buildPayload,
            rangeStartDay,
            rangeStartYear,
            dispatch,
        ]
    );

    const handleRangeStartYearChange = useCallback(
        (value: string) => {
            setRangeStartYear(value);

            if (dateConfigType === "range") {
                const payload = buildPayload({
                    options: {
                        ...selectedComponent?.options,
                        dateRangeStart:
                            rangeStartDay && rangeStartMonth && value
                                ? `${rangeStartDay}/${rangeStartMonth}/${value}`
                                : null,
                    },
                });

                isSyncingRef.current = true;
                dispatch({
                    type: Actions.SET_COMPONENT,
                    payload,
                });
            }
        },
        [
            dateConfigType,
            selectedComponent,
            buildPayload,
            rangeStartDay,
            rangeStartMonth,
            dispatch,
        ]
    );

    const handleRangeEndDayChange = useCallback(
        (value: string) => {
            setRangeEndDay(value);

            if (dateConfigType === "range") {
                const payload = buildPayload({
                    options: {
                        ...selectedComponent?.options,
                        dateRangeEnd:
                            value && rangeEndMonth && rangeEndYear
                                ? `${value}/${rangeEndMonth}/${rangeEndYear}`
                                : null,
                    },
                });

                isSyncingRef.current = true;
                dispatch({
                    type: Actions.SET_COMPONENT,
                    payload,
                });
            }
        },
        [
            dateConfigType,
            selectedComponent,
            buildPayload,
            rangeEndMonth,
            rangeEndYear,
            dispatch,
        ]
    );

    const handleRangeEndMonthChange = useCallback(
        (value: string) => {
            setRangeEndMonth(value);

            if (dateConfigType === "range") {
                const payload = buildPayload({
                    options: {
                        ...selectedComponent?.options,
                        dateRangeEnd:
                            rangeEndDay && value && rangeEndYear
                                ? `${rangeEndDay}/${value}/${rangeEndYear}`
                                : null,
                    },
                });

                isSyncingRef.current = true;
                dispatch({
                    type: Actions.SET_COMPONENT,
                    payload,
                });
            }
        },
        [
            dateConfigType,
            selectedComponent,
            buildPayload,
            rangeEndDay,
            rangeEndYear,
            dispatch,
        ]
    );

    const handleRangeEndYearChange = useCallback(
        (value: string) => {
            setRangeEndYear(value);

            if (dateConfigType === "range") {
                const payload = buildPayload({
                    options: {
                        ...selectedComponent?.options,
                        dateRangeEnd:
                            rangeEndDay && rangeEndMonth && value
                                ? `${rangeEndDay}/${rangeEndMonth}/${value}`
                                : null,
                    },
                });

                isSyncingRef.current = true;
                dispatch({
                    type: Actions.SET_COMPONENT,
                    payload,
                });
            }
        },
        [
            dateConfigType,
            selectedComponent,
            buildPayload,
            rangeEndDay,
            rangeEndMonth,
            dispatch,
        ]
    );

    // Handler for add date checkbox
    const handleAddDateChange = useCallback(
        (checked: boolean) => {
            setAddDate(checked);

            if (!checked) {
                setHideDay(false);
                setHideMonth(false);
                setHideYear(false);
            }

            const payload = buildPayload({
                date: {
                    hideDay: !checked ? false : hideDay,
                    hideMonth: !checked ? false : hideMonth,
                    hideYear: !checked ? false : hideYear,
                },
            });

            !checked && delete payload.date;

            isSyncingRef.current = true;
            dispatch({
                type: Actions.SET_COMPONENT,
                payload,
            });
        },
        [buildPayload, hideDay, hideMonth, hideYear, dispatch]
    );

    // Handlers for date checkboxes
    const handleHideDayChange = useCallback(
        (checked: boolean) => {
            setHideDay(checked);

            const payload = buildPayload({
                date: {
                    ...selectedComponent?.date,
                    hideDay: checked,
                },
            });

            isSyncingRef.current = true;
            dispatch({
                type: Actions.SET_COMPONENT,
                payload,
            });
        },
        [buildPayload, selectedComponent, dispatch]
    );

    const handleHideMonthChange = useCallback(
        (checked: boolean) => {
            setHideMonth(checked);

            const payload = buildPayload({
                date: {
                    ...selectedComponent?.date,
                    hideMonth: checked,
                },
            });

            isSyncingRef.current = true;
            dispatch({
                type: Actions.SET_COMPONENT,
                payload,
            });
        },
        [buildPayload, selectedComponent, dispatch]
    );

    const handleHideYearChange = useCallback(
        (checked: boolean) => {
            setHideYear(checked);

            const payload = buildPayload({
                date: {
                    ...selectedComponent?.date,
                    hideYear: checked,
                },
            });

            isSyncingRef.current = true;
            dispatch({
                type: Actions.SET_COMPONENT,
                payload,
            });
        },
        [buildPayload, selectedComponent, dispatch]
    );

    // Handler for add time checkbox
    const handleAddTimeChange = useCallback(
        (checked: boolean) => {
            setAddTime(checked);

            const payload = buildPayload({
                addTime: checked,
            });

            isSyncingRef.current = true;
            dispatch({
                type: Actions.SET_COMPONENT,
                payload,
            });
        },
        [buildPayload, dispatch]
    );

    return (
        <div>
            <Spacing mb={SpacingUnit.Six} />
            <h4 className="govuk-label-wrapper">
                <label
                    className="govuk-label govuk-label--s"
                    htmlFor={`tab-dropdown-section`}
                >
                    {i18n("dateTime.selectDateTime")}
                </label>
            </h4>
            <div id={`tab-dropdown-section-hint`} className="govuk-hint">
                {i18n("dateTime.selectDateTimeHint")}
            </div>

            <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                <div className="govuk-checkboxes__item govuk-!-margin-top-5">
                    <input
                        className="govuk-checkboxes__input"
                        id="add-date"
                        name="add-date"
                        type="checkbox"
                        value={String(addDate)}
                        checked={addDate}
                        onChange={(e) => handleAddDateChange(e.target.checked)}
                    />
                    <label
                        className="govuk-label govuk-checkboxes__label"
                        htmlFor="add-date"
                    >
                        {i18n("dateTime.addDateOption.title")}
                    </label>
                    <span className="govuk-hint govuk-checkboxes__hint">
                        {i18n("dateTime.addDateOption.helpText")}
                    </span>
                </div>

                {addDate && (
                    <div className="govuk-checkboxes__conditional">
                        <div className="govuk-checkboxes__item">
                            <input
                                className="govuk-checkboxes__input"
                                id="hide-day"
                                name="hide-day"
                                type="checkbox"
                                checked={hideDay}
                                onChange={(e) =>
                                    handleHideDayChange(e.target.checked)
                                }
                            />
                            <label
                                className="govuk-body govuk-checkboxes__label"
                                htmlFor="hide-day"
                            >
                                {i18n("dateTime.hideDayOption.title")}
                            </label>
                            <span className="govuk-hint govuk-checkboxes__hint">
                                {i18n("dateTime.hideDayOption.helpText")}
                            </span>
                        </div>
                        <div className="govuk-checkboxes__item">
                            <input
                                className="govuk-checkboxes__input"
                                id="hide-month"
                                name="hide-month"
                                type="checkbox"
                                checked={hideMonth}
                                onChange={(e) =>
                                    handleHideMonthChange(e.target.checked)
                                }
                            />
                            <label
                                className="govuk-body govuk-checkboxes__label"
                                htmlFor="hide-month"
                            >
                                {i18n("dateTime.hideMonthOption.title")}
                            </label>
                            <span className="govuk-hint govuk-checkboxes__hint">
                                {i18n("dateTime.hideMonthOption.helpText")}
                            </span>
                        </div>
                        <div className="govuk-checkboxes__item">
                            <input
                                className="govuk-checkboxes__input"
                                id="hide-year"
                                name="hide-year"
                                type="checkbox"
                                checked={hideYear}
                                onChange={(e) =>
                                    handleHideYearChange(e.target.checked)
                                }
                            />
                            <label
                                className="govuk-body govuk-checkboxes__label"
                                htmlFor="hide-year"
                            >
                                {i18n("dateTime.hideYearOption.title")}
                            </label>
                            <span className="govuk-hint govuk-checkboxes__hint">
                                {i18n("dateTime.hideYearOption.helpText")}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <Spacing mb={SpacingUnit.Six} />

            <div className="govuk-checkboxes__item govuk-!-margin-top-5">
                <input
                    className="govuk-checkboxes__input"
                    id="add-time"
                    name="add-time"
                    type="checkbox"
                    value={String(addTime)}
                    checked={addTime}
                    onChange={(e) => handleAddTimeChange(e.target.checked)}
                />
                <label
                    className="govuk-label govuk-checkboxes__label"
                    htmlFor="add-time"
                >
                    {i18n("dateTime.addTimeOption.title")}
                </label>
                <span className="govuk-hint govuk-checkboxes__hint">
                    {i18n("dateTime.addTimeOption.helpText")}
                </span>
            </div>

            <Spacing mb={SpacingUnit.Six} />

            <details className="govuk-details">
                <summary className="govuk-details__summary">
                    <span className="govuk-details__summary-text">
                        {i18n("common.detailsLink.title")}
                    </span>
                </summary>
                <div className="govuk-details__text">
                    <AdditionalSettings
                        dateConfigType={dateConfigType}
                        setDateConfigType={handleDateConfigTypeChange}
                        rangeStartDay={rangeStartDay}
                        rangeStartMonth={rangeStartMonth}
                        rangeStartYear={rangeStartYear}
                        rangeEndDay={rangeEndDay}
                        rangeEndMonth={rangeEndMonth}
                        rangeEndYear={rangeEndYear}
                        setRangeStartDay={handleRangeStartDayChange}
                        setRangeStartMonth={handleRangeStartMonthChange}
                        setRangeStartYear={handleRangeStartYearChange}
                        setRangeEndDay={handleRangeEndDayChange}
                        setRangeEndMonth={handleRangeEndMonthChange}
                        setRangeEndYear={handleRangeEndYearChange}
                    />
                </div>
            </details>
        </div>
    );
};

export default DateAndTimeFieldEdit;
