import React from "react";
import { render, fireEvent } from "@testing-library/react";
import DataImport from "../data-import";

describe("Data Import snapshot test", () => {
    it("Should match snapshot", () => {
      const { asFragment } = render(
        <DataImport />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });