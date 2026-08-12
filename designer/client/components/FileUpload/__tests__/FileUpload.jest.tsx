import React from "react";
import { render } from "@testing-library/react";
import FileUpload from "../FileUpload";

describe("File Upload Component", () => {
    test("should render file upload component", () => {
        const mockHandleChange = jest.fn();
        const buttonText = "test"
        const emptyMessage = "testEmptyMessage"
        const { getByText, unmount } = render(<FileUpload
            id={"test"}
            name={""}
            hintId={""}
            buttonText={buttonText}
            emptyMessage={emptyMessage}
            selectedFile={null}
            onChange={mockHandleChange}
            acceptableFileExtension={""}
        />)
        const button = getByText(buttonText);
        expect(button).toBeInTheDocument();
        const emptyMessageElement = getByText(emptyMessage);
        expect(emptyMessageElement).toBeInTheDocument();
        //trigger button click to render file upload dialog
        button.click();
        unmount();
    })

    test("handle else branch for file upload click", () => {
        const createRefSpy = jest.spyOn(React, 'createRef').mockReturnValueOnce({ current: null });
        const mockHandleChange = jest.fn();
        const buttonText = "test"
        const emptyMessage = "testEmptyMessage"
        const { getByText, unmount } = render(<FileUpload
            id={"test"}
            name={""}
            hintId={""}
            buttonText={buttonText}
            emptyMessage={emptyMessage}
            selectedFile={null}
            onChange={mockHandleChange}
            acceptableFileExtension={""}
        />)
        const button = getByText(buttonText);
        expect(button).toBeInTheDocument();
        const emptyMessageElement = getByText(emptyMessage);
        expect(emptyMessageElement).toBeInTheDocument();
        //trigger button click to render file upload dialog
        button.click();
        createRefSpy.mockRestore()
        unmount();
    })

    test("check if file name is rendered", () => {
        const mockFile = new File(["test"], "filename.txt",{
            type: "text/plain",
          })
        const mockHandleChange = jest.fn();
        const buttonText = "test"
        const { getByText, unmount } = render(<FileUpload
            id={"test"}
            name={""}
            hintId={""}
            buttonText={buttonText}
            emptyMessage={""}
            selectedFile={mockFile}
            onChange={mockHandleChange}
            acceptableFileExtension={""}
        />)
        const fileDisplay = getByText("filename.txt");
        expect(fileDisplay).toBeInTheDocument();
        unmount();
    })
})