import React, { Component } from "react";
import { i18n } from "../../i18n";
import { withRouter } from "react-router-dom";
import "./LandingPage.scss";
import logger from "../../plugins/logger";
import ModalChangeStatus from "../../modal-change-status";
import { DesignerApi } from "../../api/designerApi";
import { BackLink } from "../../components/BackLink";
import { FormDefinition, FormStatus } from "@xgovformbuilder/model";
import { MsalContext, AuthenticatedTemplate } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";

type Props = {
    history: any;
};

type State = {
    showModal: boolean;
    checkBox: boolean;
    displayName: string;
    radioStatus: FormStatus;
    radioClicked: boolean;
    loading?: boolean;
    data?: any;
    id?: string;
};
export class ChangeStatus extends Component<Props, State> {
    static contextType = MsalContext;
    constructor(props: Props) {
        super(props);

        this.state = {
            loading: true,
            showModal: false,
            checkBox: false,
            displayName: "",
            radioStatus: FormStatus.InDevelopment,
            radioClicked: false,
            data: "",
            id: "",
        };
    }

    designerApi = new DesignerApi();

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

    get id() {
        return this.props.match?.params?.id;
    }

    showCheckBox = () => {
        this.setState({
            checkBox: !this.state.checkBox,
        });
    };

    showModal = () => {
        this.setState({ showModal: true });
    };

    hideModal = () => {
        this.setState({ showModal: false });
    };
    radioClicked = () => {
        this.setState({
            radioClicked: !this.state.radioClicked,
        });
    };
    modalChangeStatus = () => {
        if (this.state.checkBox) {
            this.changeForm();
        }
    };

    changeForm = async () => {
        const id = this.props.history.location.state;

        try {
            const response: FormDefinition = await this.designerApi.fetchData(
                id
            );

            if (response) {
                response.formStatus = this.state.radioStatus;
                const updated = await this.designerApi.save(id, response);
                if (!updated) {
                    logger.error("ChangeStatus id:", id);
                }
                window.location.reload();
            }
        } catch (e) {
            logger.error("error ChangeStatus", e);
        }
    };

    componentDidMount() {
        this.callLogin();
        const id = this.props.history.location.state;
        this.setState({ id });
        this.designerApi.fetchData(id).then((data) => {
            this.setState({ loading: false, data });
        });
    }

    componentDidUpdate() {
        this.callLogin();
    }

    goBack = (event) => {
        event.preventDefault();
        this.props.history.goBack();
    };

    render() {
        const { env } = window;

        if (this.state.loading) {
            return <p className="govuk-body">Loading ...</p>;
        }

        const formTable = (
            <tr className="govuk-table__row">
                <td className="govuk-table__cell">
                    <span
                        className={
                            this.state.data.displayName.length > 30
                                ? "govuk-formname-ellipsis"
                                : ""
                        }
                        title={this.state.data.displayName}
                    >
                        {this.state.data.displayName}
                    </span>
                </td>
                <td className="govuk-table__cell">
                    {this.state.data.formStatus}
                </td>
                <td className="govuk-table__cell">
                    {this.state.data.lastModified}
                </td>
                <td className="govuk-table__cell">
                    {this.state.data.createdBy}
                </td>
            </tr>
        );

        const myFormsButtons = (
            <div>
                <p />
                <button
                    type="submit"
                    className="govuk-button"
                    onClick={async (e) => {
                        e.preventDefault();
                        this.showModal();
                    }}
                >
                    Change status
                </button>

                <ModalChangeStatus
                    onClose={this.hideModal}
                    onCheck={this.showCheckBox}
                    checked={this.state.checkBox}
                    onChangeStatus={this.modalChangeStatus}
                    show={this.state.showModal}
                    formName={this.state.data.displayName}
                />
            </div>
        );
        const formStatusList = [
            FormStatus.InDevelopment,
            FormStatus.UAT,
            FormStatus.Published,
            FormStatus.Closed,
        ];
        const myRadioButtons = formStatusList.map((form) => (
            <tr className="govuk-table__row" key={form}>
                <td className="govuk-table__cell__noborder">
                    <div className="govuk-radios" data-module="govuk-radios">
                        <div className="govuk-radios__item govuk-!-margin-bottom-2">
                            <input
                                className="govuk-radios__input"
                                name="change-status"
                                type="radio"
                                id={`${form}`}
                                value={`${form}`}
                                checked={
                                    (this.state.radioStatus == form &&
                                        this.state.radioClicked) ||
                                    (this.state.data.formStatus == form &&
                                        !this.state.radioClicked)
                                }
                                onClick={async (e) => {
                                    e.preventDefault();
                                    this.radioClicked;
                                    this.setState({
                                        radioStatus: form,
                                        radioClicked: true,
                                    });
                                }}
                            />

                            <label
                                className="govuk-label govuk-radios__label"
                                htmlFor="change-status"
                            >
                                {form}
                            </label>
                        </div>
                    </div>
                </td>
            </tr>
        ));

        const changeStatus = (
            <div className="govuk-grid-row">
                <BackLink onClick={this.goBack}>{i18n("Back")}</BackLink>
                <div className="govuk-grid-column-full">
                    <table className="govuk-table">
                        <caption className="govuk-table__caption govuk-table__caption--l">
                            Change Status of {this.state.data.displayName}
                        </caption>
                        <thead className="govuk-table__head">
                            <tr className="govuk-table__row">
                                <th scope="col" className="govuk-table__header">
                                    Form name
                                </th>
                                <th scope="col" className="govuk-table__header">
                                    Status
                                </th>
                                <th scope="col" className="govuk-table__header">
                                    Last Modified
                                </th>
                                <th scope="col" className="govuk-table__header">
                                    Created by
                                </th>
                            </tr>
                        </thead>
                        <tbody className="govuk-table__body">
                            {this.state.data ? (
                                <>{formTable}</>
                            ) : (
                                <tr className="govuk-table__row">
                                    <td className="govuk-table__cell table__cell__noborder">
                                        {i18n("landingPage.existing.noforms")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <p className="govuk-body">
                        Please select a new status for this form below:
                    </p>
                    <div>{myRadioButtons}</div>

                    <div>{myFormsButtons}</div>
                </div>
            </div>
        );

        function RenderPage() {
            if (env === "local") {
                return changeStatus;
            } else {
                return (
                    <AuthenticatedTemplate>
                        {changeStatus}
                    </AuthenticatedTemplate>
                );
            }
        }

        return <RenderPage />;
    }
}

export default withRouter(ChangeStatus);
