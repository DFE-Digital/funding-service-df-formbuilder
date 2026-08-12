import React from "react";
import { render, fireEvent } from "@testing-library/react";
import ImportDataFileUpload from "../ImportDataFileUpload";

describe("Import Data snapshot test", () => {
  it("Should match snapshot", () => {
    const { asFragment } = render(<ImportDataFileUpload />);
    expect(asFragment()).toMatchSnapshot();
  });
});

// Import Data File Upload
describe("Import Data File Upload Component", () => {
  it("Save button exists", () => {
    const { getByText } = render(
      <ImportDataFileUpload
        previouslyUploadedFile="dummyPreviousFile.csv"
        uploadedFile={undefined}
      />
    );
    expect(getByText("Save")).toBeInTheDocument();
  });

  it("Save button called when clicked", () => {
    const dummyUploadedFile = new File([":/"], "newFile");
    const saveDataSet = jest.fn();
    const { getByText, getByTestId } = render(
      <ImportDataFileUpload
        previouslyUploadedFile=""
        uploadedFile={dummyUploadedFile}
        saveDataSet={saveDataSet}
      />
    );

    // Need this to enable save button
    const inputElement = getByTestId("data-set-title-input");
    const newValue = "newFileTitle";
    fireEvent.change(inputElement, {
      target: {
        value: newValue,
      },
    });

    fireEvent.click(getByText("Save"));
    expect(saveDataSet).toHaveBeenCalledTimes(1);
  });

  it("Typing into input calls the onChange handler", () => {
    const { getByTestId } = render(<ImportDataFileUpload />);

    const inputElement = getByTestId("data-set-title-input");
    const newValue = "newFileTitle";
    fireEvent.change(inputElement, {
      target: {
        value: newValue,
      },
    });
    expect(inputElement.value).toBe(newValue);
  });
});
