import React from "react";
import { render } from "@testing-library/react";
import { DataPrettyPrint, componentToString } from "../DataPrettyPrint";

describe("Data Pretty Print", () => {
    const props = {
        data: {
            sections: [] as any[],
            pages: [{
                section: null  as null | string,
                components: [
                    {
                        name: "IJKDTg",
                        options: {},
                        type: "TextField",
                        title: "Test text 1",
                        schema: {}
                    }
                ]
            }]
        }
    }

    test("should render component info", () => {
        const { getByTestId } = render(
            <DataPrettyPrint {...props} />
        );
        const model = {
            ["IJKDTg"]: "TextField"
        };
        expect(getByTestId("formatted-model").innerHTML).toEqual(JSON.stringify(model, null, 2));
    });

    test("should render correct component info with section", () => {
        props.data.sections = [
            {
                name: "section"
            }
        ];
        props.data.pages[0].section = "section";
        const { getByTestId } = render(
            <DataPrettyPrint {...props} />
        );
        const model = {
            section: {
                ["IJKDTg"]: "TextField"
            }
        };
        expect(getByTestId("formatted-model").innerHTML).toEqual(JSON.stringify(model, null, 2));
    });

    test("should convert component info to string", () => {
        const component = {
            type: "RadiosField",
            options: {
                list: "list"
            }
        };
        expect(componentToString(component)).toEqual("RadiosField<list>");
        component.type = "TextField";
        expect(componentToString(component)).toEqual("TextField");
    });
});
