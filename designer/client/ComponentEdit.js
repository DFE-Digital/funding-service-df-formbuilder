import React, {
    memo,
    useContext,
    useEffect,
    useLayoutEffect,
    useState,
} from "react";
import ComponentTypeEdit from "./ComponentTypeEdit";
import { DataContext } from "./context";
import TabsContext from "./context/TabsContext";
import { ComponentContext } from "./reducers/component/componentReducer";
import { Actions } from "./reducers/component/types";
import ErrorSummary from "./error-summary";
import { hasValidationErrors } from "./validations";
import {
    ComponentTypeEnum,
    ComponentTypeEnum as Types,
} from "@xgovformbuilder/model";
import { updateComponent } from "./data";
import { i18n } from "./i18n";
import { handleLinkedPropertyEffect, Module, PropertyAction } from "./utils";
import LinkedPropertiesDetails from "./utils/LinkedPropertiesDetails";
import { Module as ReportModule } from "./utils/linkedProperties";

const LIST_TYPES = [
    Types.AutocompleteField,
    Types.List,
    Types.RadiosField,
    Types.SelectField,
    Types.YesNoField,
    Types.FlashCard,
];

export function ComponentEdit(props) {
    const { data, save } = useContext(DataContext);
    const { state, dispatch } = useContext(ComponentContext);
    const {
        selectedComponent,
        initialName,
        errors = {},
        hasValidated,
        selectedListName,
    } = state;
    const { title, componentEdited } = selectedComponent || {};
    const { page, toggleShowEditor, componentType } = props;
    const hasErrors = hasValidationErrors(errors);
    const componentToSubmit = { ...selectedComponent };
    const { dynamicDataSet, setDynamicDataSet } = useContext(TabsContext);
    const [clonePreviousState, setClonePreviousState] = useState(
        selectedComponent
    );
    const [confirm, setConfirm] = useState(false);

    const [enableSave, setEnableSave] = useState(false);

    useEffect(() => {
        if (selectedComponent?.type === "Filedownload") {
            selectedComponent?.selectedDocument !== "none" &&
            JSON.stringify(selectedComponent) !==
                JSON.stringify(clonePreviousState)
                ? setEnableSave(true)
                : setEnableSave(false);
        } else if (selectedComponent?.type === "DataImport") {
            componentEdited ||
            (JSON.stringify(selectedComponent) !==
                JSON.stringify(clonePreviousState) &&
                selectedComponent?.title)
                ? setEnableSave(true)
                : setEnableSave(false);
        } else if (
            selectedComponent?.type === "AutocompleteField" ||
            selectedComponent?.type === "SelectField" ||
            selectedComponent?.type === "RadiosField" ||
            selectedComponent?.type === "CheckboxesField"
        ) {
            selectedComponent?.list !== "-1" &&
            selectedComponent?.list !== undefined &&
            JSON.stringify(selectedComponent) !==
                JSON.stringify(clonePreviousState)
                ? setEnableSave(true)
                : setEnableSave(false);
        } else if (selectedComponent?.type === "NumberField") {
            if (selectedComponent?.prefixType) {
                selectedComponent?.prefixType &&
                selectedComponent?.prefixValue !== "" &&
                JSON.stringify(selectedComponent) !==
                    JSON.stringify(clonePreviousState)
                    ? setEnableSave(true)
                    : setEnableSave(false);
            } else {
                JSON.stringify(selectedComponent) !==
                JSON.stringify(clonePreviousState)
                    ? setEnableSave(true)
                    : setEnableSave(false);
            }
        } else if (selectedComponent?.type === "Result") {
            if (selectedComponent?.options.prefixType) {
                selectedComponent?.options.prefixType &&
                selectedComponent?.options.prefixValue !== "" &&
                selectedComponent?.calculationName &&
                selectedComponent?.calculationName !== undefined &&
                (!selectedComponent?.options.suffixType ||
                    selectedComponent?.options.suffixValue !== "") &&
                JSON.stringify(selectedComponent) !==
                    JSON.stringify(clonePreviousState)
                    ? setEnableSave(true)
                    : setEnableSave(false);
            } else {
                selectedComponent?.calculationName &&
                selectedComponent?.calculationName !== undefined &&
                (!selectedComponent?.options.suffixType ||
                    selectedComponent?.options.suffixValue !== "") &&
                JSON.stringify(selectedComponent) !==
                    JSON.stringify(clonePreviousState)
                    ? setEnableSave(true)
                    : setEnableSave(false);
            }
        } else if (selectedComponent?.type === "DateAndTimeField") {
            const selected = document.querySelector(
                'input[name="date-config"]:checked'
            );
            const isRangeMode = selected?.value === "range";

            const hasRangeValue =
                (selectedComponent?.options.dateRangeStart &&
                    selectedComponent?.options.dateRangeStart
                        .split("/")
                        .every(Boolean)) ||
                (selectedComponent?.options.dateRangeEnd &&
                    selectedComponent?.options.dateRangeEnd
                        .split("/")
                        .every(Boolean));
            const isEdited =
                JSON.stringify(selectedComponent) !==
                JSON.stringify(clonePreviousState);

            selectedComponent?.title &&
            (selectedComponent?.addTime || selectedComponent?.date) &&
            isEdited &&
            (!isRangeMode || hasRangeValue)
                ? setEnableSave(true)
                : setEnableSave(false);
        } else {
            JSON.stringify(selectedComponent) !==
            JSON.stringify(clonePreviousState)
                ? setEnableSave(true)
                : setEnableSave(false);
        }
    }, [selectedComponent, componentEdited, clonePreviousState]);

    useLayoutEffect(() => {
        if (hasValidated && !hasErrors) {
            handleSubmit();
        }
    }, [hasValidated, dispatch]);

    const handleSubmit = async (e) => {
        e?.preventDefault();
        const copyData = { ...data };

        if (!hasValidated) {
            dispatch({
                type: Actions.COMPONENT_EDITED,
                payload: false,
            });
            dispatch({ type: Actions.VALIDATE });
            return;
        }

        if (hasErrors) {
            return;
        }

        if (LIST_TYPES.includes(selectedComponent.type)) {
            if (selectedListName !== "static") {
                componentToSubmit.values = {
                    type: "listRef",
                    list: selectedListName,
                };
                delete componentToSubmit.items;
            } else {
                componentToSubmit.values.valueType = "static";
            }
        }

        if (selectedComponent.type === ComponentTypeEnum.Tabs) {
            if (!dynamicDataSet) return;
            const tabs = data?.tabs ?? [];
            const tabData = Object.values(dynamicDataSet);
            const filteredTabs = tabs.filter(
                (tab) => tab.id !== selectedComponent.name
            );
            copyData.tabs = [
                ...filteredTabs,
                {
                    id: selectedComponent.name ?? "",
                    tabData,
                },
            ];
            setDynamicDataSet({});
        }

        let updatedData = updateComponent(
            copyData,
            page.path,
            initialName,
            componentToSubmit
        );
        updatedData = handleLinkedPropertyEffect(
            Module.Component,
            componentToSubmit,
            PropertyAction.Edited,
            updatedData
        );
        await save(updatedData);
        toggleShowEditor();
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        let copy = { ...data };
        copy = handleLinkedPropertyEffect(
            Module.Component,
            selectedComponent,
            PropertyAction.Deleted,
            copy
        );
        const indexOfPage = copy.pages.findIndex((p) => p.path === page.path);
        const indexOfComponent = copy.pages[indexOfPage]?.components.findIndex(
            (component) => component.name === selectedComponent.name
        );
        copy.pages[indexOfPage].components.splice(indexOfComponent, 1);
        await save(copy);
        toggleShowEditor();
    };

    return (
        <>
            {hasErrors && <ErrorSummary errorList={Object.values(errors)} />}
            <form autoComplete="off" onSubmit={handleSubmit}>
                <ComponentTypeEdit
                    page={page}
                    isEdit
                    toggleShowEditor={toggleShowEditor}
                />
                {/* {![
                    // "Result",
                    ComponentTypeEnum.TableDataset,
                    ComponentTypeEnum.Tabs,
                    ComponentTypeEnum.List,
                ].includes(componentType) && (
                    <div className="govuk-warning-text">
                        <span
                            className="govuk-warning-text__icon"
                            aria-hidden="true"
                        >
                            !
                        </span>
                        <strong className="govuk-warning-text__text">
                            <span className="govuk-warning-text__assistive">
                                {i18n("warning")}
                            </span>
                            {i18n("fileuploadComp.deleteInfo")}
                        </strong>
                    </div>
                )} */}

                {![
                    ComponentTypeEnum.TableDataset,
                    ComponentTypeEnum.Tabs,
                    ComponentTypeEnum.List,
                ].includes(componentType) && (
                    <>
                        <button
                            className="govuk-button govuk-!-margin-right-4"
                            type="submit"
                            disabled={!enableSave}
                        >
                            {i18n("save")}
                        </button>
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
                            type="submit"
                            onClick={handleDelete}
                            disabled={!confirm}
                        >
                            {i18n("delete")}
                        </button>
                    </>
                )}
            </form>
        </>
    );
}

export default memo(ComponentEdit);
