import { render, fireEvent } from "@testing-library/react";
import { RenderWithContext } from "./helpers/renderers";
import { Component } from "../component";
import { ComponentTypeEnum } from "@xgovformbuilder/model";
import React from "react";

// Stub LinkedPropertiesDetails to avoid running linkedProperties logic during unit tests
jest.mock("../utils/LinkedPropertiesDetails", () => ({
    __esModule: true,
    default: () => <div />,
}));

const data = {
    metadata: {},
    startPage: "/first-page",
    pages: [
        {
            title: "First page",
            path: "/first-page",
            components: [],
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
                    name: "xZYLot",
                    options: {},
                    type: "NumberField",
                    title: "Number 1",
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
    userId: "test-user-id",
    createdBy: "test-user-name",
    id: "uwd9m0Zv08",
    key: "uwd9m0Zv08",
    displayName: "list-page-refactor",
    name: "list-page-refactor",
    lastModified: "2023/08/08 12:59",
    formStatus: "In development",
    lastUpdatedByName: "test-user-name",
    lastUpdatedById: "test-user-id",
    skipSummary: false,
    signInRequired: false,
    file: {},
    importedDataSets: [
        {
            fileTitle: "List Items 1",
            fileName: "List Items 1.csv",
            uploadedDate: "2023-08-01T10:58:30.745Z",
            fileId: "sMQSiG",
        },
        {
            fileTitle: "Non List Item 1",
            fileName: "sample-csv-file.csv",
            uploadedDate: "2023-08-02T08:56:03.172Z",
            fileId: "qZouqx",
        },
    ],
};

const componentTypeClass = {
    [ComponentTypeEnum.TextField]: ".box",
    [ComponentTypeEnum.TelephoneNumberField]: ".tel",
    [ComponentTypeEnum.EmailAddressField]: ".email",
    [ComponentTypeEnum.UkAddressField]: ".box",
    [ComponentTypeEnum.MultilineTextField]: ".tall",
    [ComponentTypeEnum.NumberField]: ".number",
    [ComponentTypeEnum.Result]: ".result",
    [ComponentTypeEnum.Filedownload]: ".filedownload",
    [ComponentTypeEnum.DataImport]: ".data-import",
    [ComponentTypeEnum.DSIAccess]: ".dsiDataIcon",
    [ComponentTypeEnum.RadiosField]: ".circle",
    [ComponentTypeEnum.CheckboxesField]: ".check",
    [ComponentTypeEnum.SelectField]: ".dropdown",
    [ComponentTypeEnum.YesNoField]: ".circle",
    [ComponentTypeEnum.FileUploadField]: ".short",
    [ComponentTypeEnum.Details]: ".short",
    [ComponentTypeEnum.InsetText]: ".line",
    [ComponentTypeEnum.Para]: ".line",
    [ComponentTypeEnum.List]: ".line",
    [ComponentTypeEnum.Html]: ".html",
    [ComponentTypeEnum.TableDataset]: ".table-dataset",
    [ComponentTypeEnum.Tabs]: ".tabs-dataset",
};

const componentList = Object.entries(componentTypeClass).map((entry) => {
    return {
        type: entry[0],
        name: entry[0],
        class: entry[1],
    };
});

describe("Component", () => {
    const page = {
        path: "/second-page",
        title: "Second page",
        components: [
            {
                name: "xZYLot",
                options: {},
                type: "NumberField",
                title: "Number 1",
                schema: {},
            },
        ],
        next: [
            {
                path: "/summary",
            },
        ],
    };
    componentList.forEach((component) => {
        test(`Render ${component.type}`, () => {
            const { container, unmount } = render(
                <Component component={component} />
            );
            expect(
                container.querySelector(component.class)
            ).toBeInTheDocument();
            unmount();
        });
    });
    test("Toggle show editor", () => {
        const { container, unmount } = render(
            <Component
                component={{
                    name: "xZYLot",
                    options: {},
                    type: "NumberField",
                    title: "Number 1",
                    schema: {},
                }}
                page={page}
                data={data}
            />
        );
        expect(container.querySelector(".number")).toBeInTheDocument();
        const componentDiv = container.querySelector(".component");
        if (!componentDiv) return;
        fireEvent.click(componentDiv);
        unmount();
    });
});
