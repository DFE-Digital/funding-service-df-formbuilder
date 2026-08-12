import { Menu } from "..";
import { render, fireEvent, act, screen } from "@testing-library/react";
import { DataContext, FlyoutContext, PageContext } from "../../../context";
import React from "react";
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom';


const dataValue = {
  data: {
    lists: [],
    conditions: [],
    sections: [],
    pages: [{ path: "/test", components:[]}]
}, save: jest.fn() };
const flyoutValue = {
  increment: jest.fn(),
  decrement: jest.fn(),
  count: 1,
};

const pageValue = {
  increment: jest.fn(),
  decrement: jest.fn(),
  count: 1,
};

// const redirectToList = jest.fn();

export const customRender = (children) => {
  return render(
    <DataContext.Provider value={dataValue}>
      <FlyoutContext.Provider value={flyoutValue}>
        <PageContext.Provider value={pageValue}>
          {children}
        </PageContext.Provider>
      </FlyoutContext.Provider>
      <div id="portal-root" />
    </DataContext.Provider>
  );
};

jest.mock("../../FormDetails", () => {
  const MockFormDetails = (props) => {
    return (
      <div onClick={props.onCreate}>MockFormDetails</div>
    )
  }
  return { FormDetails: MockFormDetails };
})

jest.mock("../../../page-create", () => {
  const MockPageCreate = (props) => {
    return (
      <div onClick={props.onCreate}>MockPageCreate</div>
    )
  }
  return MockPageCreate;
})

jest.mock("../../../link-create", () => {
  const MockLinkCreate = (props) => {
    return (
      <div onClick={props.onCreate}>MockLinkCreate</div>
    )
  }
  return MockLinkCreate;
})

describe("Menu Component", () => {
  afterAll(() => {
    jest.unmock("../../FormDetails")
    jest.unmock("../../../page-create")
    jest.unmock("../../../link-create")
  })
  const id = "test"

  it("Renders button strings correctly", () => {
    const { getByText, unmount } = customRender(<Menu id={id}  />);

    expect(getByText("Form details")).toBeInTheDocument();
    expect(getByText("Add page")).toBeInTheDocument();
    expect(getByText("Add link")).toBeInTheDocument();
    expect(getByText("Sections")).toBeInTheDocument();
    expect(getByText("Conditions")).toBeInTheDocument();
    expect(getByText("Lists")).toBeInTheDocument();
    expect(getByText("Outputs")).toBeInTheDocument();
    expect(getByText("Summary behaviour")).toBeInTheDocument();
    expect(getByText("Summary")).toBeInTheDocument();
    unmount();
  });

  it("Can open flyouts and close them", async () => {
    const { getByText, queryByTestId } = customRender(<Menu id={""} />);
    expect(queryByTestId("flyout-1")).toBeNull();
    act(() => { fireEvent.click(getByText("Form details")); });
    expect(queryByTestId("flyout-1")).toBeInTheDocument();
    act(() => { fireEvent.click(getByText("Close")); });
    expect(queryByTestId("flyout-1")).toBeNull();
  });

  it("clicking on a summary tab shows different tab content", async () => {
    const { getByTestId, queryByTestId, unmount } = customRender(<Menu id={""} />);
    act(() => { fireEvent.click(getByTestId("menu-summary")); });
    expect(getByTestId("flyout-1")).toBeInTheDocument();
    expect(queryByTestId("tab-json")).toBeNull();
    expect(queryByTestId("tab-summary")).toBeNull();
    act(() => { fireEvent.click(getByTestId("tab-json-button")); });
    expect(getByTestId("tab-json")).toBeInTheDocument();
    expect(queryByTestId("tab-summary")).toBeNull();
    expect(queryByTestId("tab-model")).toBeNull();
    act(() => { fireEvent.click(getByTestId("tab-model-button")); });
    expect(getByTestId("tab-model")).toBeInTheDocument();
    expect(queryByTestId("tab-summary")).toBeNull();
    expect(queryByTestId("tab-json")).toBeNull();
    act(() => { fireEvent.click(getByTestId("tab-summary-button")); });
    expect(getByTestId("tab-summary")).toBeInTheDocument();
    expect(queryByTestId("tab-model")).toBeNull();
    expect(queryByTestId("tab-json")).toBeNull();
    unmount();
  });

  it("flyouts close on Save", async () => {
    const { getByText, queryByTestId, unmount } = customRender(<Menu id={id} />);

    act(() => { fireEvent.click(getByText("Summary behaviour")); });
    expect(queryByTestId("flyout-1")).toBeInTheDocument();

    await fireEvent.click(getByText("Save"));
    expect(dataValue.save).toHaveBeenCalledTimes(1);
    expect(queryByTestId("flyout-1")).toBeNull();
    unmount();
  });

  it("check flyouts actions for Document, Import Data, Design Data, Outputs, Lists, Conditions", async () => {
    const history = createMemoryHistory();

    const { getByText, queryByTestId, unmount } = customRender(<Router history={history}>
      <Menu id={id} />
    </Router>);
    // Checks Documents
    act(() => { fireEvent.click(getByText("Documents")); });
    expect(queryByTestId("flyout-1")).toBeInTheDocument();
    act(() => { fireEvent.click(getByText("Close")); });
    expect(queryByTestId("flyout-1")).toBeNull();
    // Checks Import Data
    act(() => { fireEvent.click(getByText("Import data set")); });
    expect(queryByTestId("flyout-1")).toBeInTheDocument();
    act(() => { fireEvent.click(getByText("Close")); });
    expect(queryByTestId("flyout-1")).toBeNull();
    // Checks Design Data
    act(() => { fireEvent.click(getByText("Design data set")); });
    expect(queryByTestId("flyout-1")).toBeInTheDocument();
    act(() => { fireEvent.click(getByText("Close")); });
    expect(queryByTestId("flyout-1")).toBeNull();
    // Checks Outputs
    act(() => { fireEvent.click(getByText("Outputs")); });
    expect(queryByTestId("flyout-1")).toBeInTheDocument();
    act(() => { fireEvent.click(getByText("Close")); });
    expect(queryByTestId("flyout-1")).toBeNull();
    // Checks Lists
    act(() => { fireEvent.click(getByText("Lists")); });
    expect(queryByTestId("flyout-1")).toBeNull(); // flyout will not be called and page redirection happens
    // Checks Conditions
    act(() => { fireEvent.click(getByText("Conditions")); });
    expect(queryByTestId("flyout-1")).toBeInTheDocument();
    act(() => { fireEvent.click(getByText("Close")); });
    expect(queryByTestId("flyout-1")).toBeNull();
    // Checks Sections
    act(() => { fireEvent.click(getByText("Sections")); });
    // expect(queryByTestId("flyout-1")).toBeInTheDocument();
    // act(() => { fireEvent.click(getByText("Close")); });
    expect(queryByTestId("flyout-1")).toBeNull(); // flyout will not be called and page redirection happens
    // Checks Links
    act(() => { fireEvent.click(getByText("Add link")); });
    expect(queryByTestId("flyout-1")).toBeInTheDocument();
    act(() => { fireEvent.click(getByText("Close")); });
    expect(queryByTestId("flyout-1")).toBeNull();
    // Checks Pages
    act(() => { fireEvent.click(getByText("Add page")); });
    expect(queryByTestId("flyout-1")).toBeInTheDocument();
    act(() => { fireEvent.click(getByText("Close")); });
    expect(queryByTestId("flyout-1")).toBeNull();
    unmount();
  });

  it("flyouts close on Save", async () => {
    const { getByText, queryByTestId, unmount } = customRender(<Menu id={id} />);
    // Calls onCreate for FormDetails
    act(() => { fireEvent.click(getByText("Form details")); });
    expect(queryByTestId("flyout-1")).toBeInTheDocument();
    await fireEvent.click(getByText("MockFormDetails"));
    // Calls onCreate for PageCreate
    act(() => { fireEvent.click(getByText("Add page")); });
    expect(queryByTestId("flyout-1")).toBeInTheDocument();
    await fireEvent.click(getByText("MockPageCreate"));
    // Calls onCreate for LinkCreate
    act(() => { fireEvent.click(getByText("Add link")); });
    expect(queryByTestId("flyout-1")).toBeInTheDocument();
    await fireEvent.click(getByText("MockLinkCreate"));

    unmount();
  });

})