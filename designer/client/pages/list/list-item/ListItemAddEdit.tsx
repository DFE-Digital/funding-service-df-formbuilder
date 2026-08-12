import React, { useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { i18n } from "../../../i18n";
import {
    BackLink,
    BackModal,
    LabelSizes,
    SelectInput,
    Spacing,
    SpacingUnit,
    TextFormComponent,
} from "../../../ui";
import {
    listSelector,
    setListItemHelpText,
    setListItemText,
    setListItemValue,
    setListItemCondition,
    setListItemLinks,
    addListItemtoList,
    resetNewListItem,
    newList as newListObj,
    newListItem as newListItemObj,
} from "../../../store/reducers/listReducer";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { Flyout } from "../../../components/Flyout";
import ConditionsEdit from "../../../conditions/ConditionsEdit";

//@ts-ignore
import { constructPathFromData, isListItemEdited } from "../utils";
import { ListEntity } from "../../../store/types";

type Props = {
    isEdit: boolean;
};

const ListItemAddEdit = ({ isEdit }: Props) => {
    const dispatch = useAppDispatch();
    const { form, newListItem, selectedListItem } = useAppSelector(
        listSelector
    );
    const history = useHistory();
    const { url, params } = useRouteMatch();
    //@ts-ignore
    const listId = params?.listId ?? "";
    //@ts-ignore
    const itemIndex = params?.itemIndex ?? "";
    const listItem = isEdit ? selectedListItem : newListItem;
    const originalList = isEdit
        ? (form.lists.find((obj) => obj.name === listId) as ListEntity) ??
          newListObj
        : newListObj;
    const originalListItem = isEdit
        ? originalList.items[itemIndex] ?? newListItemObj
        : newListItemObj;
    const { conditions } = form;
    const [showCondition, setShowCondition] = useState(false);
    const [showBackModal, setShowBackModal] = useState(false);
    const selectOptions = conditions.map((condition) => {
        return {
            id: condition.name,
            key: condition.name,
            title: condition.displayName,
        };
    });

    const canSaveListItem = () => {
        const { text, value } = listItem;
        if (text && value) {
            return true;
        }
        return false;
    };

    const onBack = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        if (!isListItemEdited(originalListItem, listItem)) {
            onPageBack();
            return;
        }
        setShowBackModal(true);
    };

    const onListItemTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value ?? "";
        dispatch(setListItemText({ title, isEdit }));
    };

    const onListItemHelpTextChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const helpText = e.target.value ?? "";
        dispatch(setListItemHelpText({ helpText, isEdit }));
    };

    const onListItemValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value ?? "";
        const value = inputValue.replace(";", "").replace(",", "");
        dispatch(setListItemValue({ value, isEdit }));
    };

    const onListItemLinksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const links = e.target.value ?? "";
        dispatch(setListItemLinks({ links, isEdit }));
    };

    const onListItemConditionChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const condition = e.target.value !== "none" ? e.target.value : "";
        dispatch(setListItemCondition({ condition, isEdit }));
    };

    const onSaveNewListItem = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        dispatch(
            addListItemtoList({ listId, isEdit, itemIndex: Number(itemIndex) })
        );
        const path = constructPathFromData(listId, form.id);
        history.push(path);
    };

    const onBackModalClose = () => {
        setShowBackModal(false);
    };

    const onPageBack = () => {
        if (!isEdit) {
            dispatch(resetNewListItem());
        }
        history.goBack();
    };

    const onModalBack = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        onPageBack();
    };

    return (
        <div className="list-item-container">
            <BackModal
                onClose={onBackModalClose}
                onBack={onModalBack}
                show={showBackModal}
                buttonText={"Take me back"}
                warningTitle={"Are you sure?"}
            >
                <p className="govuk-body">
                    Do you want to leave your existing screen? This will{" "}
                    <span className="govuk-!-font-weight-bold">
                        result in loss of all the data
                    </span>{" "}
                    you have entered.
                </p>
            </BackModal>
            <div className="list-page-backlink-container">
                <BackLink onClick={onBack}>Back</BackLink>
            </div>
            <h4 className="govuk-heading-m">{i18n("list.item.add")}</h4>
            <TextFormComponent
                name="list-item-title"
                label={i18n("list.item.titleField.title")}
                labelSize={LabelSizes.S}
                hint={i18n("list.item.titleField.helpText")}
                onChange={onListItemTitleChange}
                value={listItem.text}
            />
            <Spacing mb={SpacingUnit.Six} />
            <TextFormComponent
                name="list-item-help-text"
                label={i18n("list.item.helpTextField.title")}
                labelSize={LabelSizes.S}
                hint={i18n("list.item.helpTextField.helpText")}
                onChange={onListItemHelpTextChange}
                value={listItem.description}
            />
            <Spacing mb={SpacingUnit.Six} />
            <TextFormComponent
                name="list-item-value"
                label={i18n("list.item.valueField.title")}
                labelSize={LabelSizes.S}
                hint={i18n("list.item.valueField.helpText")}
                onChange={onListItemValueChange}
                value={listItem.value}
            />
            <Spacing mb={SpacingUnit.Six} />
            <TextFormComponent
                name="list-item-link"
                label={i18n("list.item.linkField.title")}
                labelSize={LabelSizes.S}
                hint={i18n("list.item.linkField.helpText")}
                onChange={onListItemLinksChange}
                value={listItem.links}
            />
            <Spacing mb={SpacingUnit.Six} />
            <div className="govuk-form-group" data-testid="newlist-item">
                <label
                    className="govuk-label govuk-label--s"
                    htmlFor="newlist-item"
                >
                    {i18n("list.item.conditionField.title")}
                </label>
                <div id="newlist-item-hint" className="govuk-hint">
                    {i18n("list.item.conditionField.helpText")}
                </div>
                <SelectInput
                    id={"list-select-dataset"}
                    name="list-select-dataset"
                    value={listItem.condition ?? ""}
                    options={selectOptions}
                    onChange={onListItemConditionChange}
                />
                <button
                    className="import-dataset-link govuk-link govuk-!-margin-top-2 govuk-body govuk-!-margin-bottom-0"
                    onClick={() => setShowCondition(!showCondition)}
                >
                    Set a new condition
                </button>
            </div>
            {showCondition && (
                <div id="edit-conditions" data-testid="edit-conditions">
                    <Flyout
                        title={i18n("conditions.addOrEdit")}
                        onHide={() => setShowCondition(false)}
                    >
                        <ConditionsEdit path={""} />
                    </Flyout>
                </div>
            )}

            <div className="save-list-item-container govuk-!-margin-top-6">
                <button
                    className="govuk-button"
                    type="button"
                    disabled={!canSaveListItem()}
                    onClick={onSaveNewListItem}
                >
                    Save list item
                </button>
            </div>
        </div>
    );
};

export default ListItemAddEdit;
