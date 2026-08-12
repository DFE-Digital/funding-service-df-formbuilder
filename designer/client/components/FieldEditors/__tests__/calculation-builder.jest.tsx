import React from "react";
import { render, fireEvent } from "@testing-library/react";
import CalculationBuilder from "../calculation-builder";

describe("Calculation Builder", () => {
  it("should match snapshot", () => {
    //   const onSelectComponent = jest.fn();
    const { asFragment } = render(<CalculationBuilder />);
    expect(asFragment()).toMatchSnapshot();
  });
});
