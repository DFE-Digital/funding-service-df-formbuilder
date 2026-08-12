import React from "react";
import { FormStatus } from "@xgovformbuilder/model";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import DeleteFormModule from "../DeleteFormModule";
import { renderWithProviders } from "../../../__tests__/helpers/RenderWithProviders";
import { MsalReactTester } from "../../../__tests__/helpers/MsalReactTester";
import MsalClientApplication from "../../../auth/clientApplication";
import { getFormConfigWithChildByListFormForDelete } from "../../../api/deleteApi";
import { FormConfigurationWithChild, LoadingState } from "../../../store/types";

jest.mock("../../../api/deleteApi");

const mockHistoryPush = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}));

const sampleFormWithChilds: FormConfigurationWithChild = {
    Key: "parent1",
    DisplayName: "Parent 1",
    CreatedBy: "John Doe",
    FormStatus: FormStatus.InDevelopment,
    LastModified: undefined,
    feedbackForm: false,
    UserId: "local-account-id",
    signInRequired: false,
    lastModifiedByName: "John Doe",
    lastModifiedById: "local-account-id",
    childAndDependentsForms: ["child1", "child2"],
    childs: [
        {
            Key: "child1",
            DisplayName: "Child 1",
            CreatedBy: "John Doe",
            FormStatus: FormStatus.InDevelopment,
            LastModified: undefined,
            feedbackForm: false,
            UserId: "local-account-id",
            signInRequired: false,
            lastModifiedByName: "John Doe",
            lastModifiedById: "local-account-id",
            childAndDependentsForms: [],
            childs: [],
        },
        {
            Key: "child2",
            DisplayName: "Child 2",
            CreatedBy: "John Doe",
            FormStatus: FormStatus.InDevelopment,
            LastModified: undefined,
            feedbackForm: false,
            UserId: "local-account-id",
            signInRequired: false,
            lastModifiedByName: "John Doe",
            lastModifiedById: "local-account-id",
            childAndDependentsForms: [],
            childs: [],
        },
    ],
};

describe("Delete Form Module", () => {
    let msalTester: MsalReactTester;

    beforeEach(() => {
        msalTester = new MsalReactTester();
        msalTester.spyMsal();
        msalTester.isLogged();
        //@ts-ignore
        MsalClientApplication.instance = msalTester.client;
    });

    afterEach(() => {
        msalTester.resetSpyMsal();
    });

    afterAll(() => {
        jest.resetAllMocks();
    });

    describe("Render tests", () => {
        test("default render - without data", async () => {
            (getFormConfigWithChildByListFormForDelete as jest.Mock).mockResolvedValue(
                {
                    form: sampleFormWithChilds,
                    isChild: false,
                }
            );
            msalTester.isLogged();
            const { container } = renderWithProviders(<DeleteFormModule />, {
                preloadedState: {
                    deleteForm: {
                        selectedFormConfig: null,
                        loading: LoadingState.Idle,
                        isParentSelected: null,
                        isChild: false,
                        selectedChildForms: [],
                        details: {
                            show: false,
                            data: null,
                        },
                    },
                },
            });
            await waitFor(() => {
                expect(
                    container.querySelector("#delete-form")
                ).toBeInTheDocument();
            });
        });
        test("default render", () => {
            msalTester.isLogged();
            const { container } = renderWithProviders(<DeleteFormModule />, {
                preloadedState: {
                    deleteForm: {
                        selectedFormConfig: sampleFormWithChilds,
                        loading: LoadingState.Idle,
                        isParentSelected: null,
                        isChild: false,
                        selectedChildForms: [],
                        details: {
                            show: false,
                            data: null,
                        },
                    },
                },
            });
            expect(container.querySelector("#delete-form")).toBeInTheDocument();
        });
    });

    describe("Interaction tests", () => {
        test("Invoke goBack", async () => {
            msalTester.isLogged();
            renderWithProviders(<DeleteFormModule />, {
                preloadedState: {
                    deleteForm: {
                        selectedFormConfig: sampleFormWithChilds,
                        loading: LoadingState.Idle,
                        isParentSelected: null,
                        isChild: false,
                        selectedChildForms: [],
                        details: {
                            show: false,
                            data: null,
                        },
                    },
                },
            });
            const backLink = await screen.findByText("Back");
            if (!backLink) {
                return fail("Back link not found");
            }
            fireEvent.click(backLink);
            expect(mockHistoryPush).toHaveBeenCalledWith("/dashboard");
        });
        test("Invoke details modal", async () => {
            msalTester.isLogged();
            const { container } = renderWithProviders(<DeleteFormModule />, {
                preloadedState: {
                    deleteForm: {
                        selectedFormConfig: sampleFormWithChilds,
                        loading: LoadingState.Idle,
                        isParentSelected: null,
                        isChild: false,
                        selectedChildForms: [],
                        details: {
                            show: false,
                            data: null,
                        },
                    },
                },
            });
            const detailsLink = await screen.findAllByText("View");
            if (detailsLink.length === 0) {
                return fail("Details link not found");
            }
            expect(container.querySelector(".modal")).not.toBeInTheDocument();
            fireEvent.click(detailsLink[0]);
            expect(container.querySelector(".modal")).toBeInTheDocument();
            fireEvent.click(container.querySelector(".close")!);
            expect(container.querySelector(".modal")).not.toBeInTheDocument();
        });
        test("Invoke parent form select", async () => {
            msalTester.isLogged();
            renderWithProviders(<DeleteFormModule />, {
                preloadedState: {
                    deleteForm: {
                        selectedFormConfig: sampleFormWithChilds,
                        loading: LoadingState.Idle,
                        isParentSelected: null,
                        isChild: false,
                        selectedChildForms: [],
                        details: {
                            show: false,
                            data: null,
                        },
                    },
                },
            });
            let parentSelect = await screen.getAllByRole("checkbox");
            if (parentSelect.length === 0) {
                return fail("Parent form select checkbox not found");
            }
            expect(parentSelect[0]["checked"]).not.toBeTruthy();
            fireEvent.click(parentSelect[0]);
            parentSelect = await screen.getAllByRole("checkbox");
            expect(parentSelect[0]["checked"]).toBeTruthy();
        });
        test("Invoke child form select", async () => {
            msalTester.isLogged();
            renderWithProviders(<DeleteFormModule />, {
                preloadedState: {
                    deleteForm: {
                        selectedFormConfig: sampleFormWithChilds,
                        loading: LoadingState.Idle,
                        isParentSelected: null,
                        isChild: false,
                        selectedChildForms: [],
                        details: {
                            show: false,
                            data: null,
                        },
                    },
                },
            });
            let childSelect = await screen.getAllByRole("checkbox");
            if (childSelect.length < 2) {
                return fail("Child form select checkbox not found");
            }
            expect(childSelect[1]["checked"]).not.toBeTruthy();
            fireEvent.click(childSelect[1]);
            childSelect = await screen.getAllByRole("checkbox");
            expect(childSelect[1]["checked"]).toBeTruthy();
        });
    });
});
