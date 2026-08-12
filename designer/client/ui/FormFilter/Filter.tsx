import React from "react";
import Spacing, { SpacingUnit } from "../Spacing";
import {
    FormAccessTypeFilter,
    FormStatusFilter,
    ModifiedOnFilter,
    CreatedByFilter,
    SelectedFilters,
} from "./components";
import { GridColumn, GridColumnType, GridRow } from "../Layout";

import "./filter.scss";
import { Heading, HeadingType } from "../Typography";
import { DashboardFilters } from "../../store/types";
import { isFilterEmpty } from "../../pages/dashboard/utils";

type Props = {
    show: boolean;
    onClose: () => void;
    createdByList: string[];
    filters: DashboardFilters;
    setFormStatus: (formStatus: any) => void;
    setFormAccessType: (formAccessType: any) => void;
    setCreatedby: (createdBy: any) => void;
    setModifedOn: (modifiedOn: any) => void;
};

const Filter = (props: Props) => {
    if (!props.show) return null;
    return (
        <Spacing
            data-testid="dashboard-filter-container"
            mb={SpacingUnit.Five}
            additionalClasses="filter-ui-container"
        >
            <div className="filter-header">
                <Heading text="Filters" type={HeadingType.S} />
                <a
                    id="filter-close-link"
                    className="govuk-link govuk-body govuk-!-margin-bottom-0"
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        props.onClose();
                    }}
                >
                    Close
                </a>
            </div>
            {!isFilterEmpty(props.filters) && <SelectedFilters />}
            <GridColumn type={GridColumnType.Full}>
                <Spacing mb={SpacingUnit.Four} />
                <GridRow>
                    <GridColumn type={GridColumnType.Full}>
                        <FormStatusFilter
                            filters={props.filters}
                            setFormStatus={props.setFormStatus}
                        />
                    </GridColumn>
                </GridRow>
                <GridRow>
                    <GridColumn type={GridColumnType.Full}>
                        <FormAccessTypeFilter
                            filters={props.filters}
                            setFormAccessType={props.setFormAccessType}
                        />
                    </GridColumn>
                </GridRow>
                <GridRow>
                    <GridColumn type={GridColumnType.Full}>
                        <ModifiedOnFilter
                            filters={props.filters}
                            setModifedOn={props.setModifedOn}
                        />
                    </GridColumn>
                </GridRow>
                <GridRow>
                    <GridColumn type={GridColumnType.Full}>
                        <CreatedByFilter
                            filters={props.filters}
                            createdByList={props.createdByList}
                            setCreatedBy={props.setCreatedby}
                        />
                    </GridColumn>
                </GridRow>
            </GridColumn>
        </Spacing>
    );
};

export default Filter;
