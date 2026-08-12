import { InteractionStatus } from "@azure/msal-browser";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    listFormConfigurations,
    formConfigurationsSelector,
} from "../../store/reducers/formConfigurationsReducer";
import {
    getCurrentUserInfo,
    currentUserSelector,
} from "../../store/reducers/usersReducer";
import { initializeSignOutFunctionality } from "./utils";
import {
    SummaryTileComponent,
    CreateImportForm,
    FormConfigTable,
    Shortcuts,
} from "./components";

import "./dashboard.scss";
import {
    dashboardSelector,
    formulateDashboardData,
    setDashboardLoading,
} from "../../store/reducers/dashboardReducer";
import { LoadingState } from "../../store/types";
import {
    useMsal,
    useIsAuthenticated,
    AuthenticatedTemplate,
} from "@azure/msal-react";

type Props = {};

const Dashboard = (props: Props) => {
    const dispatch = useAppDispatch();
    const formConfigs = useAppSelector(formConfigurationsSelector);
    const currentUser = useAppSelector(currentUserSelector);
    const dashboardData = useAppSelector(dashboardSelector);
    const isAuthenticated = useIsAuthenticated();
    const { instance, inProgress } = useMsal();

    if (inProgress === InteractionStatus.None && !isAuthenticated) {
        instance.loginRedirect();
    }

    useEffect(() => {
        dispatch(listFormConfigurations());
        dispatch(getCurrentUserInfo());
        initializeSignOutFunctionality(currentUser.data.homeAccountId);
    }, []);

    useEffect(() => {
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
        <AuthenticatedTemplate username={instance.getActiveAccount()?.username}>
            <div
                data-testid="dashboard-container"
                className="dashboard-container"
            >
                <h1 className="govuk-heading-xl">
                    Digital Form Builder Dashboard
                </h1>
                <div className="govuk-body">
                    Welcome{" "}
                    <span className="govuk-!-font-weight-bold">
                        {currentUser.data.name}
                    </span>
                    ,
                </div>
                <SummaryTileComponent summaryData={dashboardData.summaryInfo} />
                <CreateImportForm />
                <FormConfigTable />
                <Shortcuts />
            </div>
        </AuthenticatedTemplate>
    );
};

export default Dashboard;
