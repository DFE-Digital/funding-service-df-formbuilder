import React, { useContext, useEffect, useState } from "react";
import { ComponentContext } from "./reducers/component/componentReducer";
import { Actions } from "./reducers/component/types";

import { CssClasses } from "./components/CssClasses";
import { i18n } from "./i18n";

export function FileUploadFieldEdit() {
    const { state, dispatch } = useContext(ComponentContext);
    const { selectedComponent } = state;
    const { addedFileTypes = [] } = selectedComponent;
    const fileTypes = ["PDF", "PNG", "JPG/JPEG", "DOC/DOCX", "XLS/XLSX", "CSV"];
    const [selectedFileTypes, setSelectedFileTypes] = useState(addedFileTypes);

    const callDispatcher = (newPayload) => {
        dispatch({
            type: Actions.EDIT_OPTIONS_FILE_UPLOAD_MULTIPLE,
            payload: newPayload,
        });
    };

    const addFileTypes = (event) => {
        let newArray = [];
        if (selectedFileTypes.includes(event.target.id)) {
            newArray = selectedFileTypes.filter(
                (name) => !name.includes(event.target.id)
            );
            setSelectedFileTypes([...newArray]);
        } else {
            newArray = [...selectedFileTypes, event.target.id];
            setSelectedFileTypes([...selectedFileTypes, event.target.id]);
        }
        callDispatcher(newArray);
    };

    return (
        <>
            <details className="govuk-details">
                <summary className="govuk-details__summary">
                    <span className="govuk-details__summary-text">
                        {i18n("common.detailsLink.title")}
                    </span>
                </summary>

                <div className="govuk-details__text govuk-checkboxes govuk-form-group">
                    <div className="govuk-body">
                        <p className="govuk-body govuk-!-font-size-19 govuk-!-font-weight-bold">
                            {i18n("fileuploadComp.selecteFileType")}
                        </p>
                        <div className="govuk-!-margin-bottom-2">
                            {i18n("fileuploadComp.uploadInfo")}
                        </div>
                        {console.log(selectedFileTypes)}
                        {fileTypes?.map((file) => (
                            <>
                                <div className="govuk-checkboxes__item">
                                    <input
                                        className="govuk-checkboxes__input"
                                        id={file}
                                        name={file}
                                        key={file}
                                        data-testid={file}
                                        type="checkbox"
                                        checked={addedFileTypes.includes(file)}
                                        onChange={(e) => {
                                            addFileTypes(e);
                                        }}
                                    />
                                    <label
                                        className="govuk-label govuk-checkboxes__label"
                                        htmlFor={file}
                                    >
                                        {file}
                                    </label>
                                    <br />
                                </div>
                            </>
                        ))}
                    </div>
                    <CssClasses />
                </div>
            </details>
        </>
    );
}
