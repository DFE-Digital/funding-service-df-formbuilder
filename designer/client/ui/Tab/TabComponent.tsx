import React from "react";

export type TabChildDetails = {
    id: string;
    label: string;
    render: () => React.JSX.Element;
};

type Props = {
    name: string;
    title: string;
    selectedTab: string;
    onSelectTab: (tabId: string) => void;
    childs: TabChildDetails[];
};

const TabComponent = (props: Props) => {
    const selectedTabDetail = props.childs.find(
        (child) => child.id === props.selectedTab
    );
    const renderPanel =
        selectedTabDetail?.render ??
        function () {
            return <></>;
        };
    return (
        <div
            id={props.name}
            className="govuk-frontend-supported govuk-tabs"
            data-module="govuk-tabs"
        >
            <h2 className="govuk-tabs__title">{props.title}</h2>
            <ul className="govuk-tabs__list">
                {props.childs.map((child) => (
                    <li
                        key={child.id}
                        className={`govuk-tabs__list-item ${
                            props.selectedTab === child.id
                                ? "govuk-tabs__list-item--selected"
                                : ""
                        }`}
                    >
                        <a
                            className="govuk-tabs__tab"
                            href={`#${child.id}`}
                            onClick={(e) => {
                                e.preventDefault();
                                props.onSelectTab(child.id);
                            }}
                        >
                            {child.label}
                        </a>
                    </li>
                ))}
            </ul>
            <div className="govuk-tabs__panel" id={selectedTabDetail?.id ?? ""}>
                {renderPanel()}
            </div>
        </div>
    );
};

export default TabComponent;
