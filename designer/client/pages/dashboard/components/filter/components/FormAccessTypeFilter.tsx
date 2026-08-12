import { FormAccessType } from "@xgovformbuilder/model";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import {
    filterSelector,
    setFormAccessTypeFilter,
} from "../../../../../store/reducers/dashboardReducer";

type Props = {};

const FormAccessTypeFilter = (props: Props) => {
    const dispatch = useAppDispatch();
    const { formAccessType } = useAppSelector(filterSelector);
    const onFormAccessTypeCheckboxCheck = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const updatedFormAccessTypeFilter = {
            ...formAccessType,
            [e.target.value]: !formAccessType[e.target.value],
        };
        dispatch(setFormAccessTypeFilter(updatedFormAccessTypeFilter));
    };
    return (
        <div className="govuk-form-group">
            <fieldset className="govuk-fieldset">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <h1 className="govuk-fieldset__heading govuk-!-font-size-19">
                        Access Type
                    </h1>
                </legend>
                <div
                    className="govuk-checkboxes govuk-checkboxes--small horizontal-checkboxes"
                    data-module="govuk-checkboxes"
                >
                    <div className="govuk-checkboxes__item">
                        <input
                            className="govuk-checkboxes__input"
                            id="access-type-1"
                            name="access-type"
                            type="checkbox"
                            value={FormAccessType.Public}
                            checked={formAccessType[FormAccessType.Public]}
                            onChange={onFormAccessTypeCheckboxCheck}
                        />
                        <label
                            className="govuk-label govuk-checkboxes__label form-status-checkboxes"
                            htmlFor="access-type-1"
                        >
                            Public
                        </label>
                    </div>
                    <div className="govuk-checkboxes__item">
                        <input
                            className="govuk-checkboxes__input"
                            id="access-type-2"
                            name="access-type"
                            type="checkbox"
                            value={FormAccessType.DFESignIn}
                            checked={formAccessType[FormAccessType.DFESignIn]}
                            onChange={onFormAccessTypeCheckboxCheck}
                        />
                        <label
                            className="govuk-label govuk-checkboxes__label form-status-checkboxes"
                            htmlFor="access-type-2"
                        >
                            DFE SignIn
                        </label>
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

export default FormAccessTypeFilter;
