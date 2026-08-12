import React from "react";
import { render, fireEvent } from "@testing-library/react";
import NotificationBannerModal, { BannerType } from "../NotificationBannerModal";

describe("NotificationBannerModal Component", () => {
    const defaultProps = {
        bannerType: BannerType.SUCCESS,
        bannerContent: "This is a banner content",
    };

    test("renders NotificationBannerModal with 'Success' title", () => {
        const { getByText } = render(<NotificationBannerModal {...defaultProps} />);

        expect(getByText("Success")).toBeInTheDocument();
        expect(getByText(defaultProps.bannerContent)).toBeInTheDocument();
    });

    test("renders with 'Important' title for other types", () => {
        const { getByText } = render(
            <NotificationBannerModal {...defaultProps} bannerType={BannerType.ERROR} />
        );

        expect(getByText("Important")).toBeInTheDocument();
    });

    test("renders primary button and triggers callback", () => {
        const onPrimaryButtonClick = jest.fn();
        const { getByText } = render(
            <NotificationBannerModal
                {...defaultProps}
                hasPrimaryButton={true}
                primaryButtonText="Primary"
                onPrimaryButtonClick={onPrimaryButtonClick}
            />
        );

        const primaryButton = getByText("Primary");
        fireEvent.click(primaryButton);

        expect(onPrimaryButtonClick).toHaveBeenCalledTimes(1);
    });

    test("renders secondary button and triggers callback", () => {
        const onSecondaryBtnClick = jest.fn();
        const { getByText } = render(
            <NotificationBannerModal
                {...defaultProps}
                hasSecondaryButton={true}
                secondaryButtonText="Secondary"
                onSecondaryBtnClick={onSecondaryBtnClick}
            />
        );

        const secondaryButton = getByText("Secondary");
        fireEvent.click(secondaryButton);

        expect(onSecondaryBtnClick).toHaveBeenCalledTimes(1);
    });

    test("renders additionalMessage when provided", () => {
        const { getByText } = render(
            <NotificationBannerModal
                {...defaultProps}
                additionalMessage="Additional information"
            />
        );

        expect(getByText("Additional information")).toBeInTheDocument();
    });
});
