import React from "react";
import { render } from "@testing-library/react";
import { useAppSelector } from "../../store/hooks";
import { LoadingState } from "../../store/types";
import ApiLoader from "../ApiLoader";

jest.mock("../../store/hooks", () => ({
    useAppSelector: jest.fn(),
}));

describe("ApiLoader", () => {
    test("renders Loader when status is Pending", () => {
        (useAppSelector as jest.Mock).mockReturnValue({
            status: LoadingState.Pending,
            message: "Loading data...",
        });

        const { getByText } = render(<ApiLoader />);

        expect(getByText("Loading data...")).toBeInTheDocument();
    });

    test("does not render Loader when status is not Pending", () => {
        (useAppSelector as jest.Mock).mockReturnValue({
            status: LoadingState.Succeeded,
            message: "",
        });

        const { queryByText } = render(<ApiLoader />);

        expect(queryByText("Loading data...")).not.toBeInTheDocument();
    });
});
