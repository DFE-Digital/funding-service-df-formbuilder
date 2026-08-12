import React, { Component } from "react";
import { withRouter, RouteProps } from "react-router-dom";
import "./LandingPage.scss";
import logger from "../../plugins/logger";
import { InteractionStatus } from "@azure/msal-browser";
import { MsalContext, AuthenticatedTemplate } from "@azure/msal-react";
import { DesignerApi } from "../../api/designerApi";
import { FormAccessType } from "@xgovformbuilder/model";
import { FormDefinition } from "@xgovformbuilder/model";
import FormTable from "../../components/ChangeFormAccessType/FormTable";
import { AppContext } from "../../context/AppContext";
import { uploadProvidersMapping } from "../../api/providerMappingApi";
import { Loader } from "../../ui";

declare global {
    interface Window {
        env: any;
    }
}

type Props = {
    history: any;
};

type State = {
    showModal: boolean;
    accessTypeChangeConfirmed: boolean;
    selectedAccessType: FormAccessType;
    loading?: boolean;
    data?: any;
    changeSuccessful: boolean;
    serverError: boolean;
    showLoader?: boolean;
};

export class ChangeFormAccessType extends Component<Props & RouteProps, State> {
    static contextType = AppContext;

    constructor(props: Props) {
        super(props);
        this.msalContext = MsalContext;
        this.state = {
            loading: true,
            accessTypeChangeConfirmed: false,
            showModal: false,
            selectedAccessType: FormAccessType.Public, //initialise this as Public, but it will be updated to actual value from DB in componentDidMount
            data: "",
            changeSuccessful: false,
            serverError: false,
            showLoader: false,
        };
    }

    callLogin() {
        const isAuthenticated =
            this.msalContext?._currentValue?.accounts?.length > 0;
        const msalInstance = this.msalContext?._currentValue?.instance;

        // If a user is not logged in and authentication is not already in progress, invoke login
        if (
            !isAuthenticated &&
            this.msalContext?._currentValue?.inProgress ===
                InteractionStatus.None
        ) {
            msalInstance.loginRedirect(); //redirect if user is not logged in
        }
    }

    designerApi = new DesignerApi();

    get id() {
        return this.props.history.location.state;
    }

    showModal = () => {
        this.setState({ showModal: true });
    };

    hideModal = () => {
        this.setState({ showModal: false });
    };

    modalChangeStatus = () => {
        // No confirmation modal required when only uploading new csv file
        if (
            this.state.accessTypeChangeConfirmed ||
            (this.state.selectedAccessType === FormAccessType.DFESignIn &&
                this.getFormAccessType(this.state.data.signInRequired) ===
                    FormAccessType.DFESignIn)
        ) {
            this.changeFormAccessType();
        }
    };

    toggleAccessTypeConfirmation = () => {
        this.setState((currentState) => ({
            accessTypeChangeConfirmed: !currentState.accessTypeChangeConfirmed,
        }));
    };

    getFormAccessType(signInRequired) {
        return signInRequired
            ? FormAccessType.DFESignIn
            : FormAccessType.Public;
    }

    changeFormAccessType = async () => {
        const id = this.id;

        try {
            const response: FormDefinition = await this.designerApi.fetchData(
                id
            );
            if (response) {
                if (this.state.selectedAccessType == FormAccessType.DFESignIn) {
                    response.signInRequired = true;
                    const FormDataWithUploadedFile = {
                        ...response,
                        file: this.context.uploadedFile,
                    };
                    try {
                        const fileresponse = await this.changeFormAccessTypeWithFile(
                            FormDataWithUploadedFile
                        );
                        console.log(fileresponse);
                        if (fileresponse.status === 200) {
                            this.setState({
                                changeSuccessful: true,
                                showModal: false,
                            });
                        }
                    } catch (err) {
                        console.log(err);
                        this.setState({
                            changeSuccessful: false,
                            showModal: false,
                            serverError: true,
                        });
                    }
                } else {
                    response.signInRequired = false;
                    const FormDataWithUploadedFile = {
                        ...response,
                        file: "",
                    };
                    this.designerApi.save(id, FormDataWithUploadedFile);
                    this.setState({ changeSuccessful: true, showModal: false });
                }
            }
            if (!response)
                this.setState({
                    changeSuccessful: false,
                    showModal: false,
                    serverError: true,
                });
        } catch (e) {
            this.setState({
                changeSuccessful: false,
                showModal: false,
                serverError: true,
            });
            logger.error("error ChangeFormAccessTypes", e);
        }
    };

    changeFormAccessTypeWithFile = async (FormDataWithUploadedFile) => {
        const id = this.id;
        this.setState({ showLoader: true });
        const updated = await uploadProvidersMapping(
            id,
            FormDataWithUploadedFile
        );
        if (!updated) {
            logger.error("ChangeFormAccessType id:", id);
        }
        if (updated && updated.status === 200) {
            this.setState({ showLoader: false });
        }
        return updated;
    };

    componentDidMount() {
        this.callLogin();
        const id = this.id;
        this.designerApi.fetchData(id).then((data) => {
            this.setState({
                loading: false,
                data,
                selectedAccessType: this.getFormAccessType(data.signInRequired),
            });
            this.context.setPreviouslyUploadedFile(
                typeof data.file === "string" ? data.file : ""
            );
        });
    }

    componentDidUpdate() {
        this.callLogin();
    }

    goBack = (event) => {
        event.preventDefault();
        this.props.history.goBack();
    };

    handleRadioCheck = (formAccessType) => {
        this.setState({
            selectedAccessType: formAccessType,
        });
        if (formAccessType === FormAccessType.DFESignIn) {
            this.context.setPreviouslyUploadedFile(null);
        }
    };

    render() {
        const { env } = window;

        if (this.state.loading) {
            return <p className="govuk-body">Loading ...</p>;
        }

        if (this.state.showLoader === true) {
            return (
                <Loader
                    show={true}
                    loadingText={
                        "Processing your request, this should take a few moments"
                    }
                />
            );
        }

        const RenderPage = () => {
            if (env === "local") {
                return (
                    <FormTable
                        showModal={this.showModal}
                        hideModal={this.hideModal}
                        goBack={this.goBack}
                        tableData={this.state.data}
                        getFormAccessType={this.getFormAccessType}
                        handleRadioCheck={this.handleRadioCheck}
                        accessTypeChangeConfirmed={
                            this.state.accessTypeChangeConfirmed
                        }
                        selectedAccessType={this.state.selectedAccessType}
                        modalChangeStatus={this.modalChangeStatus}
                        toggleAccessTypeConfirmation={
                            this.toggleAccessTypeConfirmation
                        }
                        isModalOpen={this.state.showModal}
                        changeSuccessful={this.state.changeSuccessful}
                        serverError={this.state.serverError}
                    />
                );
            } else {
                return (
                    <AuthenticatedTemplate>
                        <FormTable
                            showModal={this.showModal}
                            hideModal={this.hideModal}
                            goBack={this.goBack}
                            tableData={this.state.data}
                            getFormAccessType={this.getFormAccessType}
                            handleRadioCheck={this.handleRadioCheck}
                            accessTypeChangeConfirmed={
                                this.state.accessTypeChangeConfirmed
                            }
                            selectedAccessType={this.state.selectedAccessType}
                            modalChangeStatus={this.modalChangeStatus}
                            toggleAccessTypeConfirmation={
                                this.toggleAccessTypeConfirmation
                            }
                            isModalOpen={this.state.showModal}
                            changeSuccessful={this.state.changeSuccessful}
                            serverError={this.state.serverError}
                        />
                    </AuthenticatedTemplate>
                );
            }
        };
        return <RenderPage />;
    }
}

export default withRouter(ChangeFormAccessType);
