import React from "react";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { i18n } from "../../../i18n";

import ResultEdit from "../result-edit";
import { RenderWithContextAndDataContext } from "../../../__tests__/helpers/renderers";

const mockComputeExpression = jest.fn().mockReturnValue("MOCK_EXPR");
jest.mock("../utility/expression", () => ({
    computeExpression: (...args: any[]) => mockComputeExpression(...args),
}));

// ---- Minimal model shapes used in tests ------------------------------------
type Section = { name: string; repeatableSection: boolean };
type Page = {
    path: string;
    section?: string;
    components?: Array<{ name: string }>;
};
type Calculation = {
    name: string;
    title?: string;
    components: Array<{ name: string }>;
    computeList?: Array<{ type?: string; value?: string }>;
    expression?: string;
};
type Condition = { name: string; displayName: string };

// ---- Fixtures ---------------------------------------------------------------
const sections: Section[] = [
    { name: "section-1", repeatableSection: true },
    { name: "section-2", repeatableSection: false },
];

const pages: Page[] = [
    {
        path: "/page-1",
        section: "section-1",
        components: [{ name: "comp-1" }, { name: "comp-2" }],
    },
    { path: "/page-2", section: "section-2", components: [] },
];

const calculations: Calculation[] = [
    {
        name: "CalcA",
        title: "Calc A",
        components: [{ name: "comp-1" }],
        computeList: [
            { type: "component", value: "comp-1" },
            { type: "operator", value: "+" },
            { type: "number", value: "5" },
        ],
        expression: "comp-1~R+ + 5",
    },
    {
        name: "CalcB",
        title: "Calc B",
        components: [],
        computeList: [],
        expression: "comp-2",
    },
];

const conditions: Condition[] = [
    { name: "cond-1", displayName: "Condition 1" },
    { name: "cond-2", displayName: "Condition 2" },
];

const mockData = { pages, sections, calculations, conditions };

// ---- Render helper ----------------------------------------------------------
function renderResultEdit(stateProps: any = {}) {
    return render(
        <RenderWithContextAndDataContext
            stateProps={stateProps}
            mockData={mockData as any}
            mockSave={jest.fn()}
        >
            <ResultEdit />
        </RenderWithContextAndDataContext>
    );
}

// ---- Tests ------------------------------------------------------------------
describe("ResultEdit", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(cleanup);

    it("renders calculation autocomplete", () => {
        renderResultEdit({
            selectedComponent: {
                name: "SomeResult",
                calculationName: "CalcB",
                options: {},
                schema: {},
            },
            pagePath: "/page-2",
        });

        expect(
            screen.getByLabelText(i18n("calculations.calculationField.title"))
        ).toBeInTheDocument();
    });

    it("changing calculation: type 3 chars to show options, click an option → computeExpression called", async () => {
        renderResultEdit({
            selectedComponent: {
                name: "SomeResult",
                calculationName: "CalcB",
                options: {},
                schema: {},
            },
            pagePath: "/page-2",
        });

        const calcInput = screen.getByLabelText(
            i18n("calculations.calculationField.title")
        );
        expect(calcInput).toBeInTheDocument();

        // Type 3 characters ("Cal") to trigger menu; then click "Calc A"
        await userEvent.clear(calcInput);
        await userEvent.type(calcInput, "Cal"); // matches "Calc A" and "Calc B"

        const listboxes = await screen.findAllByRole("listbox");
        const options = within(listboxes[0]).getAllByRole("option");

        // Find the option whose flattened text matches "Calc A"
        const calcAOption = options.find((opt) =>
            /Calc A/i.test(opt.textContent ?? "")
        );
        expect(calcAOption).toBeDefined();

        await userEvent.click(calcAOption!);

        const expectedCalcArg = calculations.find((c) => c.name === "CalcA");
        expect(mockComputeExpression).toHaveBeenCalledWith(
            expectedCalcArg,
            "/page-2",
            pages,
            sections
        );
    });

    it("prefix checkbox toggles checked state", async () => {
        renderResultEdit({
            selectedComponent: {
                name: "CalcA",
                calculationName: "CalcA",
                options: { prefixValue: "" }, // start unchecked
                schema: {},
            },
            pagePath: "/page-2",
        });

        const prefixCheckbox = screen.getByTestId("add-prefix");
        expect(prefixCheckbox).toBeInTheDocument();

        await userEvent.click(prefixCheckbox);
        expect(prefixCheckbox).toBeChecked();
    });

    it("suffix checkbox toggles and custom suffix input updates its value", async () => {
        renderResultEdit({
            selectedComponent: {
                name: "CalcA",
                calculationName: "CalcA",
                options: { suffixValue: "" },
                schema: {},
            },
            pagePath: "/page-2",
        });

        const suffixCheckbox = screen.getByLabelText(
            i18n("calculations.addSufixField.title")
        );
        expect(suffixCheckbox).toBeInTheDocument();

        await userEvent.click(suffixCheckbox);

        const suffixInput = screen.getByLabelText("Enter custom suffix");
        expect(suffixInput).toBeInTheDocument();

        await userEvent.clear(suffixInput);
        await userEvent.type(suffixInput, " %");
        expect(suffixInput).toHaveValue(" %");

        // Uncheck → input disappears
        await userEvent.click(suffixCheckbox);
        expect(
            screen.queryByLabelText("Enter custom suffix")
        ).not.toBeInTheDocument();
    });

    it("bold checkbox toggles checked state", async () => {
        renderResultEdit({
            selectedComponent: {
                name: "CalcA",
                calculationName: "CalcA",
                options: { bold: false },
                schema: {},
            },
            pagePath: "/page-2",
        });

        const boldCheckbox = screen.getByTestId("bold");
        expect(boldCheckbox).toBeInTheDocument();

        await userEvent.click(boldCheckbox);
        expect(boldCheckbox).toBeChecked();
    });

    it("hideResultOnPage / hideResultOnSummary toggles", async () => {
        renderResultEdit({
            selectedComponent: {
                name: "CalcA",
                calculationName: "CalcA",
                options: {
                    hideResultOnPage: false,
                    hideResultOnSummary: false,
                },
                schema: {},
            },
            pagePath: "/page-2",
        });

        const hideOnPage = screen.getByLabelText(
            i18n("calculations.hideCalculation.hideOnPage")
        );
        const hideOnSummary = screen.getByLabelText(
            i18n("calculations.hideCalculation.hideOnSummary")
        );

        expect(hideOnPage).not.toBeChecked();
        expect(hideOnSummary).not.toBeChecked();

        await userEvent.click(hideOnPage);
        await userEvent.click(hideOnSummary);

        expect(hideOnPage).toBeChecked();
        expect(hideOnSummary).toBeChecked();
    });

    it("condition autocomplete: type 3 chars to show options, click option to select", async () => {
        renderResultEdit({
            selectedComponent: {
                name: "CalcA",
                calculationName: "CalcA",
                options: { condition: "" },
                schema: {},
            },
            pagePath: "/page-2",
        });

        const conditionInput = screen.getByLabelText(
            i18n("calculations.conditionField.title")
        );
        expect(conditionInput).toBeInTheDocument();

        // Type 3 chars ("Con") then click "Condition 2"
        await userEvent.clear(conditionInput);
        await userEvent.type(conditionInput, "Con");

        const listboxes = await screen.findAllByRole("listbox");
        const options = within(listboxes[1]).getAllByRole("option");

        const cond2Option = options.find((opt) =>
            /Condition 2/i.test(opt.textContent ?? "")
        );
        expect(cond2Option).toBeDefined();

        await userEvent.click(cond2Option!);
    });

    it('opens and closes the "Set a new condition" flyout', async () => {
        renderResultEdit({
            selectedComponent: {
                name: "CalcA",
                calculationName: "CalcA",
                options: {},
                schema: {},
            },
            pagePath: "/page-2",
        });

        const toggleBtn = screen.getByText(/Set a new condition/i);
        expect(toggleBtn).toBeInTheDocument();

        await userEvent.click(toggleBtn);
        expect(screen.getByTestId("edit-conditions")).toBeInTheDocument();

        const closeBtn = screen.getByText(/Close/i);
        expect(closeBtn).toBeInTheDocument();

        await userEvent.click(closeBtn);
        expect(screen.queryByTestId("edit-conditions")).not.toBeInTheDocument();
    });
});
