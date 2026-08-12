import React, { useState, useEffect } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";

import Modal from "../../ui/Modal";
import {
    BackLink,
    Button,
    ButtonGroup,
    ButtonVariant,
    Divider,
    Heading,
    Para,
    RadioInput,
    Spacing,
    SpacingUnit,
    Table,
    TableCell,
    GridColumn,
    CheckboxInput,
    GridColumnType,
    GenericModal,
} from "../../ui";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    calculationBuilderSelector,
    deleteCalculation,
    setSelectedCalculation,
    toggleCalculationSelect,
} from "../../store/reducers/calculationBuilderReducer";
import { i18n } from "../../i18n";
import { Calculation } from "@xgovformbuilder/model";
import { createColumnHelper } from "@tanstack/react-table";
import { Module } from "../../utils/linkedProperties";

type Props = {};

/** i18n function for this module */
const t = (key: string) => i18n(`calculationModule.calculationPage.${key}`);

const CalculationPage = (props: Props) => {
    const dispatch = useAppDispatch();
    const calculations = useAppSelector(calculationBuilderSelector);
    const { path } = useRouteMatch();
    const history = useHistory();
    const columnHelper = createColumnHelper<Calculation>();
    const [calcName, setCalcName] = useState("");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const confirmationMessage = `This will permently delete the calculation: <b>${calcName}</b>`;
    const checkboxMessage = `Confirm permenent deletion`;

    const deleteModal = {
        warning: i18n("calculationModule.deleteCalculation.warning"),
        hint: i18n("calculationModule.deleteCalculation.hint"),
        note: i18n("calculationModule.deleteCalculation.text"),
        confirm: i18n("calculationModule.deleteCalculation.confirm"),
    };

    useEffect(() => {
        if (!calculations.selectedCalculation) return;
        setCalcName(calculations.selectedCalculation.displayName);
    }, [calculations.selectedCalculation]);

    const onCalculationSelectToggle = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        dispatch(toggleCalculationSelect(e.target.value));
    };

    const columns = [
        columnHelper.display({
            id: "radioButton",
            cell: (props) => (
                <RadioInput
                    id={"select-calculation"}
                    name={"select-calculation"}
                    selectedValue={calculations.selectedCalculation?.name || ""}
                    options={[
                        {
                            key: "select-a-calculation",
                            value: props.row.original.name,
                            label: "",
                            onChange: onCalculationSelectToggle,
                        },
                    ]}
                />
            ),
            header: () => "",
            size: 55, //40 + 15
        }),
        columnHelper.accessor("title", {
            id: "calculationTitle",
            cell: (row) => (
                <TableCell>
                    {row.getValue() ?? row.row.original.displayName}
                </TableCell>
            ),
            header: () => "Calculation title",
            enableSorting: false,
            size: 350, //190 + 36
        }),
        columnHelper.accessor("name", {
            id: "variable",
            cell: (row) => <TableCell>{row.getValue()}</TableCell>,
            header: () => "Variable",
            enableSorting: false,
            size: 150, //190 + 36
        }),
        columnHelper.display({
            id: "componentsCount",
            cell: (row) => (
                <TableCell>
                    {row.row.original?.components?.length || 0}
                </TableCell>
            ),
            header: () => "Component count",
            size: 150, //190 + 36
        }),
        columnHelper.display({
            id: "designDataSetCount",
            cell: (row) => (
                <TableCell>{row.row.original?.datasets?.length || 0}</TableCell>
            ),
            header: () => "Design data set count",
            size: 150, //190 + 36
        }),
    ];

    const onAddNewClick = () => {
        history.push(`${path}/new`);
    };

    const onEditClick = () => {
        dispatch(setSelectedCalculation(calculations.selectedCalculation));
        history.push(`${path}/edit/${calculations.selectedCalculation!.name}`);
    };

    const onDeleteClick = () => {
        setShowDeleteModal(true);
    };
    const onDeleteSubmit = async (e) => {
        e.preventDefault();
        dispatch(
            deleteCalculation({
                calcId: calculations.selectedCalculation!.name,
                data: calculations.form,
            })
        );
    };

    const goBack = (event) => {
        event.preventDefault();
        history.push(`/designer/${calculations?.form?.id}`);
        window.location.reload();
    };
    return (
        <>
            <BackLink onClick={goBack}>{i18n("back")}</BackLink>
            <Heading text={t("heading")} />
            <Spacing mb={SpacingUnit.Six} />
            <Para text={t("infoText")} />
            <Spacing mb={SpacingUnit.Six} />
            <ButtonGroup>
                <Button
                    data-testid="add-new-calculation-button"
                    onButtonClick={() => onAddNewClick()}
                    text={t("addCalculation")}
                    additionalClasses="govuk-!-margin-bottom-0"
                    name={"add-new-calculation-button"}
                />
            </ButtonGroup>
            <Divider />
            <Para text={t("editOrDeleteACalculation")} bold />
            <Spacing mb={SpacingUnit.Six} />
            <Table
                name={"calculation-list-table"}
                rows={calculations.entities}
                columns={columns}
                renderEmptyMessage={true}
                emptyMessage={t("emptyDataMessage")}
                renderPagination={true}
                additionalClasses="calc-table"
            />
            <Spacing mb={SpacingUnit.Four} />
            <ButtonGroup>
                <Button
                    variant={ButtonVariant.Secondary}
                    data-testid="edit-calculation-button"
                    onButtonClick={() => onEditClick()}
                    text={t("editCalculation")}
                    additionalClasses="govuk-!-margin-bottom-0"
                    name={"edit-calculation-button"}
                    isDisabled={!calculations.selectedCalculation}
                />
                <Button
                    variant={ButtonVariant.Warning}
                    data-testid="delete-calculation-button"
                    onButtonClick={() => onDeleteClick()}
                    text={t("deleteCalculation")}
                    additionalClasses="govuk-!-margin-bottom-0"
                    name={"delete-calculation-button"}
                    isDisabled={!calculations.selectedCalculation}
                />
            </ButtonGroup>
            <GenericModal
                onClose={function (
                    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
                ): void {
                    setShowDeleteModal(false);
                    setConfirm(false);
                }}
                onDelete={onDeleteSubmit}
                listName={calculations.selectedCalculation?.title}
                show={showDeleteModal}
                warning={deleteModal.warning}
                hint={deleteModal.hint}
                note={deleteModal.note}
                confirm={deleteModal.confirm}
                buttonText="Delete Calculation"
                type={Module.Calculation}
                selectedComponent={calculations.selectedCalculation!}
            />
            <Spacing mb={SpacingUnit.Six} />
        </>
    );
};

export default CalculationPage;
