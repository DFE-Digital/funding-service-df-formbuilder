import React from "react";
import {
    render,
    cleanup,
    fireEvent,
    screen,
    waitFor,
} from "@testing-library/react";

import { Section } from "@xgovformbuilder/model";

import { renderWithProviders } from "../../../__tests__/helpers/RenderWithProviders";
import { LoadingState } from "../../../store/types";
import FormSection from "../FormSectionPage";

const mockHistoryPush = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}));

const newSection: Section = {
    title: "",
    name: "testid4",
    repeatableSection: false,
    numberComp: "",
    conditionComp: "",
};

const entities: Section[] = [
    {
        name: "testid1",
        title: "testid1",
    },
    {
        name: "testid2",
        title: "testid2",
        repeatableSection: true,
        numberComp: "testnum1",
    },
    {
        name: "testid3",
        title: "testid3",
        repeatableSection: true,
        numberComp: "testnum1",
        conditionComp: "testcond1",
    },
];

const sampleForm = {
    id: "parent1",
    key: "parent1",
    displayName: "Parent 1",
    lastModified: "2022/05/27 00:53",
    lastDownloaded: "2022/05/27 00:53",
    lastUpdatedByName: "John Doe",
    lastUpdatedById: "local-account-id",
    createdBy: "John Doe",
    userId: "local-account-id",
    pages: [],
    conditions: [],
    lists: [],
    sections: entities,
    confirmationMsg: "",
    fees: [],
    calculations: [],
};

describe("Form section page", () => {
    afterEach(() => jest.resetAllMocks());
    afterEach(cleanup);

    test("should render correctly", async () => {
        renderWithProviders(<FormSection />, {
            preloadedState: {
                formSection: {
                    loading: LoadingState.Idle,
                    form: sampleForm,
                    entities: entities,
                    newSection: newSection,
                    selectedSection: null,
                    numberComponents: [],
                    conditionalComponents: [],
                },
            },
        });
        expect(
            await screen.findByText("Add or edit sections")
        ).toBeInTheDocument();
    });

    test("on edit navigates to correct page", async () => {
        const { container } = renderWithProviders(<FormSection />, {
            preloadedState: {
                formSection: {
                    loading: LoadingState.Idle,
                    form: sampleForm,
                    entities: entities,
                    newSection: newSection,
                    selectedSection: null,
                    numberComponents: [],
                    conditionalComponents: [],
                },
            },
        });
        const radioButton = container.querySelector("#section-testid3-0");
        fireEvent.click(radioButton!);
        fireEvent.click(await screen.getByText("Edit section"));
        expect(mockHistoryPush).toHaveBeenCalledWith("//edit");
    });
});
