import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { DateFieldEdit, RenderMaxDaysInFuture, RenderMaxDaysInPast } from "../date-field-edit";
import { RenderWithContext } from "../../../__tests__/helpers/renderers";

describe("date field edit", () => {
  describe("date field edit fields", () => {
    let stateProps;
    let textFieldEditPage;

    beforeEach(() => {
      stateProps = {
        component: {
          type: "dateFieldEdit",
          name: "dateFieldEditClass",
          options: undefined,
        },
      };

      textFieldEditPage = render(
        <RenderWithContext stateProps={stateProps}>
          <DateFieldEdit context={undefined} />
        </RenderWithContext>
      );
    });

    test("should display details link title", () => {
      const text = "Additional settings";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display future title", () => {
      const text = "Max days in the future";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display future help text ", () => {
      const text = "Determines the latest date users can enter";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display past title", () => {
      const text = "Max days in the past";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display past help text ", () => {
      const text = "Determines the earliest date users can enter";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("trigger onChange for RenderMaxDaysInFuture", () => {
      textFieldEditPage.unmount()
      const mockDispatch = jest.fn();
      const mockHandleFn = jest.fn();
      const { getByTestId, unmount } = render(
        <RenderMaxDaysInFuture
          maxDaysInFuture={10}
          dispatch={mockDispatch}
          from="DateComponent"
          value={5}
          handleChange={mockHandleFn}
        />
      )
      const input = getByTestId("field-options-max-days-in-future");
      if (!input) return;
      fireEvent.change(input, {
        target: {
          value: 6
        }
      })
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockHandleFn).not.toHaveBeenCalled();
      unmount();
    });

    test("trigger onChange for RenderMaxDaysInFuture for non-date component", () => {
      textFieldEditPage.unmount()
      const mockDispatch = jest.fn();
      const mockHandleFn = jest.fn();
      const { getByTestId, unmount } = render(
        <RenderMaxDaysInFuture
          maxDaysInFuture={10}
          dispatch={mockDispatch}
          from="SelectComponent"
          value={5}
          handleChange={mockHandleFn}
        />
      )
      const input = getByTestId("field-options-max-days-in-future");
      if (!input) return;
      fireEvent.change(input, {
        target: {
          value: 6
        }
      })
      expect(mockDispatch).not.toHaveBeenCalled();
      expect(mockHandleFn).toHaveBeenCalledTimes(1);
      unmount();
    });

    test("trigger onChange for RenderMaxDaysInPast", () => {
      textFieldEditPage.unmount()
      const mockDispatch = jest.fn();
      const mockHandleFn = jest.fn();
      const { getByTestId, unmount } = render(
        <RenderMaxDaysInPast
          maxDaysInPast={10}
          dispatch={mockDispatch}
          from="DateComponent"
          value={5}
          handleChange={mockHandleFn}
        />
      )
      const input = getByTestId("field-options-max-days-in-past");
      if (!input) return;
      fireEvent.change(input, {
        target: {
          value: 6
        }
      })
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockHandleFn).not.toHaveBeenCalled();
      unmount()
    });

    test("trigger onChange for RenderMaxDaysInPast for non-date component", () => {
      textFieldEditPage.unmount()
      const mockDispatch = jest.fn();
      const mockHandleFn = jest.fn();
      const { getByTestId, unmount } = render(
        <RenderMaxDaysInPast
          maxDaysInPast={10}
          dispatch={mockDispatch}
          from="SelectComponent"
          value={5}
          handleChange={mockHandleFn}
        />
      )
      const input = getByTestId("field-options-max-days-in-past");
      if (!input) return;
      fireEvent.change(input, {
        target: {
          value: 6
        }
      })
      expect(mockHandleFn).toHaveBeenCalledTimes(1);
      expect(mockDispatch).not.toHaveBeenCalled();
      unmount()
    });
  });
});
