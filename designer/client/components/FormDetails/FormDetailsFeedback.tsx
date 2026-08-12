import React, { ChangeEvent, useEffect, useState } from "react";
import { RadioFormComponent, LegendSizes } from "../../ui";
import { FormConfiguration } from "@xgovformbuilder/model";

import { i18n } from "../../i18n";
import * as formConfigurationApi from "../../load-form-configurations";

interface Props {
    feedbackForm: any;
    handleIsFeedbackFormRadio: (event: ChangeEvent<HTMLInputElement>) => void;
    onSelectFeedbackForm: (event: ChangeEvent<HTMLSelectElement>) => void;
    formConfigurations: FormConfiguration[];
    selectedFeedbackForm: string | undefined;
}

export const FormDetailsFeedback = (props: Props) => {
    const {
        feedbackForm = false,
        handleIsFeedbackFormRadio,
        onSelectFeedbackForm,
        selectedFeedbackForm,
    } = props;

    const [configs, setConfigs] = useState<FormConfiguration[]>([]);

    useEffect(() => {
        let isMounted = true;
        formConfigurationApi.loadConfigurations().then((result) => {
            if (isMounted) setConfigs(result.filter((it) => it.feedbackForm));
        });
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="govuk-form-group form-details__feedback">
            <RadioFormComponent
                name="feedbackForm"
                value={feedbackForm}
                label={i18n("formDetails.feedbackForm.fieldTitle")}
                labelSize={LegendSizes.S}
                hint={i18n("formDetails.feedbackForm.fieldHint")}
                options={[
                    {
                        key: "true",
                        value: true,
                        label: i18n("yes"),
                        onChange: handleIsFeedbackFormRadio,
                    },
                    {
                        key: "false",
                        value: false,
                        label: i18n("no"),
                        onChange: handleIsFeedbackFormRadio,
                    },
                ]}
            />
            {feedbackForm === false && (
                <div className="govuk-form-group">
                    <label
                        className="govuk-label govuk-label--s"
                        htmlFor="target-feedback-form"
                    >
                        Feedback form
                    </label>
                    {configs.length === 0 && (
                        <div
                            className="govuk-hint"
                            id="target-feedback-form-hint"
                        >
                            <p>
                                No available feedback form configurations found
                            </p>
                            <p>
                                Only forms marked as being a feedback form are
                                listed here
                            </p>
                        </div>
                    )}

                    {configs.length > 0 && (
                        <div>
                            <div
                                id="target-feedback-form-hint"
                                className="govuk-hint"
                            >
                                <p>
                                    This is the form to use for gathering
                                    feedback about this form
                                </p>
                                <p>
                                    Only forms marked as being a feedback form
                                    are listed here
                                </p>
                            </div>
                            <select
                                className="govuk-select"
                                id="target-feedback-form"
                                data-testid="target-feedback-form"
                                name="targetFeedbackForm"
                                value={selectedFeedbackForm}
                                required
                                onChange={onSelectFeedbackForm}
                            >
                                <option />
                                {configs.map((config, index) => (
                                    <option
                                        key={config.Key + index}
                                        value={config.Key}
                                    >
                                        {config.DisplayName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
