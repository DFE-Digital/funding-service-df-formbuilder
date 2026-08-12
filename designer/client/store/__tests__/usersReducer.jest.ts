import { usersReducer } from "../reducers";
import { LoadingState } from "../types";
import { getCurrentUserInfo, currentUserSelector } from "../reducers/usersReducer"
import { getCurrentUserData } from "../../api/usersApi";

jest.mock("../../api/usersApi")

describe("Reducer - user reducer", () => {
    const initialState = {
        currentUser: {
            loading: LoadingState.Idle,
            data: {
                id: "",
                name: "",
                isSessionActive: false,
                homeAccountId: "",
            },
        }
    }
    const mockResponse = {
        id: "test-user-id",
        name: "test-user-name",
        isSessionActive: true,
        homeAccountId: "test-home-account-id",
    }
    test("should return the initial state", () => {
        expect(usersReducer(undefined, { type: undefined })).toEqual(initialState)
    })
    test("get current user info thunk", async () => {
        // @ts-ignore
        getCurrentUserData.mockImplementationOnce(() => (mockResponse))
        const infoAction = await getCurrentUserInfo();
        const mockDispatch = jest.fn();
        const mockGetState = jest.fn().mockReturnValue({
            currentUser: {
            loading: LoadingState.Idle,
            data: mockResponse,
            }
        })
        await infoAction(mockDispatch, mockGetState, undefined)
        expect(mockDispatch).toHaveBeenCalled();
      
    })
    test("current user selector", () => {
        //@ts-ignore
        expect(currentUserSelector({
            users: {
                currentUser: {
                    loading: LoadingState.Succeeded,
                    data: mockResponse
                }
            }
        }).data).toEqual(mockResponse)
    })
    test("should return the current user loading state - pending", () => {
        expect(usersReducer(undefined, { type: "users/getCurrentUserInfo/pending" }).currentUser.loading).toEqual(LoadingState.Pending)
    })
    test("should return the current user loading state - rejected", () => {
        expect(usersReducer(undefined, { type: "users/getCurrentUserInfo/rejected" }).currentUser.loading).toEqual(LoadingState.Failed)
    })
    test("should return the current user loading state - succeeded", () => {
        expect(usersReducer(undefined, { type: "users/getCurrentUserInfo/fulfilled", payload: mockResponse }).currentUser.loading).toEqual(LoadingState.Succeeded)
    })
})