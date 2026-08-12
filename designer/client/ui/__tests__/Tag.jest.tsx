import React from "react";
import { render, fireEvent } from "@testing-library/react";
import TagComponent from "../Tag";

describe("TagComponent", () => {
    const defaultProps = {
        title: "Test Tag",
        onClickClose: jest.fn(),
    };

    test("renders the tag component with the correct title", () => {
        const { getByText } = render(<TagComponent {...defaultProps} />);
        
        expect(getByText("Test Tag")).toBeInTheDocument();
    });

    test("renders the close icon and triggers onClickClose callback when clicked", () => {
        const { container } = render(<TagComponent {...defaultProps} />);
        
        const closeButton = container.querySelector(".tag-component-clear") as HTMLButtonElement;
        
        expect(closeButton).toBeInTheDocument();
        
        fireEvent.click(closeButton);
        
        expect(defaultProps.onClickClose).toHaveBeenCalledTimes(1);
    });
});
