import React from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { NumberFieldEdit } from "../number-field-edit";
import userEvent from '@testing-library/user-event';
import { RenderWithContext } from "../../../__tests__/helpers/renderers";
import {RenderMinNumber, RenderMaxNumber, RenderPrecisionNumber } from "../number-field-edit";

describe("Number field edit", () => {
  describe("Number field edit fields", () => {
    let stateProps;
    let textFieldEditPage;

    beforeEach(() => {
      stateProps = {
        component: {
          type: "numberFieldEdit",
          name: "numberFieldEditClass",
          options: {},
        },
      };

      textFieldEditPage = render(
        <RenderWithContext stateProps={stateProps}>
          <NumberFieldEdit context={undefined} />
        </RenderWithContext>
      );
    });

    afterEach(cleanup)

    test("should display details link title", () => {
      const text = "Additional settings";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display min title", () => {
      const text = "Min";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display min help text ", () => {
      const text = "Specifies the lowest number users can enter";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display max title", () => {
      const text = "Max";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display max help text ", () => {
      const text = "Specifies the highest number users can enter";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display precision title", () => {
      const text = "Precision";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display precision help text ", () => {
      const text =
        "Specifies the number of decimal places users can enter. For example, to allow users to enter numbers with up to two decimal places, set this to 2";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    it("handle min number changes", async () => {
      const renderMin = render(
        <RenderMinNumber 
          from="NumberComponent"
          dispatch={jest.fn()}
          handleChange={() => jest.fn()}
          minNumber="1"
          />
      );
      const findInput = screen.getAllByTestId('field-schema-min')[1];
      expect(findInput).toBeInTheDocument();
      userEvent.type(findInput, "£");
      expect(findInput).toHaveValue(1);
    })

    it("handle min number changes", async () => {
      const renderMax = render(
        <RenderMaxNumber 
          from="NumberComponent"
          dispatch={jest.fn()}
          handleChange={() => jest.fn()}
          maxNumber="1"
          />
      );
      const findInput = screen.getAllByTestId('field-schema-max')[1];
      expect(findInput).toBeInTheDocument();
      userEvent.type(findInput, "£");
      expect(findInput).toHaveValue(1);
    })

    it("handle precision changes", async () => {
      const renderMax = render(
        <RenderPrecisionNumber 
          from="NumberComponent"
          dispatch={jest.fn()}
          handleChange={() => jest.fn()}
          precisionNumber="1"
          />
      );
      const findInput = screen.getAllByTestId('field-schema-precision')[1];
      expect(findInput).toBeInTheDocument();
      userEvent.type(findInput, "£");
      expect(findInput).toHaveValue(1);
    })

    it("click add prefix checkbox", async() => {
      const prefixBox = textFieldEditPage.getByTestId('add-prefix');
      fireEvent.click(prefixBox);
      expect(prefixBox).toBeInTheDocument();
  })
  });
});
