import React from "react";

import { Para } from "../../Typography";
import {
    ChildLegendIcon,
    ParentLegendIcon,
    StandaloneLegendIcon,
} from "../../Icons";
import Spacing, { SpacingUnit } from "../../Spacing";

import "./formTableLegend.scss";

type Props = {};

const FormTableLegend = (props: Props) => {
    return (
        <div className="form-legend-container">
            <Para text="Form legends:" />
            <Spacing mr={SpacingUnit.Three} />
            <ParentLegendIcon />
            <Spacing mr={SpacingUnit.One} />
            <Para text="Parent" />
            <Spacing mr={SpacingUnit.Three} />
            <ChildLegendIcon />
            <Spacing mr={SpacingUnit.One} />
            <Para text="Child" />
            <Spacing mr={SpacingUnit.Three} />
            <StandaloneLegendIcon />
            <Spacing mr={SpacingUnit.One} />
            <Para text="Standalone" />
            <Spacing mr={SpacingUnit.Four} />
        </div>
    );
};

export default FormTableLegend;
