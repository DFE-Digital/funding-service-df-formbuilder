import React from "react";
import { render, fireEvent } from "@testing-library/react";
import SummaryScreen from "../SummaryScreen";
import NavigationButtons from "../NavigationButtons";
import DataSetsTable from "../DataSetsTable";

const mockDataSets = [
  {
    id: "29ssmkx",
    date: "2022-08-01T14:56:46.442Z",
    title: "Title 1",
    fileName: "File Name 1",
  },
  {
    id: "45ssmkx",
    date: "2022-08-03T14:56:46.442Z",
    title: "Title 2",
    fileName: "File Name 2",
  },
];

const mockColumns = [
  {
    key: "title",
    label: "label 1",
    render: (val) => val,
  },
  {
    key: "date",
    label: "label 2",
    render: (val) => val,
  },
];

describe("Summary Screen snapshot test", () => {
  it("Should match snapshot", () => {
    const { asFragment } = render(
      <SummaryScreen
        rows={mockDataSets}
        isChecked={jest.fn()}
        onItemSelect={jest.fn()}
        selectedDataSet={undefined}
        introMesage={undefined}
        warningMessage={undefined}
        onAdd={undefined}
        onDelete={undefined}
        onEdit={undefined}
        addLabel={undefined}
        deleteLabel={undefined}
        editLabel={undefined}
        emptyMessage={undefined}
        columns={mockColumns}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});

// Navigation Buttons
describe("Navigations buttons: Edit, Delete, Import", () => {
  it("Clicking on import should invoke relevant handlers", () => {
    const mockProps = {
      selectedDataSet: {},
      addLabel: "Add",
      deleteLabel: "",
      editLabel: "",
    };
    const onDeleteMock = jest.fn();
    const onEditMock = jest.fn();
    const onAddMock = jest.fn();

    const { getByTestId } = render(
      <NavigationButtons
        {...mockProps}
        onDelete={onDeleteMock}
        onEdit={onEditMock}
        onAdd={onAddMock}
      />
    );

    const importButton = getByTestId("add-data-set");
    fireEvent.click(importButton);
    expect(onAddMock).toHaveBeenCalledTimes(1);
  });

  it("Clicking on edit should invoke relevant handlers", () => {
    const mockProps = {
      selectedDataSet: {},
      addLabel: "",
      deleteLabel: "",
      editLabel: "Edit",
    };
    const onDeleteMock = jest.fn();
    const onEditMock = jest.fn();
    const onAddMock = jest.fn();

    const { getByTestId } = render(
      <NavigationButtons
        {...mockProps}
        onDelete={onDeleteMock}
        onEdit={onEditMock}
        onAdd={onAddMock}
      />
    );

    const editButton = getByTestId("edit-data-set");
    fireEvent.click(editButton);
    expect(onEditMock).toHaveBeenCalledTimes(1);
  });
});

describe("Table when no data", () => {
  it("empty message should show when there are no table rows", () => {
    const noDataMessage = "No data sets exist";
    const { getByText } = render(
      <DataSetsTable
        emptyMessage={noDataMessage}
        isChecked={undefined}
        onItemSelect={undefined}
        columns={mockColumns}
        rows={undefined}
      />
    );
    expect(getByText(noDataMessage)).toBeInTheDocument();
  });
});
