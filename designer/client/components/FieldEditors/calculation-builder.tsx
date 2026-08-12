import React, { useContext, useState } from "react";
import { i18n } from "../../i18n";
import { useMenuItem } from "../Menu/useMenuItem";
import { Flyout } from "../Flyout";
import AddCalculation from "./add-calculation";
import CalculationInfo from "./calculation-info";
import { DataContext } from "../../context";
import "./Calculations.scss";
import { Calculation } from "@xgovformbuilder/model";
import SavedCalculationRadio from "./saved-calculation-radio";
import DeleteCalculation from "./delete-calculation";

function CalculationBuilder(props) {
    const [isEditCalculation, setIsEditCalculation] = useState(false);
    const [selectedCalculation, setSelectedCalculation] = useState<
        Calculation | undefined
    >();
    const calculationDetails = useMenuItem();
    const deleteConfirmation = useMenuItem();

    const {
        data: { calculations },
    } = useContext(DataContext);

    const handleAddNewCalculation = (e) => {
        e.preventDefault();
        setIsEditCalculation(false);
        setSelectedCalculation(undefined);
        calculationDetails.show();
    };

    const handleEditCalculation = (e) => {
        e.preventDefault();
        if (!selectedCalculation) return;

        setIsEditCalculation(true);
        calculationDetails.show();
    };

    const handleDeleteCalculation = (e) => {
        e.preventDefault();
        if (!selectedCalculation) return;

        deleteConfirmation.show();
    };

    return (
        <div className="calculations">
            <CalculationInfo />
            <div>
                <table className="govuk-table">
                    <thead className="govuk-table__head">
                        <tr className="govuk-table__row">
                            <th
                                scope="col"
                                className="govuk-table__header"
                            ></th>
                            <th scope="col" className="govuk-table__header">
                                Calculation name
                            </th>
                            <th scope="col" className="govuk-table__header">
                                Calculation variable
                            </th>
                            <th scope="col" className="govuk-table__header">
                                Page location
                            </th>
                            <th scope="col" className="govuk-table__header">
                                Component variables
                            </th>
                        </tr>
                    </thead>

                    <tbody className="govuk-table__body">
                        {calculations?.map((calc) => (
                            <SavedCalculationRadio
                                key={calc.name}
                                calc={calc}
                                selectedCalculation={selectedCalculation}
                                setSelectedCalculation={setSelectedCalculation}
                            />
                        ))}
                    </tbody>
                </table>
                {!calculations && (
                    <div className="calculations__center govuk-body">
                        {i18n("calculations.noExistingCalculations")}
                    </div>
                )}

                <p />
                <div className="govuk-button-group">
                    <button
                        id="edit-calculation"
                        type="submit"
                        className="govuk-button govuk-button--secondary calculations__mt"
                        data-testid={"edit-calculation"}
                        onClick={handleEditCalculation}
                        disabled={!selectedCalculation}
                        title="Edit calculation"
                    >
                        {i18n("calculations.editCalculation")}
                    </button>
                    <button
                        id="delete-calculation"
                        type="submit"
                        className="govuk-button govuk-button--secondary govuk-!-margin-left-6 calculations__mt"
                        data-testid={"delete-calculation"}
                        onClick={handleDeleteCalculation}
                        disabled={!selectedCalculation}
                        title="Delete calculation"
                    >
                        {i18n("calculations.deleteCalculation")}
                    </button>
                </div>
                <button
                    id="add-calculation"
                    type="submit"
                    className="govuk-button calculations__mt"
                    data-testid={"add-calculation"}
                    onClick={handleAddNewCalculation}
                    title="Add new calculation"
                >
                    {i18n("calculations.addNewCalculation")}
                </button>
            </div>
            {calculationDetails.isVisible && (
                <Flyout
                    title="Calculation builder"
                    onHide={calculationDetails.hide}
                    width="md2"
                >
                    <AddCalculation
                        onHide={calculationDetails.hide}
                        page={props.page}
                        isEdit={isEditCalculation}
                        calculationToEdit={selectedCalculation}
                    />
                </Flyout>
            )}
            {deleteConfirmation.isVisible && (
                <DeleteCalculation
                    onHide={deleteConfirmation.hide}
                    selectedCalculation={selectedCalculation}
                    setSelectedCalculation={setSelectedCalculation}
                    showModal={deleteConfirmation.isVisible}
                />
            )}
        </div>
    );
}

export default CalculationBuilder;
