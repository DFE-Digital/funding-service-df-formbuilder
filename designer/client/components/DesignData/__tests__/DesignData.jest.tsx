import React from "react";
import { DataContext } from "../../../context";
import { render, fireEvent } from "@testing-library/react";
import DesignData from "../DesignData";
import DesignScreen from "../DesignScreen";
import { NameInput, RowInput } from "../components";
import { not } from "joi";

describe("Design Data snapshot test", () => {
  it("Should match snapshot", () => {
    const { asFragment } = render(<DesignData />);
    expect(asFragment()).toMatchSnapshot();
  });
});

describe("Design Screen", () => {
  it("There should be two input and one select dropdown options", () => {
    const setShowDesignScreenMock = jest.fn();
    const { getByTestId } = render(
      <DesignScreen setShowDesignScreen={setShowDesignScreenMock} />
    );

    const nameTextInput = getByTestId("design-data-set-name-input");
    const rowsTextInput = getByTestId("design-data-set-dropdown-row-input");
    const columnsSelectInput = getByTestId(
      "design-data-set-dropdown-column-input"
    );
    const generateButton = getByTestId("design-generate-button");

    expect(nameTextInput).toBeInTheDocument();
    expect(rowsTextInput).toBeInTheDocument();
    expect(columnsSelectInput).toBeInTheDocument();
    expect(generateButton).toBeInTheDocument();
  });

  it("Design Screen Modal Boolean Setter called when back button clicked", () => {
    const setShowDesignScreenMock = jest.fn();
    const { getByText } = render(
      <DesignScreen setShowDesignScreen={setShowDesignScreenMock} />
    );

    fireEvent.click(getByText("Back"));

    expect(setShowDesignScreenMock).toHaveBeenCalledTimes(1);
  });

  it("Name input on change calls appropiate handler function", () => {
    const mockHandler = jest.fn();
    const { getByTestId } = render(
      <NameInput setDataSetName={mockHandler} dataSetName={undefined} />
    );

    const nameTextInput = getByTestId("design-data-set-name-input");

    fireEvent.change(nameTextInput, {
      target: { value: "NewName" },
    });

    expect(mockHandler).toHaveBeenCalled();
  });

  it("Row input on change calls appropiate handler function", () => {
    const mockHandler = jest.fn();
    let value = 0;
    const { getByTestId } = render(
      <RowInput value={value} setter={mockHandler} label="rows" hint="rows" />
    );

    const textInput = getByTestId("design-data-set-dropdown-row-input");

    fireEvent.change(textInput, {
      target: { value: 2 },
    });

    expect(mockHandler).toHaveBeenCalled();
  });

  it("Generate button is enabled with appropriate values and render on click", () => {
    const setShowDesignScreenMock = jest.fn();
    const { container, getByTestId } = render(
      <DesignScreen setShowDesignScreen={setShowDesignScreenMock} />
    );

    const nameTextInput = getByTestId("design-data-set-name-input");
    const rowsInput = getByTestId("design-data-set-dropdown-row-input");
    const columnsInput = getByTestId("design-data-set-dropdown-column-input");

    const generateButton = getByTestId("design-generate-button");

    // Entering valid inputs
    fireEvent.change(nameTextInput, {
      target: { value: "Test" },
    });
    fireEvent.change(rowsInput, {
      target: { value: 2 },
    });
    fireEvent.change(columnsInput, {
      target: { value: 2 },
    });

    // Clicks on generate button
    fireEvent.click(generateButton);

    const importSelect = getByTestId("design-imported-dataset-select");
    expect(importSelect).toBeInTheDocument();
    const keySelect = getByTestId("design-key-identifier-select");
    expect(keySelect).toBeInTheDocument();

    const numberOfCells = container.querySelectorAll(".cell").length;
    expect(numberOfCells).toEqual(4);
  });
});

describe("Design Data", () => {
  it("Render Design Data with Table", () => {
    const saveFn = jest.fn();
    const mockData = {
      userId: "test-user-id",
      createdBy: "Selvamuthukumar Marimuthu",
      id: "DiOMttTviO",
      key: "DiOMttTviO",
      displayName: "design-data-dev",
      name: "design-data-dev",
      lastModified: "2022/09/29 13:16",
      formStatus: "In development",
      file: {},
      importedDataSets: [
        {
          fileTitle: "Sample 1",
          fileName: "sample-csv-file.csv",
          uploadedDate: "2022-09-08T12:08:12.157Z",
          fileId: "wPofmk",
        },
      ],
      lastUpdatedByName: "Test User",
      lastUpdatedById: "test",
      skipSummary: false,
      signInRequired: false,
      designedDataSets: [
        {
          id: "uvdupZ",
          title: "Test Data Set 1",
          uploadedDate: "2022-09-29T12:16:10.759Z",
          csvUsed: "wPofmk",
          keyIdentifier: "UKPRN",
          data: [
            [
              {
                index: "1-1",
                type: "custom_text",
                value: "asd",
                bold: false,
                calc: false,
              },
              {
                index: "1-2",
                type: "select_value",
                value: "Org-Header",
                bold: false,
                calc: false,
              },
            ],
            [
              {
                index: "2-1",
                type: "custom_text",
                value: "asdbold",
                bold: true,
                calc: false,
              },
              {
                index: "2-2",
                type: "filled_empty",
                value: "",
                bold: false,
                calc: false,
              },
            ],
          ],
        },
      ],
    };
    const { getByTestId, debug } = render(
      <DataContext.Provider value={{ data: mockData, save: saveFn }}>
        <DesignData />
      </DataContext.Provider>
    );

    const addDesignData = getByTestId("add-data-set");
    fireEvent.click(addDesignData);
    expect(addDesignData).not.toBeInTheDocument();
  });
});
