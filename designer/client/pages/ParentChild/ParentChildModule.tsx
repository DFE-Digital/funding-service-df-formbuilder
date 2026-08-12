import React, { useEffect } from "react";
import { InteractionStatus } from "@azure/msal-browser";
import {
    useMsal,
    useIsAuthenticated,
    AuthenticatedTemplate,
} from "@azure/msal-react";
import { Route, useRouteMatch } from "react-router-dom";

import GroupForms from "./GroupForms";
import AddDependentForms from "./AddDependentForms";
import AddChildForms from "./AddChildForms";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    formConfigurationsSelector,
    listFormConfigurations,
} from "../../store/reducers/formConfigurationsReducer";
import {
    getFormData,
    parentChildSelector,
    setSelectedParentForm,
} from "../../store/reducers/parentChildReducer";
import { FormConfigurationWithChild, LoadingState } from "../../store/types";

import "./parentChild.scss";
import {
    currentUserSelector,
    getCurrentUserInfo,
} from "../../store/reducers/usersReducer";
import {
    dashboardSelector,
    formulateDashboardData,
    setDashboardLoading,
} from "../../store/reducers/dashboardReducer";

type Props = {};

const ParentChildModule = (props: Props) => {
    const { instance, inProgress } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    if (inProgress === InteractionStatus.None && !isAuthenticated) {
        instance.loginRedirect();
    }

    const { url, params } = useRouteMatch<{ parentId?: string }>();
    const dispatch = useAppDispatch();
    const parentChild = useAppSelector(parentChildSelector);
    const formConfigs = useAppSelector(formConfigurationsSelector);
    const currentUser = useAppSelector(currentUserSelector);
    const dashboardData = useAppSelector(dashboardSelector);

    useEffect(() => {
        if (formConfigs.loading === LoadingState.Idle) {
            dispatch(getCurrentUserInfo());
            dispatch(listFormConfigurations());
        }
        if (parentChild.loading === LoadingState.Idle) {
            dispatch(getFormData(params.parentId!));
        }
    }, []);

    useEffect(() => {
        if (formConfigs.loading === LoadingState.Succeeded) {
            let selectedForm: FormConfigurationWithChild | null = null;
            formConfigs.data.some((form) => {
                if (form.Key === params.parentId!) {
                    selectedForm = form;
                    return true;
                } else {
                    return form.childs.some((child) => {
                        if (child.Key === params.parentId!) {
                            selectedForm = child;
                            return true;
                        }
                        return false;
                    });
                }
            });
            if (!selectedForm) return;
            dispatch(setSelectedParentForm(selectedForm));
        }
        if (
            formConfigs.loading === LoadingState.Succeeded &&
            currentUser.loading === LoadingState.Succeeded &&
            dashboardData.loading !== LoadingState.Succeeded
        ) {
            dispatch(
                formulateDashboardData({
                    formConfigs,
                    userId: currentUser.data.id,
                })
            );
        }
        if (formConfigs.loading === LoadingState.Pending) {
            dispatch(setDashboardLoading(LoadingState.Pending));
        }
    }, [formConfigs, currentUser]);

    return (
        <AuthenticatedTemplate>
            <>
                <Route path={`${url}`} exact>
                    <GroupForms />
                </Route>
                <Route path={`${url}/add-dependent-forms`} exact>
                    <AddDependentForms
                        parentId={params.parentId!}
                        selectedDependentForms={parentChild.selectedDependents.map(
                            (dpnd) => dpnd.id
                        )}
                    />
                </Route>
                <Route path={`${url}/add-child-forms`} exact>
                    <AddChildForms parentId={params.parentId!} />
                </Route>
            </>
        </AuthenticatedTemplate>
    );
};

export default ParentChildModule;
