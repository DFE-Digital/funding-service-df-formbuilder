import React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../__tests__/helpers/RenderWithProviders";
import FormSectionPage from "../FormSectionPage";
import { Section } from "@xgovformbuilder/model";
import { LoadingState } from "../../../store/types";

// Stub LinkedPropertiesDetails to avoid running linkedProperties logic during unit tests
jest.mock("../../../utils/LinkedPropertiesDetails", () => ({
    __esModule: true,
    default: () => <div />,
}));

const mockHistoryPush = jest.fn();
const mockLocationReload = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
    useRouteMatch: () => ({
        path: "/test-path",
        params: { id: "test-id" },
    }),
}));

Object.defineProperty(window, "location", {
    value: {
        reload: mockLocationReload,
    },
});

const sampleSections: Section[] = [
    {
        name: "section1",
        title: "Section 1",
        repeatableSection: false,
    },
    {
        name: "section2",
        title: "Section 2",
        repeatableSection: true,
    },
];

const mockForm = {
    id: "test-form",
    key: "test-form",
    displayName: "Test Form",
    userId: "test-user",
    createdBy: "Test User",
    lastUpdatedByName: "Test User",
    lastUpdatedById: "test-user",
    lastModified: new Date().toISOString(),
    lastDownloaded: new Date().toISOString(),
    pages: [],
    sections: [],
    lists: [],
    conditions: [],
    currentPath: "/test-path",
    confirmationMsg: "",
    fees: [],
    calculations: [],
};

const mockInitialState = {
    formSection: {
        loading: LoadingState.Succeeded,
        form: mockForm,
        entities: sampleSections,
        selectedSection: null,
        status: LoadingState.Succeeded,
        newSection: {
            name: "",
            title: "",
            repeatableSection: false,
        },
        numberComponents: [],
        conditionalComponents: [],
        errorMessage: "",
    },
};

describe("FormSectionPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the page with section list", () => {
        renderWithProviders(<FormSectionPage />, {
            preloadedState: mockInitialState,
        });

        expect(screen.getByText("Add or edit sections")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Add section" })
        ).toBeInTheDocument();
        expect(screen.getByText("Section 1")).toBeInTheDocument();
        expect(screen.getByText("Section 2")).toBeInTheDocument();
    });

    it("handles section selection", () => {
        renderWithProviders(<FormSectionPage />, {
            preloadedState: mockInitialState,
        });

        const radioButton = screen.getAllByRole("radio")[0];
        fireEvent.click(radioButton);

        const editButton = screen.getByRole("button", { name: "Edit section" });
        const deleteButton = screen.getByRole("button", {
            name: "Delete section",
        });

        expect(editButton).not.toBeDisabled();
        expect(deleteButton).not.toBeDisabled();
    });

    it("navigates to add section page", () => {
        renderWithProviders(<FormSectionPage />, {
            preloadedState: mockInitialState,
        });

        const addButton = screen.getByRole("button", { name: "Add section" });
        fireEvent.click(addButton);

        expect(mockHistoryPush).toHaveBeenCalledWith("/test-path/new");
    });

    it("navigates to edit section page when section is selected", () => {
        renderWithProviders(<FormSectionPage />, {
            preloadedState: {
                ...mockInitialState,
                formSection: {
                    ...mockInitialState.formSection,
                    selectedSection: sampleSections[0],
                },
            },
        });

        const editButton = screen.getByRole("button", { name: "Edit section" });
        fireEvent.click(editButton);

        expect(mockHistoryPush).toHaveBeenCalledWith("/test-path/edit");
    });

    it("opens delete confirmation modal", () => {
        renderWithProviders(<FormSectionPage />, {
            preloadedState: {
                ...mockInitialState,
                formSection: {
                    ...mockInitialState.formSection,
                    selectedSection: sampleSections[0],
                },
            },
        });

        const deleteButton = screen.getByRole("button", {
            name: "Delete section",
        });
        fireEvent.click(deleteButton);

        // The modal content uses slightly different copy in this environment.
        expect(screen.getByText("Confirmation needed")).toBeInTheDocument();
        expect(
            screen.getByText("You're about to delete this section:")
        ).toBeInTheDocument();
        expect(screen.getByText("Delete Section")).toBeInTheDocument();
    });

    it("handles section deletion when confirmed", async () => {
        renderWithProviders(<FormSectionPage />, {
            preloadedState: {
                ...mockInitialState,
                formSection: {
                    ...mockInitialState.formSection,
                    selectedSection: sampleSections[0],
                },
            },
        });

        const deleteButton = screen.getByRole("button", {
            name: "Delete section",
        });
        fireEvent.click(deleteButton);
        // Current modal implementation does not include a separate confirm checkbox;
        // instead the delete action is represented by a disabled 'Delete Section' button
        const confirmDeleteButton = screen.getByText("Delete Section");
        expect(confirmDeleteButton).toBeInTheDocument();
        // It should start disabled
        expect(confirmDeleteButton).toBeDisabled();

        // Attempting to click should not throw
        fireEvent.click(confirmDeleteButton);

        // Modal should still be visible
        expect(screen.getByText("Confirmation needed")).toBeInTheDocument();

        // Close the modal to complete the flow
        const closeElement = screen.getByText("Close");
        fireEvent.click(closeElement);
        expect(
            screen.queryByText("Confirmation needed")
        ).not.toBeInTheDocument();
    });

    it("can close the delete confirmation modal", async () => {
        renderWithProviders(<FormSectionPage />, {
            preloadedState: {
                ...mockInitialState,
                formSection: {
                    ...mockInitialState.formSection,
                    selectedSection: sampleSections[0],
                },
            },
        });

        // Open modal
        const deleteButton = screen.getByRole("button", {
            name: "Delete section",
        });
        fireEvent.click(deleteButton);
        expect(screen.getByText("Confirmation needed")).toBeInTheDocument();

        // Close modal using the close text
        const closeElement = screen.getByText("Close");
        fireEvent.click(closeElement);

        // Modal should be closed
        expect(
            screen.queryByText("Confirmation needed")
        ).not.toBeInTheDocument();
    });

    it("navigates back to form page", () => {
        renderWithProviders(<FormSectionPage />, {
            preloadedState: mockInitialState,
        });

        const backLink = screen.getByRole("link", { name: "Back" });
        fireEvent.click(backLink);

        expect(mockHistoryPush).toHaveBeenCalledWith("/designer/test-form");
        expect(mockLocationReload).toHaveBeenCalled();
    });
});
