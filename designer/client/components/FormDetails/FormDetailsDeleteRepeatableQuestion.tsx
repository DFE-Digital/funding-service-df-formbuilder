import React, { useContext } from "react";
import { DataContext } from "../../context";
import { ButtonVariant, ButtonGroup, Button } from "../../ui";
import { deleteRepeatableQuestionForm } from "../../api/formConfigurationsApi";
import { i18n } from "../../i18n";
interface Props {
    isRepeatableForm: any;
    onDBClear?: (saved: boolean) => void;
}

export const FormDetailsDeleteRepeatableQuestion = (props: Props) => {
    const { isRepeatableForm = false, onDBClear } = props;
    const { data } = useContext(DataContext);
    const { id } = data;
    const handleRefreshForm = async (e) => {
        e.preventDefault();
        var closeModal = await deleteRepeatableQuestionForm(id);
        if (closeModal) {
            onDBClear?.(closeModal);
        }
    };

    return (
        <>
            <div className="govuk-form-group">
                <label
                    className="govuk-label govuk-label--s"
                    htmlFor="target-feedback-form"
                >
                    {i18n("formDetails.RefreshForm.fieldTitle")}
                </label>
                <div className="govuk-hint" id="target-feedback-form-hint">
                    {i18n("formDetails.RefreshForm.fieldHint")}

                    {/* <div className="govuk-warning-text govuk-!-margin-bottom-1">
                        <span
                            className="govuk-warning-text__icon"
                            aria-hidden="true"
                        >
                            !
                        </span>
                        <strong className="govuk-warning-text__text govuk-!-margin-bottom-1">
                            <span className="govuk-warning-text__assistive">
                                Warning
                            </span>
                            {i18n("formDetails.RefreshForm.warningMessage")}
                        </strong>
                    </div> */}
                </div>

                <div
                    className="govuk-hint govuk-!-margin-bottom-4"
                    id="target-feedback-form-hint"
                >
                    {i18n("formDetails.RefreshForm.warningMessage")}
                </div>
                <div className="govuk-!-margin-bottom-7">
                    <ButtonGroup>
                        <Button
                            name="Refresh-Form"
                            variant={ButtonVariant.Secondary}
                            text="Clear database"
                            onButtonClick={handleRefreshForm}
                            isDisabled={isRepeatableForm ? false : true}
                        />
                    </ButtonGroup>
                </div>
            </div>
        </>
    );
};
