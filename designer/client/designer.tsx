/* eslint-disable prettier/prettier */
import React, { Component } from "react";
import Menu from "./components/Menu/Menu";
import { Visualisation } from "./components/Visualisation";
import { FormDefinition, FormStatus } from "@xgovformbuilder/model";
import { DataContext, FlyoutContext, PageContext } from "./context";
import { FeatureFlagProvider } from "./context/FeatureFlagContext";
import { DesignerApi } from "./api/designerApi";
import { i18n } from "./i18n";
import { Prompt } from "react-router-dom";
import { MsalContext, AuthenticatedTemplate } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { UserAccountHelper } from "./helpers/userAccount.helper";
import MsalClientApplication from "./auth/clientApplication";
import moment from "moment";
import TabsContext from "./context/TabsContext";
import { DynamicDataSetTabs } from "./components/FieldEditors/TabEdit/types";
import { Loader } from "./ui";

interface Props {
    match?: any;
    location?: any;
    history?: any;
}

interface State {
    id?: any;
    flyoutCount?: number;
    pageCount?: number;
    loading?: boolean;
    error?: string; // not using as of now
    newConfig?: boolean; // TODO - is this required?
    data?: FormDefinition;
    page?: any;
    updatedAt?: any;
    downloadedAt?: any;
    userName?: string;
    userId?: string;
    tabs?: DynamicDataSetTabs;
    showLoader: boolean;
}

export default class Designer extends Component<Props, State> {
    state: State = {
        loading: true,
        flyoutCount: 0,
        pageCount: 0,
        userName: "",
        userId: "",
        tabs: {},
        showLoader: false,
    };
    static contextType = MsalContext;

    callLogin() {
        const isAuthenticated = this.context.accounts.length > 0;
        const msalInstance = this.context.instance;

        // If a user is not logged in and authentication is not already in progress, invoke login
        if (
            !isAuthenticated &&
            this.context.inProgress === InteractionStatus.None
        ) {
            msalInstance.loginRedirect();
        }
    }

    designerApi = new DesignerApi();

    get id() {
        return this.props.match?.params?.id;
    }

    updateDownloadedAt = (time) => {
        this.setState({ downloadedAt: time });
    };

    incrementFlyoutCounter = (callback = () => {}) => {
        let currentCount = this.state.flyoutCount;
        this.setState({ flyoutCount: ++currentCount }, callback());
    };

    decrementFlyoutCounter = (callback = () => {}) => {
        let currentCount = this.state.flyoutCount;
        this.setState({ flyoutCount: --currentCount }, callback());
    };

    incrementPageCounter = (callback = () => {}) => {
        let currentCount = this.state.pageCount;
        this.setState({ pageCount: ++currentCount }, callback());
    };

    decrementPageCounter = (callback = () => {}) => {
        let currentCount = this.state.pageCount;
        this.setState({ pageCount: --currentCount }, callback());
    };

    save = async (toUpdate, callback = () => {}) => {
        try {
            //Add current user credentials
            this.setState({ showLoader: true });
            toUpdate.lastUpdatedByName = this.state.userName;
            toUpdate.lastUpdatedById = this.state.userId;
            const response = await this.designerApi.save(this.id, toUpdate);
            if (response.status === 200) {
                this.setState({ showLoader: false });
            }
            const afterUpdate = (await response.json()) as FormDefinition;
            this.setState(
                {
                    data: afterUpdate, //removing optimistic save to ensure better testing of SQL functionality
                    updatedAt: moment(new Date()).format(
                        "DD/MM/YYYY, h:mm:ss a"
                    ),
                    error: undefined,
                },
                //@ts-ignore
                callback()
            );
            return toUpdate;
        } catch (e) {
            this.setState({ error: e.message });
            this.props.history.push({
                pathname: "/save-error",
                state: { id: this.id },
            });
        }
    };

    setTabs = (dataset: DynamicDataSetTabs) => {
        //@ts-ignore
        this.setState({ tabs: dataset });
        return false;
    };

    updatePageContext = (page) => {
        this.setState({ page });
    };

    componentDidMount() {
        const id = this.props.match?.params?.id;
        console.log(this.context.accounts.length);
        this.callLogin();
        this.setState({ id });
        UserAccountHelper.getUserAccount(
            MsalClientApplication.getInstance()
        ).then((acc) => {
            this.setState({
                id,
                userName: acc.UserName,
                userId: acc.UserId,
            });
        });
        this.designerApi.fetchData(id).then((data) => {
            const form = data;
            this.setState({ loading: false, data: form });
        });
    }
    //Reload clears the current CSS when leaving designer
    componentDidUpdate() {
        this.callLogin();
        window.onpopstate = () => {
            window.location.reload();
        };
    }

    render() {
        const { flyoutCount, data, loading, error, pageCount } = this.state;
        const { env, preprodPreviewUrl } = window;
        let { previewUrl } = window;
        if (loading) {
            return <p className="govuk-body">Loading ...</p>;
        }
        if (data != undefined) {
            previewUrl =
                data.formStatus !== FormStatus.Published &&
                data.formStatus !== FormStatus.Closed
                    ? preprodPreviewUrl
                    : previewUrl;
        }
        const flyoutContextProviderValue = {
            count: flyoutCount,
            increment: this.incrementFlyoutCounter,
            decrement: this.decrementFlyoutCounter,
        };

        const pageContextProviderValue = {
            count: pageCount,
            increment: this.incrementPageCounter,
            decrement: this.decrementPageCounter,
        };

        const dataContextProviderValue = { data, save: this.save };
        const tabsContextProviderValue = {
            dynamicDataSet: this.state.tabs,
            setDynamicDataSet: this.setTabs,
        };
        const designer = (
            <FeatureFlagProvider>
                <DataContext.Provider value={dataContextProviderValue}>
                    <FlyoutContext.Provider value={flyoutContextProviderValue}>
                        <TabsContext.Provider value={tabsContextProviderValue}>
                            <PageContext.Provider
                                value={pageContextProviderValue}
                            >
                                <div id="app">
                                    <Prompt
                                        when={!error && pageCount === 0}
                                        message={`${i18n("leaveDesigner")}`}
                                    />

                                    <Menu
                                        id={this.id}
                                        updateDownloadedAt={
                                            this.updateDownloadedAt
                                        }
                                        updatePersona={this.updatePersona}
                                    />
                                    <Visualisation
                                        downloadedAt={this.state.downloadedAt}
                                        updatedAt={this.state.updatedAt}
                                        persona={this.state.persona}
                                        id={this.id}
                                        previewUrl={previewUrl}
                                    />
                                </div>
                                <Loader
                                    show={this.state.showLoader}
                                    loadingText={
                                        "Processing your request, this should take a few moments"
                                    }
                                />
                            </PageContext.Provider>
                        </TabsContext.Provider>
                    </FlyoutContext.Provider>
                </DataContext.Provider>
            </FeatureFlagProvider>
        );
        return <AuthenticatedTemplate>{designer}</AuthenticatedTemplate>;
    }
}
