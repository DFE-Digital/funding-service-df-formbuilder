import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import RenderTitleAndHelptext from "../render-help-text";
import { RenderWithContextAndDataContext } from "../../../__tests__/helpers/renderers";
import { i18n } from "../../../i18n";

describe("RenderTitleAndHelptext", () => {
    const defaultProps = {
        errors: "",
        onSaveCalculation: jest.fn(),
    };

    const mockData = {
        conditions: [
            {
                name: "condition1",
                displayName: "Condition 1",
            },
            {
                name: "condition2",
                displayName: "Condition 2",
            },
        ],
        pages: [{ path: "/test-page", components: [] }],
    };

    const selectedComponent = {
        title: "Test Component",
        hint: "Test hint",
        options: {
            hideResult: false,
            prefixType: "",
            prefixValue: "",
            suffixValue: "",
            condition: "",
        },
        schema: {
            precision: 2,
        },
    };

    const renderComponent = (props = {}) => {
        return render(
            <RenderWithContextAndDataContext
                mockData={mockData}
                stateProps={{ selectedComponent }}
            >
                <RenderTitleAndHelptext {...defaultProps} {...props} />
            </RenderWithContextAndDataContext>
        );
    };

    test("renders title input field", () => {
        renderComponent();
        const titleInput = screen.getByRole("textbox", { name: /title/i });
        expect(titleInput).toBeInTheDocument();
    });

    test("renders help text field", () => {
        renderComponent();
        const helpTextLabel = screen.getByText(
            i18n("calculations.helpTextField.title")
        );
        const helpTextArea = screen.getByRole("textbox", {
            name: /help text/i,
        });
        expect(helpTextLabel).toBeInTheDocument();
        expect(helpTextArea).toBeInTheDocument();
    });

    test("renders hide result checkbox", () => {
        renderComponent();
        const hideResultCheckbox = document.getElementById(
            "hideResult"
        ) as HTMLInputElement;
        expect(hideResultCheckbox).toBeInTheDocument();
        expect(hideResultCheckbox).not.toBeChecked();
    });

    test("renders prefix and suffix options", () => {
        renderComponent();
        const prefixCheckbox = screen.getByRole("checkbox", {
            name: /add prefix/i,
        });
        const suffixCheckbox = screen.getByRole("checkbox", {
            name: /add suffix/i,
        });
        expect(prefixCheckbox).toBeInTheDocument();
        expect(suffixCheckbox).toBeInTheDocument();
    });

    test("handles title change", () => {
        renderComponent();
        const titleInput = screen.getByRole("textbox", { name: /title/i });
        fireEvent.change(titleInput, { target: { value: "New Title" } });
        expect(titleInput).toHaveValue("New Title");
    });

    test("handles help text change", () => {
        renderComponent();
        const helpTextArea = screen.getByRole("textbox", {
            name: /help text/i,
        });
        fireEvent.change(helpTextArea, { target: { value: "New help text" } });
        expect(helpTextArea).toHaveValue("New help text");
    });

    test("handles hide result toggle", () => {
        renderComponent();
        const hideResultCheckbox = document.getElementById(
            "hideResult"
        ) as HTMLInputElement;
        fireEvent.click(hideResultCheckbox);
        expect(hideResultCheckbox).toBeChecked();
    });

    test("renders condition selection dropdown", () => {
        renderComponent();
        const conditionSelect = screen.getByRole("combobox");
        expect(conditionSelect).toBeInTheDocument();
        expect(screen.getByText("Condition 1")).toBeInTheDocument();
        expect(screen.getByText("Condition 2")).toBeInTheDocument();
    });

    test("handles save calculation", () => {
        const mockSave = jest.fn();
        renderComponent({ onSaveCalculation: mockSave });
        const saveButton = screen.getByRole("button", {
            name: /save calculation/i,
        });
        fireEvent.click(saveButton);
        expect(mockSave).toHaveBeenCalled();
    });

    test("renders set condition link", () => {
        renderComponent();
        const setConditionLink = screen.getByText(/set a new condition/i);
        expect(setConditionLink).toBeInTheDocument();
    });

    test("shows condition editor when clicking set condition link", () => {
        renderComponent();
        const setConditionLink = screen.getByText(/set a new condition/i);
        fireEvent.click(setConditionLink);
        expect(screen.getByTestId("edit-conditions")).toBeInTheDocument();
    });
});
