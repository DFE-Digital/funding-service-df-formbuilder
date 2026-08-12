import React from "react";
import { render, fireEvent } from "@testing-library/react";
import Button, { ButtonVariant, ButtonType, ButtonGroup } from "../Button";

describe("Button", () => {
    const defaultProps = {
        name: "test",
        text: "Click Me",
        onButtonClick: jest.fn(),
    };

    test("renders button with correct text and variant in group", () => {
        const { container, getByText } = render(<ButtonGroup><Button {...defaultProps} variant={ButtonVariant.Primary} /></ButtonGroup>);

        const button = getByText("Click Me");
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass("govuk-button");
        expect(container.querySelector(".govuk-button-group")).toBeInTheDocument();
    });

    test("renders anchor when isAnchor is true", () => {
        const { getByText } = render(
            <Button {...defaultProps} isAnchor href="http://example.com" />
        );

        const link = getByText("Click Me");
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href", "http://example.com");
    });

    test("renders anchor with default href when isAnchor is true but href not provided", () => {
        const { getByText } = render(<Button {...defaultProps} isAnchor />);

        const link = getByText("Click Me");
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href", "#");
    });

    test("does not throw when onButtonClick is not provided", () => {
        const { getByText } = render(<Button {...defaultProps} onButtonClick={undefined} />);

        const button = getByText("Click Me");
        fireEvent.click(button);

        expect(defaultProps.onButtonClick).not.toHaveBeenCalled();
    });
});
