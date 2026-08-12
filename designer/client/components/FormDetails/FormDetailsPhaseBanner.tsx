import React, { ChangeEvent } from "react";
import { LegendSizes, RadioFormComponent } from "../../ui";
import { Data } from "@xgovformbuilder/model";

import { i18n } from "../../i18n";

type PhaseBanner = Exclude<Data["phaseBanner"], undefined>;
type Phase = PhaseBanner["phase"];

interface Props {
    phase: Phase;
    handlePhaseBannerChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const FormDetailsPhaseBanner = (props: Props) => {
    const { phase = "", handlePhaseBannerChange } = props;

    return (
        <div className="govuk-form-group">
            <RadioFormComponent
                name="phaseBanner"
                value={phase}
                label={i18n("formDetails.phaseBanner.fieldTitle")}
                labelSize={LegendSizes.S}
                hint={i18n("formDetails.phaseBanner.hint")}
                options={[
                    {
                        key: "alpha",
                        value: "alpha",
                        label: i18n("formDetails.alpha"),
                        onChange: handlePhaseBannerChange,
                    },
                    {
                        key: "beta",
                        value: "beta",
                        label: i18n("formDetails.beta"),
                        onChange: handlePhaseBannerChange,
                    },
                    {
                        key: "none",
                        value: "",
                        label: i18n("formDetails.none"),
                        onChange: handlePhaseBannerChange,
                    },
                ]}
            />
        </div>
    );
};
