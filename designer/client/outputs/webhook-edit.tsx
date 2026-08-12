import React, { useState } from "react";
import { ValidationErrors } from "./types";
import { LabelSizes, Spacing, SpacingUnit, TextFormComponent } from "../ui";

type Props = {
    url: string;
    errors: ValidationErrors;
};

const WebhookEdit = ({ url = "", errors }: Props) => {
    const [webhookUrl, setUrl] = useState(url);

    return (
        <>
            <TextFormComponent
                name="webhook-url"
                label="Webhook url"
                labelSize={LabelSizes.S}
                value={webhookUrl}
                error={errors?.url && errors?.url.children}
                onChange={(e) => setUrl(e.target.value)}
            />
            <Spacing mb={SpacingUnit.Six} />
        </>
    );
};

export default WebhookEdit;
