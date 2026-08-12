import React from "react";
import Editor from "./editor";
import { clone } from "@xgovformbuilder/model";

import { DataContext } from "./context";
import logger from "../client/plugins/logger";

class DeclarationEdit extends React.Component {
    static contextType = DataContext;

    constructor(props) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new window.FormData(form);
        const { data, toggleShowState } = this.props;
        const { save } = this.context;
        const copy = clone(data);

        copy.declaration = formData.get("declaration");
        copy.customSummaryMessage = formData.get("customSummaryMessage");
        copy.skipSummary = formData.get("skip-summary") === "on";

        try {
            const savedData = await save(copy);
            this.props.onCreate({ data: savedData });
        } catch {
            logger.error("DeclarationEdit", err);
        }
    };

    render() {
        const { data } = this.props;
        const { declaration, customSummaryMessage, skipSummary } = data;

        return (
            <div className="govuk-body">
                <form onSubmit={(e) => this.onSubmit(e)} autoComplete="off">
                    <div className="govuk-checkboxes govuk-form-group">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                            <p className="govuk-fieldset__heading">
                                Skip summary page{" "}
                            </p>
                            <span className="govuk-hint">
                                The user will not be shown a summary page, and
                                will continue to pay and/or the application
                                complete page.
                            </span>
                        </legend>
                        <div className="govuk-checkboxes__item">
                            <input
                                className="govuk-checkboxes__input"
                                id="skip-summary"
                                data-cast="boolean"
                                name="skip-summary"
                                type="checkbox"
                                defaultChecked={skipSummary}
                            />
                            <label
                                className="govuk-label govuk-checkboxes__label"
                                htmlFor="skip-summary"
                            >
                                Skip summary
                            </label>
                        </div>
                    </div>

                    <div className="govuk-form-group">
                        <h1 className="govuk-label-wrapper">
                            <label
                                className="govuk-label govuk-label--s"
                                htmlFor="declaration"
                            >
                                Declaration
                            </label>
                        </h1>
                        <div className="govuk-hint">
                            The declaration can include HTML and the
                            `govuk-prose-scope` css class is available. Use this
                            on a wrapping element to apply default govuk styles.
                        </div>
                        <Editor
                            id="declaration"
                            name="declaration"
                            value={declaration}
                        />
                    </div>

                    <div className="govuk-form-group">
                        <h1 className="govuk-label-wrapper">
                            <label
                                className="govuk-label govuk-label--s"
                                htmlFor="custom-summary-message"
                            >
                                Customise summary message
                            </label>
                        </h1>
                        <div
                            id="custom-summary-message-hint"
                            className="govuk-hint"
                        >
                            Add a customised message to the summary page. It
                            will be placed above the submit button. It can
                            contain text, images, links, etc. in html format.
                        </div>
                        <Editor
                            id="custom-summary-message"
                            name="customSummaryMessage"
                            value={customSummaryMessage}
                        />
                    </div>

                    <button className="govuk-button" type="submit">
                        Save
                    </button>
                </form>
            </div>
        );
    }
}

export default DeclarationEdit;
