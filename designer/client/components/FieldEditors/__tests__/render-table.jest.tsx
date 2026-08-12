import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import RenderTable from "../render-table";
import { ComponentDef, DataSet, SectionDetails } from "@xgovformbuilder/model";
import { i18n } from "../../../i18n";

// Mock the i18n function
jest.mock("../../../i18n", () => ({
    i18n: (key: string) => key
}));

// Mock the child components
jest.mock("../table-template", () => {
    return function TableTemplate({ component, onCheckBoxChange, isChecked, comptype, repeatableSection }: any) {
        return (
            <tr data-testid={`table-template-${component.name}`}>
                <td>
                    <input
                        type="checkbox"
                        checked={isChecked(component.name)}
                        onChange={() => onCheckBoxChange(component)}
                        data-testid={`checkbox-${component.name}`}
                    />
                </td>
                <td>{component.name}</td>
                <td>{component.name}</td>
                {repeatableSection && <td>R+</td>}
            </tr>
        );
    };
});

jest.mock("../table-dataset", () => {
    return function TableDataset({ dataset, onDatasetCheckboxChange, isDatasetChecked }: any) {
        return (
            <tr data-testid={`table-dataset-${dataset.value}`}>
                <td>
                    <input
                        type="checkbox"
                        checked={isDatasetChecked(dataset.value)}
                        onChange={() => onDatasetCheckboxChange(dataset)}
                        data-testid={`dataset-checkbox-${dataset.value}`}
                    />
                </td>
                <td>{dataset.value}</td>
            </tr>
        );
    };
});

describe("RenderTable", () => {
    const mockSetSelectedComponents = jest.fn();
    const mockSetSelectedDatasets = jest.fn();
    const mockOnAddComponent = jest.fn();
    const mockOnAddDataset = jest.fn();
    const mockOnAddCalculation = jest.fn();

    const mockComponent: ComponentDef = {
        name: "testComponent",
        title: "Test Component",
        type: "TextField",
        options: {}
    };

    const mockSelectedComponent: ComponentDef = {
        name: "selectedComponent",
        title: "Selected Component", 
        type: "TextField",
        options: {}
    };

    const mockDataset: DataSet = {
        index: 0,
        type: "string",
        value: "testDataset",
        bold: false,
        calc: false
    };

    const mockSelectedDataset: DataSet = {
        index: 1,
        type: "string", 
        value: "selectedDataset",
        bold: false,
        calc: false
    };

    const mockRepeatableSection: SectionDetails = {
        repeatableSection: true,
        sectionOptions: {}
    };

    const defaultProps = {
        type: "Component",
        selectedComponents: [],
        setSelectedComponents: mockSetSelectedComponents,
        selectedDatasets: [],
        setSelectedDatasets: mockSetSelectedDatasets,
        displayComponents4mPage: [mockComponent],
        displayDatasets: [mockDataset],
        displayCalculations4mPage: [mockComponent],
        pageSelected: true,
        datasetSelected: false,
        onAddComponent: mockOnAddComponent,
        onAddDataset: mockOnAddDataset,
        onAddCalculation: mockOnAddCalculation,
        repeatableSection: undefined,
        showRPlus: false
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Basic Rendering", () => {
        it("renders the table with basic structure", () => {
            render(<RenderTable {...defaultProps} />);
            
            expect(screen.getByText("Add variable to text area")).toBeInTheDocument();
            expect(screen.getByRole("table")).toBeInTheDocument();
            expect(screen.getByText("Variable names")).toBeInTheDocument();
        });

        it("renders component type header when type is Component", () => {
            render(<RenderTable {...defaultProps} type="Component" datasetSelected={false} />);
            
            expect(screen.getByText("Component name")).toBeInTheDocument();
        });

        it("renders calculation type header when type is Calculation", () => {
            render(<RenderTable {...defaultProps} type="Calculation" datasetSelected={false} />);
            
            expect(screen.getByText("Calculation name")).toBeInTheDocument();
        });

        it("renders dataset header when type is Dataset and datasetSelected is true", () => {
            render(<RenderTable {...defaultProps} type="Dataset" datasetSelected={true} pageSelected={false} />);
            
            expect(screen.getByText("Design data set value")).toBeInTheDocument();
        });

        it("applies hidden-visibility class for Dataset type", () => {
            render(<RenderTable {...defaultProps} type="Dataset" />);
            
            const variableNamesHeader = screen.getByText("Variable names");
            expect(variableNamesHeader).toHaveClass("hidden-visibility");
        });
    });

    describe("Component Type Rendering", () => {
        it("renders components when type is Component and pageSelected is true", () => {
            render(<RenderTable {...defaultProps} type="Component" pageSelected={true} />);
            
            expect(screen.getByTestId("table-template-testComponent")).toBeInTheDocument();
        });

        it("does not render components when pageSelected is false", () => {
            render(<RenderTable {...defaultProps} type="Component" pageSelected={false} />);
            
            expect(screen.queryByTestId("table-template-testComponent")).not.toBeInTheDocument();
        });
    });

    describe("Dataset Type Rendering", () => {
        it("renders datasets when type is Dataset and datasetSelected is true", () => {
            render(<RenderTable {...defaultProps} type="Dataset" datasetSelected={true} />);
            
            expect(screen.getByTestId("table-dataset-testDataset")).toBeInTheDocument();
        });

        it("does not render datasets when datasetSelected is false", () => {
            render(<RenderTable {...defaultProps} type="Dataset" datasetSelected={false} />);
            
            expect(screen.queryByTestId("table-dataset-testDataset")).not.toBeInTheDocument();
        });
    });

    describe("Component Selection Logic", () => {
        it("handles checkbox change for unchecked component", () => {
            render(<RenderTable {...defaultProps} selectedComponents={[]} />);
            
            const checkbox = screen.getByTestId("checkbox-testComponent");
            fireEvent.click(checkbox);
            
            expect(mockSetSelectedComponents).toHaveBeenCalledWith(expect.any(Function));
        });

        it("handles checkbox change for checked component", () => {
            render(<RenderTable {...defaultProps} selectedComponents={[mockSelectedComponent]} />);
            
            const checkbox = screen.getByTestId("checkbox-testComponent");
            fireEvent.click(checkbox);
            
            expect(mockSetSelectedComponents).toHaveBeenCalledWith(expect.any(Function));
        });

        it("correctly filters out selected component when unchecking", () => {
            const mockSetSelectedComponentsCallback = jest.fn((updateFn) => {
                const existingComponents = [mockSelectedComponent];
                const result = updateFn(existingComponents);
                expect(result).toEqual([]);
            });

            render(<RenderTable 
                {...defaultProps} 
                selectedComponents={[mockSelectedComponent]}
                displayComponents4mPage={[mockSelectedComponent]}
                setSelectedComponents={mockSetSelectedComponentsCallback}
            />);
            
            const checkbox = screen.getByTestId("checkbox-selectedComponent");
            fireEvent.click(checkbox);
        });
    });

    describe("Dataset Selection Logic", () => {
        it("handles dataset checkbox change for unchecked dataset", () => {
            render(<RenderTable {...defaultProps} type="Dataset" datasetSelected={true} selectedDatasets={[]} />);
            
            const checkbox = screen.getByTestId("dataset-checkbox-testDataset");
            fireEvent.click(checkbox);
            
            expect(mockSetSelectedDatasets).toHaveBeenCalledWith(expect.any(Function));
        });

        it("handles dataset checkbox change for checked dataset", () => {
            render(<RenderTable {...defaultProps} type="Dataset" datasetSelected={true} selectedDatasets={[mockSelectedDataset]} />);
            
            const checkbox = screen.getByTestId("dataset-checkbox-testDataset");
            fireEvent.click(checkbox);
            
            expect(mockSetSelectedDatasets).toHaveBeenCalledWith(expect.any(Function));
        });

        it("correctly filters out selected dataset when unchecking", () => {
            const mockSetSelectedDatasetsCallback = jest.fn((updateFn) => {
                const existingDatasets = [mockSelectedDataset];
                const result = updateFn(existingDatasets);
                expect(result).toEqual([]);
            });

            render(<RenderTable 
                {...defaultProps} 
                type="Dataset"
                datasetSelected={true}
                selectedDatasets={[mockSelectedDataset]}
                displayDatasets={[mockSelectedDataset]}
                setSelectedDatasets={mockSetSelectedDatasetsCallback}
            />);
            
            const checkbox = screen.getByTestId("dataset-checkbox-selectedDataset");
            fireEvent.click(checkbox);
        });

        it("correctly adds dataset when checking", () => {
            const mockSetSelectedDatasetsCallback = jest.fn((updateFn) => {
                const existingDatasets: DataSet[] = [];
                const result = updateFn(existingDatasets);
                expect(result).toHaveLength(1);
                expect(result[0]).toMatchObject({
                    index: mockDataset.index,
                    type: mockDataset.type,
                    value: mockDataset.value,
                    checked: true,
                    bold: mockDataset.bold,
                    calc: mockDataset.calc
                });
            });

            render(<RenderTable 
                {...defaultProps} 
                type="Dataset"
                datasetSelected={true}
                selectedDatasets={[]}
                setSelectedDatasets={mockSetSelectedDatasetsCallback}
            />);
            
            const checkbox = screen.getByTestId("dataset-checkbox-testDataset");
            fireEvent.click(checkbox);
        });
    });
});