import React, { useContext } from "react";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Actions } from "../../reducers/component/types";
import { withI18n } from "../../i18n";
import classNames from "classnames";
import { ErrorMessage } from "../ErrorMessage";
import DOMPurify from "dompurify";
import { LabelSizes, Spacing, SpacingUnit, TextFormComponent } from "../../ui";

type Props = {
    context: any; // TODO
    i18n: any;
};

function DetailsEdit({ i18n, context = ComponentContext }: Props) {
    // If you are editing a component, the default context will be ComponentContext because props.context is undefined,
    // but if you editing a component which is a children of a list based component, then the props.context is the ListContext.
    const { state, dispatch } = useContext(context);
    const { selectedComponent, errors = {} } = state;

    return (
        <div>
            <TextFormComponent
                name="title"
                label={i18n("Title")}
                labelSize={LabelSizes.S}
                hint={i18n("titleHint")}
                value={selectedComponent.title}
                onChange={(e) =>
                    dispatch({
                        type: Actions.EDIT_TITLE,
                        payload: e.target.value,
                    })
                }
                error={errors?.title && i18n(...errors.title.children)}
            />
            <Spacing mb={SpacingUnit.Six} />

            <div
                className={classNames({
                    "govuk-form-group": true,
                    "govuk-form-group--error": errors?.content,
                })}
            >
                <label
                    className="govuk-label govuk-label--s"
                    htmlFor="details-content"
                >
                    Content
                </label>
                <span className="govuk-hint">
                    {i18n("fieldEdit.details.hint")}
                </span>
                {errors?.content && (
                    <ErrorMessage>
                        {i18n(...errors.content.children)}
                    </ErrorMessage>
                )}
                <textarea
                    className="govuk-textarea"
                    id="field-content"
                    name="content"
                    defaultValue={selectedComponent.content}
                    rows="10"
                    onChange={(e) =>
                        dispatch({
                            type: Actions.EDIT_CONTENT,
                            payload: DOMPurify.sanitize(e.target.value, {
                                USE_PROFILES: {
                                    html: true,
                                    svg: true,
                                    svgFilters: true,
                                },
                                ADD_ATTR: ["target"],
                            }),
                        })
                    }
                />
            </div>
        </div>
    );
}

export default withI18n(DetailsEdit);
