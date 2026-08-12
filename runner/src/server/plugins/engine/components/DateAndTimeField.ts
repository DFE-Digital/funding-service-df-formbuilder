import moment from "moment";
import { InputFieldsComponentsDef } from "@xgovformbuilder/model";
import { FormComponent } from "./FormComponent";
import { ComponentCollection } from "./ComponentCollection";
import { optionalText } from "./constants";
import { buildFormSchema } from "./helpers";
import {
    FormData,
    FormPayload,
    FormSubmissionErrors,
    FormSubmissionState,
} from "../types";
import { FormModel } from "../models";
import { DataType } from "server/plugins/engine/components/types";
import Joi from "joi";

export class DateAndTimeField extends FormComponent {
    formSchema;
    stateSchema;
    children: ComponentCollection;
    dataType = "date" as DataType;
    parts;

    constructor(def: InputFieldsComponentsDef, model: FormModel) {
        super(def, model);

        const { name, options } = this;
        const isRequired =
            "required" in options && options.required === false ? false : true;
        const optionalText = "optionalText" in options && options.optionalText;
        const { date, addTime } = def;
        const { hideDay, hideMonth, hideYear } = date ?? {};
        this.parts = {
            hasDay: hideDay === false,
            hasMonth: hideMonth === false,
            hasYear: hideYear === false,
            hasHour: !!addTime,
            hasMinute: !!addTime,
            hasAmPm: !!addTime,
        } as const;

        const fields: any[] = [];

        // Date parts
        if (hideDay === false) {
            const additionalClasses =
                hideYear && hideMonth ? "govuk-!-margin-right-4" : "";
            fields.push({
                type: "NumberField",
                name: `${name}__day`,
                title: "Day",
                schema: { min: 1, max: 31 },
                options: {
                    required: isRequired,
                    optionalText,
                    classes: `govuk-input--width-2 ${additionalClasses}`,
                },
                hint: "",
                prefixType: "",
                prefixValue: "",
                suffixValue: "",
                precision: 0,
            });
        }

        if (hideMonth === false) {
            const additionalClasses = hideYear ? "govuk-!-margin-right-4" : "";
            fields.push({
                type: "NumberField",
                name: `${name}__month`,
                title: "Month",
                schema: { min: 1, max: 12 },
                options: {
                    required: isRequired,
                    optionalText,
                    classes: `govuk-input--width-2 ${additionalClasses}`,
                },
                hint: "",
                prefixType: "",
                prefixValue: "",
                suffixValue: "",
                precision: 0,
            });
        }

        if (hideYear === false) {
            fields.push({
                type: "NumberField",
                name: `${name}__year`,
                title: "Year",
                schema: { min: 1000, max: 3000 },
                options: {
                    required: isRequired,
                    optionalText,
                    classes: "govuk-input--width-4 govuk-!-margin-right-4",
                },
                hint: "",
                prefixType: "",
                prefixValue: "",
                suffixValue: "",
                precision: 0,
            });
        }

        // Time parts
        if (addTime) {
            fields.push(
                {
                    type: "NumberField",
                    name: `${name}__hour`,
                    title: "Hour",
                    schema: { min: 1, max: 12 },
                    options: {
                        required: isRequired,
                        optionalText,
                        classes: "govuk-input--width-2",
                    },
                    hint: "",
                    prefixType: "",
                    prefixValue: "",
                    suffixValue: "",
                    precision: 0,
                },
                {
                    type: "NumberField",
                    name: `${name}__minute`,
                    title: "Minute",
                    schema: { min: 0, max: 59 },
                    options: {
                        required: isRequired,
                        optionalText,
                        classes: "govuk-input--width-2",
                    },
                    hint: "",
                    prefixType: "",
                    prefixValue: "",
                    suffixValue: "",
                    precision: 0,
                },
                {
                    type: "RadiosField",
                    name: `${name}__ampm`,
                    title: "Choose am or pm",
                    options: {
                        required: isRequired,
                        optionalText,
                        classes: "govuk-radios--inline",
                    },
                    list: "",
                    schema: {},
                }
            );
        }

        this.children = new ComponentCollection(fields, model);
        this.formSchema = buildFormSchema("string", this);
        if (isRequired) {
            this.stateSchema = Joi.any().strip();
        } else {
            this.stateSchema = Joi.any()
                .strip()
                .raw()
                .allow(null)
                .allow("")
                .default("")
                .optional();
        }
    }

    getFormSchemaKeys() {
        return this.children.getFormSchemaKeys();
    }

    getStateSchemaKeys() {
        const name = this.name;
        const { options } = this;

        const isRequired =
            "required" in options && options.required === false ? false : true;

        const {
            maxDaysInPast,
            maxDaysInFuture,
            dateRangeStart,
            dateRangeEnd,
        } = options as any;

        const {
            hasDay,
            hasMonth,
            hasYear,
            hasHour,
            hasMinute,
            hasAmPm,
        } = this.parts;

        // Build child-field schemas
        const childSchema: any = {};

        if (hasDay)
            childSchema[`${name}__day`] = isRequired
                ? Joi.number().min(1).max(31).required()
                : Joi.number()
                      .min(1)
                      .max(31)
                      .allow(null)
                      .allow("")
                      .default("")
                      .optional();

        if (hasMonth)
            childSchema[`${name}__month`] = isRequired
                ? Joi.number().min(1).max(12).required()
                : Joi.number()
                      .min(1)
                      .max(12)
                      .allow(null)
                      .allow("")
                      .default("")
                      .optional();

        if (hasYear)
            childSchema[`${name}__year`] = isRequired
                ? Joi.number().min(1000).max(3000).required()
                : Joi.number()
                      .min(1000)
                      .max(3000)
                      .allow(null)
                      .allow("")
                      .default("")
                      .optional();

        if (hasHour)
            childSchema[`${name}__hour`] = isRequired
                ? Joi.number().min(1).max(12).required()
                : Joi.number()
                      .min(1)
                      .max(12)
                      .allow(null)
                      .allow("")
                      .default("")
                      .optional();

        if (hasMinute)
            childSchema[`${name}__minute`] = isRequired
                ? Joi.number().min(0).max(59).required()
                : Joi.number()
                      .min(0)
                      .max(59)
                      .allow(null)
                      .allow("")
                      .default("")
                      .optional();

        if (hasAmPm)
            childSchema[`${name}__ampm`] = isRequired
                ? Joi.string().valid("am", "pm").required()
                : Joi.string()
                      .valid("am", "pm")
                      .allow(null)
                      .allow("")
                      .default("")
                      .optional();

        function parseDDMMYYYY(value: string): Date | null {
            if (!value || typeof value !== "string") return null;
            const [d, m, y] = value.split("/").map(Number);
            if (!d || !m || !y) return null;
            const dt = new Date(y, m - 1, d);
            return isNaN(dt.getTime()) ? null : dt;
        }

        // Format JS dates into human string (e.g., "1 February 2026")
        function formatHumanDate(date: Date): string {
            return moment(date).format("D MMMM YYYY");
        }

        function daysInMonth(year: number, month: number): number {
            return new Date(year, month, 0).getDate(); // month is 1–12
        }

        const startDate = parseDDMMYYYY(dateRangeStart);
        const endDate = parseDDMMYYYY(dateRangeEnd);

        // Build parent object schema with custom validator
        let schema = Joi.object(childSchema).custom((value, helpers) => {
            // Extract parts
            const year = hasYear ? value[`${name}__year`] : undefined;
            const month = hasMonth ? value[`${name}__month`] : undefined;
            const day = hasDay ? value[`${name}__day`] : undefined;

            const hasCompleteDate =
                (!hasYear || !!year) &&
                (!hasMonth || !!month) &&
                (!hasDay || !!day);

            // Optional field and no complete date → do not validate
            if (!isRequired && !hasCompleteDate) {
                return value;
            }

            // Only validate date ranges using the *date parts* (ignore time)
            let assembled: Date;

            if (hasCompleteDate) {
                const y = Number(year);
                const m = Number(month);
                const d = Number(day);

                // Calculate valid day limit for this month/year
                const maxDay = daysInMonth(y, m);

                if (d > maxDay) {
                    return helpers.error("date.invalidDayForMonth", {
                        maxDay,
                    });
                }

                assembled = new Date(y, m - 1, d);
            } else {
                // No date parts → nothing to validate
                return value;
            }

            const today = new Date();
            const todayMidnight = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );

            //
            // MAX DAYS IN PAST
            // The date must be strictly BEFORE today
            //
            if (hasCompleteDate && maxDaysInPast === "true") {
                if (assembled.getTime() >= todayMidnight.getTime()) {
                    return helpers.error("date.beforeToday", {
                        today: formatHumanDate(todayMidnight),
                    });
                }
            }

            //
            // MAX DAYS IN FUTURE
            // The date must be strictly AFTER today
            //
            if (hasCompleteDate && maxDaysInFuture === "true") {
                if (assembled.getTime() <= todayMidnight.getTime()) {
                    return helpers.error("date.afterToday", {
                        today: formatHumanDate(todayMidnight),
                    });
                }
            }

            //
            // DATE RANGE START + END
            //
            if (hasCompleteDate && startDate && endDate) {
                if (assembled < startDate || assembled > endDate) {
                    return helpers.error("date.rangeBetween", {
                        start: formatHumanDate(startDate),
                        end: formatHumanDate(endDate),
                    });
                }
            }

            //
            // ONLY START DATE
            //
            if (hasCompleteDate && startDate && !endDate) {
                if (assembled < startDate) {
                    return helpers.error("date.rangeMin", {
                        start: formatHumanDate(startDate),
                    });
                }
            }

            //
            // ONLY END DATE
            //
            if (hasCompleteDate && !startDate && endDate) {
                if (assembled > endDate) {
                    return helpers.error("date.rangeMax", {
                        end: formatHumanDate(endDate),
                    });
                }
            }

            return value;
        });

        if (!isRequired) {
            schema = schema.allow(null).allow("").default("").optional();
        }

        return { [name]: schema };
    }

    getFormDataFromState(state: FormSubmissionState) {
        const name = this.name;
        const container = state[name];

        if (!container || typeof container !== "object") return {};

        const {
            hasDay,
            hasMonth,
            hasYear,
            hasHour,
            hasMinute,
            hasAmPm,
        } = this.parts;

        const data: Record<string, any> = {};

        if (hasDay) data[`${name}__day`] = container[`${name}__day`];
        if (hasMonth) data[`${name}__month`] = container[`${name}__month`];
        if (hasYear) data[`${name}__year`] = container[`${name}__year`];
        if (hasHour) data[`${name}__hour`] = container[`${name}__hour`];
        if (hasMinute) data[`${name}__minute`] = container[`${name}__minute`];
        if (hasAmPm) data[`${name}__ampm`] = container[`${name}__ampm`];

        return data;
    }

    getStateValueFromValidForm(payload: FormPayload) {
        return this.children.getStateFromValidForm(payload);
    }

    getDisplayStringFromState(state: FormSubmissionState) {
        const name = this.name;
        const container = state[name];
        if (!container || typeof container !== "object") return "";

        const {
            hasDay,
            hasMonth,
            hasYear,
            hasHour,
            hasMinute,
            hasAmPm,
        } = this.parts;

        const day = hasDay ? container[`${name}__day`] : undefined;
        const month = hasMonth ? container[`${name}__month`] : undefined;
        const year = hasYear ? container[`${name}__year`] : undefined;
        const hour = hasHour ? container[`${name}__hour`] : undefined;
        const minute = hasMinute ? container[`${name}__minute`] : undefined;
        const ampm = hasAmPm ? container[`${name}__ampm`] : undefined;

        if (hasYear && year == null) return "";
        if (hasMonth && month == null) return "";
        if (hasDay && day == null) return "";
        if (hasHour && (hour == null || hour === "")) return "";
        if (hasMinute && (minute == null || minute === "")) return "";
        if (hasAmPm && (ampm == null || ampm === "")) return "";


        let normalisedHour = 0;

        if (hasHour) {
            normalisedHour = hour;

            if (hasAmPm) {
                const lower = ampm.toLowerCase().trim();
                if (lower === "pm" && hour !== 12) normalisedHour += 12;
                if (lower === "am" && hour === 12) normalisedHour = 0;
            }
        }

        const m = moment({
            year: hasYear ? year : 2000,
            month: hasMonth ? month - 1 : 0,
            day: hasDay ? day : 1,
            hour: hasHour ? normalisedHour : 0,
            minute: hasMinute ? minute : 0,
        });
        if (!m.isValid()) return "";

        const dateFormatParts: string[] = [];
        if (hasDay) dateFormatParts.push("D");
        if (hasMonth) dateFormatParts.push("MMMM");
        if (hasYear) dateFormatParts.push("YYYY");

        let timeFormat = "";
        if (hasHour && hasMinute && hasAmPm) {
            timeFormat = "h:mma";
        }

        const finalFormat =
            timeFormat.length > 0
                ? `${dateFormatParts.join(" ")} ${timeFormat}`
                : dateFormatParts.join(" ");

        return m.format(finalFormat);
    }

    // @ts-ignore - eslint does not report this as an error, only tsc
    getViewModel(formData: FormData, errors: FormSubmissionErrors) {
        const viewModel = super.getViewModel(formData, errors);
        //@ts-ignore
        this.children.getFormDataFromState(formData);
        // Use the component collection to generate the subitems
        const componentViewModels = this.children
            .getViewModel(formData, errors)
            .map((vm) => vm.model);

        componentViewModels?.forEach((componentViewModel) => {
            // Nunjucks macro expects label to be a string for this component
            componentViewModel.label = componentViewModel.label?.text?.replace(
                optionalText,
                ""
            ) as any;

            if (componentViewModel.type !== "number") {
                componentViewModel.items?.push(
                    {
                        text: "am",
                        value: "am",
                        checked:
                            "am" ===
                                `${
                                    formData?.value?.[
                                        `${componentViewModel.name}`
                                    ]
                                }` ||
                            "am" ===
                                `${formData?.[`${componentViewModel.name}`]}`,
                    },
                    {
                        text: "pm",
                        value: "pm",
                        checked:
                            "pm" ===
                                `${
                                    formData.value?.[
                                        `${componentViewModel.name}`
                                    ]
                                }` ||
                            "pm" ===
                                `${formData?.[`${componentViewModel.name}`]}`,
                    }
                );
            }

            if (componentViewModel.errorMessage) {
                componentViewModel.classes += " govuk-input--error";
            }
        });
        const firstError = errors?.errorList?.filter(
            (error) => error.name.slice(0, 6) === this.name
        )[0];
        const errorMessage = firstError && { text: firstError?.text };

        return {
            ...viewModel,
            errorMessage,
            fieldset: {
                legend: viewModel.label,
            },
            items: componentViewModels,
        };
    }
}
