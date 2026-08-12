import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { PageLinkage } from "../PageLinkage";
import { DataContext } from "../../../context";
jest.useFakeTimers();
describe("Page Linkage", () => {
    
    function renderWithDataContext(ui, { data, ...renderOptions }) {
        return render(
            <DataContext.Provider value={data}>{ui}</DataContext.Provider>,
            renderOptions
        );
    }
    xit("Test drag functions", async () => {
        const page = {
            title: "First page",
            path: "/first-page",
            components: [
                {
                    name: "XlpgOd",
                    options: {},
                    type: "NumberField",
                    title: "Test Number",
                    checked: true,
                },
            ],
            next: [
                {
                    path: "/second-page",
                },
            ],
        };
        const layout = {
            node: {
                label: "/first-page",
                width: 240,
                height: 180,
                x: 170,
                y: 209.5,
            },
            top: "119.5px",
            left: "50px",
        };
        const pageLinkageRenderResult = renderWithDataContext(
            <PageLinkage page={page} layout={layout} />,
            {
                data: {
                    metadata: {},
                    startPage: "/first-page",
                    pages: [
                        {
                            title: "First page",
                            path: "/first-page",
                            components: [
                                {
                                    name: "XlpgOd",
                                    options: {},
                                    type: "NumberField",
                                    title: "Test Number",
                                    checked: true,
                                },
                            ],
                            next: [
                                {
                                    path: "/second-page",
                                },
                            ],
                        },
                        {
                            path: "/second-page",
                            title: "Second page",
                            components: [
                                {
                                    name: "rKvoIO",
                                    options: {},
                                    type: "Details",
                                    title: "Details 1",
                                    content: "qwerty",
                                },
                                {
                                    name: "kBHfmx",
                                    displayName: "Test Calc",
                                    options: {
                                        hideResult: false,
                                    },
                                    type: "Result",
                                    title: "Test Calc",
                                    hint: "",
                                    expression: "(XlpgOd) + 40",
                                    schema: {},
                                },
                            ],
                            next: [
                                {
                                    path: "/summary",
                                },
                            ],
                        },
                        {
                            title: "Summary",
                            path: "/summary",
                            controller: "./pages/summary.js",
                            components: [],
                        },
                    ],
                    lists: [],
                    sections: [],
                    conditions: [],
                    fees: [],
                    outputs: [],
                    version: 2,
                    userId: "TestUserId",
                    createdBy: "TestUser",
                    id: "7xxb5lRkuh",
                    key: "7xxb5lRkuh",
                    displayName: "test-helper",
                    name: "test-helper",
                    lastModified: "2023/06/07 09:46",
                    formStatus: "In development",
                    lastUpdatedByName: "TestUser",
                    lastUpdatedById: "TestUserId",
                    calculations: [
                        {
                            displayName: "Test Calc",
                            hint: "",
                            type: "arithmetic",
                            name: "kBHfmx",
                            pageLocation: "Second page",
                            components: [
                                {
                                    title: "Test Number",
                                    name: "XlpgOd",
                                    type: "NumberField",
                                    options: {},
                                    checked: true,
                                    schema: {},
                                },
                            ],
                            datasets: [],
                            expression: "(XlpgOd) + 40",
                            title: "Test Calc",
                            hideResult: false,
                        },
                    ],
                },
            }
        );
        const draggableArea = pageLinkageRenderResult.getByTestId(
            "page-linkage-draggable-area"
        );
        const setData = jest.fn();
        fireEvent.drag(draggableArea, {
            delta: { x: 0, y: 10 },
        });
        fireEvent.dragStart(draggableArea, {
            delta: { x: 0, y: 10 },
            dataTransfer: { setData },
        });
        expect(setData).toHaveBeenLastCalledWith(
            "linkingPage",
            '{"title":"First page","path":"/first-page","components":[{"name":"XlpgOd","options":{},"type":"NumberField","title":"Test Number","checked":true}],"next":[{"path":"/second-page"}]}'
        );
        fireEvent.dragEnd(draggableArea, {
            delta: { x: 0, y: 3 },
        });
        await fireEvent.drop(draggableArea, {
            delta: { x: 0, y: 3 },
            dataTransfer: {
                getData: (str: string) =>
                    JSON.stringify({ path: "/second-page" }),
            },
        });
        fireEvent.dragOver(draggableArea, {
            delta: { x: 0, y: 3 },
        });
        fireEvent.dragLeave(draggableArea, {
            delta: { x: 0, y: 3 },
        });
        expect(draggableArea).toBeInTheDocument();
    });
});
