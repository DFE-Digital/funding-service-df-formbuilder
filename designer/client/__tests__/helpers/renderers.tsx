import React, { useReducer } from "react";
import {
    ComponentContext,
    componentReducer,
    initComponentState,
} from "../../reducers/component/componentReducer";
import { DataContext, TabsContext } from "../../context";
import { FormDefinition, TabInputType } from "@xgovformbuilder/model";

export function RenderWithContext({ children, stateProps = {} }) {
    const [state, dispatch] = useReducer(
        componentReducer,
        initComponentState({
            ...stateProps,
        })
    );
    return (
        <ComponentContext.Provider value={{ state, dispatch }}>
            {children}
        </ComponentContext.Provider>
    );
}

export function RenderWithContextAndDataContext({
    children,
    stateProps = {},
    mockData = {},
    mockSave = jest.fn(),
}) {
    const [state, dispatch] = useReducer(
        componentReducer,
        initComponentState({
            ...stateProps,
        })
    );

    return (
        <DataContext.Provider
            value={{ data: mockData as FormDefinition, save: mockSave }}
        >
            <ComponentContext.Provider value={{ state, dispatch }}>
                {children}
            </ComponentContext.Provider>
        </DataContext.Provider>
    );
}

export const RenderWithAllContexts = ({
    children,
    componentProps = {},
    mockData = {},
    mockSave = jest.fn(),
    mockDynamicDataSet = {
        ["1-1"]: {
            tabLabel: "sampleLabel",
            tabHeader: "sampleHeader",
            type: TabInputType.PARAGRAPH,
            value: "sampleValue",
        },
    },
    mockSetDynamicDataSet = jest.fn(),
}) => {
    const [state, dispatch] = useReducer(componentReducer, {
        ...initComponentState({}),
        ...componentProps,
    });
    return (
        <DataContext.Provider
            value={{ data: mockData as FormDefinition, save: mockSave }}
        >
            <TabsContext.Provider
                value={{
                    dynamicDataSet: mockDynamicDataSet,
                    setDynamicDataSet: mockSetDynamicDataSet,
                }}
            >
                <ComponentContext.Provider value={{ state, dispatch }}>
                    {children}
                </ComponentContext.Provider>
            </TabsContext.Provider>
        </DataContext.Provider>
    );
};
