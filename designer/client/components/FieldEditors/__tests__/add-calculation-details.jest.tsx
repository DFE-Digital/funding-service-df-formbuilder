import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AddCalculationDetails from "../add-calculation-details";
import { i18n } from "../../../i18n";
import { RenderWithContextAndDataContext } from "../../../__tests__/helpers/renderers";

jest.mock("../../../i18n", () => ({
  i18n: (key) => key // Return the key itself for easy testing
}));

const mockSave = jest.fn().mockResolvedValue(true);
const mockOnHide = jest.fn();

const defaultProps = {
    calculationDetails: {
        calculationName: "",
        title: "",
        helpText: "",
        hideResult: false,
        prefixType: "",
        prefixValue: "",
        suffixType: "",
        suffixValue: "",
        precision: 2,
        condition: "",
    },
    showTitle: true,
    setShowTitle: jest.fn(),
    isEdit: false,
    onHide: mockOnHide,
    page: { path: "/test-page", components: [] },
    selectedComponents: [{ name: "comp1", value: "2" }],
    selectedDatasets: [],
    calculationResult: "(comp1) + 2",
    calculationToEdit: null,
    errors: {},
    setErrors: jest.fn(),
};

const selectedComponent = {
    displayName: "",
    title: "",
    hint: "",
    options: {
        hideResult: false,
        prefixType: "",
        prefixValue: "",
        suffixType: "",
        suffixValue: "",
        condition: "",
    },
    schema: {
        precision: 2,
    },
};

const mockData = {
    conditions: [],
    calculations: [],
    pages: [{ path: "/test-page", components: [] }],
};

const renderComponent = (props = {}, stateProps = {}) => {
    const mergedProps = { ...defaultProps, ...props };
    return render(
        <RenderWithContextAndDataContext
            stateProps={{ 
                selectedComponent: {
                    ...selectedComponent,
                    ...stateProps
                }
            }}
            mockData={mockData}
            mockSave={mockSave}
        >
            <AddCalculationDetails {...mergedProps} />
        </RenderWithContextAndDataContext>
    );
};

describe("AddCalculationDetails", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSave.mockResolvedValue(true);
    });

    it("renders calculation name input", () => {
        renderComponent();
        expect(screen.getByLabelText(i18n("calculations.calculationName"))).toBeInTheDocument();
    });

    it("dispatches display name change", () => {
        renderComponent();
        const input = screen.getByLabelText(i18n("calculations.calculationName"));
        fireEvent.change(input, { target: { value: "new-calc-name" } });
        expect(screen.getByDisplayValue("new-calc-name")).toBeInTheDocument();
    });

    it("shows continue button when showTitle is false", () => {
        renderComponent({ showTitle: false });
        expect(screen.getByText(i18n("calculations.continueBtn"))).toBeInTheDocument();
    });

    it("shows title and help text fields when showTitle is true", () => {
        renderComponent();
        expect(screen.getByLabelText(i18n("Title"))).toBeInTheDocument();
        expect(screen.getByLabelText(i18n("calculations.helpTextField.title"))).toBeInTheDocument();
    });

    it("shows validation errors", async () => {
        renderComponent({
            errors: { title: { children: "calculations.titleRequired" } },
            selectedComponent: { ...selectedComponent, title: "" },
        });

        const saveBtn = screen.getByText(i18n("calculations.saveCalculation"));
        fireEvent.click(saveBtn);

        expect(screen.getByText(i18n("calculations.titleRequired"))).toBeInTheDocument();
    });

    it("handles hide result checkbox toggle", () => {
        renderComponent();
        const checkbox = screen.getByLabelText(i18n("calculations.hideCalculation"));
        fireEvent.click(checkbox);
        
        expect(checkbox).toBeChecked();
    });

    it("handles prefix checkbox toggle", () => {
        renderComponent();
        const checkbox = screen.getByTestId("add-prefix");
        fireEvent.click(checkbox);
        
        expect(checkbox).toBeChecked();
    });

    it("handles suffix input when enabled", () => {
        renderComponent();
        const suffixCheckbox = screen.getByLabelText(i18n("calculations.addSufixField.title"));
        fireEvent.click(suffixCheckbox);
        
        const suffixInput = screen.getByLabelText("Enter custom suffix");
        fireEvent.change(suffixInput, { target: { value: "%" } });
        
        expect(suffixInput).toHaveValue("%");
    });

    it("shows save button when showTitle is true", () => {
        renderComponent();
        expect(screen.getByText("calculations.saveCalculation")).toBeInTheDocument();
    });

    it("saves new calculation successfully", async () => {
        renderComponent();
        
        // Set valid calculation name and title
        const displayNameInput = screen.getByLabelText("calculations.calculationName");
        const titleInput = screen.getByLabelText("Title");
        
        fireEvent.change(displayNameInput, { target: { value: "test-calc" } });
        fireEvent.change(titleInput, { target: { value: "Test Calculation" } });
        
        // Click save button
        const saveButton = screen.getByTestId("save-calculation");
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockSave).toHaveBeenCalled();
            expect(mockOnHide).toHaveBeenCalled();
        });
    });

    it("saves edited calculation successfully", async () => {
        renderComponent({ isEdit: true, calculationToEdit: {
            name: "existing-calc",
            displayName: "Existing Calculation",
            title: "Existing Calculation Title"
        }});

        // Set valid calculation name and title
        const displayNameInput = screen.getByLabelText("calculations.calculationName");
        const titleInput = screen.getByLabelText("Title");
        
        fireEvent.change(displayNameInput, { target: { value: "updated-calc" } });
        fireEvent.change(titleInput, { target: { value: "Updated Calculation" } });
        
        // Click save button
        const saveButton = screen.getByTestId("save-calculation");
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockSave).toHaveBeenCalled();
            expect(mockOnHide).toHaveBeenCalled();
        });
    });
});