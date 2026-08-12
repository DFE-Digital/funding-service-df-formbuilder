import React, { useState, useEffect } from "react";
type Props = {
    show: boolean;
    loadingText?: string;
    delay?: number;
    loadingSubText?: string;
};

function Loader(props: Props) {
    const { show, loadingText = "", delay = 100, loadingSubText } = props;
    return (
        <>
            {show && (
                <div className="digital-forms-loader" id="loader">
                    <div
                        className="loaderpopup pop"
                        id="loader"
                        role="dialog"
                        aria-labelledby="loader"
                    >
                        <div className="pop_logo govuk-grid-column-full">
                            <div className="loading loading--full-height"></div>
                            <p
                                id="loader-text"
                                className="loadertext govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-0"
                            >
                                {loadingText}
                            </p>
                            <span className="govuk-body-s loadersubtext">
                                {loadingSubText}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Loader;
