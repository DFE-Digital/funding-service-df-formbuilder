// @ts-nocheck
import React, { useState, useContext, useEffect } from "react";
import { withRouter } from "react-router-dom";
//@ts-ignore
import axios from "axios";
import { i18n } from "../../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
    getSelectedFormConfig,
    selectFormConfig,
} from "../../../../store/reducers/dashboardReducer";
import { stringToHTMLFromJSON } from "../../../../utils/stringToHTML";
import { validateDuplicateFormName } from "../../../../validations";
import logger from "../../../../plugins/logger";
import { AppContext } from "../../../../context";
import { currentUserSelector } from "../../../../store/reducers/usersReducer";
import ModalDelete from "../../../../modal-delete";
import Modal from "../../../../ui/Modal";
import {
    Heading,
    Spacing,
    SpacingUnit,
    Button,
    ButtonVariant,
    GridColumn,
    GridColumnType,
    Para,
    CheckboxInput,
} from "../../../../ui";
import {
    deleteFormConfigurations,
    formConfigurationsSelector,
} from "../../../../store/reducers/formConfigurationsReducer";
import { duplicateFormConfiguration } from "../../../../api";
import { setSelectedFormConfig as setSelectedFormConfigForStatus } from "../../../../store/reducers/changeStatusReducer";
import { setSelectedFormConfig as setSelectedFormConfigForDelete } from "../../../../store/reducers/deleteFormReducer";
import { FormStatus } from "@xgovformbuilder/model";
import { setSelectedFormConfig as setSelectedFormConfigForDuplicate } from "../../../../store/reducers/duplicateFormReducer";
import { filterFormsById } from "../../utils";

type Props = {
    isMyForm: boolean;
};

const TableActionButtons = (props: Props) => {
    const dispatch = useAppDispatch();
    const { setLastModifiedForm } = useContext(AppContext);
    const currentUser = useAppSelector(currentUserSelector);
    const { selectedFormConfig, isChild } = useAppSelector(
        getSelectedFormConfig
    );
    const { data } = useAppSelector(formConfigurationsSelector);
    const [error, setError] = useState({});
    const [formName, setFormName] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [disabledButton, setDisabledButton] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const isFormSelected = !!selectedFormConfig;

    const confirmationMessage = `You're about to delete the form <b>${formName}</b> permanently.`;
    const confirmationNote = `<b>Note:</b> Once deleted, it cannot be retrieved.`;
    const checkboxMessage = `Yes, I want to delete the selected form`;

    const duplicateForm = async (formKey: string, formName: string) => {
        try {
            const result = await duplicateFormConfiguration({
                formId: formKey,
                name: formName,
                userName: currentUser.data.name,
                userId: currentUser.data.id,
            });
            if (result.status) {
                const { id } = result;
                setLastModifiedForm({
                    //@ts-ignore
                    formKey: id,
                    formName: formName,
                    formGroup: "MyForms", // When you duplicate a form then it becomes your form
                });
            }
            return result;
        } catch (e) {
            logger.error("ChooseForms", e);
            return {
                status: false,
                error: "server-error",
                id: "",
            };
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFormConfig) return;
        setInputValue(selectedFormConfig.DisplayName);
        const output = await duplicateForm(selectedFormConfig.Key, formName);
        if (!output.status && output.error === "duplicate-name-error") {
            const duplicateFormNameErrors = validateDuplicateFormName(
                "duplicate-form-name",
                "",
                i18n
            );
            const errorsFound = { ...duplicateFormNameErrors };
            setError(errorsFound);
            setDisabledButton(true);
            return;
        }
        window.location.reload();
    };

    const onEdit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        //@ts-ignore
        props.history.push(`/designer/${selectedFormConfig?.Key}`);
        window.location.reload();
    };

    const onDuplicate = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();
        const formConfig = filterFormsById(data, selectedFormConfig.Key);
        dispatch(
            setSelectedFormConfigForDuplicate({
                form: formConfig,
                isChild,
            })
        );
        props.history.push(`/duplicate-form/${selectedFormConfig?.Key}`);
    };

    const onChangeStatus = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();
        const formConfig = filterFormsById(data, selectedFormConfig.Key);
        dispatch(setSelectedFormConfigForStatus(formConfig));
        props.history.push(`/change-form-status/${selectedFormConfig?.Key}`);
    };

    const onGroup = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        //@ts-ignore
        props.history.push(`/group-form/${selectedFormConfig?.Key}`);
    };

    const onSwitchAccess = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();
        if (
            selectedFormConfig?.childAndDependentsForms &&
            selectedFormConfig.childAndDependentsForms.length > 0
        ) {
            props.history.push(
                `/change-accessType-group/${selectedFormConfig?.Key}`
            );
        } else {
            props.history.push(`/change-accessType`, selectedFormConfig?.Key);
        }
    };

    const onDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if (
            (selectedFormConfig?.childAndDependentsForms &&
                selectedFormConfig.childAndDependentsForms.length > 0) ||
            isChild
        ) {
            const formConfig = filterFormsById(data, selectedFormConfig.Key);
            dispatch(
                setSelectedFormConfigForDelete({
                    form: formConfig,
                    isChild,
                })
            );
            props.history.push(`/delete-form/${selectedFormConfig?.Key}`);
        } else {
            setShowDeleteModal(true);
        }
    };

    const onDeleteSubmit = async (e) => {
        e.preventDefault();
        await dispatch(deleteFormConfigurations(selectedFormConfig?.Key));
        setShowDeleteModal(false);
        setConfirm(false);
    };

    useEffect(() => {
        formName.length === 0 || formName === inputValue
            ? setDisabledButton(true)
            : setDisabledButton(false);
    }, [formName]);

    useEffect(() => {
        if (!selectedFormConfig) return;
        setFormName(selectedFormConfig.DisplayName);
        setInputValue(selectedFormConfig.DisplayName);
    }, [selectedFormConfig]);

    return (
        <div className="table-actions-container">
            <button
                className="govuk-button govuk-button--secondary govuk-!-margin-right-6"
                data-module="govuk-button"
                disabled={!isFormSelected}
                onClick={onEdit}
            >
                Edit form
            </button>
            <button
                className="govuk-button govuk-button--secondary govuk-!-margin-right-6"
                data-module="govuk-button"
                disabled={!isFormSelected}
                onClick={onDuplicate}
            >
                Duplicate form
            </button>
            <button
                className="govuk-button govuk-button--secondary govuk-!-margin-right-6"
                data-module="govuk-button"
                disabled={!isFormSelected}
                onClick={onGroup}
            >
                Group form
            </button>
            <button
                className="govuk-button govuk-button--secondary govuk-!-margin-right-6"
                data-module="govuk-button"
                disabled={!isFormSelected}
                onClick={onChangeStatus}
            >
                Change status
            </button>
            <button
                className="govuk-button govuk-button--secondary govuk-!-margin-right-6"
                data-module="govuk-button"
                disabled={!isFormSelected}
                onClick={onSwitchAccess}
            >
                Switch access
            </button>
            {props.isMyForm && (
                <button
                    className="govuk-button govuk-button--warning"
                    data-module="govuk-button"
                    disabled={!isFormSelected}
                    onClick={onDelete}
                >
                    Delete form
                </button>
            )}

            <Modal
                show={showDeleteModal}
                closeStyleOverride={true}
                onHide={function (
                    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
                ): void {
                    setShowDeleteModal(false);
                    setConfirm(false);
                }}
            >
                <Heading text="Are you sure?" />
                <Spacing mb={SpacingUnit.Four} />
                <Para
                    text={confirmationMessage}
                    additionalClasses="govuk-!-margin-right-9"
                />
                <Spacing mb={SpacingUnit.Four} />
                <Para text={confirmationNote} />
                <Spacing mb={SpacingUnit.Four} />
                <CheckboxInput
                    id={"delete-confirm"}
                    name={"delete-confirm"}
                    selectedValue={confirm ? 1 : 0}
                    options={[
                        {
                            key: "1",
                            value: 1,
                            label: checkboxMessage,
                            onChange: (
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                setConfirm((value) => !value);
                            },
                        },
                    ]}
                />
                <Spacing mb={SpacingUnit.Six} />
                <GridColumn
                    type={GridColumnType.OneHalf}
                    additionalClasses="govuk-!-padding-left-0"
                >
                    <Button
                        variant={ButtonVariant.Warning}
                        name={"on-form-delete-confirm-submit"}
                        text={"Delete form"}
                        isDisabled={
                            !confirm ||
                            selectedFormConfig?.FormStatus ===
                                FormStatus.Published
                        }
                        onButtonClick={onDeleteSubmit}
                    />
                </GridColumn>
            </Modal>
        </div>
    );
};

export default withRouter(TableActionButtons);
