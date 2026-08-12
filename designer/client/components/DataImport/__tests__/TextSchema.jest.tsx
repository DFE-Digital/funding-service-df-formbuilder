import React from "react";
import { render, fireEvent } from "@testing-library/react";
import TextSchema from "../TextSchema";

describe("Text Schema snapshot test", () => {
    it("Should match snapshot", () => {
      const { asFragment } = render(
        <TextSchema 
            maxLength="6" 
            handleTextSchemaChanges={jest.fn()}
        />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });