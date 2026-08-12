import React from "react";
import { i18n } from "../../i18n";

function UKAddressSchema({ setImportState, importState, from }) {
    const onChangeTrigger = (e) => {
        const { name, value, type, checked } = e.target;
        if (from === "dataImport") {
            setImportState((prevState) => {
                return {
                    ...prevState,
                    [name]: type === "checkbox" ? checked : value,
                };
            });
        } else {
            setImportState((prevState) => {
                return {
                    ...prevState,
                    editColumnSchema: {
                        [name]: type === "checkbox" ? checked : value,
                    },
                };
            });
        }
    };

    let addressRequired;
    if (from === "dataImport") {
        addressRequired = importState.addressRequired;
    } else {
        addressRequired = importState?.editColumnSchema?.addressRequired;
    }

    return (
        <>
            <div className="govuk-checkboxes__item">
                <input
                    className="govuk-checkboxes__input"
                    id="field-options-address"
                    name="addressRequired"
                    type="checkbox"
                    checked={addressRequired}
                    onChange={onChangeTrigger}
                />
                <label
                    className="govuk-label govuk-checkboxes__label"
                    htmlFor="field-options-hideTitle"
                >
                    {i18n("dataImportComp.UKAddressTitle")}
                </label>
                <span className="govuk-hint govuk-checkboxes__hint">
                    {i18n("dataImportComp.UKAddressHelpText")}
                </span>
            </div>
        </>
    );
}

export default UKAddressSchema;
