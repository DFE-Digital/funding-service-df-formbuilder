import React, { useState, useEffect } from "react";
import { DateDirections, RelativeTimeValue } from "@xgovformbuilder/model";

const RelativeTimeValues = (props) => {
    const [timePeriod, setTimePeriod] = useState(props.value?.timePeriod);
    const [timeUnits, setTimeUnits] = useState(props.value?.timeUnit);
    const [direction, setDirection] = useState(props.value?.direction);

    useEffect(() => {
        if (timePeriod && timeUnits && direction) {
            props.updateValue(
                new RelativeTimeValue(
                    timePeriod,
                    timeUnits,
                    direction,
                    props.timeOnly || false
                )
            );
        }
    }, [timePeriod, timeUnits, direction, props]);

    return (
        <div>
            <input
                className="govuk-input govuk-input--width-20"
                id="cond-value-period"
                name="cond-value-period"
                type="text"
                defaultValue={timePeriod}
                required
                onChange={(e) => setTimePeriod(e.target.value)}
                data-testid="cond-value-period"
            />

            <select
                className="govuk-select"
                id="cond-value-units"
                name="cond-value-units"
                value={timeUnits ?? ""}
                onChange={(e) => setTimeUnits(e.target.value)}
                data-testid="cond-value-units"
            >
                <option />
                {Object.values(props.units).map((unit) => {
                    return (
                        <option key={unit.value} value={unit.value}>
                            {unit.display}
                        </option>
                    );
                })}
            </select>

            <select
                className="govuk-select"
                id="cond-value-direction"
                name="cond-value-direction"
                value={direction ?? ""}
                onChange={(e) => setDirection(e.target.value)}
                data-testid="cond-value-direction"
            >
                <option />
                {Object.values(DateDirections).map((direction) => {
                    return (
                        <option key={direction} value={direction}>
                            {direction}
                        </option>
                    );
                })}
            </select>
        </div>
    );
};

export default RelativeTimeValues;
