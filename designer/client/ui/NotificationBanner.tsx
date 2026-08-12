import React from "react";
import { Para } from "./Typography";

export enum NotificationBannerType {
    Success = "govuk-notification-banner--success",
}
type Props = {
    type?: NotificationBannerType;
    title?: string;
    subtitle?: string;
    bodyText: string;
    href?: string;
};
const NotificationBanner = (props: Props) => {
    const { type, title, subtitle, bodyText, href } = props;
    const bannerType = type ? NotificationBannerType.Success : "";
    return (
        <div
            className={`govuk-notification-banner govuk-!-margin-0 ${bannerType}`}
            role="region"
            aria-labelledby="govuk-notification-banner-title"
            data-module="govuk-notification-banner"
        >
            <div className="govuk-notification-banner__header">
                <h2
                    className="govuk-notification-banner__title"
                    id="govuk-notification-banner-title"
                >
                    {bannerType ? "Success" : "Important"}
                </h2>
            </div>
            <div className="govuk-notification-banner__content">
                {title && (
                    <p className="govuk-notification-banner__heading">
                        {title}
                    </p>
                )}
                {subtitle && <h3 className="govuk-heading-s">{subtitle}</h3>}
                <Para text={bodyText} />
            </div>
        </div>
    );
};

export default NotificationBanner;
