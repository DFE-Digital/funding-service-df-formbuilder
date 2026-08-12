import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { ComponentContext } from "../../../reducers/component/componentReducer";
import DSIDataEdit from "../DSIDataEdit";
import { ComponentDef } from "@xgovformbuilder/model";

interface ComponentState {
    selectedComponent: Partial<ComponentDef>;
    isNew?: boolean;
    initialName?: ComponentDef["name"];
    pagePath?: string;
    listItemErrors?: {};
    hasValidated: boolean;
    errors?: any;
}

describe("DSIDataEdit", () => {
    const mockDispatch = jest.fn();
    
    function TestComponentWithContext({ children }) {
        const state: ComponentState = {
            selectedComponent: {
                name: "testComponent",
                title: "Test Title",
                type: "DSIAccess" as const,
                options: {},
                schema: {}
            },
            errors: {},
            hasValidated: false,
            initialName: "testComponent"
        };

        return (
            <ComponentContext.Provider value={{ state, dispatch: mockDispatch }}>
                {children}
            </ComponentContext.Provider>
        );
    }

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders title input field correctly", () => {
        const { getByLabelText } = render(
            <TestComponentWithContext>
                <DSIDataEdit />
            </TestComponentWithContext>
        );

        const titleInput = getByLabelText("Title");
        expect(titleInput).toBeInTheDocument();
        expect(titleInput).toHaveValue("Test Title");
    });

    it("renders name input field correctly", () => {
        const { getByLabelText } = render(
            <TestComponentWithContext>
                <DSIDataEdit />
            </TestComponentWithContext>
        );

        const nameInput = getByLabelText("Component name");
        expect(nameInput).toBeInTheDocument();
        expect(nameInput).toHaveValue("testComponent");
    });

    it("dispatches correct action when title is changed", () => {
        const { getByLabelText } = render(
            <TestComponentWithContext>
                <DSIDataEdit />
            </TestComponentWithContext>
        );

        const titleInput = getByLabelText("Title");
        fireEvent.change(titleInput, { target: { value: "New Title" } });

        expect(mockDispatch).toHaveBeenCalledWith({
            type: "EDIT_TITLE",
            payload: "New Title",
        });
    });

    it("dispatches correct action when name is changed", () => {
        const { getByLabelText } = render(
            <TestComponentWithContext>
                <DSIDataEdit />
            </TestComponentWithContext>
        );

        const nameInput = getByLabelText("Component name");
        fireEvent.change(nameInput, { target: { value: "newName" } });

        expect(mockDispatch).toHaveBeenCalledWith({
            type: "EDIT_NAME",
            payload: "newName",
        });
    });

    it("displays error message when name has error", () => {
        const stateWithError: ComponentState = {
            selectedComponent: {
                name: "testComponent",
                title: "Test Title",
                type: "DSIAccess" as const,
                options: {},
                schema: {}
            },
            errors: {
                name: true
            },
            hasValidated: false,
            initialName: "testComponent"
        };

        const { getByText } = render(
            <ComponentContext.Provider value={{ state: stateWithError, dispatch: mockDispatch }}>
                <DSIDataEdit />
            </ComponentContext.Provider>
        );

        expect(getByText("Name must not contain spaces")).toBeInTheDocument();
    });

    it("displays error message when title has error", () => {
        const stateWithError: ComponentState = {
            selectedComponent: {
                name: "testComponent",
                title: "Test Title",
                type: "DSIAccess" as const,
                options: {},
                schema: {}
            },
            errors: {
                title: ["error.message", { value: "test" }]
            },
            hasValidated: false,
            initialName: "testComponent"
        };

        const { getByText } = render(
            <ComponentContext.Provider value={{ state: stateWithError, dispatch: mockDispatch }}>
                <DSIDataEdit />
            </ComponentContext.Provider>
        );

        expect(getByText("error.message")).toBeInTheDocument();
    });
});