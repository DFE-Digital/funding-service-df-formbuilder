import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { FileUploadFieldEdit } from "../file-upload-field-edit";
import { RenderWithContext } from "./helpers/renderers";

describe("File upload", () => {
  describe("File upload Field", () => {
    let stateProps;
    let page;

    beforeEach(() => {
      stateProps = {
        component: {
          type: "FileUploadField",
          name: "TestFileUpload",
          options: {},
        },
      };

      page = render(
        <RenderWithContext stateProps={stateProps}>
          <FileUploadFieldEdit />
        </RenderWithContext>
      );
    });

    test("should display display correct title", () => {
      const text = "Select file type";
      expect(page.getByText(text)).toBeInTheDocument();
    });

    test("should display display correct help text", () => {
      const text =
        "This allows to upload the selected file type. If nothing is selected it will allow any file type from the list";
      expect(page.getByText(text)).toBeInTheDocument();
    });

    test("find 6 checkboxes & select PDF checkbox", () => {
      const { getByLabelText, queryAllByTestId } = render(
        <RenderWithContext stateProps={stateProps}>
          <FileUploadFieldEdit />
        </RenderWithContext>
      );

      expect(getByLabelText("PDF")).toBeInTheDocument();
      expect(getByLabelText("PNG")).toBeInTheDocument();
      expect(getByLabelText("JPG/JPEG")).toBeInTheDocument();
      expect(getByLabelText("DOC/DOCX")).toBeInTheDocument();
      expect(getByLabelText("XLS/XLSX")).toBeInTheDocument();
      expect(getByLabelText("CSV")).toBeInTheDocument();

      const PDFcheckbox = queryAllByTestId("PDF");
      fireEvent.click(PDFcheckbox[0]);
      expect(PDFcheckbox[0].checked).toEqual(true);
    });
  });
});
