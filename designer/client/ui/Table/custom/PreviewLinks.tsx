import { CellContext } from "@tanstack/react-table";
import { FormStatus } from "@xgovformbuilder/model";
import React from "react";
import { FormConfigurationWithChild } from "../../../store/types";

type Props = {
    data: CellContext<FormConfigurationWithChild, unknown>;
};

const PreviewLinks = (props: Props) => {
    const { data } = props;
    //@ts-ignore
    const previewUrl = window?.previewUrl;
    //@ts-ignore
    const preProdUrl = window?.preprodPreviewUrl;
    if (
        data.row.original.FormStatus === FormStatus.InDevelopment ||
        data.row.original.FormStatus === FormStatus.UAT ||
        data.row.original.FormStatus === FormStatus.Closed
    ) {
        return (
            <a
                className="govuk-link"
                target="_blank"
                href={`${preProdUrl}/${data.row.original.Key}`}
                rel="noreferrer noopener"
            >
                Test
            </a>
        );
    } else if (data.row.original.FormStatus === FormStatus.Published) {
        return (
            <>
                <a
                    className="govuk-link"
                    target="_blank"
                    href={`${preProdUrl}/${data.row.original.Key}`}
                    rel="noreferrer noopener"
                >
                    Test
                </a>
                <a
                    className="govuk-link govuk-!-margin-left-3"
                    target="_blank"
                    href={`${previewUrl}/${data.row.original.Key}`}
                    rel="noreferrer noopener"
                >
                    Prod
                </a>
            </>
        );
    } else {
        return <></>;
    }
};

export default PreviewLinks;
