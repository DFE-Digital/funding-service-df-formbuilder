import React, { useState } from "react";
import { Output, EmailOutputConfiguration, ValidationErrors } from "./types";
import { LabelSizes, Spacing, SpacingUnit, TextFormComponent } from "../ui";

type Props = {
    output: Output;
    errors: ValidationErrors;
};

const EmailEdit = ({ output, errors = {} }: Props) => {
    const [outputConfiguration, setOutputConfiguration] = useState(
        (typeof output?.outputConfiguration === "object"
            ? output?.outputConfiguration
            : {
                  emailAddress: "",
              }) as EmailOutputConfiguration
    );

    return (
        <div className="govuk-body email-edit">
            <TextFormComponent
                name="email-address"
                label="Email Address"
                labelSize={LabelSizes.S}
                value={outputConfiguration.emailAddress}
                error={errors?.email && errors?.email.children}
                onChange={(e) =>
                    setOutputConfiguration({ emailAddress: e.target.value })
                }
            />
            <Spacing mb={SpacingUnit.Six} />
        </div>
    );
};

export default EmailEdit;
