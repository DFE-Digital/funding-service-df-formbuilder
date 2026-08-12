import React, { useState, useContext } from "react";
import { i18n } from "../../i18n";
import { CssClasses } from "../CssClasses";
import { DataContext } from "../../context";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Actions } from "../../reducers/component/types";
import InlineConditions from "../../conditions/InlineConditions";
import { Flyout } from "../../components/Flyout";
import { RenderInPortal } from "../../components/RenderInPortal";
import DocumentUpload from "../Document/DocumentUpload";

const fdi18 = (key) => i18n("filedownloadComp." + key);

/* Render additional settings section */
const RenderAdditionalSettings = () => (
    <details className="govuk-details">
        <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">
                {i18n("common.detailsLink.title")}
            </span>
        </summary>

        <div className="govuk-details__text govuk-checkboxes govuk-form-group">
            <CssClasses />
        </div>
    </details>
);

function FileDownload() {
    const { data } = useContext(DataContext);
    const { conditions, documents } = data;
    const { state, dispatch } = useContext(ComponentContext);
    let { selectedComponent } = state;
    const {
        options = { condition: "" },
        selectedDocument = "",
    } = selectedComponent;
    const [editingCondition, setEditingCondition] = useState(null);
    const [showAddCondition, setShowAddCondition] = useState(false);
    const [showDocumentUpload, setShowDocumentUpload] = useState(false);

    const cancelInlineCondition = () => {
        setEditingCondition(null);
        setShowAddCondition(false);
    };

    const cancelShowDocumentUpload = () => {
        setShowDocumentUpload(false);
    };

    const onClickCondition = () => {
        setShowAddCondition(true);
    };

    const showDocumentView = () => {
        setShowDocumentUpload(true);
    };

    /* Render the documents section */
    const RenderImportDocument = () => (
        <div className="govuk-body govuk-form-group">
            <p className="govuk-label govuk-label--s">
                {fdi18("documentTitle")}
            </p>
            <span className="govuk-hint">{fdi18("documentDescription")}</span>
            <select
                className="govuk-select govuk-input--width-10"
                id="field-options-list"
                name="selectedDocument"
                value={selectedDocument}
                onChange={(e) =>
                    dispatch({
                        type: Actions.EDIT_DOCUMENT,
                        payload: e.target.value,
                    })
                }
            >
                <option value="none">{i18n("select")}</option>
                {documents?.map((document) => {
                    return (
                        <option key={document?.id} value={document?.id}>
                            {document?.title}
                        </option>
                    );
                })}
            </select>
            <button
                className="govuk-link govuk-!-margin-top-2 govuk-body govuk-!-margin-bottom-0"
                onClick={() => showDocumentView()}
            >
                Import a new document
            </button>
        </div>
    );

    /* Render the condition section */
    const RenderConditions = () => (
        <div className="govuk-body govuk-form-group">
            <p className="govuk-label govuk-label--s">
                {fdi18("conditionTitle")}
            </p>
            <span className="govuk-hint">{fdi18("conditionDescription")}</span>
            <select
                className="govuk-select govuk-input--width-10"
                id="field-options-list"
                name="options?.condition"
                value={options?.condition}
                onChange={(e) =>
                    dispatch({
                        type: Actions.EDIT_OPTIONS_CONDITION,
                        payload: e.target.value,
                    })
                }
            >
                <option value="">{i18n("select")}</option>
                {conditions?.map((condition, index) => {
                    return (
                        <option
                            key={`${condition?.displayName}-${index}`}
                            value={condition?.name}
                        >
                            {condition?.displayName}
                        </option>
                    );
                })}
            </select>
            <button
                className="govuk-link govuk-!-margin-top-2 govuk-body govuk-!-margin-bottom-0"
                onClick={() => onClickCondition()}
            >
                Set a new condition
            </button>
        </div>
    );

    return (
        <>
            {!editingCondition && showAddCondition && (
                <RenderInPortal>
                    <Flyout
                        title={i18n("conditions.add")}
                        onHide={cancelInlineCondition}
                    >
                        <InlineConditions
                            conditionsChange={cancelInlineCondition}
                            cancelCallback={cancelInlineCondition}
                            path=""
                        />
                    </Flyout>
                </RenderInPortal>
            )}

            {showDocumentUpload && (
                <RenderInPortal>
                    <Flyout
                        title={i18n("documents.title")}
                        onHide={cancelShowDocumentUpload}
                    >
                        <DocumentUpload
                            setShowDocumentUpload={setShowDocumentUpload}
                        />
                    </Flyout>
                </RenderInPortal>
            )}

            <RenderImportDocument />

            <RenderConditions />

            <RenderAdditionalSettings />
        </>
    );
}

export default FileDownload;
