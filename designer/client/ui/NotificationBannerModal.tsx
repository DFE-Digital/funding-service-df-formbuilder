import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router";
import { Spacing, SpacingUnit } from "./index";

export enum BannerType {
    SUCCESS = "success",
    ERROR = "error",
    INFORMATIONAL = "informational",
}
type Props = {
    bannerType: BannerType;
    hasPrimaryButton?: boolean;
    hasSecondaryButton?: boolean;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    primaryButtonOnClick?: () => void;
    secondaryButtonOnClick?: () => void;
    bannerContent: string;
    additionalMessage?: string;
    onSecondaryBtnClick?: () => void;
    onPrimaryButtonClick?: () => void;
};
export default function NotificationBannerModal(props: Props) {
    const history = useHistory();
    const {
        bannerType,
        hasPrimaryButton,
        primaryButtonText,
        hasSecondaryButton,
        secondaryButtonText,
        bannerContent,
        additionalMessage,
        onPrimaryButtonClick,
        onSecondaryBtnClick,
    } = props;
    return (
        <div className="modal" id="modal">
            <div>
                <div
                    className={`govuk-notification-banner ${
                        bannerType === "success"
                            ? "govuk-notification-banner--success "
                            : "govuk-notification-banner"
                    } govuk-!-margin-bottom-0`}
                    role="alert"
                    aria-labelledby="govuk-notification-banner-title"
                    data-module="govuk-notification-banner"
                >
                    <div className="govuk-notification-banner__header">
                        <h2
                            className="govuk-notification-banner__title"
                            id="govuk-notification-banner-title"
                        >
                            {bannerType === "success" ? "Success" : "Important"}
                        </h2>
                    </div>
                    <div className="govuk-notification-banner__content">
                        <h3 className="govuk-notification-banner__heading">
                            {bannerContent}
                        </h3>
                    </div>
                </div>
                {additionalMessage && (
                    <>
                        <Spacing mt={SpacingUnit.Six} />
                        <p className="govuk-body govuk-!-padding-top-5 govuk-secondary-text-color">
                            <u>{additionalMessage}</u>
                        </p>
                    </>
                )}
                <Spacing mt={SpacingUnit.Six} />
                {hasPrimaryButton && (
                    <button
                        type="submit"
                        className="govuk-button"
                        data-module="govuk-button"
                        onClick={onPrimaryButtonClick}
                    >
                        {primaryButtonText}
                    </button>
                )}
                {hasSecondaryButton && (
                    <>
                        <Spacing pl={SpacingUnit.Two} />
                        <button
                            type="submit"
                            className="govuk-button govuk-button--secondary"
                            data-module="govuk-button"
                            onClick={onSecondaryBtnClick}
                        >
                            {secondaryButtonText}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
