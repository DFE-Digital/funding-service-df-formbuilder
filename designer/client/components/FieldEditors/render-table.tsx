import { ComponentDef, DataSet, SectionDetails } from "@xgovformbuilder/model";
import React from "react";
import { i18n } from "../../i18n";
import TableTemplate from "./table-template";
import TableDataset from "./table-dataset";

interface RenderTableProps {
    type: string;
    selectedComponents?: ComponentDef[];
    setSelectedComponents?: React.Dispatch<
        React.SetStateAction<ComponentDef[]>
    >;
    selectedDatasets?: DataSet[];
    setSelectedDatasets?: React.Dispatch<React.SetStateAction<DataSet[]>>;
    displayComponents4mPage?: ComponentDef[];
    displayDatasets?: DataSet[];
    displayCalculations4mPage?: ComponentDef[];
    pageSelected?: boolean;
    datasetSelected?: boolean;
    onAddComponent?: (e: any) => void;
    onAddDataset?: (e: any) => void;
    onAddCalculation?: (e: any) => void;
    repeatableSection?: SectionDetails;
    showRPlus?: boolean;
}

const RenderTable: React.FC<RenderTableProps> = ({
    type,
    selectedComponents,
    setSelectedComponents,
    selectedDatasets,
    setSelectedDatasets,
    pageSelected,
    datasetSelected,
    displayComponents4mPage,
    displayCalculations4mPage,
    displayDatasets,
    onAddComponent,
    onAddDataset,
    onAddCalculation,
    repeatableSection,
    showRPlus,
}) => {
    const onCheckBoxChange = (selectedComponent) => {
        const { name, checked = false } = selectedComponent;
        !checked
            ? (selectedComponent.checked = true)
            : (selectedComponent.checked = false);
        if (setSelectedComponents) {
            setSelectedComponents((existingComponents) => {
                if (isChecked(name)) {
                    return existingComponents.filter(
                        (component) => component.name !== name
                    );
                }
                // If checking, add the component
                return [
                    ...existingComponents,
                    {
                        ...selectedComponent,
                        repeatable: showRPlus, // Always start with repeatable false when adding
                    },
                ];
            });
        }
    };

    const isChecked = (name: string) => {
        return selectedComponents?.some((component) => component.name === name);
    };

    const onDatasetCheckboxChange = (selectedDataset: any) => {
        const {
            index,
            type,
            value,
            bold,
            calc,
            checked = false,
        } = selectedDataset;

        !checked
            ? (selectedDataset.checked = true)
            : (selectedDataset.checked = false);

        if (setSelectedDatasets) {
            setSelectedDatasets((existingDatasets) => {
                if (isDatasetChecked(value)) {
                    return existingDatasets.filter(
                        (dataset) => dataset.value !== value
                    );
                }
                return [
                    ...existingDatasets,
                    {
                        index: index,
                        type: type,
                        value: value,
                        checked: selectedDataset.checked,
                        bold: bold,
                        calc: calc,
                    },
                ];
            });
        }
    };

    const isDatasetChecked = (value: string) => {
        return selectedDatasets?.some((dataset) => dataset.value === value);
    };

    return (
        <>
            <span className="govuk-body-s bold mt-20">
                Add variable to text area
            </span>
            <table className="govuk-table">
                <thead className="govuk-table__head">
                    <>
                        <tr className="govuk-table__row">
                            <th
                                scope="col"
                                className="govuk-body-s bold border-bottom"
                            >
                                <span className="govuk-tick"></span>
                            </th>
                            {(type === "Component" || type === "Calculation") &&
                                !datasetSelected && (
                                    <th
                                        scope="col"
                                        className="govuk-body-s bold border-bottom left"
                                    >
                                        {type} name
                                    </th>
                                )}
                            {type === "Dataset" &&
                                datasetSelected &&
                                !pageSelected && (
                                    <th
                                        scope="col"
                                        className="govuk-body-s bold border-bottom left"
                                    >
                                        Design data set value
                                    </th>
                                )}

                            <th
                                scope="col"
                                className={`govuk-body-s bold border-bottom left ${
                                    type === "Dataset"
                                        ? "hidden-visibility"
                                        : ""
                                }`}
                            >
                                Variable names
                            </th>
                            {repeatableSection?.repeatableSection === true && (
                                <th
                                    scope="col"
                                    className={`govuk-body-s bold border-bottom left ${
                                        type === "Dataset"
                                            ? "hidden-visibility"
                                            : ""
                                    }`}
                                >
                                    R+
                                </th>
                            )}
                        </tr>
                    </>
                </thead>
                <tbody className="govuk-table__body">
                    {type === "Component" &&
                        pageSelected &&
                        displayComponents4mPage?.map((component) => {
                            return (
                                <TableTemplate
                                    component={component}
                                    key={component.name}
                                    comptype="Component"
                                    onCheckBoxChange={onCheckBoxChange}
                                    isChecked={isChecked}
                                    repeatableSection={
                                        repeatableSection &&
                                        repeatableSection?.repeatableSection ===
                                            true
                                            ? true
                                            : false
                                    }
                                />
                            );
                        })}
                    {type === "Dataset" &&
                        datasetSelected &&
                        displayDatasets?.map((dataset) => {
                            return (
                                <TableDataset
                                    dataset={dataset}
                                    key={dataset?.value}
                                    onDatasetCheckboxChange={
                                        onDatasetCheckboxChange
                                    }
                                    isDatasetChecked={isDatasetChecked}
                                />
                            );
                        })}

                    {type === "Calculation" &&
                        pageSelected &&
                        displayCalculations4mPage?.map((component) => {
                            return (
                                <TableTemplate
                                    component={component}
                                    key={component.name}
                                    comptype="Calculation"
                                    onCheckBoxChange={onCheckBoxChange}
                                    isChecked={isChecked}
                                    repeatableSection={
                                        repeatableSection &&
                                        repeatableSection?.repeatableSection ===
                                            true
                                            ? true
                                            : false
                                    }
                                />
                            );
                        })}
                </tbody>
            </table>

            {!pageSelected && type == "Component" && (
                <div className="calculations__center govuk-body-s">
                    {i18n("calculations.pageNotSelected")}
                </div>
            )}

            {(displayComponents4mPage === undefined ||
                displayComponents4mPage.length == 0) &&
                pageSelected &&
                type == "Component" && (
                    <div className="calculations__center govuk-body-s">
                        {i18n("calculations.noComponents")}
                    </div>
                )}

            {(displayDatasets === undefined || displayDatasets.length == 0) &&
                datasetSelected &&
                type == "Dataset" && (
                    <div className="calculations__center govuk-body-s">
                        {i18n("calculations.noDatasets")}
                    </div>
                )}

            {(displayCalculations4mPage === undefined ||
                displayCalculations4mPage.length == 0) &&
                type !== "Component" &&
                type !== "Dataset" && (
                    <div className="calculations__center govuk-body-s">
                        {i18n("calculations.noSavedCalculations")}
                    </div>
                )}
            <p />
            {type === "Component" && (
                <button
                    id="add-component"
                    type="submit"
                    className="govuk-button"
                    onClick={onAddComponent}
                >
                    <span className="govuk-right-arrow"></span>
                    <span className="govuk-right-arrow-1"></span>
                </button>
            )}

            {type === "Dataset" && (
                <button
                    id="add-dataset"
                    type="submit"
                    className="govuk-button"
                    onClick={onAddDataset}
                >
                    <span className="govuk-right-arrow"></span>
                    <span className="govuk-right-arrow-1"></span>
                </button>
            )}

            {type === "Calculation" && (
                <button
                    id="add-calculation"
                    type="submit"
                    className="govuk-button"
                    onClick={onAddCalculation}
                >
                    <span className="govuk-right-arrow"></span>
                    <span className="govuk-right-arrow-1"></span>
                </button>
            )}

            <br />
        </>
    );
};
export default RenderTable;
