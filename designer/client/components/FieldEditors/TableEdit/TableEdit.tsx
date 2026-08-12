import { Page } from "@xgovformbuilder/model";
import React, { useContext, useState } from "react";
import { DataContext } from "../../../context";
import { i18n } from "../../../i18n";
import { ComponentContext } from "../../../reducers/component/componentReducer";
import { Actions } from "../../../reducers/component/types";
import { CssClasses } from "../../CssClasses";
import DesignScreen from "../../DesignData/DesignScreen";
import { Flyout } from "../../Flyout";
import LinkedPropertiesDetails from "../../../utils/LinkedPropertiesDetails";
import { Module as ReportModule } from "../../../utils/linkedProperties";
import {
    handleLinkedPropertyEffect,
    PropertyAction,
    Module,
} from "../../../utils";

const t = (str: string) => i18n("table." + str);

type Props = {
    page: Page;
    isEdit?: boolean;
    toggleShowEditor?: () => void;
};

const TableEdit = (props: Props) => {
    const { data, save } = useContext(DataContext);
    const designedDataSets = data?.designedDataSets ?? [];
    const { state, dispatch } = useContext(ComponentContext);
    //@ts-ignore
    const { selectedComponent, errors = {}, hasValidated, initialName } = state;
    //@ts-ignore
    const { name, title, type, hint, content = "" } = selectedComponent;
    const [clonePreviousState, setClonePreviousState] = useState(
        selectedComponent
    );
    const [showDesignScreen, setShowDesignScreen] = useState(false);
    const [confirm, setConfirm] = useState(false);

    /** Checks if a dataset is selected */
    const isDisabled = () => !content || !title;

    /** Checks if a dataset is selected and also if data has been modified */
    const isDisabledEdit = () => {
        if (
            JSON.stringify(selectedComponent) ===
            JSON.stringify(clonePreviousState)
        ) {
            return true;
        }
        if (content && title) {
            return false;
        }
        return true;
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
        await save(copy);
        if (props.toggleShowEditor) {
            props.toggleShowEditor();
        }
    };

    /** Add dataset id to Component - Content (on dropdown select) */
    const onDataSetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault();
        dispatch({
            type: Actions.EDIT_CONTENT,
            payload: e.target.value,
        });
    };

    /** Toggle design data set screen */
    const onDesignDataSet = (
        e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
    ) => {
        e.preventDefault();
        setShowDesignScreen(true);
    };

    if (showDesignScreen) {
        return (
            <Flyout
                show={showDesignScreen}
                onHide={() => setShowDesignScreen(false)}
                width="md2"
            >
                <DesignScreen
                    isEdit={false}
                    setShowDesignScreen={setShowDesignScreen}
                    selectedId={undefined}
                />
            </Flyout>
        );
    }

    return (
        <div>
            <div className="govuk-form-group">
                <h4 className="govuk-label-wrapper">
                    <label
                        className="govuk-label govuk-label--s"
                        htmlFor={`table-dropdown-dataset`}
                    >
                        {t("dropdown.title")}
                    </label>
                </h4>
                <div id={`table-dropdown-dataset-hint`} className="govuk-hint">
                    {t("dropdown.hint")}
                </div>
                <select
                    value={content}
                    onChange={onDataSetSelect}
                    className="govuk-select"
                    id={`table-dropdown-dataset`}
                    data-testid={`table-component-dropdown-dataset`}
                    name={`table-dropdown-dataset`}
                    aria-describedby={`table-dropdown-dataset-hint`}
                >
                    <option key={""} value={""}>
                        {t("select")}
                    </option>
                    {designedDataSets.map((dataset) => (
                        <option key={dataset.id} value={dataset.id}>
                            {dataset.title}
                        </option>
                    ))}
                </select>
            </div>
            <div className="govuk-!-margin-bottom-8">
                <a
                    href="#"
                    className="govuk-body govuk-link"
                    onClick={onDesignDataSet}
                >
                    {t("designNewDataSet")}
                </a>
            </div>
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
                    disabled={props.isEdit ? isDisabledEdit() : isDisabled()}
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

export default TableEdit;
