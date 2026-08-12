import { formConfigurationsReducer } from "../reducers";
import { LoadingState } from "../types";
import { listFormConfigurations, deleteFormConfigurations, formConfigurationsSelector } from "../reducers/formConfigurationsReducer"
import { fetchAllformConfigs, deleteFormConfig } from "../../api/formConfigurationsApi";

jest.mock("../../api/formConfigurationsApi")

describe("Reducer - form configuration reducer", () => {
    const initialState = {
        loading: LoadingState.Idle,
        entities: [],
    }
    const mockResponse = [
        { id: "test-form-id-1", Key: "test-form-id-1" }
    ]
    test("should return the initial state", () => {
        expect(formConfigurationsReducer(undefined, { type: undefined })).toEqual(initialState)
    })
    test("list form configuration thunk", async () => {
        // @ts-ignore
        fetchAllformConfigs.mockImplementationOnce(() => {
            return { data: mockResponse, error: "" }
        })
        const action = await listFormConfigurations();
        const mockDispatch = jest.fn();
        const mockGetState = jest.fn().mockReturnValue({
            loading: LoadingState.Idle,
            entities: mockResponse,
        })
        await action(mockDispatch, mockGetState, undefined)
        expect(mockDispatch).toHaveBeenCalled();
    })
    test("list form configuration thunk -- error", async () => {
        // @ts-ignore
        fetchAllformConfigs.mockImplementationOnce(() => {
            return { data: [], error: "server error" }
        })
        const action = await listFormConfigurations();
        const mockDispatch = jest.fn();
        const mockGetState = jest.fn().mockReturnValue({
            loading: LoadingState.Idle,
            entities: mockResponse,
        })
        await action(mockDispatch, mockGetState, undefined)
        expect(mockDispatch).toHaveBeenCalled();
    })
    test("delete form configuration thunk", async () => {
        // @ts-ignore
        deleteFormConfig.mockImplementationOnce(() => ({
            status: true,
            error: "",
        }))
        const action = await deleteFormConfigurations("test-id");
        const mockDispatch = jest.fn();
        const mockGetState = jest.fn().mockReturnValue({
            loading: LoadingState.Idle,
            entities: mockResponse,
        })
        await action(mockDispatch, mockGetState, undefined)
        expect(mockDispatch).toHaveBeenCalled();
    })
    test("delete form configuration thunk -- delete", async () => {
        // @ts-ignore
        deleteFormConfig.mockImplementationOnce(() => ({
            status: false,
            error: "server error",
        }))
        const action = await deleteFormConfigurations("test-id");
        const mockDispatch = jest.fn();
        const mockGetState = jest.fn().mockReturnValue({
            loading: LoadingState.Idle,
            entities: mockResponse,
        })
        await action(mockDispatch, mockGetState, undefined)
        expect(mockDispatch).toHaveBeenCalled();
    })
    test("form configuration selector", () => {
        //@ts-ignore
        expect(formConfigurationsSelector({
            formConfigurations: {
                loading: LoadingState.Succeeded,
                //@ts-ignore
                entities: mockResponse
            }
        }).data).toEqual(mockResponse)
    })
    test("should return the list form configuration loading state - pending", () => {
        expect(formConfigurationsReducer(undefined, { type: "formConfigurations/listFormConfigurations/pending" }).loading).toEqual(LoadingState.Pending)
    })
    test("should return the list form configuration loading state - rejected", () => {
        expect(formConfigurationsReducer(undefined, { type: "formConfigurations/listFormConfigurations/rejected" }).loading).toEqual(LoadingState.Failed)
    })
    test("should return the list form configuration loading state - succeeded", () => {
        expect(formConfigurationsReducer(undefined, { type: "formConfigurations/listFormConfigurations/fulfilled", payload: { data: mockResponse } }).loading).toEqual(LoadingState.Succeeded)
    })
    test("should return the delete form configuration loading state - pending", () => {
        expect(formConfigurationsReducer(undefined, { type: "formConfigurations/deleteFormConfigurations/pending" }).loading).toEqual(LoadingState.Pending)
    })
    test("should return the delete form configuration loading state - rejected", () => {
        expect(formConfigurationsReducer(undefined, { type: "formConfigurations/deleteFormConfigurations/rejected" }).loading).toEqual(LoadingState.Failed)
    })
    test("should return the delete form configuration loading state - succeeded", () => {
        //@ts-ignores
        expect(formConfigurationsReducer({ loading: LoadingState.Idle, entities: mockResponse }, { type: "formConfigurations/deleteFormConfigurations/fulfilled", payload: "test-form-id-1" }).loading).toEqual(LoadingState.Succeeded)
    })
})