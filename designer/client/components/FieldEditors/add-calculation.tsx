import React, { useState, useContext, useEffect } from "react";
import CalculationInfo from "./calculation-info";
import { DataContext } from "../../context";
import "./Calculations.scss";
import RenderTable from "./render-table";
import { ComponentDef, DataSet, SectionDetails } from "@xgovformbuilder/model";
import AddCalculationDetails from "./add-calculation-details";
import { generateFormulaExpressionString } from "./utility/helperFunctions";
// import ExpressionTextArea from "./expression-text-area";
import { ComputeBlock } from "../../ui";
import PageSelectInput from "./page-select-input";
import { hasValidationErrors } from "../../validations";
import ErrorSummary from "../../error-summary";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Actions } from "../../reducers/component/types";

function AddCalculation({ onHide, page, isEdit, calculationToEdit }) {
    const [showTitle, setShowTitle] = useState(false);
    const [pageSelected, setPageSelected] = useState(false);
    const [datasetSelected, setDatasetSelected] = useState(false);
    const { state, dispatch } = useContext(ComponentContext);
    const { pagePath } = state;
    const { data } = useContext(DataContext);
    const { pages, designedDataSets, sections } = data;
    const [resultCompCreatedPage, setResultCompCreatedPage] = useState(
        pagePath || ""
    );
    const [selectedComponents, setSelectedComponents] = useState<
        ComponentDef[]
    >([]);
    const [selectedDatasets, setSelectedDatasets] = useState<DataSet[]>([]);
    const [calculationResult, setCalculationResult] = useState("");
    const [showRPlus, setShowRPlus] = useState(false);
    const [displayComponents4mPage, setDisplayComponents4mPage] = useState<
        ComponentDef[]
    >([]);
    const [displayDatasets, setDisplayDatasets] = useState<DataSet[]>([]);
    const [repeatableSection, setRepeatableSection] = useState<
        SectionDetails
    >();
    const [displayCalculations4mPage, setDisplayCalculations4mPage] = useState<
        ComponentDef[]
    >([]);
    const calculationDetails: any = {
        calculationName: "",
        title: "",
        helpText: "",
        hideResult: false,
        prefixType: "",
        prefixValue: "",
        suffixValue: "",
        precision: 0,
        condition: "",
    };
    const [errors, setErrors] = useState({});
    const [
        addMultipleVariablesFunction,
        setAddMultipleVariablesFunction,
    ] = useState<((variables: any[]) => void) | null>(null);

    // Fetch existing, i.e. saved, calculation details and prefill the fields when EDITING
    useEffect(() => {
        if (isEdit) {
            const calculationToEditDetails = data.calculations.filter(
                (calculation) => calculation.name === calculationToEdit.name
            )[0];

            // Iterate over the pages to get the calculation details of the calculation to be edited
            const pagesCalculationToEditDetails = data.pages
                .flatMap((p) => p.components)
                .filter((c) => c?.name === calculationToEdit?.name)[0];

            // Show calculation, name, title, etc.
            setShowTitle(true);
            dispatch({
                type: Actions.SET_COMPONENT,
                payload: pagesCalculationToEditDetails,
            });
            setSelectedComponents(calculationToEditDetails?.components);
            setSelectedDatasets(calculationToEditDetails?.datasets ?? []);
            setCalculationResult(calculationToEditDetails?.expression);
        } else {
            dispatch({
                type: Actions.SET_COMPONENT,
                payload: {
                    ...calculationDetails,
                    type: "Result",
                    displayName: "",
                },
            });
        }
    }, [isEdit]);

    // const generateFormula = () => {
    //     let selectedValues = [...selectedComponents, ...selectedDatasets];
    //     // Add repeatable: true if any calculation expression matches name~R+
    //     selectedValues = selectedValues.map((item) => {
    //         const itemName =
    //             "name" in item && typeof item.name === "string"
    //                 ? item.name
    //                 : "";
    //         const isRepeatable = data.calculations.some(
    //             (calc) =>
    //                 typeof calc.expression === "string" &&
    //                 calc.expression.includes(`${itemName}~R+`) &&
    //                 resultCompCreatedPage === calc.pageLocation
    //         );
    //         return isRepeatable ? { ...item, repeatable: true } : item;
    //     });

    //     const calculationFormula = generateFormulaExpressionString(
    //         selectedValues
    //     );
    //     setCalculationResult(calculationFormula);
    // };

    /* onclick of the add components button(>>) we will add selected components to compute block */
    const onAddComponent = (e) => {
        e.preventDefault();
        if (addMultipleVariablesFunction && selectedComponents.length > 0) {
            addMultipleVariablesFunction(selectedComponents);
        }
    };

    /* onclick of the add dataset button(>>) we will add selected datasets to compute block */
    const onAddDataset = (e) => {
        e.preventDefault();
        if (addMultipleVariablesFunction && selectedDatasets.length > 0) {
            addMultipleVariablesFunction(selectedDatasets);
        }
    };

    /* onclick of the add Calculation button(>>) we will add selected calculations to compute block */
    const onAddCalculation = (e) => {
        e.preventDefault();
        if (
            addMultipleVariablesFunction &&
            displayCalculations4mPage.length > 0
        ) {
            addMultipleVariablesFunction(selectedComponents);
        }
    };

    return (
        <div className="add-calculations">
            {hasValidationErrors(errors) && (
                <ErrorSummary errorList={Object.values(errors)} />
            )}
            <CalculationInfo />
            <PageSelectInput
                pages={pages}
                resultCreationPage={pagePath}
                datasets={designedDataSets}
                sections={sections}
                setPageSelected={setPageSelected}
                setDatasetSelected={setDatasetSelected}
                setDisplayCalculations4mPage={setDisplayCalculations4mPage}
                setDisplayDatasets={setDisplayDatasets}
                setDisplayComponents4mPage={setDisplayComponents4mPage}
                setRepeatableSection={setRepeatableSection}
                setShowRPlus={setShowRPlus}
            />
            <div className="add-calculations__main-container">
                <div className="add-calculations__left-wrapper">
                    <div className="mr-5">
                        <>
                            {!datasetSelected && (
                                <RenderTable
                                    type="Component"
                                    selectedComponents={selectedComponents}
                                    setSelectedComponents={
                                        setSelectedComponents
                                    }
                                    pageSelected={pageSelected}
                                    displayComponents4mPage={
                                        displayComponents4mPage
                                    }
                                    repeatableSection={repeatableSection}
                                    onAddComponent={onAddComponent}
                                    showRPlus={showRPlus}
                                />
                            )}
                            {datasetSelected && (
                                <RenderTable
                                    type="Dataset"
                                    datasetSelected={datasetSelected}
                                    displayDatasets={displayDatasets}
                                    selectedDatasets={selectedDatasets}
                                    setSelectedDatasets={setSelectedDatasets}
                                    onAddDataset={onAddDataset}
                                />
                            )}
                            <br />
                            <RenderTable
                                type="Calculation"
                                selectedComponents={selectedComponents}
                                setSelectedComponents={setSelectedComponents}
                                pageSelected={pageSelected}
                                displayCalculations4mPage={
                                    displayCalculations4mPage
                                }
                                onAddCalculation={onAddCalculation}
                                repeatableSection={repeatableSection}
                                showRPlus={showRPlus}
                            />
                        </>

                        <br />
                    </div>
                </div>
                {/* <ExpressionTextArea
                    calculationResult={calculationResult}
                    setCalculationResult={setCalculationResult}
                /> */}
                <ComputeBlock
                    calculationResult={calculationResult}
                    setCalculationResult={setCalculationResult}
                    selectedComponents={selectedComponents}
                    selectedDatasets={selectedDatasets}
                    onAddMultipleVariables={(fn) =>
                        setAddMultipleVariablesFunction(() => fn)
                    }
                />
            </div>
            <AddCalculationDetails
                errors={errors}
                setErrors={setErrors}
                calculationDetails={calculationDetails}
                page={page}
                onHide={onHide}
                isEdit={isEdit}
                showTitle={showTitle}
                setShowTitle={setShowTitle}
                selectedComponents={selectedComponents}
                selectedDatasets={selectedDatasets}
                calculationResult={calculationResult}
                calculationToEdit={calculationToEdit}
            />
        </div>
    );
}
export default AddCalculation;
