import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import PageSelectInput from "../page-select-input";

const mockSetPageSelected = jest.fn();
const mockSetDatasetSelected = jest.fn();
const mockSetDisplayCalculations4mPage = jest.fn();
const mockSetDisplayDatasets = jest.fn();
const mockSetDisplayComponents4mPage = jest.fn();
const mockSetRepeatableSection = jest.fn();
const mockSetShowRPlus = jest.fn();

const mockPages = [
    {
        path: "/page1",
        title: "Page 1",
        section: "section1",
        components: [
            { type: "NumberField", name: "field1" },
            { type: "Result", name: "result1" },
            { type: "TextField", name: "field2" },
        ],
    },
    {
        path: "/page2",
        title: "Page 2",
        section: "section2",
        components: [
            { type: "NumberField", name: "field3" },
            { type: "NumberField", name: "field4" },
        ],
    },
    {
        path: "/page3",
        title: "Page 3",
        section: "repeatableSection1",
        components: [],
    },
];

const mockSections = [
    {
        name: "section1",
        repeatableSection: false,
    },
    {
        name: "section2",
        repeatableSection: false,
    },
    {
        name: "repeatableSection1",
        repeatableSection: true,
    },
];

const mockDatasets = [
    {
        id: "dataset1",
        title: "Dataset 1",
        data: [
            [
                { value: "data1", calc: true },
                { value: "data2", calc: false },
                { value: "data3", calc: true },
            ],
        ],
    },
    {
        id: "dataset2",
        title: "Dataset 2",
        data: [[{ value: "data4", calc: false }]],
    },
];

const defaultProps = {
    pages: mockPages,
    resultCreationPage: "/page1",
    datasets: mockDatasets,
    sections: mockSections,
    setPageSelected: mockSetPageSelected,
    setDatasetSelected: mockSetDatasetSelected,
    setDisplayCalculations4mPage: mockSetDisplayCalculations4mPage,
    setDisplayDatasets: mockSetDisplayDatasets,
    setDisplayComponents4mPage: mockSetDisplayComponents4mPage,
    setRepeatableSection: mockSetRepeatableSection,
    setShowRPlus: mockSetShowRPlus,
};

const renderComponent = (props = {}) => {
    const mergedProps = { ...defaultProps, ...props };
    return render(<PageSelectInput {...mergedProps} />);
};

describe("PageSelectInput", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        console.log = jest.fn(); // Mock console.log
    });

    it("renders the component with label and select element", () => {
        renderComponent();

        expect(
            screen.getByText("Select a page or a design data set")
        ).toBeInTheDocument();
        expect(screen.getByTestId("calc-page-select")).toBeInTheDocument();
    });

    it("renders all pages as options", () => {
        renderComponent();

        expect(screen.getByText("Page 1")).toBeInTheDocument();
        expect(screen.getByText("Page 2")).toBeInTheDocument();
        expect(screen.getByText("Page 3")).toBeInTheDocument();
    });

    it("renders all datasets as options", () => {
        renderComponent();

        expect(screen.getByText("Dataset 1")).toBeInTheDocument();
        expect(screen.getByText("Dataset 2")).toBeInTheDocument();
    });

    it("handles page selection with valid page", () => {
        renderComponent();

        const select = screen.getByTestId("calc-page-select");
        fireEvent.change(select, { target: { value: "page_/page1" } });

        expect(mockSetPageSelected).toHaveBeenCalledWith(true);
        expect(mockSetDatasetSelected).toHaveBeenCalledWith(false);
        expect(mockSetDisplayDatasets).toHaveBeenCalledWith([]);
        expect(mockSetDisplayComponents4mPage).toHaveBeenCalledWith([
            { type: "NumberField", name: "field1" },
        ]);
        expect(mockSetDisplayCalculations4mPage).toHaveBeenCalledWith([
            { type: "Result", name: "result1" },
        ]);
    });

    it("handles dataset selection with valid dataset", () => {
        renderComponent();

        const select = screen.getByTestId("calc-page-select");
        fireEvent.change(select, { target: { value: "dataset_dataset1" } });

        expect(mockSetDatasetSelected).toHaveBeenCalledWith(true);
        expect(mockSetPageSelected).toHaveBeenCalledWith(false);
        expect(mockSetDisplayComponents4mPage).toHaveBeenCalledWith([]);

        const expectedCalcDatasets = [
            { value: "dataset1->data1", calc: true },
            { value: "dataset1->data3", calc: true },
        ];
        expect(mockSetDisplayDatasets).toHaveBeenCalledWith(
            expectedCalcDatasets
        );
    });

    it("handles dataset with no calc data", () => {
        renderComponent();

        const select = screen.getByTestId("calc-page-select");
        fireEvent.change(select, { target: { value: "dataset_dataset2" } });

        expect(mockSetDisplayDatasets).toHaveBeenCalledWith([]);
    });

    it("handles page with repeatable section and shows RPlus", () => {
        const propsWithDifferentResultPage = {
            ...defaultProps,
            resultCreationPage: "/page2", // Different from selected page
        };

        renderComponent(propsWithDifferentResultPage);

        const select = screen.getByTestId("calc-page-select");
        fireEvent.change(select, { target: { value: "page_/page3" } });

        expect(mockSetShowRPlus).toHaveBeenCalledWith(true);
        expect(mockSetRepeatableSection).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "repeatableSection1",
                repeatableSection: true,
            })
        );
    });

    it("handles page without repeatable section", () => {
        renderComponent();

        const select = screen.getByTestId("calc-page-select");
        fireEvent.change(select, { target: { value: "page_/page1" } });

        expect(mockSetRepeatableSection).toHaveBeenCalledWith();
    });

    it("handles page with same section as result creation page", () => {
        renderComponent();

        const select = screen.getByTestId("calc-page-select");
        fireEvent.change(select, { target: { value: "page_/page1" } });

        expect(mockSetShowRPlus).toHaveBeenCalledWith(false);
    });

    it("handles resultCreationPage with null section", () => {
        const propsWithNullResultPage = {
            ...defaultProps,
            resultCreationPage: "/nonexistent",
        };

        renderComponent(propsWithNullResultPage);

        const select = screen.getByTestId("calc-page-select");
        fireEvent.change(select, { target: { value: "page_/page1" } });

        expect(mockSetShowRPlus).toHaveBeenCalledWith(false);
    });

    it("handles sections with repeatableSection false in condition check", () => {
        const propsWithNonRepeatableResultSection = {
            ...defaultProps,
            resultCreationPage: "/page2", // section2 has repeatableSection: false
            sections: [
                ...mockSections,
                {
                    name: "section3",
                    repeatableSection: false,
                },
            ],
        };

        renderComponent(propsWithNonRepeatableResultSection);

        const select = screen.getByTestId("calc-page-select");
        fireEvent.change(select, { target: { value: "page_/page1" } }); // Different section

        expect(mockSetShowRPlus).toHaveBeenCalledWith(false);
    });
});
