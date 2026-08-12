import React from "react";
import { render, fireEvent } from "@testing-library/react";
import SearchInput from "../Search/SearchInput";

describe("SearchInput", () => {
  const defaultProps = {
    name: "search",
    label: "Search",
    value: "",
    onSearchChange: jest.fn(),
  };

  test("renders the search icon", () => {
    const { container } = render(
      <SearchInput
        name={defaultProps.name}
        label={defaultProps.label}
        value={defaultProps.value}
        onSearchChange={defaultProps.onSearchChange}
      />
    );

    const iconElement = container.querySelector(".search-input-icon-box");
    expect(iconElement).toBeInTheDocument();
  });
});
