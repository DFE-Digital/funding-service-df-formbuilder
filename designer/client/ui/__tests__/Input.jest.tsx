import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import {
    RadioInput,
    RadioFormComponent,
    SelectInput,
    TextInput,
    DateInput,
    DateTimeInput,
    MultilineTextInput,
    CheckboxFormComponent,
    DateTimeFormComponent,
    SelectFormComponent,
    TextInputWidth,
    TextFormComponent,
    CheckboxInput,
    MultilineFormComponent,
    AutocompleteOptions,
    AutocompleteInput,
} from "../Input";
import { LabelSizes, LegendSizes } from "../Typography";
import { Provider } from "react-redux";
import store from "../../store";
import userEvent from "@testing-library/user-event";

describe("Input Components", () => {
    describe("AutocompleteInput", () => {
        const options: AutocompleteOptions[] = [
            { id: "a", title: "Alpha" },
            { id: "b", title: "Beta 123" },
            { id: "c", title: "Alphanumeric" },
            { id: "none", title: "None" },
        ];

        test("renders inside govuk-form-group and toggles error class with hasError", () => {
            const { container, rerender } = render(
                <AutocompleteInput
                    id="test"
                    name="field"
                    value=""
                    options={options}
                    onChange={jest.fn()}
                />
            );
            const root = container.querySelector(".govuk-form-group");
            expect(root).toBeInTheDocument();
            expect(root).not.toHaveClass("govuk-form-group--error");

            rerender(
                <AutocompleteInput
                    id="test"
                    name="field"
                    value=""
                    options={options}
                    onChange={jest.fn()}
                    hasError
                />
            );
            const errorRoot = container.querySelector(".govuk-form-group");
            expect(errorRoot).toHaveClass("govuk-form-group--error");
        });

        test("prefills input with default label for selected value", async () => {
            render(
                <AutocompleteInput
                    id="test"
                    name="field"
                    value="a"
                    options={options}
                    onChange={jest.fn()}
                />
            );

            const input = screen.getByRole("combobox") as HTMLInputElement;
            expect(input).toHaveAttribute("id", "field-test");
            expect(input.value).toBe("Alpha");
        });

        test("applies inputClasses and menuClasses, and sets menu data-heading via menuAttributes", async () => {
            render(
                <AutocompleteInput
                    id="test"
                    name="field"
                    value=""
                    options={options}
                    onChange={jest.fn()}
                    inputClasses="extra-input"
                    menuClasses="extra-menu"
                    headingText="Pick a value"
                />
            );

            const input = screen.getByRole("combobox");
            expect(input).toHaveClass("extra-input");

            await userEvent.type(input, "al");

            const listbox = await screen.findByRole("listbox");
            expect(listbox).toHaveClass("extra-menu");
            expect(listbox).toHaveAttribute("data-heading", "Pick a value");
        });

        test("shows suggestions when query length >= minLength and matches are found", async () => {
            render(
                <AutocompleteInput
                    id="test"
                    name="field"
                    value=""
                    options={options}
                    onChange={jest.fn()}
                    minLength={2}
                />
            );

            const input = screen.getByRole("combobox");
            await userEvent.type(input, "al");

            const listbox = await screen.findByRole("listbox");
            const items = await screen.findAllByRole("option");
            expect(items.length).toBeGreaterThanOrEqual(2);

            const html = items[0].innerHTML.toLowerCase();
            expect(html).toContain("<strong>");
        });

        test("renders default 'No results found' when nothing matches", async () => {
            render(
                <AutocompleteInput
                    id="test"
                    name="field"
                    value=""
                    options={options}
                    onChange={jest.fn()}
                    minLength={2}
                />
            );

            const input = screen.getByRole("combobox");
            await userEvent.type(input, "zzz");

            const listbox = await screen.findByRole("listbox");
            expect(listbox).toHaveTextContent("No results found");
        });

        test("renders custom no results text and supports newline characters", async () => {
            render(
                <AutocompleteInput
                    id="test"
                    name="field"
                    value=""
                    options={options}
                    onChange={jest.fn()}
                    minLength={1}
                    noResultsText={"Nothing\nTry again"}
                />
            );

            const input = screen.getByRole("combobox");
            await userEvent.type(input, "Q");

            const listbox = await screen.findByRole("listbox");
            expect(listbox).toHaveTextContent("Nothing");
            expect(listbox).toHaveTextContent("Try again");
        });

        test("clicking a suggestion calls onChange with the selected option id", async () => {
            const onChange = jest.fn();
            render(
                <AutocompleteInput
                    id="test"
                    name="field"
                    value=""
                    options={options}
                    onChange={onChange}
                    minLength={1}
                />
            );

            const input = screen.getByRole("combobox");
            await userEvent.type(input, "beta");

            const option = await screen.findByRole("option", {
                name: /beta 123/i,
            });
            await userEvent.click(option);

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith("b");
        });

        test("selecting the nullOptionId clears the value", async () => {
            const onChange = jest.fn();
            render(
                <AutocompleteInput
                    id="test"
                    name="field"
                    value=""
                    options={options}
                    nullOptionId="none"
                    onChange={onChange}
                    minLength={1}
                />
            );

            const input = screen.getByRole("combobox");
            await userEvent.type(input, "none");

            const option = await screen.findByRole("option", { name: /none/i });
            await userEvent.click(option);

            expect(onChange).toHaveBeenCalledWith("");
        });

        test("blur clears non-matching free text, remounts inner AA, and resets defaultValue to empty", async () => {
            const onChange = jest.fn();
            render(
                <AutocompleteInput
                    id="test"
                    name="field"
                    value=""
                    options={options}
                    onChange={onChange}
                    minLength={1}
                />
            );

            const input = screen.getByRole("combobox") as HTMLInputElement;
            await userEvent.type(input, "Unknown value");
            input.blur();

            await waitFor(() => {
                expect(onChange).toHaveBeenCalledWith("");
            });

            const inputAfter = screen.getByRole("combobox") as HTMLInputElement;
            expect(inputAfter.value).toBe("");
        });

        test("blur does NOT clear when text exactly equals an option title (case-insensitive)", async () => {
            const onChange = jest.fn();
            render(
                <AutocompleteInput
                    id="test"
                    name="field"
                    value=""
                    options={options}
                    onChange={onChange}
                />
            );

            const input = screen.getByRole("combobox");
            await userEvent.type(input, "alpha");
            input.blur();

            await waitFor(() => {
                expect(onChange).not.toHaveBeenCalled();
            });
        });

        test("selecting prefilled default value triggers onConfirm with string equal to defaultLabel", async () => {
            const onChange = jest.fn();
            render(
                <AutocompleteInput
                    id="test"
                    name="field"
                    value="b"
                    options={options}
                    onChange={onChange}
                />
            );

            const option = await screen.findByRole("option", {
                name: /beta 123/i,
            });
            await userEvent.click(option);

            expect(onChange).toHaveBeenCalledWith("b");
        });
    });

    describe("Checkbox", () => {
        test("Checkbox input", () => {
            const { container } = render(
                <CheckboxInput
                    id={"test"}
                    name={"test"}
                    selectedValue={"test"}
                    options={[
                        {
                            key: "option-1",
                            value: "option-1",
                            label: "option-1",
                        },
                    ]}
                />
            );
            expect(
                container.querySelector(".govuk-checkboxes")
            ).toBeInTheDocument();
        });

        test("renders a checkbox with hint", () => {
            const { container } = render(
                <CheckboxInput
                    id={"test"}
                    name={"test"}
                    selectedValue={"test"}
                    options={[
                        {
                            key: "option-1",
                            value: "option-1",
                            label: "option-1",
                            hint: "This is a hint",
                        },
                    ]}
                />
            );
            expect(container.querySelector(".govuk-hint")).toBeInTheDocument();
            expect(
                container.querySelector(".govuk-checkboxes__hint")
            ).toBeInTheDocument();
        });

        test("renders a checkbox with a divider", () => {
            const { container } = render(
                <CheckboxInput
                    id={"test"}
                    name={"test"}
                    selectedValue={"test"}
                    options={[
                        {
                            key: "option-1",
                            value: "option-1",
                            label: "option-1",
                            divider: "or",
                        },
                    ]}
                />
            );
            expect(
                container.querySelector(".govuk-checkboxes__divider")
            ).toBeInTheDocument();
        });

        test("applies isSmall and isInline classes when passed", () => {
            const { container } = render(
                <CheckboxInput
                    id={"test"}
                    name={"test"}
                    selectedValue={"test"}
                    options={[
                        {
                            key: "option-1",
                            value: "option-1",
                            label: "option-1",
                        },
                    ]}
                    isSmall={true}
                    isInline={true}
                />
            );
            expect(
                container.querySelector(".govuk-checkboxes--small")
            ).toBeInTheDocument();
            expect(
                container.querySelector(".govuk-checkboxes--inline")
            ).toBeInTheDocument();
        });
    });

    describe("CheckboxFormComponent", () => {
        test("Checkbox form component", () => {
            const { container } = render(
                <CheckboxFormComponent
                    name={"test"}
                    value={"test"}
                    label={"test"}
                    options={[
                        {
                            key: "option-1",
                            value: "option-1",
                            label: "option-1",
                        },
                    ]}
                />
            );
            expect(
                container.querySelector(".govuk-form-group")
            ).toBeInTheDocument();
        });

        test("renders with hint when hint prop is provided", () => {
            const { container } = render(
                <CheckboxFormComponent
                    name={"test"}
                    value={"test"}
                    label={"test"}
                    options={[
                        {
                            key: "option-1",
                            value: "option-1",
                            label: "option-1",
                        },
                    ]}
                    hint="This is a hint"
                />
            );
            expect(container.querySelector(".govuk-hint")).toBeInTheDocument();
        });

        test("renders with error message when error prop is provided", () => {
            const { container } = render(
                <CheckboxFormComponent
                    name={"test"}
                    value={"test"}
                    label={"test"}
                    options={[
                        {
                            key: "option-1",
                            value: "option-1",
                            label: "option-1",
                        },
                    ]}
                    error="This is an error"
                />
            );
            expect(
                container.querySelector(".govuk-error-message")
            ).toBeInTheDocument();
            expect(
                container.querySelector(".govuk-visually-hidden")
            ).toBeInTheDocument();
        });

        test("applies labelSize and heading when provided", () => {
            const { container } = render(
                <CheckboxFormComponent
                    name={"test"}
                    value={"test"}
                    label={"test"}
                    options={[
                        {
                            key: "option-1",
                            value: "option-1",
                            label: "option-1",
                        },
                    ]}
                    labelSize={LegendSizes.L}
                    isLabelHeading={true}
                />
            );
            expect(
                container.querySelector(".govuk-fieldset__legend--l")
            ).toBeInTheDocument();
            expect(
                container.querySelector(".govuk-fieldset__heading")
            ).toBeInTheDocument();
        });

        test("passes isSmall and isInline props to CheckboxInput", () => {
            const { container } = render(
                <CheckboxFormComponent
                    name={"test"}
                    value={"test"}
                    label={"test"}
                    options={[
                        {
                            key: "option-1",
                            value: "option-1",
                            label: "option-1",
                        },
                    ]}
                    isInline={true}
                    isSmall={true}
                />
            );
            expect(
                container.querySelector(".govuk-checkboxes--small")
            ).toBeInTheDocument();
            expect(
                container.querySelector(".govuk-checkboxes--inline")
            ).toBeInTheDocument();
        });
    });

    describe("Date", () => {
        test("Date input", () => {
            const { container } = render(
                <DateInput
                    name={"test"}
                    value={{
                        day: 1,
                        month: 1,
                        year: 2000,
                    }}
                    onChange={jest.fn()}
                />
            );
            expect(
                container.querySelector(".govuk-date-input")
            ).toBeInTheDocument();
        });

        test("displays empty string when value is 0", () => {
            const { container } = render(
                <DateInput
                    name={"test"}
                    value={{
                        day: 0,
                        month: 0,
                        year: 0,
                    }}
                    onChange={jest.fn()}
                />
            );
            expect(container.querySelector("#test-day")).toHaveValue("");
            expect(container.querySelector("#test-month")).toHaveValue("");
            expect(container.querySelector("#test-year")).toHaveValue("");
        });
    });

    describe("DateTime", () => {
        test("DateTime input", () => {
            const { container } = render(
                <DateTimeInput
                    name={"test"}
                    onChange={jest.fn()}
                    day={1}
                    month={1}
                    year={2000}
                    hour={12}
                    minute={30}
                />
            );
            expect(
                container.querySelector(".govuk-date-input")
            ).toBeInTheDocument();
        });
    });

    describe("DateTimeFormComponent", () => {
        test("DateTime form component", () => {
            const { container } = render(
                <Provider store={store}>
                    <DateTimeFormComponent
                        name={"test"}
                        label={"test"}
                        value={{
                            day: 1,
                            month: 1,
                            year: 2000,
                            hour: 12,
                            minute: 30,
                        }}
                    />
                </Provider>
            );
            expect(
                container.querySelector(".govuk-date-input")
            ).toBeInTheDocument();
        });

        test("shows error when day input is invalid", () => {
            const { container } = render(
                <Provider store={store}>
                    <DateTimeFormComponent
                        name={"test"}
                        label={"test"}
                        value={{
                            day: 1,
                            month: 1,
                            year: 2000,
                            hour: 12,
                            minute: 30,
                        }}
                        setError={jest.fn()}
                    />
                </Provider>
            );
            const dayInput = container.querySelector(
                "#test-day"
            ) as HTMLElement;

            fireEvent.change(dayInput, { target: { value: "32" } });

            expect(
                container.querySelector(".govuk-error-message")
            ).toBeInTheDocument();
            expect(
                container.querySelector(".govuk-visually-hidden")
            ).toBeInTheDocument();
        });

        test("shows error when month input is invalid", () => {
            const { container } = render(
                <Provider store={store}>
                    <DateTimeFormComponent
                        name={"test"}
                        label={"test"}
                        value={{
                            day: 1,
                            month: 1,
                            year: 2000,
                            hour: 12,
                            minute: 30,
                        }}
                        setError={jest.fn()}
                    />
                </Provider>
            );
            const monthInput = container.querySelector(
                "#test-month"
            ) as HTMLElement;

            fireEvent.change(monthInput, { target: { value: "13" } });

            expect(
                container.querySelector(".govuk-error-message")
            ).toBeInTheDocument();
            expect(
                container.querySelector(".govuk-visually-hidden")
            ).toBeInTheDocument();
        });

        test("handles year boundary and future validation", () => {
            const { container } = render(
                <Provider store={store}>
                    <DateTimeFormComponent
                        name={"test"}
                        label={"test"}
                        value={{
                            day: 1,
                            month: 1,
                            year: 2000,
                            hour: 12,
                            minute: 30,
                        }}
                        setError={jest.fn()}
                        isFuture={true}
                    />
                </Provider>
            );
            const yearInput = container.querySelector(
                "#test-year"
            ) as HTMLElement;

            fireEvent.change(yearInput, { target: { value: "2020" } });

            expect(
                container.querySelector(".govuk-error-message")
            ).toBeInTheDocument();
            expect(
                container.querySelector(".govuk-visually-hidden")
            ).toBeInTheDocument();
        });

        test("shows error when hour input is invalid", () => {
            const { container } = render(
                <Provider store={store}>
                    <DateTimeFormComponent
                        name={"test"}
                        label={"test"}
                        value={{
                            day: 1,
                            month: 1,
                            year: 2000,
                            hour: 12,
                            minute: 30,
                        }}
                        setError={jest.fn()}
                    />
                </Provider>
            );
            const hourInput = container.querySelector(
                "#test-hour"
            ) as HTMLElement;

            fireEvent.change(hourInput, { target: { value: "61" } });

            expect(
                container.querySelector(".govuk-error-message")
            ).toBeInTheDocument();
            expect(
                container.querySelector(".govuk-visually-hidden")
            ).toBeInTheDocument();
        });

        test("shows error when minute input is invalid", () => {
            const { container } = render(
                <Provider store={store}>
                    <DateTimeFormComponent
                        name={"test"}
                        label={"test"}
                        value={{
                            day: 1,
                            month: 1,
                            year: 2000,
                            hour: 12,
                            minute: 30,
                        }}
                        setError={jest.fn()}
                    />
                </Provider>
            );
            const minuteInput = container.querySelector(
                "#test-minute"
            ) as HTMLElement;

            fireEvent.change(minuteInput, { target: { value: "61" } });

            expect(
                container.querySelector(".govuk-error-message")
            ).toBeInTheDocument();
            expect(
                container.querySelector(".govuk-visually-hidden")
            ).toBeInTheDocument();
        });
    });

    describe("MultilineText", () => {
        test("MultilineText input", () => {
            const { container } = render(
                <MultilineTextInput
                    id={"test"}
                    name={"test"}
                    value={"test"}
                    onChange={jest.fn()}
                />
            );
            expect(
                container.querySelector(".govuk-textarea")
            ).toBeInTheDocument();
        });
    });

    describe("MultilineTextFormComponent", () => {
        test("Multiline Text form component", () => {
            const { container } = render(
                <MultilineFormComponent
                    name={"test"}
                    value={"test"}
                    label={"test"}
                    onChange={jest.fn()}
                />
            );
            expect(
                container.querySelector(".govuk-form-group")
            ).toBeInTheDocument();
        });

        test("renders with hint when hint prop is provided", () => {
            const { container } = render(
                <MultilineFormComponent
                    name={"test"}
                    value={"test"}
                    label={"test"}
                    onChange={jest.fn()}
                    hint="This is a hint"
                />
            );
            expect(container.querySelector(".govuk-hint")).toBeInTheDocument();
        });

        test("renders with error message when error prop is provided", () => {
            const { container } = render(
                <MultilineFormComponent
                    name={"test"}
                    value={"test"}
                    label={"test"}
                    onChange={jest.fn()}
                    error="This is an error"
                />
            );
            expect(
                container.querySelector(".govuk-error-message")
            ).toBeInTheDocument();
            expect(
                container.querySelector(".govuk-visually-hidden")
            ).toBeInTheDocument();
        });

        test("applies labelSize when provided", () => {
            const { container } = render(
                <MultilineFormComponent
                    name={"test"}
                    value={"test"}
                    label={"test"}
                    onChange={jest.fn()}
                    labelSize={LabelSizes.L}
                />
            );
            expect(
                container.querySelector(".govuk-label--l")
            ).toBeInTheDocument();
        });
    });

    describe("Radio", () => {
        test("Radio input", () => {
            const { container } = render(
                <RadioInput
                    id={"test"}
                    name={"test"}
                    options={[
                        {
                            key: "option-1",
                            value: "option-1",
                            label: "option-1",
                        },
                    ]}
                />
            );
            expect(
                container.querySelector(".govuk-radios__input")
            ).toBeInTheDocument();
        });

        test("renders inline and small classes when props are provided", () => {
            const { container } = render(
                <RadioInput
                    id="test"
                    name="test"
                    options={[
                        {
                            key: "option-1",
                            value: "option-1",
                            label: "option-1",
                        },
                    ]}
                    isInline={true}
                    isSmall={true}
                />
            );
            expect(
                container.querySelector(".govuk-radios--inline")
            ).toBeInTheDocument();
            expect(
                container.querySelector(".govuk-radios--small")
            ).toBeInTheDocument();
        });

        test("renders hint when hint is provided", () => {
            const { getByText } = render(
                <RadioInput
                    id="test"
                    name="test"
                    options={[
                        {
                            key: "option-1",
                            value: "option-1",
                            label: "option-1",
                            hint: "This is a hint",
                        },
                    ]}
                />
            );
            expect(getByText("This is a hint")).toBeInTheDocument();
        });

        test("renders divider when divider is provided", () => {
            const { getByText } = render(
                <RadioInput
                    id="test"
                    name="test"
                    options={[
                        {
                            key: "option-1",
                            value: "option-1",
                            label: "option-1",
                            divider: "Or",
                        },
                    ]}
                />
            );
            expect(getByText("Or")).toBeInTheDocument();
        });

        test("renders conditional content when checked", () => {
            const { getByText } = render(
                <RadioInput
                    id="test"
                    name="test"
                    options={[
                        {
                            key: "option-1",
                            value: "option-1",
                            label: "option-1",
                            renderConditional: () => (
                                <div>Conditional content</div>
                            ),
                        },
                    ]}
                    selectedValue="option-1"
                />
            );
            expect(getByText("Conditional content")).toBeInTheDocument();
        });
    });

    describe("RadioFormComponent", () => {
        test("Radio form component", () => {
            const { container } = render(
                <RadioFormComponent
                    name={"test"}
                    value={"test"}
                    label={"test"}
                    options={[
                        {
                            key: "option-1",
                            value: "option-1",
                            label: "option-1",
                        },
                    ]}
                />
            );
            expect(
                container.querySelector(".govuk-form-group")
            ).toBeInTheDocument();
        });

        test("renders with hint when hint prop is provided", () => {
            const { container } = render(
                <RadioFormComponent
                    name={"test"}
                    value={"test"}
                    label={"test"}
                    hint="This is a hint"
                    options={[
                        {
                            key: "option-1",
                            value: "option-1",
                            label: "option-1",
                        },
                    ]}
                />
            );
            expect(container.querySelector(".govuk-hint")).toBeInTheDocument();
        });

        test("renders with error message when error prop is provided", () => {
            const { container } = render(
                <RadioFormComponent
                    name={"test"}
                    value={"test"}
                    label={"test"}
                    error="This is an error"
                    options={[
                        {
                            key: "option-1",
                            value: "option-1",
                            label: "option-1",
                        },
                    ]}
                />
            );
            expect(
                container.querySelector(".govuk-error-message")
            ).toBeInTheDocument();
            expect(
                container.querySelector(".govuk-visually-hidden")
            ).toBeInTheDocument();
        });
    });

    describe("Select", () => {
        test("Select input", () => {
            const { container } = render(
                <SelectInput
                    id={"test"}
                    name={"test"}
                    value={"test"}
                    options={[
                        {
                            id: "option-1",
                            key: "option-1",
                            title: "option-1",
                        },
                    ]}
                    onChange={jest.fn()}
                />
            );
            expect(
                container.querySelector(".govuk-select")
            ).toBeInTheDocument();
        });

        test("renders select input with hasError prop", () => {
            const { container } = render(
                <SelectInput
                    id={"test"}
                    name={"test"}
                    value={"test"}
                    options={[
                        {
                            id: "option-1",
                            key: "option-1",
                            title: "option-1",
                        },
                    ]}
                    onChange={jest.fn()}
                    hasError={true}
                />
            );
            expect(
                container.querySelector(".govuk-select--error")
            ).toBeInTheDocument();
        });
    });

    describe("SelectFormComponent", () => {
        test("Select form component", () => {
            const { container } = render(
                <SelectFormComponent
                    name={"test"}
                    value={"test"}
                    label={"test"}
                    options={[
                        {
                            id: "option-1",
                            key: "option-1",
                            title: "option-1",
                        },
                    ]}
                    onChange={jest.fn()}
                />
            );
            expect(
                container.querySelector(".govuk-form-group")
            ).toBeInTheDocument();
        });

        test("renders with hint when hint prop is provided", () => {
            const { container } = render(
                <SelectFormComponent
                    name={"test"}
                    value={"test"}
                    label={"test"}
                    options={[
                        {
                            id: "option-1",
                            key: "option-1",
                            title: "option-1",
                        },
                    ]}
                    onChange={jest.fn()}
                    hint="This is a hint"
                />
            );
            expect(container.querySelector(".govuk-hint")).toBeInTheDocument();
        });

        test("renders with error message when error prop is provided", () => {
            const { container } = render(
                <SelectFormComponent
                    name={"test"}
                    value={"test"}
                    label={"test"}
                    options={[
                        {
                            id: "option-1",
                            key: "option-1",
                            title: "option-1",
                        },
                    ]}
                    onChange={jest.fn()}
                    error="This is an error"
                />
            );
            expect(
                container.querySelector(".govuk-error-message")
            ).toBeInTheDocument();
            expect(
                container.querySelector(".govuk-visually-hidden")
            ).toBeInTheDocument();
        });
    });

    describe("Text", () => {
        test("Text input", () => {
            const { container } = render(
                <TextInput
                    id={"test"}
                    name={"test"}
                    value={"test"}
                    onChange={jest.fn()}
                />
            );
            expect(container.querySelector(".govuk-input")).toBeInTheDocument();
        });

        test("renders with width class when width prop is provided", () => {
            const { container } = render(
                <TextInput
                    id={"test"}
                    name={"test"}
                    value={"test"}
                    onChange={jest.fn()}
                    width={TextInputWidth.W20}
                />
            );
            expect(
                container.querySelector(".govuk-input--width-20")
            ).toBeInTheDocument();
        });
    });

    describe("TextFormComponent", () => {
        test("Text form component", () => {
            const { container } = render(
                <TextFormComponent
                    name={"test"}
                    value={"test"}
                    label={"test"}
                    onChange={jest.fn()}
                />
            );
            expect(
                container.querySelector(".govuk-form-group")
            ).toBeInTheDocument();
        });

        test("renders with hint when hint prop is provided", () => {
            const { container } = render(
                <TextFormComponent
                    name={"test"}
                    value={"test"}
                    label={"test"}
                    onChange={jest.fn()}
                    hint="This is a hint"
                />
            );
            expect(container.querySelector(".govuk-hint")).toBeInTheDocument();
        });

        test("renders with error message when error prop is provided", () => {
            const { container } = render(
                <TextFormComponent
                    name={"test"}
                    value={"test"}
                    label={"test"}
                    onChange={jest.fn()}
                    error="This is an error"
                />
            );
            expect(
                container.querySelector(".govuk-error-message")
            ).toBeInTheDocument();
            expect(
                container.querySelector(".govuk-visually-hidden")
            ).toBeInTheDocument();
        });

        test("applies labelSize when provided", () => {
            const { container } = render(
                <TextFormComponent
                    name={"test"}
                    value={"test"}
                    label={"test"}
                    onChange={jest.fn()}
                    labelSize={LabelSizes.L}
                />
            );
            expect(
                container.querySelector(".govuk-label--l")
            ).toBeInTheDocument();
        });
    });
});
