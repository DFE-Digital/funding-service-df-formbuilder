import React from "react";
import { render, fireEvent } from "@testing-library/react";
import BackModal from "../BackModal";

describe("BackModal", () => {
    const defaultProps = {
        show: true,
        warningTitle: "Warning",
        onBack: jest.fn(),
        onClose: jest.fn(),
        buttonText: "Go Back",
        children: "Are you sure you want to leave?",
    };

    test("renders the modal when show is true", () => {
        const { getByText } = render(<BackModal {...defaultProps} />);

        expect(getByText("Warning")).toBeInTheDocument();
        expect(getByText("Are you sure you want to leave?")).toBeInTheDocument();
        expect(getByText("Go Back")).toBeInTheDocument();
    });

    test("does not render the modal when show is false", () => {
        const { queryByText } = render(<BackModal {...defaultProps} show={false} />);

        expect(queryByText("Warning")).not.toBeInTheDocument();
    });
});
