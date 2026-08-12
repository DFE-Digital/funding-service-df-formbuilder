import React, { Component } from "react";

import NotifyEditItems from "./notify-edit-items";
import { Output, NotifyOutputConfiguration, ValidationErrors } from "./types";
import classNames from "classnames";
import { i18n } from "../i18n";
import { allInputs } from "../data/component/inputs";
import { NOTIFY_DSI_SIGNIN_EMAIL } from "@xgovformbuilder/model";
import {
    CheckboxInput,
    LabelSizes,
    Spacing,
    SpacingUnit,
    TextFormComponent,
} from "../ui";

type State = {
    outputConfiguration: NotifyOutputConfiguration;
};

type Props = {
    data: any; // TODO: type
    output: Output;
    onEdit: ({ data: any }) => void;
    errors: ValidationErrors;
};

class NotifyEdit extends Component<Props, State> {
    usableKeys: { name: string; display: string }[];

    constructor(props: Props) {
        super(props);
        this.state = {
            outputConfiguration: (typeof props.output?.outputConfiguration ===
            "object"
                ? props.output?.outputConfiguration
                : {
                      templateId: "",
                      apiKey: "",
                      emailField: "",
                      personalisation: [],
                  }) as NotifyOutputConfiguration,
        };
        const { data } = this.props;
        const dsiSignInEmail = {
            name: NOTIFY_DSI_SIGNIN_EMAIL,
            display: "DSI Signin Email",
        };

        this.usableKeys = allInputs(data).map((input) => ({
            name: input.name || "",
            display: input.title || "",
        }));
        if (data.signInRequired) {
            this.usableKeys.push(dsiSignInEmail);
        }
    }

    onTemplateIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const templateId = e.target.value ?? "";
        this.setState({
            outputConfiguration: {
                ...this.state.outputConfiguration,
                templateId,
            },
        });
    };

    onAPIKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const apiKey = e.target.value ?? "";
        this.setState({
            outputConfiguration: { ...this.state.outputConfiguration, apiKey },
        });
    };

    onAddReferencesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const addReferencesToPersonalisation = !this.state.outputConfiguration
            .addReferencesToPersonalisation;
        this.setState({
            outputConfiguration: {
                ...this.state.outputConfiguration,
                addReferencesToPersonalisation,
            },
        });
    };

    render() {
        const { outputConfiguration } = this.state;
        const { data, output, onEdit, errors } = this.props;
        const { conditions } = data;

        const {
            templateId,
            apiKey,
            emailField,
            addReferencesToPersonalisation,
        } = outputConfiguration;
        const personalisation = outputConfiguration.personalisation;
        const values = [
            ...conditions.map((condition) => ({
                name: condition.name,
                display: condition.displayName,
            })),
            ...this.usableKeys,
        ];
        const allowedTypes = ["EmailAddressField"];

        const allowedComponentNames = new Set(
            data.pages.flatMap((page) =>
                (page.components || [])
                    .filter((component) =>
                        allowedTypes.includes(component.type)
                    )
                    .map((component) => component.name)
            )
        );
        allowedComponentNames.add("notify_dsi_signin_email");
        const filteredUsableKeys = this.usableKeys.filter((key) =>
            allowedComponentNames.has(key.name)
        );

        return (
            <div className="govuk-body">
                <TextFormComponent
                    name="template-id"
                    label="Template ID"
                    labelSize={LabelSizes.S}
                    value={templateId}
                    error={errors?.templateId && errors?.templateId.children}
                    onChange={this.onTemplateIdChange}
                />
                <Spacing mb={SpacingUnit.Six} />
                <TextFormComponent
                    name="api-key"
                    label="API Key"
                    labelSize={LabelSizes.S}
                    value={apiKey}
                    error={errors?.apiKey && errors?.apiKey.children}
                    onChange={this.onAPIKeyChange}
                />
                <Spacing mb={SpacingUnit.Six} />
                <div
                    className={classNames({
                        "govuk-form-group": true,
                        "govuk-form-group--error": errors?.email,
                    })}
                >
                    <label
                        className="govuk-label govuk-!-font-weight-bold"
                        htmlFor="email-field"
                    >
                        Email field
                    </label>
                    {errors?.email && (
                        <p className="govuk-error-message">
                            <span className="govuk-visually-hidden">
                                Error:
                            </span>{" "}
                            {errors?.email.children ?? ""}
                        </p>
                    )}
                    <select
                        className={classNames({
                            "govuk-select": true,
                            "govuk-input--error": errors?.email,
                        })}
                        id="email-field"
                        name="email-field"
                        defaultValue={emailField}
                    >
                        {filteredUsableKeys.map((value, i) => (
                            <option
                                key={`${value.name}-${i}`}
                                value={value.name}
                            >
                                {value.display ?? value.name}
                            </option>
                        ))}
                    </select>
                </div>
                <NotifyEditItems
                    items={personalisation}
                    values={values}
                    data={data}
                    onEdit={onEdit}
                />
                <div className="govuk-form-group">
                    <CheckboxInput
                        id={"add-references-to-personalisation"}
                        name={"add-references-to-personalisation"}
                        selectedValue={
                            addReferencesToPersonalisation ? "true" : null
                        }
                        options={[
                            {
                                key: "true",
                                value: "true",
                                label: i18n(
                                    "outputEdit.notifyEdit.includeReferenceTitle"
                                ),
                                labelBold: true,
                                hint: i18n(
                                    "outputEdit.notifyEdit.includeReferenceHint"
                                ),
                                onChange: this.onAddReferencesChange,
                            },
                        ]}
                    />
                    <Spacing mb={SpacingUnit.Six} />
                </div>
            </div>
        );
    }
}

export default NotifyEdit;
