import React from "react";
import { renderWithProviders } from "../../../__tests__/helpers/RenderWithProviders";
import ParentChildModule from "../ParentChildModule";
import { FormConfigurationWithChild, LoadingState } from "../../../store/types";
import { MsalReactTester } from "../../../__tests__/helpers/MsalReactTester";
import MsalClientApplication from "../../../auth/clientApplication";
import { FormDefinition, FormStatus } from "@xgovformbuilder/model";
import {
    fetchAllformConfigs,
    getConfiguration,
    getCurrentUserData,
} from "../../../api";
import { act } from "@testing-library/react";

jest.mock("../../../api/formConfigurationsApi");
jest.mock("../../../api/usersApi");

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
    LastModified: "2022/05/27 00:53",
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
            LastModified: "2022/05/27 00:53",
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
            LastModified: "2022/05/27 00:53",
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

const sampleFormWithChildsDefinition: FormDefinition = {
    id: "parent1",
    key: "parent1",
    displayName: "Parent 1",
    lastModified: "2022/05/27 00:53",
    lastDownloaded: "2022/05/27 00:53",
    pages: [],
    conditions: [],
    lists: [],
    sections: [],
    confirmationMsg: "",
    fees: [],
    calculations: [],
    lastUpdatedByName: "John Doe",
    lastUpdatedById: "local-account-id",
    createdBy: "John Doe",
    userId: "local-account-id",
    parentChild: {
        id: "pc1",
        isMainParent: true,
        parentChildConfig: {
            description: "test description",
            childHeading: "test heading",
            childConfigs: [
                {
                    childId: "child1",
                    childFormName: "Child 1",
                    cardOrder: 0,
                    dependentforms: [],
                    dateComponent: "",
                    helpText: "",
                    parentId: "parent1",
                },
                {
                    childId: "child2",
                    childFormName: "Child 2",
                    cardOrder: 1,
                    dependentforms: [],
                    dateComponent: "",
                    helpText: "",
                    parentId: "parent1",
                },
            ],
        },
    },
};

describe("Parent & Child Module", () => {
    let msalTester: MsalReactTester;

    beforeEach(async () => {
        msalTester = new MsalReactTester();
        await msalTester.spyMsal();
        await msalTester.isLogged();
        //@ts-ignore
        MsalClientApplication.instance = msalTester.client;
    });

    afterEach(() => {
        msalTester.resetSpyMsal();
    });

    afterAll(() => {
        jest.resetAllMocks();
    });

    describe("Render Tests", () => {
        test("Default render", () => {
            act(() => {});
            (fetchAllformConfigs as jest.Mock).mockResolvedValue({
                data: [
                    sampleFormWithChilds,
                    sampleFormWithChilds.childs[0],
                    sampleFormWithChilds.childs[1],
                ],
                error: "",
            });
            (getConfiguration as jest.Mock).mockResolvedValue({
                data: sampleFormWithChildsDefinition,
                error: "",
            });
            (getCurrentUserData as jest.Mock).mockResolvedValue({
                id: "local-account-id",
                name: "John Doe",
                isSessionActive: true,
                homeAccountId: "home-account-id",
            });
            const { container, debug } = renderWithProviders(
                <ParentChildModule />,
                {
                    preloadedState: {
                        parentChild: {
                            loading: LoadingState.Idle,
                            selectedParentForm: null,
                            selectedFormData: null,
                            isEdit: false,
                            originalParentChildDetails: {
                                id: "",
                                isMainParent: true,
                                parentChildConfig: {
                                    description: "description",
                                    childHeading: "heading",
                                    childConfigs: [
                                        {
                                            childId: "child1",
                                            childFormName: "child1",
                                            cardOrder: 0,
                                            dependentforms: [],
                                            dateComponent: "",
                                            helpText: "",
                                            parentId: "",
                                        },
                                        {
                                            childId: "child2",
                                            childFormName: "child2",
                                            cardOrder: 1,
                                            dependentforms: [],
                                            dateComponent: "",
                                            helpText: "",
                                            parentId: "",
                                        },
                                    ],
                                },
                            },
                            markAsParent: "1",
                            description: "description",
                            childHeading: "heading",
                            childConfigs: [
                                {
                                    childId: "child1",
                                    childFormName: "child1",
                                    cardOrder: 0,
                                    dependentforms: [],
                                    dateComponent: "",
                                    helpText: "new",
                                    parentId: "",
                                },
                                {
                                    childId: "child2",
                                    childFormName: "child2",
                                    cardOrder: 1,
                                    dependentforms: [],
                                    dateComponent: "",
                                    helpText: "",
                                    parentId: "",
                                },
                            ],
                            isChildEdit: false,
                            editChild: null,
                            editChildIndex: null,
                            newChildConfig: {
                                childId: "",
                                childFormName: "",
                                cardOrder: 0,
                                dependentforms: [],
                                dateComponent: "",
                                helpText: "",
                                parentId: "",
                            },
                            parentDetails: null,
                            selectedDependents: [],
                        },
                    },
                    msalInstance: msalTester.client,
                }
            );
            debug();
            expect(container).toBeInTheDocument();
        });
    });
});
