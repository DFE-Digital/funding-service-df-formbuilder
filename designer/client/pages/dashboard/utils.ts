import { current } from "@reduxjs/toolkit";

import {
    DashboardState,
    DashboardFilters,
    FilterTypes,
    FormConfigurationWithChild,
} from "./../../store/types";
import {
    whichMigrations,
    FormConfiguration,
    FormStatus,
    FormAccessType,
    FormDefinition,
} from "@xgovformbuilder/model";
import MsalClientApplication from "../../auth/clientApplication";
import logger from "../../plugins/logger";
import { DateEnum } from "../../store/types";
import { FormConfigurationTabs } from "../../utils";
import { cloneDeep } from "lodash";

/**
 * Add on click event listener to signout link in header
 * @param homeAccountId
 */
export const initializeSignOutFunctionality = (homeAccountId: string) => {
    const signOutLink = document.querySelector("#dfe-designer-signout");
    signOutLink?.addEventListener("click", (e) => {
        e.preventDefault();
        MsalClientApplication.logout(homeAccountId);
    });
};

type saveFn = (form: FormDefinition) => string;

export const onformImport = (file: File, save: saveFn, history) => {
    const reader = new window.FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = async function (evt) {
        const result = evt?.target?.result;
        if (!result) return;
        const isString = typeof result === "string";
        if (!isString) return;
        const content = JSON.parse(result);
        const migrated = migrate(content);
        const response = await save(migrated);
        if (!response) return;
        history.push(`/designer/${response}`);
        window.location.reload();
    };
};

const migrate = (form) => {
    const { version = 0 } = form;
    const migrationList = whichMigrations(version);
    try {
        let migratedJson = { ...form };
        migrationList.forEach((migration) => {
            migratedJson = migration(migratedJson);
        });
        return migratedJson;
    } catch (e) {
        logger.error("SubMenu", "failed to migrate json");
    }
};

/**
 * Removes Azure specific meta properties from imported form
 * @param form
 */
export const removeAzureMetaProperties = (form: FormDefinition) => {
    //@ts-ignore
    if (form._rid) delete form._rid;
    //@ts-ignore
    if (form._self) delete form._self;
    //@ts-ignore
    if (form._etag) delete form._etag;
    //@ts-ignore
    if (form._attachments) delete form._attachments;
    //@ts-ignore
    if (form._ts) delete form._ts;
};

export const validateDate = (
    name: DateEnum,
    value: string,
    prevValue: number
) => {
    const result = { [name]: value ? prevValue : 0 };
    switch (name) {
        case DateEnum.Day:
            if (!value) break;
            const parsedDay = Number(value);
            if (!isValidDay(parsedDay)) break;
            result[name] = parsedDay;
            break;
        case DateEnum.Month:
            if (!value) break;
            const parsedMonth = Number(value);
            if (!isValidMonth(parsedMonth)) break;
            result[name] = parsedMonth;
            break;
        case DateEnum.Year:
            if (!value) break;
            const parsedYear = Number(value);
            result[name] = parsedYear;
            break;
        default:
            break;
    }
    return result;
};

const isValidDay = (day: number) => {
    if (day >= 0 && day < 32) return true;
    return false;
};

const isValidMonth = (month: number) => {
    if (month > 0 && month < 13) return true;
    return false;
};

const applyFormStatusFilter = (
    rows: FormConfigurationWithChild[],
    dashboardData: DashboardState
) => {
    const filters = dashboardData.filter;
    if (
        Object.values(filters.formStatus).every((bool) => bool) ||
        Object.values(filters.formStatus).every((bool) => !bool)
    ) {
        return rows;
    }
    const formStatusApplied = Object.keys(filters.formStatus).filter(
        (status) => filters.formStatus[status]
    );
    return rows.filter((row) => {
        if (row.childs.length > 0) {
            const filteredChilds = row.childs.filter((child) =>
                formStatusApplied.includes(child.FormStatus!)
            );
            row.childs = filteredChilds;
            return (
                formStatusApplied.includes(row.FormStatus!) ||
                filteredChilds.length > 0
            );
        } else {
            return formStatusApplied.includes(row.FormStatus!);
        }
    });
};

const checkAccessTypeWithFilter = (
    row: FormConfigurationWithChild,
    filters: DashboardFilters
) => {
    if (filters.formAccessType[FormAccessType.DFESignIn]) {
        return !!row.signInRequired;
    } else {
        return !row.signInRequired;
    }
};

const applyFormAccessTypeFilter = (
    rows: FormConfigurationWithChild[],
    dashboardData: DashboardState
) => {
    const filters = dashboardData.filter;
    if (
        Object.values(filters.formAccessType).every((bool) => bool) ||
        Object.values(filters.formAccessType).every((bool) => !bool)
    ) {
        return rows;
    }
    return rows.filter((row) => {
        if (row.childs.length > 0) {
            const filteredChilds = row.childs.filter((child) => {
                return checkAccessTypeWithFilter(child, filters);
            });
            row.childs = filteredChilds;
            return (
                checkAccessTypeWithFilter(row, filters) ||
                filteredChilds.length > 0
            );
        } else {
            return checkAccessTypeWithFilter(row, filters);
        }
    });
};

const isValidDate = (d) => {
    return d instanceof Date && !isNaN(d.getTime());
};

const checkLastModifiedWithFilter = (
    row: FormConfigurationWithChild,
    fromDate: Date,
    tillDate: Date
) => {
    const modifiedOnDate = new Date(row.LastModified!);
    if (
        modifiedOnDate.getTime() >= fromDate.getTime() &&
        modifiedOnDate.getTime() <= tillDate.getTime()
    ) {
        return true;
    } else if (fromDate.getTime() === tillDate.getTime()) {
        const additionalFromDate = new Date(fromDate.toDateString());
        additionalFromDate.setHours(additionalFromDate.getHours() + 24);
        if (
            modifiedOnDate.getTime() >= fromDate.getTime() &&
            modifiedOnDate.getTime() <= additionalFromDate.getTime()
        ) {
            return true;
        }
        return false;
    }
    return false;
};

const applyModifiedOnFilter = (
    rows: FormConfigurationWithChild[],
    dashboardData: DashboardState
) => {
    const modifiedOn = dashboardData.filter.modifiedOn;
    const fromDate = new Date(
        Date.parse(
            `${modifiedOn.from.month}/${modifiedOn.from.day}/${modifiedOn.from.year}`
        )
    );
    if (!isValidDate(fromDate)) return rows;
    const tillDate = new Date(
        Date.parse(
            `${modifiedOn.till.month}/${modifiedOn.till.day}/${modifiedOn.till.year}`
        )
    );
    if (!isValidDate(tillDate)) return rows;
    if (fromDate.getTime() > tillDate.getTime()) return rows;
    return rows.filter((row) => {
        if (row.childs.length > 0) {
            const filteredChilds = row.childs.filter((child) => {
                return checkLastModifiedWithFilter(child, fromDate, tillDate);
            });
            row.childs = filteredChilds;
            return (
                checkLastModifiedWithFilter(row, fromDate, tillDate) ||
                filteredChilds.length > 0
            );
        } else {
            return checkLastModifiedWithFilter(row, fromDate, tillDate);
        }
    });
};

const applyCreatedByFilter = (
    rows: FormConfigurationWithChild[],
    dashboardData: DashboardState
) => {
    if (dashboardData.filter.createdBy.length === 0) return rows;
    return rows.filter((row) => {
        if (row.childs.length > 0) {
            const filteredChilds = row.childs.filter((child) => {
                return dashboardData.filter.createdBy.includes(
                    child.CreatedBy ?? ""
                );
            });
            row.childs = filteredChilds;
            return (
                dashboardData.filter.createdBy.includes(row.CreatedBy ?? "") ||
                filteredChilds.length > 0
            );
        } else {
            return dashboardData.filter.createdBy.includes(row.CreatedBy ?? "");
        }
    });
};

const checkRowNameMatchesSearch = (
    row: FormConfigurationWithChild,
    search: string
) => {
    if (row.DisplayName) {
        return row.DisplayName.toLowerCase().includes(search.toLowerCase());
    } else {
        return false;
    }
};

const applySearchFilter = (
    rows: FormConfigurationWithChild[],
    dashboardData: DashboardState
) => {
    if (dashboardData.filter.search) {
        return rows.filter((row) => {
            if (row.childs.length > 0) {
                const filteredChilds = row.childs.filter((child) => {
                    return checkRowNameMatchesSearch(
                        child,
                        dashboardData.filter.search
                    );
                });
                row.childs = filteredChilds;
                return (
                    checkRowNameMatchesSearch(
                        row,
                        dashboardData.filter.search
                    ) || filteredChilds.length > 0
                );
            } else {
                return checkRowNameMatchesSearch(
                    row,
                    dashboardData.filter.search
                );
            }
        });
    } else {
        return rows;
    }
};

export const applyFiltersInReducer = (state: DashboardState) => {
    state.filteredColForms = applyFilters(
        FormConfigurationTabs.ColleagueForms,
        state
    );
    state.filteredMyForms = applyFilters(FormConfigurationTabs.MyForms, state);
};

export const applyFilters = (
    type: FormConfigurationTabs,
    dashboardData: DashboardState
) => {
    let rows: FormConfigurationWithChild[] = [];
    // Performs cloneDeep to ensure mutability based on filter condition
    rows =
        type === FormConfigurationTabs.MyForms
            ? cloneDeep(dashboardData.myForms)
            : cloneDeep(dashboardData.colForms);
    rows = applySearchFilter(rows, dashboardData);
    rows = applyFormStatusFilter(rows, dashboardData);
    rows = applyFormAccessTypeFilter(rows, dashboardData);
    rows = applyModifiedOnFilter(rows, dashboardData);
    if (type === FormConfigurationTabs.ColleagueForms) {
        rows = applyCreatedByFilter(rows, dashboardData);
    }
    return rows;
};

type Selected = {
    key: string;
    title: string;
};

type SelectedFilters = {
    title: string;
    key: string;
    selected: Selected[];
};

const isFormStatusFilterEmpty = (filters: DashboardFilters) => {
    return Object.values(filters.formStatus).every((val) => !val);
};

const isFormAccessTypeFilterEmpty = (filters: DashboardFilters) => {
    return Object.values(filters.formAccessType).every((val) => !val);
};

const isModifiedOnFilterEmpty = (filters: DashboardFilters) => {
    return Object.values(filters.modifiedOn.from)
        .concat(Object.values(filters.modifiedOn.till))
        .some((val) => !val);
};

const isCreatedByFilterEmpty = (filters: DashboardFilters) => {
    return filters.createdBy.length === 0;
};

export const isFilterEmpty = (filters: DashboardFilters) => {
    return (
        isFormStatusFilterEmpty(filters) &&
        isFormAccessTypeFilterEmpty(filters) &&
        isModifiedOnFilterEmpty(filters) &&
        isCreatedByFilterEmpty(filters)
    );
};

export const isFilterSearchEmpty = (filters: DashboardFilters) => {
    return isFilterEmpty(filters) && !filters.search;
};

const selectedFormStatusFilters = (filters: DashboardFilters) => {
    const titles = {
        [FormStatus.InDevelopment]: "In development",
        [FormStatus.UAT]: "UAT",
        [FormStatus.Published]: "Published",
        [FormStatus.Closed]: "Closed",
    };
    const { formStatus } = filters;
    const selected: Selected[] = [];
    const result: SelectedFilters = {
        title: "Form status",
        key: FilterTypes.FormStatus,
        selected,
    };
    for (const [key, value] of Object.entries(formStatus)) {
        if (value) {
            result.selected.push({
                key,
                title: titles[key],
            });
        }
    }
    return result;
};

const selectedFormAccessTypeFilters = (filters: DashboardFilters) => {
    const titles = {
        [FormAccessType.Public]: "Public",
        [FormAccessType.DFESignIn]: "DFE SignIn",
    };
    const { formAccessType } = filters;
    const selected: Selected[] = [];
    const result: SelectedFilters = {
        title: "Access type",
        key: FilterTypes.FormAccessType,
        selected,
    };
    for (const [key, value] of Object.entries(formAccessType)) {
        if (value) {
            result.selected.push({
                key,
                title: titles[key],
            });
        }
    }
    return result;
};

const selectedModifiedOnFilters = (filters: DashboardFilters) => {
    const { modifiedOn } = filters;
    const { from, till } = modifiedOn;
    const result: Selected[] = [
        {
            key: `${from.day}/${from.month}/${from.year}-${till.day}/${till.month}/${till.year}`,
            title: `between ${from.year}-${from.month}-${from.day} and ${till.year}-${till.month}-${till.day}`,
        },
    ];
    const formattedResult: SelectedFilters = {
        title: "Modified on",
        key: FilterTypes.ModifiedOn,
        selected: result,
    };
    return formattedResult;
};

const selectedCreatedByFilters = (filters: DashboardFilters) => {
    const { createdBy } = filters;
    const result: Selected[] = createdBy.map((name) => ({
        key: name,
        title: name,
    }));
    const formattedResult: SelectedFilters = {
        title: "Created by",
        key: FilterTypes.CreatedBy,
        selected: result,
    };
    return formattedResult;
};

export const selectedFilters = (filters: DashboardFilters) => {
    const result: SelectedFilters[] = [];
    if (!isFormStatusFilterEmpty(filters)) {
        const selectedFormStatus = selectedFormStatusFilters(filters);
        result.push(selectedFormStatus);
    }
    if (!isFormAccessTypeFilterEmpty(filters)) {
        const selectedFormAccessType = selectedFormAccessTypeFilters(filters);
        result.push(selectedFormAccessType);
    }
    if (!isModifiedOnFilterEmpty(filters)) {
        const selectedModifiedOn = selectedModifiedOnFilters(filters);
        result.push(selectedModifiedOn);
    }
    if (!isCreatedByFilterEmpty(filters)) {
        const selectedCreatedBy = selectedCreatedByFilters(filters);
        result.push(selectedCreatedBy);
    }
    return result;
};

export const getFormStatusBasedOnType = (type: string) => {
    const totalResult = {
        [FormStatus.InDevelopment]: false,
        [FormStatus.UAT]: false,
        [FormStatus.Published]: false,
        [FormStatus.Closed]: false,
    };
    switch (type) {
        case "total":
            return totalResult;
        case FormStatus.InDevelopment:
            totalResult[FormStatus.InDevelopment] = true;
            return totalResult;
        case FormStatus.UAT:
            totalResult[FormStatus.UAT] = true;
            return totalResult;
        case FormStatus.Published:
            totalResult[FormStatus.Published] = true;
            return totalResult;
        case FormStatus.Closed:
            totalResult[FormStatus.Closed] = true;
            return totalResult;
        default:
            return totalResult;
    }
};

export const filterFormsById = (
    forms: FormConfigurationWithChild[],
    formId: string
): FormConfigurationWithChild | null => {
    const form = forms.find((form) => form.Key === formId);
    if (form) return form;

    for (const form of forms) {
        if (form.childs?.length > 0) {
            const childForm = filterFormsById(form.childs, formId);
            if (childForm) return childForm;
        }
    }

    return null;
};

// export const modifiedOnSortingFn = (
//     rowA: Row<FormConfiguration>,
//     rowB: Row<FormConfiguration>,
//     columnId: string
// ): number => {
//     if (
//         new Date(rowA.getValue(columnId)).getTime() <
//         new Date(rowB.getValue(columnId)).getTime()
//     ) {
//         return -1;
//     }
//     return 1;
// };
