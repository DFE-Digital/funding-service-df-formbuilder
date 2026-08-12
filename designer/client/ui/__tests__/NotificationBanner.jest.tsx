import React from "react";
import { render } from "@testing-library/react";
import NotificationBanner, { NotificationBannerType } from "../NotificationBanner";

describe("NotificationBanner Component", () => {
    const defaultProps = {
        bodyText: "This is a test notification",
    };

    test("renders NotificationBanner component with default 'Important' title", () => {
        const { getByText } = render(<NotificationBanner {...defaultProps} />);

        expect(getByText("Important")).toBeInTheDocument();
        expect(getByText(defaultProps.bodyText)).toBeInTheDocument();
    });

    test("renders with 'Success' title when success type is passed", () => {
        const { getByText } = render(
            <NotificationBanner {...defaultProps} type={NotificationBannerType.Success} />
        );

        expect(getByText("Success")).toBeInTheDocument();
        expect(getByText(defaultProps.bodyText)).toBeInTheDocument();
    });

    test("renders the title and subtitle when provided", () => {
        const propsWithTitleAndSubtitle = {
            ...defaultProps,
            title: "Test Title",
            subtitle: "Test Subtitle",
        };
        const { getByText } = render(<NotificationBanner {...propsWithTitleAndSubtitle} />);

        expect(getByText("Test Title")).toBeInTheDocument();
        expect(getByText("Test Subtitle")).toBeInTheDocument();
    });
});
