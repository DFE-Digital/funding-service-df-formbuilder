import React, { useContext, useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import { Section } from "@xgovformbuilder/model";
import { i18n } from "../../i18n";
import { GenericModal } from "../../ui";

import {
    BackLink,
    Button,
    ButtonGroup,
    ButtonVariant,
    CheckboxInput,
    Divider,
    FlexRow,
    Heading,
    Para,
    RadioInput,
    Spacing,
    SpacingUnit,
    Table,
} from "../../ui";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    deleteSection,
    formSectionSelector,
    selectSection,
} from "../../store/reducers/formSectionReducer";
import Cell from "../../ui/Table/custom/Cell";
import { Module } from "../../utils/linkedProperties";

type Props = {};

type ParamType = {
    url: string;
    path: string;
    params: { id: string };
};

const FormSectionPage = (props: Props) => {
    const [showModal, setShowModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const dispatch = useAppDispatch();
    const formSections = useAppSelector(formSectionSelector);
    const { path, params }: ParamType = useRouteMatch();
    const history = useHistory();
    const columnHelper = createColumnHelper<Section>();
    const hasSelectedSection = !!formSections.selectedSection?.name;

    const deleteModal = {
        warning: i18n("section.deleteSection.warning"),
        hint: i18n("section.deleteSection.hint"),
        note: i18n("section.deleteSection.text"),
        confirm: i18n("section.deleteSection.confirm"),
    };

    const goBack = (event) => {
        event.preventDefault();
        history.push(`/designer/${formSections?.form?.id}`);
        window.location.reload();
    };

    const onModalHide = () => {
        setShowModal(false);
    };

    const onSectionSelect = (section: Section) => {
        dispatch(selectSection(section));
    };

    const onAddNewSection = (
        event: React.MouseEvent<
            HTMLAnchorElement | HTMLButtonElement,
            MouseEvent
        >
    ) => {
        event.preventDefault();
        history.push(`${path}/new`);
    };

    const onEditSection = (
        event: React.MouseEvent<
            HTMLAnchorElement | HTMLButtonElement,
            MouseEvent
        >
    ) => {
        event.preventDefault();
        history.push(`${path}/edit`);
    };

    const onDeleteSection = (
        event: React.MouseEvent<
            HTMLAnchorElement | HTMLButtonElement,
            MouseEvent
        >
    ) => {
        event.preventDefault();
        dispatch(deleteSection({ state: formSections }));
        setConfirmDelete(false);
        setShowModal(false);
    };

    const onConfirmDelete = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmDelete((val) => !val);
    };

    const onDeleteModalToggle = () => {
        setShowModal(true);
    };

    const columns = [
        columnHelper.display({
            id: "radioButton",
            cell: (row) => (
                <RadioInput
                    id={`section-${row.row.original.name}`}
                    name={"form-section"}
                    selectedValue={formSections.selectedSection?.name}
                    options={[
                        {
                            key: row.row.original.name,
                            value: row.row.original.name,
                            label: "",
                            onChange: () => {
                                onSectionSelect(row.row.original);
                            },
                        },
                    ]}
                />
            ),
            header: () => "",
        }),
        columnHelper.accessor("title", {
            id: "sectionTitle",
            cell: (row) => (
                <Cell>
                    <span title={row.getValue()}>{row.getValue()}</span>
                </Cell>
            ),
            header: () => "Section title",
            enableSorting: false,
        }),
        columnHelper.display({
            id: "repeatableSectionAvailable",
            cell: (row) => (
                <Cell>
                    <span>
                        {row.row.original?.repeatableSection ? "Yes" : "No"}
                    </span>
                </Cell>
            ),
            header: () => "Repeatable section available",
        }),
    ];
    return (
        <>
            <BackLink onClick={goBack}>Back</BackLink>
            <Heading text="Add or edit sections" />
            <Spacing mb={SpacingUnit.Five} />
            <Para
                text={
                    "Use sections to group pages in sequence, You can also use this to make certain pages repeatable by adding a repeatable section to the form."
                }
            />
            <Spacing mb={SpacingUnit.Five} />
            <Button
                text="Add section"
                name={"add-section"}
                onButtonClick={onAddNewSection}
                additionalClasses="govuk-!-margin-bottom-3"
            />
            <Divider />
            <Spacing mb={SpacingUnit.Five} />
            <Para text={"Edit or delete the following sections"} />
            <Spacing mb={SpacingUnit.Four} />
            <Table
                columns={columns}
                rows={formSections.entities}
                name={"form-section-table"}
                additionalClasses="form-section-table"
                emptyMessage="No section found"
                renderEmptyMessage={true}
                renderPagination={true}
            />
            <Spacing mb={SpacingUnit.Six} />
            <ButtonGroup>
                <Button
                    name={"edit-section"}
                    text={"Edit section"}
                    variant={ButtonVariant.Secondary}
                    isDisabled={!hasSelectedSection}
                    onButtonClick={onEditSection}
                />
                <Button
                    name={"delete-section"}
                    text={"Delete section"}
                    variant={ButtonVariant.Warning}
                    isDisabled={!hasSelectedSection}
                    onButtonClick={onDeleteModalToggle}
                />
            </ButtonGroup>

            {/* ✅ Modal usage */}
            <GenericModal
                onClose={onModalHide}
                onDelete={onDeleteSection}
                listName={formSections.selectedSection?.title}
                show={showModal}
                warning={deleteModal.warning}
                hint={deleteModal.hint}
                note={deleteModal.note}
                confirm={deleteModal.confirm}
                buttonText="Delete Section"
                type={Module.Section}
                selectedComponent={formSections.selectedSection!}
            />
        </>
    );
};

export default FormSectionPage;
