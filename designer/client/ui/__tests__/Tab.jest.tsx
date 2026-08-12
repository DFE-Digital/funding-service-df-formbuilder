import React from "react";
import { render, fireEvent } from "@testing-library/react";
import TabComponent, { TabChildDetails } from "../Tab/TabComponent";

describe("TabComponent", () => {
  let onSelectTabMock: jest.Mock;

  const childTabs: TabChildDetails[] = [
    {
      id: "tab1",
      label: "Tab 1",
      render: () => <div>Content of Tab 1</div>,
    },
    {
      id: "tab2",
      label: "Tab 2",
      render: () => <div>Content of Tab 2</div>,
    },
    {
      id: "tab3",
      label: "Tab 3",
      render: () => <div>Content of Tab 3</div>,
    },
  ];

  beforeEach(() => {
    onSelectTabMock = jest.fn();
  });

  test("renders TabComponent with correct title and tabs", () => {
    const { container } = render(
      <TabComponent
        name="myTabComponent"
        title="My Tabs"
        selectedTab="tab1"
        onSelectTab={onSelectTabMock}
        childs={childTabs}
      />
    );

    expect(container.querySelector("h2")?.textContent).toBe("My Tabs");

    const tabItems = container.querySelectorAll(".govuk-tabs__list-item");
    expect(tabItems.length).toBe(3);

    expect(container.textContent).toContain("Tab 1");
    expect(container.textContent).toContain("Tab 2");
    expect(container.textContent).toContain("Tab 3");

    const selectedTab = container.querySelector(
      ".govuk-tabs__list-item--selected"
    );
    expect(selectedTab?.textContent).toBe("Tab 1");

    expect(container.textContent).toContain("Content of Tab 1");
  });

  test("clicking on a tab switches to the correct content", () => {
    const { container } = render(
      <TabComponent
        name="myTabComponent"
        title="My Tabs"
        selectedTab="tab1"
        onSelectTab={onSelectTabMock}
        childs={childTabs}
      />
    );

    const tab2 = container.querySelector("a[href='#tab2']");
    fireEvent.click(tab2!);

    expect(onSelectTabMock).toHaveBeenCalledWith("tab2");
  });

  test("displays correct panel content based on selected tab", () => {
    const { container, rerender } = render(
      <TabComponent
        name="myTabComponent"
        title="My Tabs"
        selectedTab="tab1"
        onSelectTab={onSelectTabMock}
        childs={childTabs}
      />
    );

    expect(container.textContent).toContain("Content of Tab 1");
    expect(container.textContent).not.toContain("Content of Tab 2");

    rerender(
      <TabComponent
        name="myTabComponent"
        title="My Tabs"
        selectedTab="tab2"
        onSelectTab={onSelectTabMock}
        childs={childTabs}
      />
    );

    expect(container.textContent).toContain("Content of Tab 2");
    expect(container.textContent).not.toContain("Content of Tab 1");
  });
});
