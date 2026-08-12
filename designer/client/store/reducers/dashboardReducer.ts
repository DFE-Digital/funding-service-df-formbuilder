import { createSlice } from "@reduxjs/toolkit";
import { FormAccessType, FormStatus } from "@xgovformbuilder/model";
import type { RootState } from "../store";
import {
    DashboardFilters,
    DashboardState,
    LoadingState,
    DateEnum,
    FormConfigurationWithChild,
} from "../types";
import { extractDashboardData } from "../utils";
import { FormConfigurationTabs } from "../../utils";
import { applyFiltersInReducer } from "../../pages/dashboard/utils";

export const initialFilterState: DashboardFilters = {
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
};

const initialState: DashboardState = {
    loading: LoadingState.Idle,
    selectedTab: FormConfigurationTabs.MyForms,
    selectedFormConfig: null,
    myForms: [],
    filteredMyForms: [],
    colForms: [],
    filteredColForms: [],
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
    filter: initialFilterState,
    details: {
        show: false,
        data: null,
    },
    isChild: false,
};

export const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        setDashboardLoading: (state, action) => {
            state.loading = action.payload;
        },
        formulateDashboardData: (state, action) => {
            const dashboardData = extractDashboardData(action.payload);
            if (!dashboardData) return;
            state.myForms = dashboardData.myForms;
            state.filteredMyForms = dashboardData.myForms;
            state.colForms = dashboardData.colForms;
            state.filteredColForms = dashboardData.colForms;
            state.summaryInfo = dashboardData.summaryInfo;
            state.createdBy = dashboardData.createdBy;
            state.loading = LoadingState.Succeeded;
        },
        selectDashboardTab: (state, action) => {
            state.selectedTab = action.payload;
            state.selectedFormConfig = null;
        },
        selectFormConfig: (state, action) => {
            state.selectedFormConfig = action.payload.form;
            state.isChild = action.payload.isChild;
        },
        toggleFilters: (state) => {
            state.filter.show = !state.filter.show;
        },
        searchForms: (state, action) => {
            state.filter.search = action.payload;
            applyFiltersInReducer(state);
        },
        setFormStatusFilter: (state, action) => {
            state.filter.formStatus = action.payload;
            applyFiltersInReducer(state);
        },
        setFormAccessTypeFilter: (state, action) => {
            state.filter.formAccessType = action.payload;
            applyFiltersInReducer(state);
        },
        setModifiedOnFilter: (state, action) => {
            state.filter.modifiedOn = action.payload;
            applyFiltersInReducer(state);
        },
        setCreatedByFilter: (state, action) => {
            const createdBy = state.filter.createdBy;
            const name = action.payload as string;
            if (createdBy.includes(name)) {
                state.filter.createdBy = createdBy.filter(
                    (str) => str !== name
                );
            } else {
                state.filter.createdBy.push(name);
            }
            applyFiltersInReducer(state);
        },
        clearFilters: (state) => {
            const search = state.filter.search;
            const show = state.filter.show;
            const emptyFilter = { ...initialFilterState };
            emptyFilter.search = search;
            emptyFilter.show = show;
            state.filter = emptyFilter;
            applyFiltersInReducer(state);
        },
        toggleDetailModal: (state, action?) => {
            if (state.details.show && state.details.data) {
                state.details.show = false;
                state.details.data = null;
            } else {
                state.details.show = true;
                state.details.data = action?.payload as FormConfigurationWithChild;
            }
        },
    },
});

export const {
    setDashboardLoading,
    formulateDashboardData,
    selectDashboardTab,
    selectFormConfig,
    toggleFilters,
    setFormStatusFilter,
    setFormAccessTypeFilter,
    setModifiedOnFilter,
    searchForms,
    setCreatedByFilter,
    clearFilters,
    toggleDetailModal,
} = dashboardSlice.actions;

export const dashboardSelector = (state: RootState) => state.dashboard;

export const getSelectedFormConfig = (state: RootState) => ({
    selectedFormConfig: state.dashboard.selectedFormConfig,
    isChild: state.dashboard.isChild,
});

export const filterSelector = (state: RootState) => state.dashboard.filter;

export const createdBySelector = (state: RootState) =>
    state.dashboard.createdBy;

export const detailsSelector = (state: RootState) => state.dashboard.details;

export default dashboardSlice.reducer;
