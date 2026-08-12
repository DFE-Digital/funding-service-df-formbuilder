import React from "react";
import { render, fireEvent } from "@testing-library/react";
import UKAddressSchema from "../UKAddressSchema";
const mockState = {
    addressRequired:true,
    editColumnSchema: {
        addressRequired:false,
    }
}
describe("UK Address Schema snapshot test with dataImport", () => {
    it("Should match snapshot", () => {
      const { asFragment } = render(
        <UKAddressSchema 
            setImportState={mockState} 
            importState={mockState} 
            from="dataImport"
        />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe("UK Address Schema snapshot test without dataImport", () => {
    it("Should match snapshot", () => {
      const { asFragment } = render(
        <UKAddressSchema 
            setImportState={mockState} 
            importState={mockState} 
            from="table"
        />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });