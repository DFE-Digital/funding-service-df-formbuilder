import React from "react";
import { RenderResult, fireEvent, render } from "@testing-library/react";
import { TextFieldEdit, RenderMaxLength } from "../text-field-edit";
import { RenderWithContext } from "../../../__tests__/helpers/renderers";

describe("Text field edit", () => {
  describe("Text field edit fields", () => {
    let stateProps;
    let textFieldEditPage: RenderResult;

    beforeEach(() => {
      stateProps = {
        component: {
          type: "textFieldEdit",
          name: "TextFieldEditClass",
          options: {},
        },
      };

      textFieldEditPage = render(
        <RenderWithContext stateProps={stateProps}>
          {/** @ts-ignore */}
          <TextFieldEdit />
        </RenderWithContext>
      );
    });

    test("should display details link title", () => {
      const text = "Additional settings";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display min length title", () => {
      const text = "Min length";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display min length help text ", () => {
      const text = "Specifies the minimum number of characters users can enter";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display max length title", () => {
      const text = "Max length";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display max length help text ", () => {
      const text = "Specifies the maximum number of characters users can enter";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display length title", () => {
      const text = "Length";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display length help text ", () => {
      const text =
        "Specifies the exact character length users must enter. Using this setting negates any values you set for Min length or Max length.";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display regex title", () => {
      const inputSchemaMax = textFieldEditPage.getAllByTestId("field-schema-max")[0];
      if (!inputSchemaMax) return;
      fireEvent.change(inputSchemaMax, {
        target: {
          value: 1
        }
      })
      const text = "Regex";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display regex help text ", () => {
      const inputSchemaRegex = textFieldEditPage.getByTestId("field-schema-regex");
      if (!inputSchemaRegex) return;
      fireEvent.change(inputSchemaRegex, {
        target: {
          value: "text"
        }
      })
      const text =
        "Specifies a regular expression to validate users' inputs. Use JavaScript syntax.";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display autocomplete title", () => {
      const inputSchemaLength = textFieldEditPage.getByTestId("field-schema-length");
      if (!inputSchemaLength) return;
      fireEvent.change(inputSchemaLength, {
        target: {
          value: 1
        }
      })
      const text = "Autocomplete";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display autocomplete help text ", () => {
      const inputSchemaMin = textFieldEditPage.getByTestId("field-schema-min");
      if (!inputSchemaMin) return;
      fireEvent.change(inputSchemaMin, {
        target: {
          value: 1
        }
      })
      const text =
        "Add the autocomplete attribute to this field. For example, 'on' or 'given-name'.";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("trigger onChange for RenderMaxLength input", () => {
      const mockDispatch = jest.fn();
      const mockChangeFn = jest.fn();
      const { getAllByTestId } = render(<RenderMaxLength
        maxLength={10}
        dispatch={mockDispatch}
        handleChange={mockChangeFn}
        from="TelephoneNumberField"
        value={2}
    />)
      const inputSchemaMax = getAllByTestId("field-schema-max")[1];
      if (!inputSchemaMax) return;
      fireEvent.change(inputSchemaMax, {
        target: {
          value: 1
        }
      })

      expect(mockChangeFn).toHaveBeenCalledTimes(1);
    });

    test("should display custom validation message ", () => {
      textFieldEditPage.unmount()
      const stateTeleProps = {
        component: {
          type: "TelephoneNumberField",
          name: "TelephoneNumberFieldName",
          options: {},
        },
      };
      const telephoneNumberPage = render(<RenderWithContext stateProps={stateTeleProps}>
      {/** @ts-ignore */}
      <TextFieldEdit />
    </RenderWithContext>)
      const text = "Validation message";
      expect(telephoneNumberPage.getByText(text)).toBeInTheDocument();
    });
  });
});
