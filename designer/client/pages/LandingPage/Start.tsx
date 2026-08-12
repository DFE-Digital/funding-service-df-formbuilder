import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { i18n } from "../../i18n";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../config/authConfig";
type Props = {
    history: any;
};

function handleLogin(instance) {
    instance.loginRedirect(loginRequest);
}

/**
 * Renders a button which, when selected, will redirect the page to the login prompt
 */
export const SignInButton = () => {
    const { instance } = useMsal();

    return (
        <button
            className="govuk-button govuk-button--start"
            onClick={() => handleLogin(instance)}
        >
            {i18n("Start now")}
        </button>
    );
};

export class StartPage extends Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <h1 className="govuk-heading-xl">Digital Form Builder</h1>
                    <p className="govuk-body">Use this service to:</p>
                    <ul className="govuk-list govuk-list--bullet">
                        <li>Set up a new digital form for a grant</li>
                        <li>Deliver forms for policy teams at a faster pace</li>
                        <li>Ensure consistency with forms created</li>
                    </ul>
                    <SignInButton />
                </div>
            </div>
        );
    }
}

export default withRouter(StartPage);
