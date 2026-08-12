import React, { useContext, useEffect } from "react";
import { Flyout } from "../Flyout";
import { FormDetails } from "../FormDetails";
import PageCreate from "../../page-create";
import LinkCreate from "../../link-create";
import ConditionsEdit from "../../conditions/ConditionsEdit";
import { i18n } from "../../i18n";
import DeclarationEdit from "../../declaration-edit";
import OutputsEdit from "../../outputs/outputs-edit";
import { DataContext } from "../../context";
import { DataPrettyPrint } from "../DataPrettyPrint/DataPrettyPrint";
import { useMenuItem } from "./useMenuItem";
import { Tabs, useTabs } from "./useTabs";
import { SubMenu } from "./SubMenu";
import ImportData from "../ImportData/ImportData";
import DesignData from "../DesignData/DesignData";
import Document from "../Document";
import { useHistory } from "react-router-dom";
import { PageContext } from "../../context";

type Props = {
    updateDownloadedAt?: (string) => void;
    id: string;
};

export default function Menu({ updateDownloadedAt, id }: Props) {
    const { data } = useContext(DataContext);
    const pagecontext = useContext(PageContext);
    let history = useHistory();

    const formDetails = useMenuItem();
    const page = useMenuItem();
    const link = useMenuItem();
    const sections = useMenuItem();
    const conditions = useMenuItem();
    const lists = useMenuItem();
    const outputs = useMenuItem();
    const summaryBehaviour = useMenuItem();
    const summary = useMenuItem();
    const importData = useMenuItem();
    const designData = useMenuItem();
    const document = useMenuItem();
    const calculation = useMenuItem();

    const { selectedTab, handleTabChange } = useTabs();

    function redirectToList() {
        history.push(`/list-module/${data.id}`);
        window.location.reload();
    }

    function redirectToSections() {
        history.push(`/form-section/${data.id}`);
        window.location.reload();
    }

    function redirectToCalculation() {
        history.push(`/calculation/${data.id}`);
        window.location.reload();
    }

    useEffect(() => {
        pagecontext.increment();
    }, []);

    return (
        <nav className="menu" style={{ position: "fixed" }}>
            <div className="menu__row">
                <button
                    data-testid="menu-form-details"
                    onClick={formDetails.show}
                >
                    {i18n("menu.formDetails")}
                </button>
                <button data-testid="menu-page" onClick={page.show}>
                    {i18n("menu.addPage")}
                </button>
                <button data-testid="menu-links" onClick={link.show}>
                    {i18n("menu.links")}
                </button>
                <button data-testid="menu-sections" onClick={sections.show}>
                    {i18n("menu.sections")}
                </button>
                <button data-testid="menu-conditions" onClick={conditions.show}>
                    {i18n("menu.conditions")}
                </button>
                <button data-testid="menu-lists" onClick={lists.show}>
                    {i18n("menu.lists")}
                </button>
                <button data-testid="menu-outputs" onClick={outputs.show}>
                    {i18n("menu.outputs")}
                </button>
                <button
                    data-testid="menu-summary-behaviour"
                    onClick={summaryBehaviour.show}
                >
                    {i18n("menu.summaryBehaviour")}
                </button>
                <button
                    onClick={importData.show}
                    data-testid="menu-import-data"
                >
                    {i18n("menu.importData")}
                </button>
                <button
                    onClick={designData.show}
                    data-testid="menu-design-data"
                >
                    {i18n("menu.designData")}
                </button>
                <button onClick={document.show} data-testid="menu-document">
                    {i18n("menu.documents")}
                </button>
                <button onClick={summary.show} data-testid="menu-summary">
                    {i18n("menu.summary")}
                </button>
                <button
                    onClick={calculation.show}
                    data-testid="menu-calculation"
                >
                    {i18n("menu.calculation")}
                </button>
            </div>
            {formDetails.isVisible && (
                <Flyout
                    width="md2"
                    title="Form Details"
                    onHide={formDetails.hide}
                >
                    <FormDetails
                        onCreate={() => formDetails.hide()}
                        onDBClear={() => formDetails.hide()}
                    />
                </Flyout>
            )}

            {page.isVisible && (
                <Flyout width="md2" title="Add Page" onHide={page.hide}>
                    <PageCreate data={data} onCreate={() => page.hide()} />
                </Flyout>
            )}

            {link.isVisible && (
                <Flyout
                    width="md2"
                    title={i18n("menu.links")}
                    onHide={link.hide}
                >
                    <LinkCreate data={data} onCreate={() => link.hide()} />
                </Flyout>
            )}

            {sections.isVisible && redirectToSections()}
            {calculation.isVisible && redirectToCalculation()}

            {conditions.isVisible && (
                <Flyout
                    title={i18n("conditions.addOrEdit")}
                    onHide={conditions.hide}
                    width="md2"
                >
                    <ConditionsEdit path={""} />
                </Flyout>
            )}

            {lists.isVisible && redirectToList()}
            {outputs.isVisible && (
                <Flyout title="Edit Outputs" onHide={outputs.hide} width="md2">
                    <OutputsEdit data={data} />
                </Flyout>
            )}

            {summaryBehaviour.isVisible && (
                <Flyout
                    title="Summary behaviour"
                    onHide={summaryBehaviour.hide}
                    width="md2"
                >
                    <DeclarationEdit
                        data={data}
                        onCreate={() => summaryBehaviour.hide()}
                    />
                </Flyout>
            )}

            {designData.isVisible && (
                <Flyout
                    title={i18n("designData.title")}
                    onHide={designData.hide}
                    width="md2"
                >
                    <DesignData />
                </Flyout>
            )}

            {importData.isVisible && (
                <Flyout
                    title={i18n("importData.title")}
                    onHide={importData.hide}
                    width="md2"
                    // width="md1"
                >
                    <ImportData />
                </Flyout>
            )}

            {document.isVisible && (
                <Flyout
                    title={i18n("documents.title")}
                    onHide={document.hide}
                    width="md2"
                    // width="md1"
                >
                    <Document />
                </Flyout>
            )}

            {summary.isVisible && (
                <Flyout title="Summary" width="md2" onHide={summary.hide}>
                    <div className="js-enabled" style={{ paddingTop: "3px" }}>
                        <div
                            className="govuk-frontend-supported govuk-tabs"
                            data-module="tabs"
                        >
                            <h2 className="govuk-tabs__title">Summary</h2>
                            <ul className="govuk-tabs__list">
                                <li className="govuk-tabs__list-item">
                                    <button
                                        className="govuk-tabs__tab"
                                        aria-selected={
                                            selectedTab === Tabs.model
                                        }
                                        data-testid="tab-model-button"
                                        onClick={(e) =>
                                            handleTabChange(e, Tabs.model)
                                        }
                                    >
                                        Data Model
                                    </button>
                                </li>
                                <li className="govuk-tabs__list-item">
                                    <button
                                        className="govuk-tabs__tab"
                                        aria-selected={
                                            selectedTab === Tabs.json
                                        }
                                        data-testid={"tab-json-button"}
                                        onClick={(e) =>
                                            handleTabChange(e, Tabs.json)
                                        }
                                    >
                                        JSON
                                    </button>
                                </li>
                                <li className="govuk-tabs__list-item">
                                    <button
                                        className="govuk-tabs__tab"
                                        aria-selected={
                                            selectedTab === Tabs.summary
                                        }
                                        data-testid="tab-summary-button"
                                        onClick={(e) =>
                                            handleTabChange(e, Tabs.summary)
                                        }
                                    >
                                        Summary
                                    </button>
                                </li>
                            </ul>
                            {selectedTab === Tabs.model && (
                                <section
                                    className="govuk-tabs__panel"
                                    data-testid="tab-model"
                                >
                                    <DataPrettyPrint data={data} />
                                </section>
                            )}
                            {selectedTab === Tabs.json && (
                                <section
                                    className="govuk-tabs__panel"
                                    data-testid="tab-json"
                                >
                                    <pre>{JSON.stringify(data, null, 2)}</pre>
                                </section>
                            )}
                            {selectedTab === Tabs.summary && (
                                <section
                                    className="govuk-tabs__panel"
                                    data-testid="tab-summary"
                                >
                                    <pre>
                                        {JSON.stringify(
                                            data.pages.map((page) => page.path),
                                            null,
                                            2
                                        )}
                                    </pre>
                                </section>
                            )}
                        </div>
                    </div>
                </Flyout>
            )}

            <SubMenu id={id} updateDownloadedAt={updateDownloadedAt} />
        </nav>
    );
}
