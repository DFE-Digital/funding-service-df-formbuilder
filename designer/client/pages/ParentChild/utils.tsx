import {
    ChildConfig,
    DashboardState,
    DependentForm,
    FormConfigurationWithChild,
    ParentChildState,
    parentChildEntity,
} from "../../store/types";
import { FormConfigurationTabs } from "../../utils";
import { applyFilters } from "../dashboard/utils";

export const parentChildMapper = (
    reducer: ParentChildState
): parentChildEntity => {
    return {
        id: reducer.selectedFormData?.id,
        isMainParent: reducer.markAsParent === "1",
        parentChildConfig: {
            description: reducer.description,
            childHeading: reducer.childHeading,
            childConfigs: reducer.childConfigs.map((child, idx) => ({
                ...child,
                // Adds proper card order
                cardOrder: idx,
            })),
        },
    };
};

export const removeParentAndExistingChild = (
    parentChild: ParentChildState,
    tab: FormConfigurationTabs,
    rows: FormConfigurationWithChild[],
    currentUser: {
        id: string;
        name: string;
        isSessionActive: boolean;
        homeAccountId: string;
    }
) => {
    let childMyForms: FormConfigurationWithChild[] = [];
    let childColForms: FormConfigurationWithChild[] = [];
    const formIdsToExclude = parentChild.childConfigs.flatMap(
        (configs) => configs.childId
    );
    formIdsToExclude.push(parentChild.selectedParentForm!.Key);
    if (parentChild.newChildConfig.childId) {
        formIdsToExclude.push(parentChild.newChildConfig.childId);
    }
    parentChild.selectedDependents.forEach((dpnd) => {
        const index = formIdsToExclude.findIndex((id) => id === dpnd.id);
        if (index !== -1) {
            formIdsToExclude.splice(index, 1);
        }
    });
    // Takes childs from parent and adds as standalone
    if (parentChild.selectedParentForm!.childs.length > 0) {
        const childs = parentChild.selectedParentForm!.childs;
        childs.forEach((child) => {
            if (child.UserId === currentUser.id) {
                childMyForms.push(child);
            } else {
                childColForms.push(child);
            }
        });
    }
    if (tab === FormConfigurationTabs.MyForms) {
        const filteredRows = [...childMyForms, ...rows].filter(
            (form) => !formIdsToExclude.includes(form.Key)
        );
        return filteredRows;
    } else {
        const filteredRows = [...childColForms, ...rows].filter(
            (form) => !formIdsToExclude.includes(form.Key)
        );
        return filteredRows;
    }
};

export const checkIfNewChangesAreMade = (
    parentChildState: ParentChildState
) => {
    if (
        parentChildState.childConfigs.length > 0 &&
        parentChildState.description !== "" &&
        parentChildState.childHeading !== ""
    ) {
        const originalParentChildDetails =
            parentChildState.originalParentChildDetails;
        if (
            originalParentChildDetails?.parentChildConfig.childHeading ===
                parentChildState.childHeading &&
            originalParentChildDetails?.parentChildConfig.description ===
                parentChildState.description &&
            matchChildConfigs(
                parentChildState.childConfigs,
                originalParentChildDetails?.parentChildConfig.childConfigs
            )
        ) {
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }
};

const matchChildConfigs = (
    newChildConfigs: ChildConfig[],
    oldChildConfigs: ChildConfig[]
) => {
    if (newChildConfigs.length === oldChildConfigs.length) {
        return newChildConfigs.every((newConf, idx) => {
            return (
                oldChildConfigs[idx].helpText === newConf.helpText &&
                oldChildConfigs[idx].dateComponent === newConf.dateComponent &&
                oldChildConfigs[idx].childFormName === newConf.childFormName &&
                oldChildConfigs[idx].childFormTitle ===
                    newConf.childFormTitle &&
                oldChildConfigs[idx].condition === newConf.condition &&
                oldChildConfigs[idx].childId === newConf.childId &&
                matchDependentForms(
                    newConf.dependentforms,
                    oldChildConfigs[idx].dependentforms
                )
            );
        });
    } else {
        return false;
    }
};

const matchDependentForms = (
    newDpndForms: DependentForm[],
    oldDpndForms: DependentForm[]
) => {
    if (newDpndForms.length === oldDpndForms.length) {
        return newDpndForms.every((newDpnd, idx) => {
            return (
                oldDpndForms[idx].id === newDpnd.id &&
                oldDpndForms[idx].name === newDpnd.name &&
                oldDpndForms[idx].status === newDpnd.status
            );
        });
    } else {
        return false;
    }
};
