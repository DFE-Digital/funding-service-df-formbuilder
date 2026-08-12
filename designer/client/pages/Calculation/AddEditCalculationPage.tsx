import React, { useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import {
    BackLink,
    Button,
    ButtonGroup,
    ButtonVariant,
    CheckboxInput,
    Divider,
    GridColumn,
    GridColumnType,
    GridRow,
    Heading,
    HeadingType,
    Hint,
    Label,
    Spacing,
    SpacingUnit,
    Table,
    TextFormComponent,
    ComputeBlock,
    BackModal,
    Para,
} from "../../ui";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    addEntityToComputeList,
    calculationBuilderSelector,
    onAddNewNumberInputBox,
    onAddNewOperatorBox,
    setAddedCalculation,
    setComputeList,
    setSelectedCalculation,
    setSelectedPageOrDataset,
    setRepeatableSection,
    toggleEntitySelect,
    toggleSelectAllEntity,
    onAddCalculationToComputeBlock,
    saveCalculations,
    setTitle,
    resetNewCalculation,
    resetSelectedCalculation,
} from "../../store/reducers/calculationBuilderReducer";
import { i18n } from "../../i18n";
import {
    DataSet,
    DesignedDataSet,
    NumberFieldComponent,
    Page,
    ResultComponent,
    Section,
} from "@xgovformbuilder/model";
import { createColumnHelper } from "@tanstack/react-table";
import { AutocompleteFormComponent } from "../../ui/Input/Autocomplete";
import {
    checkIfAddToComputeBlockDisabled,
    getAllEntitiesId,
    getCalculationOptions,
    getPageDatasetOptions,
    retrieveComponents,
    validateStateToAllowSave,
} from "./utils";
import { ComputeList } from "../../store/types";
import { TickIcon } from "../../components/Icons";

type Props = {
    isEdit?: boolean;
};

type ParamsType = {
    params: { calculationId?: string };
};

/** i18n function for this module */
const t = (key: string) =>
    i18n(`calculationModule.addNewCalculationPage.${key}`);

const AddEditCalculationPage = (props: Props) => {
    const isEdit = props.isEdit || false;
    const [showBackModal, setShowBackModal] = useState(false);
    const dispatch = useAppDispatch();
    const calculations = useAppSelector(calculationBuilderSelector);
    const calculationFormDetail = isEdit
        ? calculations.editCalculation
        : calculations.newCalculation;
    const [clonePreviousState, setClonePreviousState] = useState(
        calculationFormDetail
    );
    const { params }: ParamsType = useRouteMatch();
    const history = useHistory();
    const pageDatasetOptions = getPageDatasetOptions(calculations.form);
    const calculationOptions = getCalculationOptions(calculations);

    const columnHelperForPage = createColumnHelper<
        NumberFieldComponent | ResultComponent
    >();
    const columnHelperForDataSet = createColumnHelper<DataSet>();
    const componentRows = retrieveComponents(
        calculationFormDetail.selectedPageOrDataset as Page
    );
    const datasetRows =
        (calculationFormDetail.selectedPageOrDataset as DesignedDataSet)?.data
            ?.flat()
            .filter((ds) => ds.calc) ?? [];

    const onSaveCalculation = () => {
        dispatch(saveCalculations({ state: calculations, isEdit }));
        // Save calculation and go back to form page
        history.goBack();
    };

    const selectPageOrDataset = (id: string) => {
        dispatch(setSelectedPageOrDataset({ selectedEntityId: id, isEdit }));
        dispatch(setRepeatableSection({ selectedEntityId: id, isEdit }));
    };

    const onComponentSelectToggle = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        dispatch(
            toggleEntitySelect({
                id: e.target.value,
                isComponent: true,
                isRepeatable:
                    calculationFormDetail.repeatableSection?.repeatableSection,
                designedDataSetId: "",
                isEdit,
            })
        );
    };

    const onDatasetSelectToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const id = e.target.value;
        const parts = id.split("-");
        const designedDataSetId = parts[0];
        parts.shift();
        dispatch(
            toggleEntitySelect({
                id: parts.join("-"),
                isComponent: false,
                designedDataSetId: designedDataSetId,
                isEdit,
            })
        );
    };

    const onSelectAllEntitiesToggle = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        dispatch(toggleSelectAllEntity({ isEdit }));
    };

    const componentTableColumns = [
        columnHelperForPage.display({
            id: "radioButton",
            cell: (props) => (
                <CheckboxInput
                    id={"select-component"}
                    name={"select-component"}
                    selectedValue={getAllEntitiesId(
                        calculationFormDetail.selectedEntities
                    )}
                    options={[
                        {
                            key: "select-a-component",
                            value: props.row.original.name,
                            label: "",
                            onChange: onComponentSelectToggle,
                        },
                    ]}
                />
            ),
            header: () => (
                <CheckboxInput
                    id={"select-all-components"}
                    name={"select-all-components"}
                    selectedValue={calculationFormDetail.selectAllEntity}
                    options={[
                        {
                            key: "1",
                            value: "1",
                            label: "",
                            onChange: onSelectAllEntitiesToggle,
                        },
                    ]}
                />
            ),
            size: 55,
        }),
        columnHelperForPage.accessor("title", {
            cell: (info) => info.getValue(),
            header: () => "Component / Design data set",
            size: 300,
            enableSorting: false,
            enableColumnFilter: false,
        }),
        columnHelperForPage.accessor("name", {
            cell: (info) => info.getValue(),
            header: () => "Variable",
            size: 200,
            enableSorting: false,
            enableColumnFilter: false,
        }),
        columnHelperForPage.display({
            id: "repeatable",
            cell: () => <TickIcon />,
            header: () => "R+",
            size: 200,
        }),
    ];

    const datasetTableColumns = [
        columnHelperForDataSet.display({
            id: "radioButton",
            cell: (props) => (
                <CheckboxInput
                    id={"select-dataset"}
                    name={"select-dataset"}
                    selectedValue={getAllEntitiesId(
                        calculationFormDetail.selectedEntities
                    )}
                    options={[
                        {
                            key: `${
                                (calculationFormDetail?.selectedPageOrDataset as DesignedDataSet)
                                    ?.id ?? ""
                            }-${props.row.original.index}`,
                            value: `${
                                (calculationFormDetail?.selectedPageOrDataset as DesignedDataSet)
                                    ?.id ?? ""
                            }-${props.row.original.index}`,
                            label: "",
                            onChange: onDatasetSelectToggle,
                        },
                    ]}
                />
            ),
            header: () => (
                <CheckboxInput
                    id={"select-all-datasets"}
                    name={"select-all-datasets"}
                    selectedValue={calculationFormDetail.selectAllEntity}
                    options={[
                        {
                            key: "1",
                            value: "1",
                            label: "",
                            onChange: onSelectAllEntitiesToggle,
                        },
                    ]}
                />
            ),
            size: 55,
        }),
        columnHelperForDataSet.accessor("index", {
            cell: (info) => calculationFormDetail.selectedPageOrDataset?.title,
            header: () => "Component / Design data set",
            size: 300,
            enableSorting: false,
            enableColumnFilter: false,
        }),
        columnHelperForDataSet.accessor("value", {
            cell: (info) =>
                `${
                    (calculationFormDetail?.selectedPageOrDataset as DesignedDataSet)
                        ?.id ?? ""
                }->${info.getValue()}`,
            header: () => "Variable",
            size: 200,
            enableSorting: false,
            enableColumnFilter: false,
        }),
    ];

    const onAddToComputeBlock = () => {
        dispatch(addEntityToComputeList({ isEdit }));
    };

    const onAddNumberInputBox = () => {
        dispatch(onAddNewNumberInputBox({ isEdit }));
    };
    const onAddOperatorBox = () => {
        dispatch(onAddNewOperatorBox({ isEdit }));
    };

    const selectCalculation = (id: string) => {
        dispatch(setAddedCalculation({ calculationId: id, isEdit }));
    };

    const onCalculationToComputeBlock = () => {
        dispatch(onAddCalculationToComputeBlock({ isEdit }));
    };

    const setNewComputeList = (newList: ComputeList) => {
        dispatch(setComputeList({ newList, isEdit }));
    };

    const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        dispatch(setTitle({ title: value, isEdit }));
    };

    const isCalculationEdited = () => {
        return (
            JSON.stringify(calculationFormDetail) !==
            JSON.stringify(clonePreviousState)
        );
    };
    const onBackModalClose = () => {
        setShowBackModal(false);
    };
    const isNewCalculationEmpty = (calc: typeof calculationFormDetail) => {
        return (
            calc.title === "" &&
            calc.selectedPageOrDataset === null &&
            calc.selectedCalculation === null &&
            calc.isSelectedPage === false &&
            calc.selectAllEntity === "0" &&
            Array.isArray(calc.selectedEntities) &&
            calc.selectedEntities.length === 0 &&
            Array.isArray(calc.computeList) &&
            calc.computeList.length === 0 &&
            calc.addedCalculations === null
        );
    };
    const onBack = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        if (
            isNewCalculationEmpty(calculationFormDetail) ||
            !isCalculationEdited()
        ) {
            onPageBack();
            return;
        }
        setShowBackModal(true);
    };

    const onPageBack = () => {
        if (!isEdit) {
            dispatch(resetNewCalculation());
        } else {
            dispatch(resetSelectedCalculation());
        }
        history.goBack();
    };

    const onModalBack = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        onPageBack();
    };

    useEffect(() => {
        // Populate selectedCalculation from URL
        if (!!calculations.selectedCalculation) return;
        if (!isEdit) return;
        const selectedCalculation = calculations.entities.find(
            (list) => list.name === params.calculationId
        );
        if (!selectedCalculation) return;
        dispatch(setSelectedCalculation(selectedCalculation));
    }, []);

    return (
        <>
            <BackModal
                onClose={onBackModalClose}
                onBack={onModalBack}
                show={showBackModal}
                buttonText={"Exit this page"}
                warningTitle={"Exit this page?"}
            >
                <p className="govuk-body">
                    <Spacing mb={SpacingUnit.Four} />
                    <p className="govuk-!-margin-0 govuk-!-margin-right-9">
                        You will lose all unsaved changes on this page if you
                        leave.
                    </p>
                    <Spacing mb={SpacingUnit.Four} />
                    <div className="govuk-warning-text">
                        <span
                            className="govuk-warning-text__icon"
                            aria-hidden="true"
                        >
                            !
                        </span>
                        <strong className="govuk-warning-text__text">
                            This action cannot be undone
                        </strong>
                    </div>
                </p>
            </BackModal>
            <BackLink onClick={onBack}>{i18n("back")}</BackLink>
            <Heading text={t("heading")} type={HeadingType.M} />
            <Spacing mb={SpacingUnit.Six} />
            <TextFormComponent
                name={"new-calculation-title"}
                label={t("titleField.title")}
                hint={t("titleField.hint")}
                value={calculationFormDetail.title}
                onChange={onTitleChange}
            />
            <Spacing mb={SpacingUnit.Six} />
            <AutocompleteFormComponent
                name={"new-calculation-page-dataset-select"}
                value={
                    calculationFormDetail.isSelectedPage
                        ? (calculationFormDetail.selectedPageOrDataset as Page)
                              ?.path || ""
                        : (calculationFormDetail.selectedPageOrDataset as DesignedDataSet)
                              ?.id || ""
                }
                label={t("pageDatasetSelectField.title")}
                hint={t("pageDatasetSelectField.hint")}
                noResultsText={
                    "No pages or design data set match your search. Check the name of the pages or design data set was entered correctly."
                }
                options={pageDatasetOptions}
                onChange={selectPageOrDataset}
                menuClasses="govuk-!-width-three-quarters"
                inputClasses="govuk-!-width-three-quarters"
                minLength={3}
                showAllValues={false}
                headingText={"Available pages and design datasets"}
            />
            <Spacing mb={SpacingUnit.Eight} />
            <GridRow additionalClasses="add-edit-calculation-row">
                <GridColumn type={GridColumnType.OneHalf}>
                    <Table
                        name={"select-components-from-page"}
                        rows={componentRows}
                        columns={componentTableColumns}
                        renderEmptyMessage
                        emptyMessage="Page or design data set not selected"
                        hide={!calculationFormDetail.isSelectedPage}
                        defaultVisibilityState={{
                            repeatable:
                                calculationFormDetail.repeatableSection
                                    ?.repeatableSection ?? false,
                        }}
                    />
                    <Table
                        name={"select-variable-from-datasets"}
                        rows={datasetRows}
                        columns={datasetTableColumns}
                        renderEmptyMessage
                        emptyMessage="Page or design data set not selected"
                        hide={calculationFormDetail.isSelectedPage}
                    />
                    <Button
                        name={"add-to-compute-block"}
                        text={"Add to compute block"}
                        variant={ButtonVariant.Secondary}
                        onButtonClick={onAddToComputeBlock}
                        isDisabled={checkIfAddToComputeBlockDisabled(
                            calculationFormDetail,
                            false
                        )}
                    />
                    <Divider />
                    <Spacing mb={SpacingUnit.Eight} />
                    <Label text={"Add additional boxes"} bold />
                    <Hint
                        id={"add-number-operator-box"}
                        text={
                            "Add a number input box or an operator box, if needed"
                        }
                    />
                    <Spacing mb={SpacingUnit.Four} />
                    <ButtonGroup>
                        <Button
                            name={"add-number-input-box"}
                            text={"Add number input box"}
                            variant={ButtonVariant.Secondary}
                            onButtonClick={onAddNumberInputBox}
                        />
                        <Button
                            name={"add-operator-box"}
                            text={"Add operator box"}
                            variant={ButtonVariant.Secondary}
                            onButtonClick={onAddOperatorBox}
                        />
                    </ButtonGroup>
                    <Spacing mb={SpacingUnit.Six} />
                    <Divider />
                    <Spacing mb={SpacingUnit.Six} />
                    <AutocompleteFormComponent
                        name={"new-calculation-calculation-select"}
                        value={
                            // calculationFormDetail.selectedCalculation?.name ??
                            ""
                        }
                        label={
                            "Add an existing calculation to the compute block"
                        }
                        hint={
                            "Start typing to find and add a calculation, if needed"
                        }
                        options={calculationOptions}
                        onChange={selectCalculation}
                        minLength={3}
                        showAllValues={false}
                        noResultsText={
                            "No calculations match your search. Check the name of the calculation was entered correctly."
                        }
                        headingText={"List of available calculations"}
                    />
                    <Spacing mb={SpacingUnit.Six} />
                    <Button
                        name={"add-to-compute-block"}
                        text={"Add to compute block"}
                        variant={ButtonVariant.Secondary}
                        onButtonClick={onCalculationToComputeBlock}
                        isDisabled={checkIfAddToComputeBlockDisabled(
                            calculationFormDetail,
                            true
                        )}
                    />
                    <ButtonGroup>
                        <Button
                            name={"add-calculation"}
                            text={"Save Calculation"}
                            isDisabled={
                                !validateStateToAllowSave(
                                    calculationFormDetail
                                ) || !isCalculationEdited()
                            }
                            onButtonClick={onSaveCalculation}
                        />
                    </ButtonGroup>
                </GridColumn>
                <GridColumn
                    type={GridColumnType.OneHalf}
                    additionalClasses="compute-block-column"
                >
                    <ComputeBlock
                        computeList={calculationFormDetail.computeList}
                        onUpdateComputeList={setNewComputeList}
                        isEdit={isEdit}
                    />
                </GridColumn>
            </GridRow>
        </>
    );
};

export default AddEditCalculationPage;
