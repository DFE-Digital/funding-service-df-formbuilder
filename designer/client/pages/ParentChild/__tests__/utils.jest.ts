import { FormAccessType, FormStatus } from "@xgovformbuilder/model";
import {
    DashboardState,
    DateEnum,
    LoadingState,
    ParentChildState,
} from "../../../store/types";
import { FormConfigurationTabs } from "../../../utils";
import {
    checkIfNewChangesAreMade,
    parentChildMapper,
    removeParentAndExistingChild,
} from "../utils";

describe("Parent & Child - Utils", () => {
    test("parentChildMapper function", () => {
        const emptyState: ParentChildState = {
            loading: LoadingState.Idle,
            selectedParentForm: null,
            selectedFormData: null,
            isEdit: false,
            originalParentChildDetails: null,
            markAsParent: "0",
            description: "",
            childHeading: "",
            childConfigs: [],
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
                condition: "",
                conditionName: "",
                isMainChild: true
            },
            parentDetails: null,
            selectedDependents: [],
        };

        const result = parentChildMapper(emptyState);
        expect(result.isMainParent).toBeFalsy();
    });

    test("removeParentAndExistingChild function", () => {
        const emptyState: ParentChildState = {
            loading: LoadingState.Idle,
            selectedParentForm: {
                Key: "parent",
                DisplayName: "parent",
                CreatedBy: "user1",
                FormStatus: FormStatus.InDevelopment,
                LastModified: "",
                feedbackForm: true,
                UserId: "user1",
                signInRequired: true, //Public/DFE SignIn
                lastModifiedByName: "user1",
                lastModifiedById: "user1",
                childAndDependentsForms: ["child"],
                childs: [
                    {
                        Key: "child",
                        DisplayName: "child",
                        CreatedBy: "user1",
                        FormStatus: FormStatus.InDevelopment,
                        LastModified: "",
                        feedbackForm: true,
                        UserId: "user1",
                        signInRequired: true, //Public/DFE SignIn
                        lastModifiedByName: "user1",
                        lastModifiedById: "user1",
                        childAndDependentsForms: [],
                        childs: [],
                    },
                ],
            },
            selectedFormData: null,
            isEdit: false,
            originalParentChildDetails: null,
            markAsParent: "0",
            description: "",
            childHeading: "",
            childConfigs: [
                {
                    childId: "child1",
                    childFormName: "child1",
                    cardOrder: 0,
                    dependentforms: [],
                    dateComponent: "",
                    helpText: "",
                    parentId: "",
                    condition: "",
                    conditionName: "",
                    isMainChild: true
                },
                {
                    childId: "child2",
                    childFormName: "child2",
                    cardOrder: 1,
                    dependentforms: [],
                    dateComponent: "",
                    helpText: "",
                    parentId: "",
                    condition: "",
                    conditionName: "",
                    isMainChild: true
                },
            ],
            isChildEdit: false,
            editChild: null,
            editChildIndex: null,
            newChildConfig: {
                childId: "child3",
                childFormName: "child3",
                cardOrder: 0,
                dependentforms: [],
                dateComponent: "",
                helpText: "",
                parentId: "",
                condition: "",
                conditionName: "",
                isMainChild: true
            },
            parentDetails: null,
            selectedDependents: [],
        };
        const emptyDashboardState: DashboardState = {
            loading: LoadingState.Idle,
            selectedTab: FormConfigurationTabs.MyForms,
            selectedFormConfig: null,
            myForms: [
                {
                    Key: "child1",
                    DisplayName: "child1",
                    CreatedBy: "user1",
                    FormStatus: FormStatus.InDevelopment,
                    LastModified: "",
                    feedbackForm: true,
                    UserId: "user1",
                    signInRequired: true, //Public/DFE SignIn
                    lastModifiedByName: "user1",
                    lastModifiedById: "user1",
                    childAndDependentsForms: [""],
                    childs: [],
                },
                {
                    Key: "child2",
                    DisplayName: "child2",
                    CreatedBy: "user1",
                    FormStatus: FormStatus.InDevelopment,
                    LastModified: "",
                    feedbackForm: true,
                    UserId: "user1",
                    signInRequired: true, //Public/DFE SignIn
                    lastModifiedByName: "user1",
                    lastModifiedById: "user1",
                    childAndDependentsForms: [""],
                    childs: [],
                },
                {
                    Key: "child3",
                    DisplayName: "child3",
                    CreatedBy: "user1",
                    FormStatus: FormStatus.InDevelopment,
                    LastModified: "user1",
                    feedbackForm: true,
                    UserId: "user1",
                    signInRequired: true, //Public/DFE SignIn
                    lastModifiedByName: "user1",
                    lastModifiedById: "user1",
                    childAndDependentsForms: [""],
                    childs: [],
                },
            ],
            colForms: [],
            createdBy: [],
            summaryInfo: {
                total: {
                    my_forms: 0,
                    col_forms: 0,
                    title: "All forms",
                    total: 0,
                },
                [FormStatus.InDevelopment]: {
                    my_forms: 0,
                    col_forms: 0,
                    title: "Status - In development",
                    total: 0,
                },
                [FormStatus.UAT]: {
                    my_forms: 0,
                    col_forms: 0,
                    title: "Status - UAT",
                    total: 0,
                },
                [FormStatus.Published]: {
                    my_forms: 0,
                    col_forms: 0,
                    title: "Status - Published",
                    total: 0,
                },
                [FormStatus.Closed]: {
                    my_forms: 0,
                    col_forms: 0,
                    title: "Status - Closed",
                    total: 0,
                },
            },
            filter: {
                show: false,
                formStatus: {
                    [FormStatus.InDevelopment]: false,
                    [FormStatus.UAT]: false,
                    [FormStatus.Published]: false,
                    [FormStatus.Closed]: false,
                },
                formAccessType: {
                    [FormAccessType.Public]: false,
                    [FormAccessType.DFESignIn]: false,
                },
                modifiedOn: {
                    from: {
                        [DateEnum.Day]: 0,
                        [DateEnum.Month]: 0,
                        [DateEnum.Year]: 0,
                    },
                    till: {
                        [DateEnum.Day]: 0,
                        [DateEnum.Month]: 0,
                        [DateEnum.Year]: 0,
                    },
                },
                search: "",
                createdBy: [],
            },
            details: {
                show: false,
                data: null,
            },
            isChild: false,
            filteredMyForms: [],
            filteredColForms: []
        };
        const result = removeParentAndExistingChild(
            emptyState,
            FormConfigurationTabs.MyForms,
            emptyDashboardState.filteredMyForms,
            {
                id: "user1",
                name: "user1",
                isSessionActive: true,
                homeAccountId: "user1",
            }
        );
        expect(result.length).toEqual(1);
        expect(result[0].Key).toEqual("child");
    });

    test("checkIfNewChangesAreMade function", () => {
        const state: ParentChildState = {
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
                            condition: "",
                            conditionName: "",
                            isMainChild: true
                        },
                        {
                            childId: "child2",
                            childFormName: "child2",
                            cardOrder: 1,
                            dependentforms: [],
                            dateComponent: "",
                            helpText: "",
                            parentId: "",
                            condition: "",
                            conditionName: "",
                            isMainChild: true
                        },
                    ],
                },
            },
            markAsParent: "0",
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
                    condition: "",
                    conditionName: "",
                    isMainChild: true
                },
                {
                    childId: "child2",
                    childFormName: "child2",
                    cardOrder: 1,
                    dependentforms: [],
                    dateComponent: "",
                    helpText: "",
                    parentId: "",
                    condition: "",
                    conditionName: "",
                    isMainChild: true
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
                condition: "",
                conditionName: "",
                isMainChild: true
            },
            parentDetails: null,
            selectedDependents: [],
        };

        const result = checkIfNewChangesAreMade(state);
        expect(result).toBeFalsy();
    });
});
