import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { RenderWithContextAndDataContext } from "../../__tests__/helpers/renderers";

import NotifyEdit from "../notify-edit";
import OutputEdit from "../output-edit";

describe("NotifyEdit", () => {
    let mockData;
    let mockSave: any;

    beforeEach(() => {
        mockSave = jest.fn().mockResolvedValue(mockData);
        mockData = {
            pages: [
                {
                    title: "First page",
                    path: "/first-page",
                    components: [
                        {
                            name: "9WH4EX",
                            options: {},
                            type: "TextField",
                            title: "Email",
                        },
                    ],
                    controller: "./pages/summary.js",
                },
            ],
            outputs: [],
            conditions: [],
        };
    });
    test("Email Output object is created correctly", () => {
        const props: any = {
            onEdit: jest.fn(),
            onCancel: jest.fn(),
            data: mockData,
            output: {
                name: "Email Test",
                title: "Email Test",
                outputConfiguration: {
                    emailAddress: "example@gmail.com",
                },
            },
        };

        const { getByText, getByLabelText } = render(
            <RenderWithContextAndDataContext
                mockData={mockData}
                mockSave={mockSave}
            >
                <OutputEdit {...props} />
            </RenderWithContextAndDataContext>
        );

        // change title
        fireEvent.change(getByLabelText("Title"), {
            target: { value: "Email Test" },
        });

        // change email field
        fireEvent.change(getByLabelText("Email Address"), {
            target: { value: "example@gmail.com" },
        });

        // save
        fireEvent.click(getByText("Save"));

        // expect(mockSave).toHaveBeenCalledTimes(0);

        expect(mockSave.mock.calls[0][0].outputs).toEqual([
            {
                name: "Email Test",
                title: "Email Test",
                type: "email",
                outputConfiguration: {
                    emailAddress: "example@gmail.com",
                },
            },
        ]);
    });

    test("Change to webhook type", async () => {
        const props: any = {
            onEdit: jest.fn(),
            onCancel: jest.fn(),
            data: mockData,
            output: {
                name: "Webhook Test",
                title: "Webhook Test",
                outputConfiguration: {
                    emailAddress: "example@gmail.com",
                },
            },
        };

        const { getByText, getByLabelText } = render(
            <RenderWithContextAndDataContext
                mockData={mockData}
                mockSave={mockSave}
            >
                <OutputEdit {...props} />
            </RenderWithContextAndDataContext>
        );

        // change type
        fireEvent.change(getByLabelText("Output type"), {
            target: { value: "webhook" },
        });

        // change title
        fireEvent.change(getByLabelText("Title"), {
            target: { value: "Webhook Test" },
        });

        // change email field
        fireEvent.change(getByLabelText("Webhook url"), {
            target: { value: "https://www.google.com/" },
        });

        // save
        fireEvent.click(getByText("Save"));

        // expect(mockSave).toHaveBeenCalledTimes(0);

        expect(mockSave.mock.calls[0][0].outputs).toEqual([
            {
                name: "Webhook Test",
                title: "Webhook Test",
                type: "webhook",
                outputConfiguration: {
                    url: "https://www.google.com/",
                },
            },
        ]);
    });

    test("Trigger back button", async () => {
        const props: any = {
            onEdit: jest.fn(),
            onCancel: jest.fn(),
            data: mockData,
            output: {
                name: "Webhook Test",
                title: "Webhook Test",
                outputConfiguration: {
                    emailAddress: "example@gmail.com",
                },
            },
        };

        const { getByText } = render(
            <RenderWithContextAndDataContext
                mockData={mockData}
                mockSave={mockSave}
            >
                <OutputEdit {...props} />
            </RenderWithContextAndDataContext>
        );

        const backButton = getByText("Back");

        expect(backButton).toBeInTheDocument();

        // save
        fireEvent.click(backButton);
    });

    test("Output - On delete", async () => {
        const onEdit = jest.fn();
        const props: any = {
            onEdit: onEdit,
            onCancel: jest.fn(),
            data: mockData,
            output: {
                name: "Email Test",
                title: "Email Test",
                type: "email",
                outputConfiguration: {
                    emailAddress: "example@gmail.com",
                },
            },
        };

        const { getByText } = render(
            <RenderWithContextAndDataContext
                mockData={mockData}
                mockSave={mockSave}
            >
                <OutputEdit {...props} />
            </RenderWithContextAndDataContext>
        );

        jest.spyOn(global, "confirm" as any).mockReturnValueOnce(true);

        const deleteButton = getByText("Delete");

        expect(deleteButton).toBeInTheDocument();

        // save
        fireEvent.click(deleteButton);

        await waitFor(() => expect(onEdit).toHaveBeenCalledTimes(1));
    });
});
