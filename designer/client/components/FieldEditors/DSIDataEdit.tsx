import React, { useContext } from "react";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Actions } from "../../reducers/component/types";
import { i18n } from "../../i18n";
import { ErrorMessage } from "../../components/ErrorMessage";
import { LabelSizes, Spacing, SpacingUnit, TextFormComponent } from "../../ui";

type Props = {};

function DSIDataEdit({}: Props) {
    const { state, dispatch } = useContext(ComponentContext);
    const { selectedComponent, errors } = state;
    const { name, title, type, options = {} } = selectedComponent;
    return (
        <div>
            <div data-test-id="standard-inputs">
                <TextFormComponent
                    name="title"
                    label={i18n("common.titleField.title")}
                    labelSize={LabelSizes.S}
                    hint={i18n("common.titleField.helpText")}
                    value={title || ""}
                    onChange={(e) => {
                        dispatch({
                            type: Actions.IS_EDITING_TABS,
                            payload: {
                                isEditingTabs: false,
                            },
                        });

                        dispatch({
                            type: Actions.EDIT_TITLE,
                            payload: e.target.value,
                        });
                    }}
                    error={
                        errors?.title && i18n(errors.title[0], errors.title[1])
                    }
                />
                <Spacing mb={SpacingUnit.Six} />
                <div
                    className={`govuk-form-group ${
                        errors?.name ? "govuk-form-group--error" : ""
                    }`}
                >
                    <label
                        className="govuk-label govuk-label--s"
                        htmlFor="field-name"
                    >
                        {i18n("common.componentNameField.title")}
                    </label>
                    {errors?.name && (
                        <ErrorMessage>
                            {i18n("name.errors.whitespace")}
                        </ErrorMessage>
                    )}
                    <span className="govuk-hint">{i18n("name.hint")}</span>
                    <input
                        className={`govuk-input govuk-input--width-20 ${
                            errors?.name ? "govuk-input--error" : ""
                        }`}
                        id="field-name"
                        name="name"
                        type="text"
                        value={name || ""}
                        onChange={(e) => {
                            dispatch({
                                type: Actions.EDIT_NAME,
                                payload: e.target.value,
                            });
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default DSIDataEdit;
