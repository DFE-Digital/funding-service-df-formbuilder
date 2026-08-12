import React from "react";
import { render, fireEvent } from "@testing-library/react";
import DateSchema from "../DateSchema";

describe("Date Schema snapshot test", () => {
    it("Should match snapshot", () => {
      const { asFragment } = render(
        <DateSchema 
            maxDaysInPast="2"
            maxDaysInFuture="3"
            handleDateSchemaChanges={jest.fn()}
        />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });