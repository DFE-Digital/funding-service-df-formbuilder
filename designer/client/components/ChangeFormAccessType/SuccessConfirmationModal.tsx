import { FormAccessType } from "@xgovformbuilder/model";
import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router";
import { AppContext } from "../../context/AppContext";
import { i18n } from "../../i18n";

export default function SuccessConfirmationModal({
    selectedAccessType,
    changeSuccessful,
}) {
    const history = useHistory();
    const { previouslyUploadedFile, uploadedFile } = useContext(AppContext);

    useEffect(() => {
        let delayedRedirect;
        if (changeSuccessful) {
            delayedRedirect = setInterval(() => {
                history.push("/dashboard");
            }, 3000);
        }

        return () => clearInterval(delayedRedirect);
    }, []);

    const hasFileBeenOverwritten = () => {
        if (
            previouslyUploadedFile &&
            previouslyUploadedFile !== uploadedFile?.name &&
            selectedAccessType === FormAccessType.DFESignIn
        ) {
            return true;
        }
        return false;
    };

    return (
        <div className="modal" id="modal">
            <div>
                <div
                    className="govuk-notification-banner govuk-notification-banner--success govuk-!-margin-bottom-0"
                    role="alert"
                    aria-labelledby="govuk-notification-banner-title"
                    data-module="govuk-notification-banner"
                >
                    <div className="govuk-notification-banner__header">
                        <h2
                            className="govuk-notification-banner__title"
                            id="govuk-notification-banner-title"
                        >
                            {i18n("changeFormAccessType.success.title")}
                        </h2>
                    </div>
                    <div className="govuk-notification-banner__content">
                        <h3 className="govuk-notification-banner__heading">
                            {selectedAccessType === FormAccessType.Public
                                ? i18n(
                                      "changeFormAccessType.success.publicChangeMessage"
                                  )
                                : hasFileBeenOverwritten()
                                ? i18n(
                                      "changeFormAccessType.success.primaryMessageOverwritten"
                                  )
                                : i18n(
                                      "changeFormAccessType.success.primaryMessageDefault"
                                  )}
                        </h3>
                        {/* Below should only display when changing to DFE Signin */}
                        {selectedAccessType === FormAccessType.DFESignIn && (
                            <p className="govuk-body">
                                {hasFileBeenOverwritten()
                                    ? i18n(
                                          "changeFormAccessType.success.secondaryMessageOverwritten"
                                      )
                                    : i18n(
                                          "changeFormAccessType.success.secondaryMessageDefault"
                                      )}
                            </p>
                        )}
                    </div>
                </div>
                <p className="govuk-body govuk-!-padding-top-5 govuk-secondary-text-color">
                    <u>
                        {i18n("changeFormAccessType.success.redirectMessage")}
                    </u>
                </p>
            </div>
        </div>
    );
}
