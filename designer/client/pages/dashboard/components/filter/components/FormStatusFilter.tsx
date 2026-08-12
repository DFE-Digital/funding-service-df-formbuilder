import { FormStatus } from "@xgovformbuilder/model";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import {
    filterSelector,
    setFormStatusFilter,
} from "../../../../../store/reducers/dashboardReducer";

type Props = {};

const FormStatusFilter = (props: Props) => {
    const dispatch = useAppDispatch();
    const { formStatus } = useAppSelector(filterSelector);
    const onFormStatusCheckboxCheck = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const updatedFormStatusFilter = {
            ...formStatus,
            [e.target.value]: !formStatus[e.target.value],
        };
        dispatch(setFormStatusFilter(updatedFormStatusFilter));
    };
    return (
        <div className="govuk-form-group">
            <fieldset className="govuk-fieldset">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <h1 className="govuk-fieldset__heading govuk-!-font-size-19">
                        Form status
                    </h1>
                </legend>
                <div
                    className="govuk-checkboxes govuk-checkboxes--small horizontal-checkboxes"
                    data-module="govuk-checkboxes"
                >
                    <div className="govuk-checkboxes__item">
                        <input
                            className="govuk-checkboxes__input"
                            data-testid="dashboard-filter-form-status-in-development"
                            id="form-status-1"
                            name="form-status"
                            type="checkbox"
                            value={FormStatus.InDevelopment}
                            checked={formStatus[FormStatus.InDevelopment]}
                            onChange={onFormStatusCheckboxCheck}
                        />
                        <label
                            className="govuk-label govuk-checkboxes__label form-status-checkboxes"
                            htmlFor="form-status-1"
                        >
                            In development
                        </label>
                    </div>
                    <div className="govuk-checkboxes__item">
                        <input
                            className="govuk-checkboxes__input"
                            id="form-status-2"
                            name="form-status"
                            type="checkbox"
                            value={FormStatus.UAT}
                            checked={formStatus[FormStatus.UAT]}
                            onChange={onFormStatusCheckboxCheck}
                        />
                        <label
                            className="govuk-label govuk-checkboxes__label form-status-checkboxes"
                            htmlFor="form-status-2"
                        >
                            UAT
                        </label>
                    </div>
                    <div className="govuk-checkboxes__item">
                        <input
                            className="govuk-checkboxes__input"
                            id="form-status-3"
                            name="form-status"
                            type="checkbox"
                            value={FormStatus.Published}
                            checked={formStatus[FormStatus.Published]}
                            onChange={onFormStatusCheckboxCheck}
                        />
                        <label
                            className="govuk-label govuk-checkboxes__label form-status-checkboxes"
                            htmlFor="form-status-3"
                        >
                            Published
                        </label>
                    </div>
                    <div className="govuk-checkboxes__item">
                        <input
                            className="govuk-checkboxes__input"
                            id="form-status-4"
                            name="form-status"
                            type="checkbox"
                            value={FormStatus.Closed}
                            checked={formStatus[FormStatus.Closed]}
                            onChange={onFormStatusCheckboxCheck}
                        />
                        <label
                            className="govuk-label govuk-checkboxes__label form-status-checkboxes"
                            htmlFor="form-status-4"
                        >
                            Closed
                        </label>
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

export default FormStatusFilter;
