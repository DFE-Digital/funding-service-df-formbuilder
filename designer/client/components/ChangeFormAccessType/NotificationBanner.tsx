import React from "react";
import { i18n } from "../../i18n";

export default function NotificationBanner({ isNewUpload }) {
    return (
        <div
            className="govuk-notification-banner"
            role="region"
            aria-labelledby="govuk-notification-banner-title"
            data-module="govuk-notification-banner"
        >
            <div className="govuk-notification-banner__header">
                <h2
                    className="govuk-notification-banner__title govuk-heading-s"
                    id="govuk-notification-banner-title"
                >
                    Important
                </h2>
            </div>
            <div className="govuk-notification-banner__content">
                {isNewUpload ? (
                    <p className="govuk-notification-banner__heading">
                        {/* Please retain a copy of your file on the local machine */}
                        {i18n(
                            "changeFormAccessType.uploadBanner.defaultMessage"
                        )}
                    </p>
                ) : (
                    <>
                        <h3 className="govuk-notification-banner__heading">
                            {/* Csv file available for this form */}
                            {i18n(
                                "changeFormAccessType.uploadBanner.newUpload.title"
                            )}
                        </h3>
                        <p className="govuk-body">
                            {/* If you want to upload a new CSV to this form, it will overwrite the existing one. */}
                            {i18n(
                                "changeFormAccessType.uploadBanner.newUpload.message"
                            )}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
