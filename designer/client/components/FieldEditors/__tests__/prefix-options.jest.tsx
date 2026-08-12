import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import { ComponentContext } from "../../../reducers/component/componentReducer";
import PrefixOptions  from "../prefix-options";


describe("Prefix options snapshot test", () => {

  function TestComponentWithContext({ children }) {
    return (
      <ComponentContext.Provider
        value={{ state: { selectedComponent: {} }, dispatch: jest.fn() }}
      >
        {children}
      </ComponentContext.Provider>
    );
  }
    function TestComponentWithCustomContext({ children }) {
        return (
          <ComponentContext.Provider
            value={{ state: { selectedComponent: {prefixType: "custom-prefix"} }, dispatch: jest.fn() }}
          >
            {children}
          </ComponentContext.Provider>
        );
      }

      function TestComponentWithSelectContext({ children }) {
        return (
          <ComponentContext.Provider
            value={{ state: { selectedComponent: {prefixType: "select-prefix"} }, dispatch: jest.fn() }}
          >
            {children}
          </ComponentContext.Provider>
        );
      }
    it("Should match snapshot", () => {
        const { asFragment } = render(
            <TestComponentWithContext>
              <PrefixOptions context={ComponentContext} currency={""}></PrefixOptions>
            </TestComponentWithContext>
          );
      expect(asFragment()).toMatchSnapshot();
    });

    it("click preselect radio button", async() => {
        render(
            <TestComponentWithContext>
              <PrefixOptions context={ComponentContext} currency={""}></PrefixOptions>
            </TestComponentWithContext>
          );
        const radio = screen.getByLabelText('Select a prefix as currency');
        fireEvent.click(radio);
        expect(radio).toBeInTheDocument();
    })

    it("click custom select radio button", async() => {
       render(
          <TestComponentWithContext>
            <PrefixOptions context={ComponentContext} currency={""}></PrefixOptions>
          </TestComponentWithContext>
        );
      const radio = screen.getByLabelText('Enter custom prefix');
      fireEvent.click(radio);
      expect(radio).toBeInTheDocument();
    })

    it("handle pre select prefix", () => { 
      render(<TestComponentWithSelectContext>
        <PrefixOptions context={ComponentContext} currency={""}></PrefixOptions>
      </TestComponentWithSelectContext>);
      screen.debug();
      const findList = screen.getByTestId('currency-list');
      expect(findList).toBeInTheDocument();
      
    })

    it("handle custom prefix input changes", () => {
      render(<TestComponentWithCustomContext>
        <PrefixOptions context={ComponentContext} currency={""}></PrefixOptions>
      </TestComponentWithCustomContext>);
      screen.debug();
      const findInput = screen.getByTestId('text-input');
      expect(findInput).toBeInTheDocument();
      
      userEvent.type(findInput, "£");
      expect(findInput).toHaveValue("£");
    })
  });