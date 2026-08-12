import React from "react";
import { render, fireEvent } from "@testing-library/react";
import NumberSchema from "../NumberSchema";

describe("Number Schema snapshot test", () => {
    it("Should match snapshot", () => {
      const { asFragment } = render(
        <NumberSchema 
            minNumber="4"
            maxNumber="8"
            precisionNumber="2"
            handleNumberSchemaChanges={jest.fn()}
            
        />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });