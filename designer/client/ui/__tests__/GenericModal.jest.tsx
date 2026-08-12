import React from "react";
import { render, fireEvent } from "@testing-library/react";
import Modal, { ModalType } from "../GenericModal";

describe("Modal Component", () => {
    const mockOnClose = jest.fn();
    const mockOnDelete = jest.fn();

    const defaultProps = {
        onClose: mockOnClose,
        onDelete: mockOnDelete,
        show: true,
        warning: "Are you sure you want to delete this item?",
        hint: "This action cannot be undone.",
        hintNote: "Please confirm.",
        note: "Important note",
        confirm: "I understand the consequences",
        buttonText: "Delete",
    };

    test("renders Modal component when 'show' is true", () => {
        const { getByText, getByLabelText } = render(<Modal {...defaultProps} />);

        expect(getByText(defaultProps.warning)).toBeInTheDocument();
        expect(getByLabelText(defaultProps.confirm)).toBeInTheDocument();
        expect(getByText(defaultProps.buttonText)).toBeInTheDocument();
    });

    test("does not render Modal component when 'show' is false", () => {
        const { queryByText } = render(<Modal {...defaultProps} show={false} />);

        expect(queryByText(defaultProps.warning)).not.toBeInTheDocument();
    });

    test("calls onClose when close link is clicked", () => {
        const { container } = render(<Modal {...defaultProps} />);

        const closeButton = container.querySelector(".flyout__button-close") as HTMLAnchorElement;
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test("disables button if checkbox is unchecked", () => {
        const { getByText } = render(<Modal {...defaultProps} />);

        const deleteButton = getByText(defaultProps.buttonText);
        expect(deleteButton).toBeDisabled();
    });

    test("enables button when checkbox is checked", () => {
        const { getByLabelText, getByText } = render(<Modal {...defaultProps} />);

        const checkbox = getByLabelText(defaultProps.confirm);
        fireEvent.click(checkbox);

        const deleteButton = getByText(defaultProps.buttonText);
        expect(deleteButton).toBeEnabled();
    });

    test("calls onDelete when delete button is clicked", () => {
        const { getByLabelText, getByText } = render(<Modal {...defaultProps} />);

        const checkbox = getByLabelText(defaultProps.confirm);
        fireEvent.click(checkbox);

        const deleteButton = getByText(defaultProps.buttonText);
        fireEvent.click(deleteButton);

        expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    test("renders with informational modal type", () => {
        const { getByText } = render(
            <Modal {...defaultProps} modalType={ModalType.INFORMATIONAL} />
        );

        const deleteButton = getByText(defaultProps.buttonText);
        expect(deleteButton.classList.contains("govuk-button")).toBe(true);
    });

    test("renders with delete modal type", () => {
        const { getByText } = render(
            <Modal {...defaultProps} modalType={ModalType.DELETE} />
        );

        const deleteButton = getByText(defaultProps.buttonText);
        expect(deleteButton.classList.contains("govuk-button--warning")).toBe(true);
    });
});
