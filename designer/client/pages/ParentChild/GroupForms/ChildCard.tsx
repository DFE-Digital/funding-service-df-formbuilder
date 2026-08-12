import React, { useState } from "react";

import { WeighingUnit } from "../../../ui/Link";

import { GenericModal, LinkComponent, Spacing, SpacingUnit } from "../../../ui";
import { ChildConfig } from "../../../store/types";
import {
    removeChildConfig,
    setEditChild,
} from "../../../store/reducers/parentChildReducer";
import { useAppDispatch } from "../../../store/hooks";
import { i18n } from "../../../i18n";
import { DependentFormStatus } from "../../../utils";

type Props = {
    id: string;
    index: number;
    item: ChildConfig;
    isEdit?: boolean;
};

function ChildCard(props: Props) {
    const dispatch = useAppDispatch();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { childId, childFormName } = props.item;

    const statusMap = {
        [DependentFormStatus.InProgress]: "In progress",
        [DependentFormStatus.Completed]: "Completed",
    };

    const deleteModal = {
        warning: i18n("childCard.removeChildCards.warning"),
        hint: i18n("childCard.removeChildCards.hint"),
        hintNote: i18n("childCard.removeChildCards.hintNote"),
        note: i18n("childCard.removeChildCards.text"),
        confirm: i18n("childCard.removeChildCards.confirm"),
    };

    const handleEdit = () => {
        dispatch(setEditChild({ item: props.item, index: props.index }));
    };

    const onDeleteModalClose = () => {
        setShowDeleteModal(false);
    };

    const onFinalDelete = () => {
        setShowDeleteModal(false);
        dispatch(removeChildConfig(props.index));
    };

    const handleRemove = () => {
        setShowDeleteModal(true);
    };

    return (
        <div className="child-card-container">
            <table className="govuk-label">
                <tr>
                    <td className="govuk-body">
                        <span>
                            <strong>C{props.index + 1}</strong>
                        </span>
                        <span>&nbsp;{" | "}&nbsp;</span>
                    </td>
                    <td className="govuk-body">
                        <span>
                            <strong>Form Name: </strong>
                        </span>
                        <span title="Column Name">
                            {props.item.childFormName}
                        </span>
                    </td>
                </tr>
            </table>
            <div className="dependencies-container ml-30">
                <div className="child-dependencies">
                    <table className="dependent-form-table-2">
                        <tr className="govuk-table__row  govuk-label--s govuk-body">
                            <td>Dependent form name</td>
                            <td>Dependent form submission status</td>
                        </tr>
                        {props.item.dependentforms.length === 0 && (
                            <tr className="govuk-table__row govuk-body">
                                <td>-</td>
                                <td>-</td>
                            </tr>
                        )}
                        {props.item.dependentforms.map((dptForms) => (
                            <tr
                                key={dptForms.id}
                                className="govuk-table__row govuk-body"
                            >
                                <td>
                                    <span title={dptForms.name}>
                                        {dptForms.name}
                                    </span>
                                </td>
                                <td>
                                    {dptForms?.status
                                        ? statusMap[dptForms.status]
                                        : ""}
                                </td>
                            </tr>
                        ))}
                    </table>
                </div>
                <Spacing mb={SpacingUnit.Four} />
                <div className="date-time-container">
                    <div className="govuk-label--s govuk-label">
                        Date and time dependency
                    </div>
                    <span className="govuk-label">
                        {props.item.dateComponent
                            ? props.item.dateComponent
                            : "-"}
                    </span>
                </div>
                <Spacing mb={SpacingUnit.Four} />
                <div className="help-container">
                    <div className="govuk-label--s govuk-label">Help text</div>
                    <span className="govuk-label">
                        {props.item.helpText ? props.item.helpText : "-"}
                    </span>
                </div>
                <div className="help-container">
                    <div className="govuk-label--s govuk-label">Condition</div>
                    <span className="govuk-label">
                        {props.item.condition && props.item.conditionName
                            ? props.item.conditionName
                            : "-"}
                    </span>
                </div>
                {!props.isEdit && (
                    <>
                        <Spacing mb={SpacingUnit.Six} />
                        <LinkComponent
                            text="Edit"
                            onClick={handleEdit}
                            weight={WeighingUnit.BOLD}
                        />{" "}
                        <Spacing pr={SpacingUnit.Two} />
                        <span className="govuk-body separator">|</span>
                        <Spacing pl={SpacingUnit.Two} />
                        <LinkComponent
                            text="Remove"
                            color="red"
                            onClick={handleRemove}
                            weight={WeighingUnit.BOLD}
                        />
                    </>
                )}
                <Spacing mb={SpacingUnit.Six} />
                <GenericModal
                    onClose={onDeleteModalClose}
                    onDelete={onFinalDelete}
                    listName={childFormName ?? ""}
                    show={showDeleteModal}
                    warning={deleteModal.warning}
                    hint={deleteModal.hint}
                    hintNote={deleteModal.hintNote}
                    note={deleteModal.note}
                    confirm={deleteModal.confirm}
                    buttonText="Remove child card"
                />
            </div>
        </div>
    );
}

export default ChildCard;
