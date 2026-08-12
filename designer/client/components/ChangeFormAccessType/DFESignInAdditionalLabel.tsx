import React, { useContext, useEffect } from "react";
import FileUpload from "./FileUpload";
import NotificationBanner from "./NotificationBanner";
import SpreadsheetSVG from "./SpreadsheetSVG";
import { i18n } from "../../i18n";
import { AppContext } from "../../context/AppContext";
import { stringToHTMLFromJSON } from "../../utils/stringToHTML";
type Props = {
    formName: string;
    serverError: boolean;
    isParentChild: boolean;
};
export default function DFESignInAdditionalLabel(props: Props) {
    const {
        uploadedFile,
        previouslyUploadedFile,
        incorrectFileType,
        setIncorrectFileTypeError,
    } = useContext(AppContext);

    useEffect(() => {
        if (!uploadedFile) return;
        const fileExtension = uploadedFile.name.split(".").pop();
        if (!fileExtension) return;
        if (fileExtension === "csv") {
            setIncorrectFileTypeError(false);
            return;
        }
        setIncorrectFileTypeError(true);
    }, [uploadedFile]);

    return (
        <div
            className="govuk-radios__conditional govuk-radios__conditional--hidden"
            id="conditional-contact"
        >
            <article>
                <h2 className="govuk-heading-s" data-testid="dfe-sign-in-title">
                    {!props.isParentChild
                        ? `${i18n("changeFormAccessType.DFESignIn.title")} ${
                              props.formName
                          }`
                        : `${i18n(
                              "changeFormAccessType.DFESignIn.groupTitle"
                          )} `}
                </h2>

                <p className="govuk-body govuk-!-font-size-19 govuk-!-margin-bottom-2">
                    {i18n("changeFormAccessType.DFESignIn.message")}
                </p>
                <ul className="govuk-list  govuk-list--bullet govuk-!-margin-left-4">
                    <li
                        dangerouslySetInnerHTML={stringToHTMLFromJSON(
                            "changeFormAccessType.DFESignIn.step1"
                        )}
                    ></li>
                    <li>{i18n("changeFormAccessType.DFESignIn.step2")}</li>
                    <li>{i18n("changeFormAccessType.DFESignIn.step3")}</li>
                    <li
                        dangerouslySetInnerHTML={stringToHTMLFromJSON(
                            "changeFormAccessType.DFESignIn.step4"
                        )}
                    ></li>
                </ul>
                <div className="flex-vertical-center govuk-!-margin-top-5 govuk-!-margin-bottom-6">
                    <SpreadsheetSVG />
                    <a
                        className="govuk-link govuk-!-font-size-19"
                        href="https://educationgovuk.sharepoint.com/sites/DigitalForms/_layouts/15/download.aspx?UniqueId=3bab68f6%2D9a06%2D4ccb%2D8251%2D074386683a23"
                        target="_blank"
                        rel="noreferrer noopener"
                        download
                    >
                        {i18n("changeFormAccessType.DFESignIn.sampleFileName")}
                    </a>
                </div>
                <FileUpload />
                {(previouslyUploadedFile || uploadedFile) &&
                    !props.serverError &&
                    !incorrectFileType && (
                        <NotificationBanner
                            isNewUpload={uploadedFile ? true : false}
                        />
                    )}
                {props.serverError && (
                    <div
                        className="govuk-notification-banner service-down"
                        role="region"
                        id="{{params.id}}"
                        aria-labelledby="govuk-notification-banner-title"
                        data-module="govuk-notification-banner"
                    >
                        <div className="govuk-notification-banner__header">
                            <h2
                                className="govuk-notification-banner__title"
                                id="govuk-notification-banner-title"
                            >
                                Important
                            </h2>
                        </div>
                        <div className="govuk-notification-banner__content">
                            <p className="govuk-notification-banner__heading">
                                Network timed out.
                            </p>
                            <p>
                                The network timed out before your upload could
                                be completed. Please try again.
                            </p>
                        </div>
                    </div>
                )}
                {incorrectFileType && (
                    <div
                        className="govuk-error-summary"
                        data-module="govuk-error-summary"
                    >
                        <div role="alert">
                            <h2 className="govuk-error-summary__title">
                                There is a problem
                            </h2>
                            <div className="govuk-error-summary__body">
                                <ul className="govuk-list govuk-error-summary__list">
                                    <li>Incorrect file type.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </article>
        </div>
    );
}
