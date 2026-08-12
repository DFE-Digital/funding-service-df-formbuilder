import { FormStatus } from "@xgovformbuilder/model";
import React from "react";
import { SummaryDataType } from "../../../store/types";
import Tile from "./Tile";

type Props = {
    summaryData: {
        total: SummaryDataType;
        [FormStatus.InDevelopment]: SummaryDataType;
        [FormStatus.UAT]: SummaryDataType;
        [FormStatus.Published]: SummaryDataType;
        [FormStatus.Closed]: SummaryDataType;
    };
};

const SummaryTileComponent = (props: Props) => {
    return (
        <div className="summary-container govuk-!-margin-bottom-8">
            <div className="summary-intro-container govuk-body govuk-!-margin-bottom-6">
                <div>
                    Here is an overview of the form count. Please click on the
                    underlined links to get those filtered results.
                </div>
                <div className="summary-note-container">
                    Note:
                    <div className="xx-indicator-container">
                        <span className="my-form-xx">XX</span>
                        <span className="xx-divider">|</span>
                        <span className="colleague-form-xx">XX</span>
                    </div>
                    -
                    <div className="xx-desc-container">
                        <span className="xx-desc">My form</span>|
                        <span className="xx-desc">Colleagues’ form</span>
                    </div>
                </div>
            </div>
            <div className="tiles-container">
                {Object.entries(props.summaryData).map(([type, obj]) => (
                    <Tile
                        key={obj.title}
                        type={type}
                        title={obj.title}
                        total={obj.total}
                        myForms={obj.my_forms}
                        colForms={obj.col_forms}
                    />
                ))}
            </div>
        </div>
    );
};

export default SummaryTileComponent;
