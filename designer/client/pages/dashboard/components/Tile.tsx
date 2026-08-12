import React from "react";
import { useAppDispatch } from "../../../store/hooks";
import {
    clearFilters,
    selectDashboardTab,
    setFormStatusFilter,
} from "../../../store/reducers/dashboardReducer";
import { getFormStatusBasedOnType } from "../utils";
import { FormConfigurationTabs } from "../../../utils";

type Props = {
    title: string;
    type: string;
    total: number;
    myForms: number;
    colForms: number;
};

const Tile = (props: Props) => {
    const dispatch = useAppDispatch();
    const setFilter = () => {
        dispatch(clearFilters());
        dispatch(setFormStatusFilter(getFormStatusBasedOnType(props.type)));
        document.getElementById("dashboard-tabs")?.scrollIntoView();
    };
    const onMyFormValueSelect = () => {
        if (props.type !== "total") {
            dispatch(selectDashboardTab(FormConfigurationTabs.MyForms));
            setFilter();
        }
    };
    const onCollFormValueSelect = () => {
        if (props.type !== "total") {
            dispatch(selectDashboardTab(FormConfigurationTabs.ColleagueForms));
            setFilter();
        }
    };
    return (
        <div className="tile govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-0">
            <div className="tile-total govuk-!-font-size-48 govuk-!-margin-bottom-2">
                {props.total}
            </div>
            <div className="tile-title govuk-!-margin-bottom-2">
                {props.title}
            </div>
            <div className="tile-total-breakdown">
                <span
                    data-testid={`${props.type}-my-forms`}
                    onClick={onMyFormValueSelect}
                >
                    {props.myForms}
                </span>
                |
                <span
                    data-testid={`${props.type}-col-forms`}
                    onClick={onCollFormValueSelect}
                >
                    {props.colForms}
                </span>
            </div>
        </div>
    );
};

export default Tile;
