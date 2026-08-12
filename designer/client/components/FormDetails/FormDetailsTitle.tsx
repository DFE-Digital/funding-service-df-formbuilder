import React, { ChangeEvent } from "react";
import { i18n } from "../../i18n";
import { LabelSizes, Spacing, SpacingUnit, TextFormComponent } from "../../ui";

interface Props {
    errors: any;
    handleTitleInputBlur: (event: ChangeEvent<HTMLInputElement>) => void;
    title: string;
}
export const FormDetailsTitle = (props: Props) => {
    const { title, errors, handleTitleInputBlur } = props;

    return (
        <>
            <TextFormComponent
                name="title"
                label={i18n("Title")}
                labelSize={LabelSizes.S}
                onChange={handleTitleInputBlur}
                value={title}
                error={errors?.title && i18n(errors?.title?.children)}
            />
            <Spacing mb={SpacingUnit.Six} />
        </>
    );
};
