import { Page } from "@xgovformbuilder/model";
import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../../../context";
import TabsContext from "../../../context/TabsContext";
import { i18n } from "../../../i18n";
import { ComponentContext } from "../../../reducers/component/componentReducer";
import { CssClasses } from "../../CssClasses";
import TabTableContainer from "./components/TabTableContainer";
import "./Tab.scss";
import { DynamicDataSetTabs, RenderTabsType } from "./types";
import { isReadyToSave } from "./utils";
import LinkedPropertiesDetails from "../../../utils/LinkedPropertiesDetails";
import { Module as ReportModule } from "../../../utils/linkedProperties";
import {
    PropertyAction,
    handleLinkedPropertyEffect,
    Module,
} from "../../../utils";

const t = (str: string) => i18n("tabs." + str);

type Props = {
    page: Page;
    isEdit?: boolean;
    toggleShowEditor?: () => void;
};

const TabEdit = (props: Props) => {
    const { data, save } = useContext(DataContext);
    const { dynamicDataSet, setDynamicDataSet } = useContext(TabsContext);
    const { state } = useContext(ComponentContext);
    const {
        selectedComponent,
        //@ts-ignore
        errors = {},
    } = state;
    //@ts-ignore
    const { name, title, type, hint, content = "" } = selectedComponent;
    const tabs = data?.tabs ?? [];
    const selectedTab = tabs.find((tab) => tab.id === name);
    const [activeCell, setActiveCell] = useState<string>("");
    const [numberOfSections, setNumberOfSections] = useState<number>(0);
    const [numberOfTabs, setNumberOfTabs] = useState<number>(0);
    const [
        renderDynamicTable,
        setRenderDynamicTable,
    ] = useState<RenderTabsType | null>(null);
    const [clonePreviousState, setClonePreviousState] = useState(
        selectedComponent
    );
    const [confirm, setConfirm] = useState(false);
    const onSectionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault();
        setNumberOfSections(Number(e.target.value));
    };
    /** Checks if tab details are properly filled on component creation */
    const isSaveDisabled = () =>
        isReadyToSave(dynamicDataSet, title, numberOfTabs);

    /** Checks if tab details are properly filled and modified on component edit */
    const isSaveDisabledEdit = () => {
        // Disables if data is same
        if (
            JSON.stringify(selectedComponent) ===
                JSON.stringify(clonePreviousState) &&
            JSON.stringify(selectedTab?.tabData ?? []) ===
                JSON.stringify(Object.values(dynamicDataSet))
        ) {
            return true;
        }
        return isReadyToSave(dynamicDataSet, title, numberOfTabs);
    };

    const deleteComponent = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();
        let copy = { ...data };
        copy = handleLinkedPropertyEffect(
            Module.Component,
            selectedComponent,
            PropertyAction.Deleted,
            copy
        );
        const indexOfPage = copy.pages.findIndex(
            (p) => p.path === props.page.path
        );
        //@ts-ignore
        const indexOfComponent = copy?.pages[indexOfPage]?.components.findIndex(
            (component) => component.name === selectedComponent.name
        );
        //@ts-ignore
        copy.pages[indexOfPage].components.splice(indexOfComponent, 1);
        //Remove corresponding: Tabs - TabData
        const tabs = copy.tabs ?? [];
        const filteredTabs = tabs.filter((tab) => tab.id !== name);
        copy.tabs = filteredTabs;
        await save(copy);
        if (props.toggleShowEditor) {
            props.toggleShowEditor();
        }
        setDynamicDataSet({});
    };

    const isGenerateButtonDisabled = () => {
        const identicalInput = numberOfSections === numberOfTabs;
        if (renderDynamicTable === RenderTabsType.INITIAL && identicalInput)
            return true;
        if (!numberOfSections) return true;
        if (!title) return true;
        const validInputPresent =
            title.trim().length > 0 && numberOfSections > 0;
        if (validInputPresent && !identicalInput) return false;
        return true;
    };

    const onGenerateClick = () => {
        setNumberOfTabs(numberOfSections);
        setRenderDynamicTable(RenderTabsType.INITIAL);
    };

    useEffect(() => {
        if (props.isEdit && selectedTab) {
            const populateDataSet = {} as DynamicDataSetTabs;
            selectedTab.tabData.forEach((tabItem, index) => {
                populateDataSet[`${index}`] = tabItem;
            });
            setDynamicDataSet(populateDataSet);
            setRenderDynamicTable(RenderTabsType.INITIAL);
            setNumberOfSections(selectedTab.tabData.length);
            setNumberOfTabs(selectedTab.tabData.length);
        }
    }, []);

    return (
        <div>
            <div className="govuk-form-group">
                <h4 className="govuk-label-wrapper">
                    <label
                        className="govuk-label govuk-label--s"
                        htmlFor={`tab-dropdown-section`}
                    >
                        {t("dropdown.title")}
                    </label>
                </h4>
                <div id={`tab-dropdown-section-hint`} className="govuk-hint">
                    {t("dropdown.hint")}
                </div>
                <select
                    value={numberOfSections}
                    onChange={onSectionSelect}
                    className="govuk-select"
                    id={`tab-dropdown-section`}
                    data-testid={`tab-component-dropdown-section`}
                    name={`tab-dropdown-section`}
                    aria-describedby={`tab-dropdown-section-hint`}
                >
                    <option key={0} value={0}>
                        {t("select")}
                    </option>
                    {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                            {num}
                        </option>
                    ))}
                </select>
            </div>
            <button
                className={`govuk-button govuk-button--secondary govuk-!-margin-bottom-7`}
                data-module="govuk-button"
                disabled={isGenerateButtonDisabled()}
                data-testid="design-generate-button"
                onClick={onGenerateClick}
            >
                {i18n("designData.buttons.generate")}
            </button>
            {renderDynamicTable && (
                <TabTableContainer
                    dynamicDataSet={dynamicDataSet}
                    activeCell={activeCell}
                    setActiveCell={setActiveCell}
                    sections={numberOfTabs}
                    setDynamicDataSet={setDynamicDataSet}
                />
            )}
            <details className="govuk-details additional-settings">
                <summary className="govuk-details__summary">
                    <span className="govuk-details__summary-text">
                        {i18n("common.detailsLink.title")}
                    </span>
                </summary>

                <div className="govuk-details__text govuk-checkboxes govuk-form-group">
                    <CssClasses />
                </div>
            </details>
            <>
                <button
                    type="submit"
                    className="govuk-button govuk-!-margin-right-4"
                    disabled={
                        props.isEdit ? isSaveDisabledEdit() : isSaveDisabled()
                    }
                >
                    {i18n("save")}
                </button>
                {props.isEdit && (
                    <>
                        <br />
                        <br />
                        <LinkedPropertiesDetails
                            module={ReportModule.Component}
                            selectedComponent={selectedComponent}
                            confirm={confirm}
                            setConfirm={setConfirm}
                        />
                        <button
                            className="govuk-button govuk-button--warning"
                            type="button"
                            onClick={deleteComponent}
                            disabled={!confirm}
                        >
                            {i18n("delete")}
                        </button>
                    </>
                )}
            </>
        </div>
    );
};

export default TabEdit;
