import React from "react";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "../../../__tests__/helpers/RenderWithProviders";
import SectionNewEditPage from "../SectionNewEditPage";
import { LoadingState } from "../../../store/types";

const mockHistoryBack = jest.fn();

Object.defineProperty(window, "history", {
  value: {
    back: mockHistoryBack
  }
});

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
  calculations: []
};

const mockInitialState = {
  formSection: {
    loading: LoadingState.Succeeded,
    selectedSection: null,
    form: mockForm,
    entities: [],
    newSection: {
      name: "",
      title: "",
      repeatableSection: false,
      numberComp: undefined,
      conditionComp: undefined
    },
    numberComponents: [
      { id: "none", key: "none", title: "Select a number component" },
      { id: "comp1", key: "comp1", title: "Number Component 1" }
    ],
    conditionalComponents: [
      { id: "none", key: "none", title: "Select a conditional component" },
      { id: "cond1", key: "cond1", title: "Conditional Component 1" }
    ]
  }
};

describe("SectionNewEditPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders new section page correctly", () => {
    renderWithProviders(<SectionNewEditPage isEdit={false} />, {
      preloadedState: mockInitialState
    });

    expect(screen.getByText("Add a new section")).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Section name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add section" })).toBeDisabled();
  });

  it("renders edit section page correctly", () => {
    renderWithProviders(<SectionNewEditPage isEdit={true} />, {
      preloadedState: {
        ...mockInitialState,
        formSection: {
          ...mockInitialState.formSection,
          selectedSection: {
            name: "test-section",
            title: "Test Section",
            repeatableSection: false
          }
        }
      }
    });

    expect(screen.getByText("Edit section")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save section" })).toBeInTheDocument();
  });

  it("handles back navigation", () => {
    renderWithProviders(<SectionNewEditPage isEdit={false} />, {
      preloadedState: mockInitialState
    });

    const backLink = screen.getByRole("link", { name: "Back" });
    fireEvent.click(backLink);

    expect(mockHistoryBack).toHaveBeenCalled();
  });

  it("enables save button when required fields are filled", () => {
    renderWithProviders(<SectionNewEditPage isEdit={false} />, {
      preloadedState: mockInitialState
    });

    const titleInput = screen.getByLabelText("Title");
    const nameInput = screen.getByLabelText("Section name");
    const addButton = screen.getByRole("button", { name: "Add section" });

    fireEvent.change(titleInput, { target: { value: "Test Section" } });
    fireEvent.change(nameInput, { target: { value: "test-section" } });

    expect(addButton).not.toBeDisabled();
  });

  it("handles repeatable section toggle", () => {
    renderWithProviders(<SectionNewEditPage isEdit={false} />, {
      preloadedState: mockInitialState
    });

    const repeatableCheckbox = screen.getByRole("checkbox");
    
    fireEvent.click(repeatableCheckbox);
    
    expect(screen.getByText("Select a number component to act as trigger (optional)")).toBeInTheDocument();
    expect(screen.getByText("Select a conditional component to act as trigger (optional)")).toBeInTheDocument();
  });

  it("handles number component selection", () => {
    renderWithProviders(<SectionNewEditPage isEdit={false} />, {
      preloadedState: {
        ...mockInitialState,
        formSection: {
          ...mockInitialState.formSection,
          newSection: {
            ...mockInitialState.formSection.newSection,
            repeatableSection: true
          }
        }
      }
    });

    const numberSelect = screen.getAllByRole("combobox")[0];
    fireEvent.change(numberSelect, { target: { value: "comp1" } });

    expect(numberSelect).toHaveValue("comp1");
  });

  it("handles conditional component selection", () => {
    renderWithProviders(<SectionNewEditPage isEdit={false} />, {
      preloadedState: {
        ...mockInitialState,
        formSection: {
          ...mockInitialState.formSection,
          newSection: {
            ...mockInitialState.formSection.newSection,
            repeatableSection: true
          }
        }
      }
    });

    const conditionalSelect = screen.getAllByRole("combobox")[1];
    fireEvent.change(conditionalSelect, { target: { value: "cond1" } });

    expect(conditionalSelect).toHaveValue("cond1");
  });

  it("requires either number or conditional component for repeatable sections", () => {
    renderWithProviders(<SectionNewEditPage isEdit={false} />, {
      preloadedState: {
        ...mockInitialState,
        formSection: {
          ...mockInitialState.formSection,
          newSection: {
            name: "test-section",
            title: "Test Section",
            repeatableSection: true,
            numberComp: undefined,
            conditionComp: undefined
          }
        }
      }
    });

    const addButton = screen.getByRole("button", { name: "Add section" });
    expect(addButton).toBeDisabled();

    const numberSelect = screen.getAllByRole("combobox")[0];
    fireEvent.change(numberSelect, { target: { value: "comp1" } });

    expect(addButton).not.toBeDisabled();
  });

  it("handles section addition and navigates back", () => {
    renderWithProviders(<SectionNewEditPage isEdit={false} />, {
      preloadedState: {
        ...mockInitialState,
        formSection: {
          ...mockInitialState.formSection,
          newSection: {
            name: "test-section",
            title: "Test Section",
            repeatableSection: false
          }
        }
      }
    });

    const addButton = screen.getByRole("button", { name: "Add section" });
    fireEvent.click(addButton);

    expect(mockHistoryBack).toHaveBeenCalled();
  });
});