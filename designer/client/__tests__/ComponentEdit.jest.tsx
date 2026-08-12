import React from "react";
import {
    fireEvent,
    getByTestId,
    render,
    waitFor,
} from "@testing-library/react";

import { ComponentTypeEnum } from "@xgovformbuilder/model";

import { RenderWithAllContexts } from "./helpers/renderers";
import ComponentEdit from "../ComponentEdit";

describe("ComponentEdit component", () => {
    describe("Render Test", () => {
        const props = {
            page: {
                title: "First page",
                path: "/first-page",
                components: [
                    {
                        name: "gnMmdD",
                        options: {},
                        type: "TextField",
                        title: "Text 1",
                    },
                ],
                next: [
                    {
                        path: "/summary",
                    },
                ],
            },
            toggleShowEditor: jest.fn(),
            componentType: ComponentTypeEnum.TextField,
        };
        const mockSave = jest.fn();
        const componentProps = {
            selectedComponent: {
                name: "gnMmdD",
                componentEdited: false,
                title: "Text 1",
                type: ComponentTypeEnum.TextField,
            },
            initialName: "gnMmdD",
            errors: {},
            hasValidated: false,
            selectedListName: "",
            hint: "",
            attrs: {},
            options: {
                hideTitle: false,
                optionalText: false,
                required: true,
            },
        };
        const mockData = {
            metadata: {},
            startPage: "/first-page",
            pages: [
                {
                    title: "First page",
                    path: "/first-page",
                    components: [
                        {
                            name: "gnMmdD",
                            options: {},
                            type: "TextField",
                            title: "Text 1",
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
            userId: "test-user-id",
            createdBy: "Test User 1",
            id: "KespT1YRxy",
            key: "KespT1YRxy",
            displayName: "test-component-edit",
            name: "test-component-edit",
            lastModified: "2023/07/21 11:01",
            formStatus: "In development",
            lastUpdatedByName: "Test User 1",
            lastUpdatedById: "test-user-id",
        };

        test("check when rendered normally", () => {
            const { container, getByLabelText } = render(
                <RenderWithAllContexts
                    componentProps={componentProps}
                    mockData={mockData}
                    mockSave={mockSave}
                >
                    <ComponentEdit {...props} />
                </RenderWithAllContexts>
            );
            expect(getByLabelText("Title")).toBeInTheDocument();
            expect(
                container.querySelector("#field-options-hideTitle")
            ).toBeInTheDocument();
            expect(getByLabelText("Help text (optional)")).toBeInTheDocument();
            expect(container.querySelector("#field-name")).toBeInTheDocument();
        });

        test("check when rendered with error", () => {
            componentProps.errors = {
                gnMmdD: {
                    children: "gnMmdD",
                },
            };
            const { getByText } = render(
                <RenderWithAllContexts
                    componentProps={componentProps}
                    mockData={mockData}
                    mockSave={mockSave}
                >
                    <ComponentEdit {...props} />
                </RenderWithAllContexts>
            );
            expect(
                getByText("Please fix the following error(s)")
            ).toBeInTheDocument();
        });
    });

    describe("Interaction Test", () => {
        const props = {
            page: {
                title: "First page",
                path: "/first-page",
                components: [
                    {
                        name: "gnMmdD",
                        options: {},
                        type: "TextField",
                        title: "Text 1",
                        hint: "",
                    },
                ],
                next: [
                    {
                        path: "/summary",
                    },
                ],
            },
            toggleShowEditor: jest.fn(),
            componentType: ComponentTypeEnum.TextField,
        };
        const mockSave = jest.fn();
        const componentProps = {
            selectedComponent: {
                name: "gnMmdD",
                componentEdited: false,
                title: "Text 1",
                type: ComponentTypeEnum.TextField,
            },
            initialName: "gnMmdD",
            errors: {},
            hasValidated: false,
            selectedListName: "",
            hint: "",
            attrs: {},
            options: {
                hideTitle: false,
                optionalText: false,
                required: true,
            },
        };
        const mockData = {
            metadata: {},
            startPage: "/first-page",
            pages: [
                {
                    title: "First page",
                    path: "/first-page",
                    components: [
                        {
                            name: "gnMmdD",
                            options: {},
                            type: "TextField",
                            title: "Text 1",
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
            userId: "test-user-id",
            createdBy: "Test User 1",
            id: "KespT1YRxy",
            key: "KespT1YRxy",
            displayName: "test-component-edit",
            name: "test-component-edit",
            lastModified: "2023/07/21 11:01",
            formStatus: "In development",
            lastUpdatedByName: "Test User 1",
            lastUpdatedById: "test-user-id",
        };

        test("handle submit", () => {
            const { getByText, getByLabelText } = render(
                <RenderWithAllContexts
                    componentProps={componentProps}
                    mockData={mockData}
                    mockSave={mockSave}
                >
                    <ComponentEdit {...props} />
                </RenderWithAllContexts>
            );
            expect(getByLabelText("Help text (optional)")).toBeInTheDocument();
            const hint = getByLabelText("Help text (optional)");
            if (!hint) return;
            fireEvent.change(hint, {
                target: {
                    value: "new hint added",
                },
            });
            getByText("Save").click();
        });

        test("handle submit - throws error", async () => {
            componentProps.errors = {
                gnMmdD: {
                    children: "gnMmdD",
                },
            };
            const { getByText, getByLabelText } = render(
                <RenderWithAllContexts
                    componentProps={componentProps}
                    mockData={mockData}
                    mockSave={mockSave}
                >
                    <ComponentEdit {...props} />
                </RenderWithAllContexts>
            );
            expect(getByLabelText("Title")).toBeInTheDocument();
            const title = getByLabelText("Title");
            if (!title) return;
            fireEvent.change(title, {
                target: {
                    value: "",
                },
            });
            getByText("Save").click();
        });

        test("handle delete", () => {
            componentProps.errors = {};
            const { getByText } = render(
                <RenderWithAllContexts
                    componentProps={componentProps}
                    mockData={mockData}
                    mockSave={mockSave}
                >
                    <ComponentEdit {...props} />
                </RenderWithAllContexts>
            );
            expect(getByText("Delete")).toBeInTheDocument();
            getByText("Delete").click();
        });

        test("handle submit - filedownload", () => {
            props.componentType = ComponentTypeEnum.Filedownload;
            props.page.components[0].type = ComponentTypeEnum.Filedownload;
            const mockData1 = {
                metadata: {},
                startPage: "/first-page",
                pages: [
                    {
                        title: "First page",
                        path: "/first-page",
                        components: [
                            {
                                name: "gnMmdD",
                                options: {},
                                type: ComponentTypeEnum.Filedownload,
                                title: "Text 1",
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
                userId: "test-user-id",
                createdBy: "Test User 1",
                id: "KespT1YRxy",
                key: "KespT1YRxy",
                displayName: "test-component-edit",
                name: "test-component-edit",
                lastModified: "2023/07/21 11:01",
                formStatus: "In development",
                lastUpdatedByName: "Test User 1",
                lastUpdatedById: "test-user-id",
            };
            componentProps.selectedComponent.type =
                ComponentTypeEnum.Filedownload;
            const { getByText, getByLabelText } = render(
                <RenderWithAllContexts
                    componentProps={componentProps}
                    mockData={mockData1}
                    mockSave={mockSave}
                >
                    <ComponentEdit {...props} />
                </RenderWithAllContexts>
            );
            expect(getByLabelText("Help text (optional)")).toBeInTheDocument();
            const hint = getByLabelText("Help text (optional)");
            if (!hint) return;
            fireEvent.change(hint, {
                target: {
                    value: "new hint added",
                },
            });
            getByText("Save").click();
        });

        test("handle submit - Data import", () => {
            props.componentType = ComponentTypeEnum.DataImport;
            props.page.components[0].type = ComponentTypeEnum.DataImport;
            const mockData2 = {
                metadata: {},
                startPage: "/first-page",
                pages: [
                    {
                        title: "First page",
                        path: "/first-page",
                        components: [
                            {
                                name: "gnMmdD",
                                options: {},
                                type: ComponentTypeEnum.DataImport,
                                title: "Text 1",
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
                userId: "test-user-id",
                createdBy: "Test User 1",
                id: "KespT1YRxy",
                key: "KespT1YRxy",
                displayName: "test-component-edit",
                name: "test-component-edit",
                lastModified: "2023/07/21 11:01",
                formStatus: "In development",
                lastUpdatedByName: "Test User 1",
                lastUpdatedById: "test-user-id",
            };
            componentProps.selectedComponent.type =
                ComponentTypeEnum.DataImport;
            const { getByText, getByLabelText } = render(
                <RenderWithAllContexts
                    componentProps={componentProps}
                    mockData={mockData2}
                    mockSave={mockSave}
                >
                    <ComponentEdit {...props} />
                </RenderWithAllContexts>
            );
            expect(getByLabelText("Help text (optional)")).toBeInTheDocument();
            const hint = getByLabelText("Help text (optional)");
            if (!hint) return;
            fireEvent.change(hint, {
                target: {
                    value: "new hint added",
                },
            });
            getByText("Save").click();
        });

        test("handle submit - number field", () => {
            props.componentType = ComponentTypeEnum.NumberField;
            props.page.components[0].type = ComponentTypeEnum.NumberField;
            const mockData3 = {
                metadata: {},
                startPage: "/first-page",
                pages: [
                    {
                        title: "First page",
                        path: "/first-page",
                        components: [
                            {
                                name: "gnMmdD",
                                options: {},
                                type: ComponentTypeEnum.NumberField,
                                title: "Text 1",
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
                userId: "test-user-id",
                createdBy: "Test User 1",
                id: "KespT1YRxy",
                key: "KespT1YRxy",
                displayName: "test-component-edit",
                name: "test-component-edit",
                lastModified: "2023/07/21 11:01",
                formStatus: "In development",
                lastUpdatedByName: "Test User 1",
                lastUpdatedById: "test-user-id",
            };
            componentProps.selectedComponent.type =
                ComponentTypeEnum.NumberField;
            const { getByText, getByLabelText } = render(
                <RenderWithAllContexts
                    componentProps={componentProps}
                    mockData={mockData3}
                    mockSave={mockSave}
                >
                    <ComponentEdit {...props} />
                </RenderWithAllContexts>
            );
            expect(getByLabelText("Help text (optional)")).toBeInTheDocument();
            const hint = getByLabelText("Help text (optional)");
            if (!hint) return;
            fireEvent.change(hint, {
                target: {
                    value: "new hint added",
                },
            });
            getByText("Save").click();
        });

        test("handle submit - number field with prefix", () => {
            props.componentType = ComponentTypeEnum.NumberField;
            props.page.components[0].type = ComponentTypeEnum.NumberField;
            const mockData3 = {
                metadata: {},
                startPage: "/first-page",
                pages: [
                    {
                        title: "First page",
                        path: "/first-page",
                        components: [
                            {
                                name: "gnMmdD",
                                options: {},
                                type: ComponentTypeEnum.NumberField,
                                title: "Text 1",
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
                userId: "test-user-id",
                createdBy: "Test User 1",
                id: "KespT1YRxy",
                key: "KespT1YRxy",
                displayName: "test-component-edit",
                name: "test-component-edit",
                lastModified: "2023/07/21 11:01",
                formStatus: "In development",
                lastUpdatedByName: "Test User 1",
                lastUpdatedById: "test-user-id",
            };
            const componentProps1 = {
                selectedComponent: {
                    name: "gnMmdD",
                    componentEdited: false,
                    title: "Text 1",
                    type: ComponentTypeEnum.NumberField,
                    prefixType: "currency",
                },
                initialName: "gnMmdD",
                errors: {},
                hasValidated: false,
                selectedListName: "",
                hint: "",
                attrs: {},
                options: {
                    hideTitle: false,
                    optionalText: false,
                    required: true,
                },
            };
            const { getByText, getByLabelText } = render(
                <RenderWithAllContexts
                    componentProps={componentProps1}
                    mockData={mockData3}
                    mockSave={mockSave}
                >
                    <ComponentEdit {...props} />
                </RenderWithAllContexts>
            );
            expect(getByLabelText("Help text (optional)")).toBeInTheDocument();
            const hint = getByLabelText("Help text (optional)");
            if (!hint) return;
            fireEvent.change(hint, {
                target: {
                    value: "new hint added",
                },
            });
            getByText("Save").click();
        });
    });
});
