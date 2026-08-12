import {
    Calculation,
    ComponentDef,
    FormDefinition,
    Page,
    DataSet,
} from "@xgovformbuilder/model";
import randomId from "../../../randomId";

interface CalculationDetails {
    calculationName: string;
    title: string;
    helpText: string;
    hideResult: boolean;
    prefixType: string;
    prefixValue: string;
    suffixValue: string;
    precision: number;
    condition: string;
}

interface ParameterTypes {
    calculationDetails: CalculationDetails;
    page: Page;
    data: FormDefinition;
    selectedComponents: ComponentDef[];
    selectedDatasets: DataSet[];
    calculationResult: string;
    isNewCalculation: boolean;
    calculationToEdit?: any;
}

export const generateFormulaExpressionString = (selectedComponents) => {
    return selectedComponents.reduce((prev, curr) => {
        const currentComponentName =
            curr.repeatable && curr.repeatable === true
                ? curr.name + "~R+"
                : curr.name;
        const calcComp = curr?.index ? curr.value : currentComponentName;
        if (!prev) return "(" + calcComp + ")";

        return prev + " " + "(" + calcComp + ")";
    }, "");
};

export const updateDataObject = ({
    isNewCalculation,
    calculationToEdit,
    calculationDetails,
    page,
    selectedComponents,
    selectedDatasets,
    calculationResult,
    data,
}: ParameterTypes): FormDefinition => {
    let updatedData;
    if (isNewCalculation) {
        updatedData = updateDataObjectForNewCalculation({
            calculationDetails,
            page,
            selectedComponents,
            selectedDatasets,
            calculationResult,
            data,
        });
    } else {
        // When editing an existing calculation
        updatedData = updateDataObjectForEditedCalculation({
            calculationDetails,
            calculationToEdit,
            selectedComponents,
            selectedDatasets,
            calculationResult,
            data,
        });
    }

    return updatedData;
};

const updateDataObjectForNewCalculation = ({
    calculationDetails,
    page,
    selectedComponents,
    selectedDatasets,
    calculationResult,
    data,
}) => {
    const variableName = randomId();
    const isRepetableCalc = calculationResult.includes("~R+");
    const calculationObject = {
        displayName: calculationDetails?.calculationName,
        hint: calculationDetails?.helpText,
        type: "arithmetic",
        name: variableName,
        pageLocation: page.path,
        components: selectedComponents,
        datasets: selectedDatasets,
        expression: calculationResult,
        title: calculationDetails?.title,
        hideResult: calculationDetails?.hideResult,
        repeatable: isRepetableCalc,
    };

    const calcComponent = {
        name: variableName,
        displayName: calculationDetails.calculationName,
        options: {
            hideResult: calculationDetails?.hideResult,
            prefixType: calculationDetails?.prefixType,
            prefixValue: calculationDetails?.prefixValue,
            suffixValue: calculationDetails?.suffixValue,
            condition: calculationDetails?.condition,
        },
        type: "Result",
        title: calculationDetails?.title,
        hint: calculationDetails?.helpText,
        expression: calculationResult,
        schema: {
            precision: calculationDetails?.precision,
        },
    };

    const updateCalculationsArray = ({
        data,
        calculationObject,
    }: {
        data: FormDefinition;
        calculationObject: Calculation;
    }): Calculation[] => {
        if (Array.isArray(data.calculations)) {
            return [...data.calculations, calculationObject];
        }
        return [calculationObject];
    };

    const updatePagesArray = ({ page, data, calcComponent }): Page[] => {
        const updatedPageWithCalculationComponent = {
            ...page,
            components: [...page?.components, calcComponent],
        };
        const updatedPages = data.pages.map((FormPage) => {
            if (FormPage?.path === page?.path) {
                return updatedPageWithCalculationComponent;
            } else {
                return FormPage;
            }
        });
        return updatedPages;
    };

    let updatedData = {
        ...data,
        pages: updatePagesArray({ data, page, calcComponent }),
        calculations: updateCalculationsArray({ data, calculationObject }),
    };

    return updatedData;
};

const updateDataObjectForEditedCalculation = ({
    calculationDetails,
    calculationToEdit,
    selectedComponents,
    selectedDatasets,
    calculationResult,
    data,
}) => {
    // Update calculation object with page path in pages array for respective calculations
    data.calculations.some((calculation) => {
        if (calculation.name === calculationToEdit.name) {
            return data.pages.some((page) => {
                return page.components.some((component) => {
                    if (component.name === calculation.name) {
                        calculationToEdit.pageLocation = page.path;
                        return true;
                    }
                    return false;
                });
            });
        }
    });
    // Update calculations array to hold new calculation object
    const updateCalculationsArray = ({ data }) => {
        return data.calculations.map((calculation) => {
            if (calculation.name === calculationToEdit.name) {
                const calculationObject = {
                    ...calculationToEdit,
                    displayName: calculationDetails.calculationName,
                    hint: calculationDetails.helpText,
                    components: selectedComponents,
                    datasets: selectedDatasets,
                    expression: calculationResult,
                    title: calculationDetails.title,
                    hideResult: calculationDetails.hideResult,
                };
                return calculationObject;
            }
            return calculation;
        });
    };

    const updatePagesArray = ({ data }) => {
        // Update Pages array to hold the new calculation component (in components array of relevant page)
        return data.pages?.map((page) => {
            // For page with edited calculation => update components array to hold updated calculation component
            if (page?.path === calculationToEdit.pageLocation) {
                // Find calculation component in components array of the page and update with edited values
                const updatedComponents = page?.components?.map((component) => {
                    if (
                        component.type === "Result" &&
                        component.name === calculationToEdit.name
                    ) {
                        return {
                            ...component,
                            displayName: calculationDetails.calculationName,
                            options: {
                                hideResult: calculationDetails.hideResult,
                                prefixType: calculationDetails.prefixType,
                                prefixValue: calculationDetails.prefixValue,
                                suffixValue: calculationDetails.suffixValue,
                                condition: calculationDetails?.condition,
                            },
                            schema: {
                                precision: calculationDetails.precision,
                            },
                            title: calculationDetails.title,
                            hint: calculationDetails.helpText,
                            expression: calculationResult,
                        };
                    }
                    // Return other components untouched
                    return component;
                });
                return {
                    ...page,
                    components: updatedComponents,
                };
            }
            // return other pages unchanged
            return page;
        });
    };

    // Return updated data object
    return {
        ...data,
        pages: updatePagesArray({ data }),
        calculations: updateCalculationsArray({ data }),
    };
};

export const updateDataObjectForDeleteCalculation = ({
    data,
    calculationNameToDelete,
    calculationToDeletePage,
}) => {
    // Delete from calculations array
    const updateCalculationsArray = ({
        calculations,
        calculationNameToDelete,
    }) => {
        return calculations.filter(
            (calculation) => calculation.name !== calculationNameToDelete
        );
    };
    // Delete from components array inside pages array
    const updatePagesArray = ({
        pages,
        calculationNameToDelete,
        calculationToDeletePage,
    }) => {
        return pages?.map((page) => {
            if (page?.path === calculationToDeletePage) {
                const updatedComponents = page?.components?.filter(
                    (component) => component.name !== calculationNameToDelete
                );
                return {
                    ...page,
                    components: updatedComponents,
                };
            }
            return page;
        });
    };

    return {
        ...data,
        pages: updatePagesArray({
            pages: data.pages,
            calculationNameToDelete,
            calculationToDeletePage,
        }),
        calculations: updateCalculationsArray({
            calculations: data.calculations,
            calculationNameToDelete,
        }),
    };
};
