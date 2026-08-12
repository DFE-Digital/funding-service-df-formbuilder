import React, { useContext } from "react";
import { DataContext } from "../../context";
import { i18n } from "../../i18n";
import {
    hasValidationErrors,
    validateCalculationName,
    validateTitle,
    validatePrefix,
    validateNotEmpty,
} from "../../validations";
import RenderTitleAndHelptext from "./render-help-text";
import { updateDataObject } from "./utility/helperFunctions";
import { LabelSizes, Spacing, SpacingUnit, TextFormComponent } from "../../ui";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Actions } from "../../reducers/component/types";

const AddCalculationDetails = ({
    calculationDetails,
    showTitle,
    setShowTitle,
    isEdit,
    onHide,
    page,
    selectedComponents,
    selectedDatasets,
    calculationResult,
    calculationToEdit,
    errors,
    setErrors,
}) => {
    const { data, save } = useContext(DataContext);
    const { state, dispatch } = useContext(ComponentContext);
    const { selectedComponent } = state;

    calculationDetails = {
        ...calculationDetails,
        calculationName: selectedComponent?.displayName,
        title: selectedComponent?.title,
        helpText: selectedComponent?.hint,
        hideResult: selectedComponent?.options?.hideResult ?? false,
        prefixType: selectedComponent?.options?.prefixType,
        prefixValue: selectedComponent?.options?.prefixValue,
        suffixType: selectedComponent?.options?.suffixType,
        suffixValue: selectedComponent?.options?.suffixValue,
        precision: selectedComponent?.schema?.precision,
        condition: selectedComponent?.options?.condition,
    };

    const onSaveCalculation = async (e) => {
        e.preventDefault();

        // Validations
        const titleErrors = validateTitle(
            "add-calculation-title",
            selectedComponent?.title,
            i18n
        );
        const calculationNameErrors = validateCalculationName(
            "add-calculation-name",
            selectedComponent?.displayName,
            i18n
        );
        const prefixErrors =
            calculationDetails.prefixType === "select-prefix" ||
            calculationDetails.prefixType === "custom-prefix"
                ? validateNotEmpty(
                      "prefix",
                      "prefix",
                      "prefix",
                      calculationDetails.prefixValue
                  )
                : null;
        const sufixErrors =
            calculationDetails.suffixType === "custom-suffix"
                ? validateNotEmpty(
                      "suffix",
                      "suffix",
                      "suffix",
                      calculationDetails.suffixValue
                  )
                : null;

        const errorsFound = {
            ...titleErrors,
            ...calculationNameErrors,
            ...prefixErrors,
            ...sufixErrors,
        };
        setErrors(errorsFound);
        if (hasValidationErrors(errorsFound)) return;

        // Check if editing or saving a new calculation
        if (isEdit) {
            await onSaveEditedCalculation();
        } else {
            await onSaveNewCalculation();
        }

        onHide();
    };

    const onSaveNewCalculation = async () => {
        const updatedDataObject = updateDataObject({
            isNewCalculation: true,
            calculationDetails,
            page,
            selectedComponents,
            selectedDatasets,
            calculationResult,
            data,
        });
        // Save to Context & DB
        await save(updatedDataObject);
    };

    const onSaveEditedCalculation = async () => {
        const updatedDataObject = updateDataObject({
            isNewCalculation: false,
            calculationToEdit,
            calculationDetails,
            page,
            selectedComponents,
            selectedDatasets,
            calculationResult,
            data,
        });
        // Save to Context & DB
        await save(updatedDataObject);
    };

    const handleOnChangeDisplayName = async (e) => {
        const { value } = e.target;
        dispatch({
            type: Actions.ADD_DISPLAY_NAME,
            payload: value,
        });
    };
    return (
        <div className="add-calculations__footer-container">
            <div className="left-wrapper"></div>
            <div className="right-wrapper govuk-body">
                <div className="right-wrapper-none"></div>
                <div className="right-wrapper-main">
                    <span className="mb-20">
                        {i18n("calculations.calculationNote")}
                    </span>
                    <TextFormComponent
                        name="calculationName"
                        additionalClasses="border-1"
                        label={i18n("calculations.calculationName")}
                        labelSize={LabelSizes.S}
                        labelClasses="govuk-!-margin-bottom-3"
                        value={selectedComponent?.displayName}
                        onChange={handleOnChangeDisplayName}
                        error={
                            errors?.calculationName &&
                            i18n(errors?.calculationName?.children)
                        }
                    />
                    <Spacing mb={SpacingUnit.Six} />
                    {!showTitle && (
                        <button
                            id="calc-continue"
                            type="submit"
                            className="govuk-button calculations__mt"
                            data-testid={"calc-continue"}
                            title="Continue"
                            onClick={() => setShowTitle(!showTitle)}
                        >
                            {i18n("calculations.continueBtn")}
                        </button>
                    )}
                    {showTitle && (
                        <RenderTitleAndHelptext
                            errors={errors}
                            onSaveCalculation={onSaveCalculation}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddCalculationDetails;
