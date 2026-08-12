import React, {
    useEffect,
    useContext,
    useState,
    useLayoutEffect,
    FormEvent,
} from "react";
import { ComponentDef, ComponentTypeEnum, Page } from "@xgovformbuilder/model";

import { i18n } from "../../i18n";
import { ErrorSummary } from "../../error-summary";
import { hasValidationErrors } from "../../validations";
import ComponentTypeEdit from "../../ComponentTypeEdit";
import { ComponentCreateList } from "./ComponentCreateList";
import { BackLink } from "../BackLink";

import { Actions } from "../../reducers/component/types";
import { DataContext } from "../../context";
import { ComponentContext } from "../../reducers/component/componentReducer";

import "./ComponentCreate.scss";
import { addComponent } from "../../data/component";
import logger from "../../plugins/logger";
import TabsContext from "../../context/TabsContext";
function useComponentCreate(props) {
    const [renderTypeEdit, setRenderTypeEdit] = useState<boolean>(false);
    const { data, save } = useContext(DataContext);
    const { state, dispatch } = useContext(ComponentContext);
    const { dynamicDataSet, setDynamicDataSet } = useContext(TabsContext);
    const { selectedComponent, errors = {}, hasValidated } = state;
    const { page, toggleAddComponent = () => {} } = props;

    const [isSaving, setIsSaving] = useState(false);
    const hasErrors = hasValidationErrors(errors);

    useEffect(() => {
        // render in the next re-paint to allow the DOM to reflow without the list
        // thus resetting the Flyout wrapper scrolling position
        // This is a quick work around the bug in small screens
        // where once user scrolls down the components list and selects one of the bottom components
        // then the component edit screen renders already scrolled to the bottom
        let isMounted = true;

        if (selectedComponent?.type) {
            window.requestAnimationFrame(() => {
                if (isMounted) setRenderTypeEdit(true);
            });
        } else {
            setRenderTypeEdit(false);
        }

        return () => {
            isMounted = false;
        };
    }, [selectedComponent?.type]);

    useEffect(() => {
        dispatch({ type: Actions.SET_PAGE, payload: page.path });
    }, [page.path]);

    useLayoutEffect(() => {
        if (hasValidated && !hasErrors) {
            handleSubmit()
                .then()
                .catch((err) => {
                    logger.error("ComponentCreate", err);
                });
        }
    }, [hasValidated, hasErrors]);

    const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
        const copyData = { ...data };
        const { selectedComponent } = state;
        e?.preventDefault();

        if (!hasValidated) {
            dispatch({ type: Actions.VALIDATE });
            return;
        }

        if (hasErrors) {
            return;
        }

        if (selectedComponent.type === ComponentTypeEnum.Tabs) {
            if (!dynamicDataSet) return;
            const tabs = data?.tabs ?? [];
            const tabData = Object.values(dynamicDataSet);
            copyData.tabs = [
                ...tabs,
                {
                    id: selectedComponent.name ?? "",
                    tabData,
                },
            ];
            setDynamicDataSet({});
        }

        setIsSaving(true);

        const updatedData = addComponent(
            copyData,
            (page as Page).path,
            selectedComponent
        );

        await save(updatedData);
        toggleAddComponent();
    };

    const handleTypeChange = (component: ComponentDef) => {
        dispatch({
            type: Actions.EDIT_TYPE,
            payload: {
                type: component.type,
            },
        });
    };

    const reset = (e) => {
        e.preventDefault();
        dispatch({ type: Actions.SET_COMPONENT });
    };

    return {
        handleSubmit,
        handleTypeChange,
        hasErrors,
        errors: Object.values(errors),
        component: selectedComponent,
        isSaving,
        reset,
        renderTypeEdit,
    };
}

export function ComponentCreate(props) {
    const {
        handleSubmit,
        handleTypeChange,
        reset,
        hasErrors,
        errors,
        component,
        isSaving,
        renderTypeEdit,
    } = useComponentCreate(props);

    const type = component?.type;

    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        if (component?.type === "Filedownload") {
            component?.title && component?.selectedDocument
                ? setDisabled(false)
                : setDisabled(true);
        } else if (component?.type === "DataImport") {
            //@ts-ignore
            component?.title && component?.columns?.length > 0
                ? setDisabled(false)
                : setDisabled(true);
        } else if (
            // component?.type === "FlashCard" ||
            component?.type === "AutocompleteField" ||
            component?.type === "SelectField" ||
            component?.type === "RadiosField" ||
            component?.type === "CheckboxesField"
        ) {
            component?.title &&
            component?.list !== "-1" &&
            component?.list !== undefined
                ? setDisabled(false)
                : setDisabled(true);
        } else if (component?.type === "NumberField") {
            if (
                component?.title &&
                component?.prefixType === undefined &&
                component?.prefixValue === undefined
            ) {
                setDisabled(false);
            } else if (
                component?.title &&
                (component?.prefixType === "" || component?.prefixValue === "")
            ) {
                setDisabled(true);
            } else {
                component?.title &&
                component?.prefixType &&
                component?.prefixValue
                    ? setDisabled(false)
                    : setDisabled(true);
            }
        } else if (component?.type === "Result") {
            if (
                component?.title &&
                component?.calculationName &&
                (!component?.options?.prefixType ||
                    component?.options?.prefixValue !== "") &&
                (!component?.options?.suffixType ||
                    component?.options?.suffixValue !== "")
            ) {
                setDisabled(false);
            } else {
                component?.title &&
                component?.calculationName &&
                (component?.options?.prefixType
                    ? component?.options?.prefixValue !== ""
                    : true) &&
                (!component?.options?.suffixType ||
                    component?.options?.suffixValue !== "")
                    ? setDisabled(false)
                    : setDisabled(true);
            }
        } else if (component?.type === "DateAndTimeField") {
            component?.title && (component?.addTime || component?.date)
                ? setDisabled(false)
                : setDisabled(true);
        } else {
            //@ts-ignore
            component?.title || component?.content
                ? setDisabled(false)
                : setDisabled(true);
        }
    }, [component]);

    return (
        <div className="component-create" data-testid={"component-create"}>
            {!type && (
                <h4 className="govuk-heading-m">{i18n("component.create")}</h4>
            )}
            {type && (
                <>
                    <BackLink onClick={reset}>
                        {i18n("Back to create component list")}
                    </BackLink>
                    <h4 className="govuk-heading-m">
                        {/* {component?.["type"] === "Result"
                            ? i18n(
                                  `fieldTypeToName.${component?.["type"]}_info`
                              )
                            : i18n(
                                  `fieldTypeToName.${component?.["type"]}`
                              )}{" "}
                        {component?.["type"] !== "Result" &&
                            i18n("component.component")} */}
                        {i18n(`fieldTypeToName.${component?.["type"]}`)}{" "}
                        {i18n("component.component")}
                    </h4>
                </>
            )}
            {hasErrors && <ErrorSummary errorList={errors} />}
            {!type && (
                <ComponentCreateList onSelectComponent={handleTypeChange} />
            )}
            {type && renderTypeEdit && (
                <form onSubmit={handleSubmit}>
                    {type && <ComponentTypeEdit page={props.page} />}
                    {![
                        // "Result",
                        ComponentTypeEnum.TableDataset,
                        ComponentTypeEnum.Tabs,
                        ComponentTypeEnum.List,
                    ].includes(type) && (
                        <button
                            type="submit"
                            className="govuk-button"
                            disabled={disabled}
                        >
                            Save
                        </button>
                    )}
                </form>
            )}
        </div>
    );
}

export default ComponentCreate;
