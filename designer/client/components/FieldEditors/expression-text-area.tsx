import React from "react";

const ExpressionTextArea = ({ calculationResult, setCalculationResult }) => {
    return (
        <div className="add-calculations__right-wrapper">
            <span className="govuk-body-s bold mb-20">
                Result based on calculation below:
            </span>
            <br />
            <textarea
                data-testid="calc-text-area"
                rows={30}
                cols={35}
                value={calculationResult}
                onChange={(e) => setCalculationResult(e.target.value)}
            ></textarea>
        </div>
    );
};

export default ExpressionTextArea;
