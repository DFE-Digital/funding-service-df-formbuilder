import React from "react";
import { SelectedDataSet } from "../types";
import { i18n } from "../../../i18n";

type Props = {
    selectedDataSet: SelectedDataSet;
    keyIdentifier: string;
    setKeyIdentifier: (key: string) => void;
};

/**
 * Translation Function
 * @param key translation key
 * @returns translated string
 */
const t = (key: string) =>
    i18n("designData.designScreen.keyIdentifierSelect." + key);

const KeyIdentifierSelect = (props: Props) => {
    const onKeyIdentifierSelect = (
        event: React.ChangeEvent<HTMLSelectElement> | undefined
    ) => {
        if (!event) return;
        props.setKeyIdentifier(event.target.value);
    };
    return (
        <>
            <div
                className="govuk-form-group govuk-!-margin-bottom-8"
                data-testid="design-key-identifier-select"
            >
                <label
                    className="govuk-label govuk-label--s"
                    htmlFor="key-identifier-select"
                >
                    {t("label")}
                </label>
                <div id="key-identifier-select-hint" className="govuk-hint">
                    {t("hint")}
                </div>
                <select
                    className="govuk-select"
                    id="key-identifier-select"
                    name="key-identifier-select"
                    aria-describedby="key-identifier-select-hint"
                    onChange={onKeyIdentifierSelect}
                    value={props.keyIdentifier}
                >
                    <option value="">{t("select")}</option>
                    {props.selectedDataSet.keys.map((datakey) => (
                        <option key={datakey} value={datakey}>
                            {datakey}
                        </option>
                    ))}
                </select>
            </div>
        </>
    );
};

export default KeyIdentifierSelect;
