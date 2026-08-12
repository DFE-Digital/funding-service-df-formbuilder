import {
    combineReducers,
    configureStore,
    PreloadedState,
} from "@reduxjs/toolkit";
import {
    formConfigurationsReducer,
    usersReducer,
    dashboardReducer,
    listReducer,
    parentChildReducer,
    changeStatusReducer,
    changeAccessTypeReducer,
    deleteFormReducer,
    apiReducer,
    duplicateFormReducer,
    formSectionReducer,
    calculationBuilderReducer,
} from "./reducers";

// Create the root reducer separately so we can extract the RootState type
const rootReducer = combineReducers({
    formConfigurations: formConfigurationsReducer,
    users: usersReducer,
    dashboard: dashboardReducer,
    list: listReducer,
    parentChild: parentChildReducer,
    changeStatus: changeStatusReducer,
    deleteForm: deleteFormReducer,
    api: apiReducer,
    changeAccessType: changeAccessTypeReducer,
    duplicateForm: duplicateFormReducer,
    formSection: formSectionReducer,
    calculation: calculationBuilderReducer,
});

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
    return configureStore({
        reducer: rootReducer,
        preloadedState,
    });
};

export const store = setupStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = typeof store.dispatch;
