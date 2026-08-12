import { setupStore } from "../../store/store";

describe("Redux Store test", () => {
    const store = setupStore();
    test("Validate initial state of redux store", () => {
        const storeState = store.getState();
        expect(storeState.hasOwnProperty("formConfigurations")).toBeTruthy()
        expect(storeState.hasOwnProperty("users")).toBeTruthy()
        expect(storeState.hasOwnProperty("dashboard")).toBeTruthy()
        expect(storeState.hasOwnProperty("list")).toBeTruthy()

    })
})