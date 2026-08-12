import React, { Component, MouseEvent } from "react";
import { withRouter } from "react-router-dom";
import { BackLink } from "../../components/BackLink";
import { i18n } from "../../i18n";
import "./LandingPage.scss";
import { isEmpty } from "../../helpers";
import ErrorSummary from "../../error-summary";
import { UserAccountHelper } from "../../helpers/userAccount.helper";
import MsalClientApplication from "../../auth/clientApplication";
import {
    createNewFormConfig,
    checkIfFormNameExists,
} from "../../api/formConfigurationsApi";
import { MsalContext, AuthenticatedTemplate } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { LabelSizes, Spacing, SpacingUnit, TextFormComponent } from "../../ui";

type Props = {
    history: any;
};

type State = {
    newName: string;
    errors?: any;
    loading?: boolean;
    userName?: string;
    userId?: string;
};

const parseNewName = (name: string) => {
    return name;
};

export class NewConfig extends Component<Props, State> {
    static contextType = MsalContext;
    constructor(props: Props) {
        super(props);

        this.state = {
            newName: "",
            errors: {},
            userName: "",
            userId: "",
        };
    }

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

    componentDidMount() {
        this.callLogin();
        UserAccountHelper.getUserAccount(
            MsalClientApplication.getInstance()
        ).then((acc) => {
            this.setState({
                userName: acc.UserName,
                userId: acc.UserId,
            });
        });
    }

    componentDidUpdate() {
        this.callLogin();
    }

    validate = async () => {
        const { newName, configs } = this.state;

        const errors: any = {};
        let hasErrors = false;

        if (isEmpty(newName)) {
            errors.name = {
                href: "#formName",
                children: i18n("Enter form name"),
            };
            hasErrors = true;
            return { errors, hasErrors };
        }

        if (!newName.match(/^[a-zA-Z0-9 _-]+$/)) {
            errors.name = {
                href: "#formName",
                children: i18n(
                    "Form name should not contain special characters"
                ),
            };
            hasErrors = true;
            return { errors, hasErrors };
        }

        const parsedName = parseNewName(newName);
        const response = await checkIfFormNameExists(parsedName);
        const alreadyExists = response.exists ?? false;

        if (alreadyExists) {
            errors.name = {
                href: "#formName",
                children: i18n("A form with this name already exists"),
            };
            hasErrors = true;
        }

        return { errors, hasErrors };
    };

    onSubmit = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        const { newName } = this.state;

        const { errors, hasErrors } = await this.validate();

        if (hasErrors) {
            return this.setState({
                errors,
            });
        } else {
            this.setState({
                errors,
            });
        }

        const newResponse = await createNewFormConfig({
            name: newName ?? "",
            userName: this.state.userName ?? "",
            userId: this.state.userId ?? "",
        });

        this.props.history.push(`designer/${newResponse.id}`);
        window.location.reload();
    };

    goBack = (event) => {
        event.preventDefault();
        this.props.history.goBack();
    };

    render() {
        const { newName, errors } = this.state;
        const { env } = window;

        const newTemplate = (
            <div>
                <BackLink onClick={this.goBack}>{i18n("Back")}</BackLink>

                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        {errors?.name && (
                            <ErrorSummary
                                titleChildren="There is a problem"
                                errorList={Object.values(errors)}
                            />
                        )}

                        <h1 className="govuk-heading-l">
                            {i18n("Enter a name for your form")}
                        </h1>

                        <TextFormComponent
                            name="formName"
                            additionalClasses="govuk-input--width-10"
                            label="Title"
                            labelSize={LabelSizes.S}
                            value={newName || ""}
                            onChange={(e) =>
                                this.setState({ newName: e.target.value })
                            }
                            error={errors?.name && errors?.name.children}
                        />
                        <Spacing mb={SpacingUnit.Six} />
                        <button
                            className="govuk-button govuk-button--start"
                            onClick={this.onSubmit}
                        >
                            {i18n("Next")}
                        </button>
                    </div>
                </div>
            </div>
        );
        if (env === "local") {
            return newTemplate;
        } else {
            return <AuthenticatedTemplate>{newTemplate}</AuthenticatedTemplate>;
        }
    }
}

export default withRouter(NewConfig);
