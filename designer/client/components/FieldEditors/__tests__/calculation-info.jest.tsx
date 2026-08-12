import React from "react";
import { render } from "@testing-library/react";
import CalculationInfo from "../calculation-info";

describe("Calculation Builder", () => {
  it("should match snapshot", () => {
    const { asFragment } = render(<CalculationInfo />);
    expect(asFragment()).toMatchSnapshot();
  });
});
