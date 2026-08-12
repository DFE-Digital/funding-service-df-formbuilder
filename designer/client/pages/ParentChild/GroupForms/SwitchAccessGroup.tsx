import React, { useEffect, useState, useContext } from "react";
import { CellContext, createColumnHelper } from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
    getFormData,
    parentChildSelector,
    resetParentChild,
    setSelectedParentForm,
} from "../../../store/reducers/parentChildReducer";
import { i18n } from "../../../i18n";
import { useHistory, useRouteMatch } from "react-router-dom";
import {
    GridColumn,
    GridRow,
    Spacing,
    SpacingUnit,
    Table,
    TableCaptionSize,
    RadioOption,
    RadioFormComponent,
    LegendSizes,
    BackLink,
    Hint,
    Para,
    CheckboxInput,
    Loader,
    formNameColumn,
    formStatusColumn,
    formAccessTypeColumn,
    formCreatedByColumn,
    formDetailsColumn,
    TableCell,
} from "../../../ui";
import { FormConfigurationWithChild, LoadingState } from "../../../store/types";
import {
    formConfigurationsSelector,
    listFormConfigurations,
} from "../../../store/reducers/formConfigurationsReducer";
import { FormAccessType } from "@xgovformbuilder/model";
import DFESignInAdditionalLabel from "../../../components/ChangeFormAccessType/DFESignInAdditionalLabel";
import { AppContext } from "../../../context";
import SwitchAccessSubmission from "./SwitchAccessSubmission";
import { FormConfigurationTabs } from "../../../utils";

const SwitchAccessGroup = () => {
    const dispatch = useAppDispatch();
    const parentChild = useAppSelector(parentChildSelector);
    const formConfigs = useAppSelector(formConfigurationsSelector);
    const { uploadedFile, setPreviouslyUploadedFile } = useContext(AppContext);
    const selectedParentForm = parentChild.selectedParentForm!;
    const [selectedForms, setSelectedForms] = useState<string[]>([]);
    const [showLoader, setShowLoader] = useState(false);
    const [radioValue, setRadioValue] = useState<FormAccessType | null>(null);
    const onRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value as FormAccessType;
        setRadioValue(value);
    };
    const radioOptions: RadioOption[] = [
        {
            key: FormAccessType.Public,
            value: FormAccessType.Public,
            label: "Public",
            onChange: onRadioChange,
        },
        {
            key: FormAccessType.DFESignIn,
            value: FormAccessType.DFESignIn,
            label: "DFE SignIn",
            onChange: onRadioChange,
        },
    ];
    const { url, params } = useRouteMatch<{ parentId?: string }>();
    const canRender =
        formConfigs.loading === LoadingState.Succeeded &&
        parentChild.selectedParentForm
            ? true
            : false;
    const history = useHistory();
    const columnHelper = createColumnHelper<FormConfigurationWithChild>();
    const [selectedParent, setSelectedParent] = useState<string>("");
    const [selectedDependents, setSelectedDependents] = useState<string[]>([]);
    const rows = [selectedParentForm];
    const childRows = selectedParentForm?.childs ?? [];
    const [serverError, setServerError] = useState(false);

    useEffect(() => {
        if (formConfigs.loading === LoadingState.Idle) {
            dispatch(listFormConfigurations());
        }
        if (parentChild.loading === LoadingState.Idle) {
            dispatch(getFormData(params.parentId!));
        }
        setShowLoader(true);
    }, []);

    useEffect(() => {
        if (formConfigs.loading === LoadingState.Succeeded) {
            let selectedForm: FormConfigurationWithChild | null = null;
            formConfigs.data.some((form) => {
                if (form.Key === params.parentId!) {
                    selectedForm = form;
                    return true;
                }
            });
            if (!selectedForm) return;
            dispatch(setSelectedParentForm(selectedForm));
            setShowLoader(false);
        }
    }, [formConfigs]);

    useEffect(() => {
        if (selectedParentForm && parentChild.selectedFormData) {
            if (allHaveSameAccessType()) {
                const value = selectedParentForm.signInRequired
                    ? FormAccessType.DFESignIn
                    : FormAccessType.Public;
                setRadioValue(value);
                setPreviouslyUploadedFile(parentChild.selectedFormData?.file);
            }
        }
    }, [selectedParentForm, parentChild.selectedFormData]);

    useEffect(() => {
        const allForms: string[] = [selectedParent, ...selectedDependents];
        setSelectedForms(allForms);
    }, [selectedParent, selectedDependents]);

    const allHaveSameAccessType = () => {
        const parentAccessType = selectedParentForm.signInRequired;
        let childSame = selectedParentForm.childs.every(
            (c) => !!c.signInRequired === !!parentAccessType
        );
        return childSame;
    };

    const ParentFormSelection = columnHelper.display({
        id: "switchAccess-checkbox",
        cell: (props) => {
            const formConfig = props.row.original;
            return (
                <CheckboxInput
                    id={"switch-access-form"}
                    name={"switch-access-form-select"}
                    options={[
                        {
                            key: "select-form",
                            label: "",
                            value: formConfig.Key,
                            onChange: (e) => {
                                const id = e.target.value;
                                if (selectedDependents.length === 0) {
                                    const totalChilds: string[] = [];
                                    selectedParentForm?.childs?.map((child) => {
                                        totalChilds.push(child.Key);
                                    });
                                    setSelectedDependents(totalChilds);
                                }
                                if (selectedParent === id) {
                                    setSelectedParent("");
                                } else {
                                    setSelectedParent(e.target.value);
                                }
                            },
                        },
                    ]}
                    selectedValue={selectedParent}
                />
            );
        },
        header: () => "",
        size: 43, //40 + 15
        enableSorting: false,
    });

    const ChildFormSelection = columnHelper.display({
        id: "switchAccess-child-checkbox",
        cell: (props) => {
            const formConfig = props.row.original;
            return (
                <CheckboxInput
                    id={"switch-access-form"}
                    name={"switch-access-form-select"}
                    options={[
                        {
                            key: "select-form",
                            label: "",
                            value: formConfig.Key,
                            onChange: (e) => {
                                const id = e.target.value;
                                const index = selectedDependents.findIndex(
                                    (key) => key === id
                                );
                                if (index === -1) {
                                    const addedDependents = [
                                        ...selectedDependents,
                                        id,
                                    ];
                                    setSelectedDependents(addedDependents);
                                } else {
                                    const removedDependents = selectedDependents.toSpliced(
                                        index,
                                        1
                                    );
                                    setSelectedDependents(removedDependents);
                                }
                            },
                        },
                    ]}
                    isSmall={true}
                    selectedValue={selectedDependents}
                    additionalClasses="small-checkbox-add-margin-left small-checkbox-add-margin-bottom"
                />
            );
        },
        header: () => "",
        size: 43, //40 + 15
        enableSorting: false,
    });

    const commonColumns = [
        { ...formNameColumn, enableSorting: false },
        { ...formStatusColumn, enableSorting: false },
        { ...formAccessTypeColumn, enableSorting: false },
        columnHelper.accessor("LastModified", {
            id: "lastModified",
            header: "Modified on",
            cell: (ctx) => (
                <TableCell>
                    <span title={ctx.getValue()}>{ctx.getValue()}</span>
                </TableCell>
            ),
            enableSorting: false,
        }),
        {
            ...formCreatedByColumn(FormConfigurationTabs.MyForms),
            enableSorting: false,
        },
    ];

    const parentColumns = [ParentFormSelection, ...commonColumns];

    const childColumns = [ChildFormSelection, ...commonColumns];
    const goBack = (event) => {
        event.preventDefault();
        dispatch(resetParentChild());
        history.push(`/dashboard`);
    };

    return (
        <>
            {canRender && (
                <GridRow>
                    <BackLink onClick={goBack}>{i18n("Back")}</BackLink>
                    <GridColumn>
                        <Table
                            name={"selected-parent-form"}
                            rows={rows}
                            columns={parentColumns}
                            caption={`Switch access type for ${selectedParentForm?.DisplayName}`}
                            captionSize={TableCaptionSize.L}
                            additionalClasses="switch-access-table"
                        />
                        <Spacing mb={SpacingUnit.Four} />
                    </GridColumn>

                    <GridColumn>
                        <span className="govuk-body">
                            Associated child forms
                        </span>
                        <Spacing mb={SpacingUnit.Five} />
                    </GridColumn>
                    <GridColumn>
                        <Table
                            name={"selected-child-form"}
                            rows={childRows}
                            columns={childColumns}
                            captionSize={TableCaptionSize.L}
                            additionalClasses="switch-access-table"
                            renderPagination={true}
                        />
                        <Spacing mb={SpacingUnit.Four} />
                    </GridColumn>
                    <Spacing mb={SpacingUnit.Five} />
                    <GridColumn>
                        <Para
                            bold={true}
                            text={i18n("changeFormAccessType.selectHelpText")}
                        ></Para>
                        <Hint
                            id="hint-id"
                            text={i18n("changeFormAccessType.selectHintText")}
                        />
                        <RadioFormComponent
                            name={"radio-form-component"}
                            labelSize={LegendSizes.S}
                            value={radioValue}
                            options={radioOptions}
                            label={""}
                        />
                    </GridColumn>
                    <GridColumn>
                        {radioValue === FormAccessType.DFESignIn && (
                            <DFESignInAdditionalLabel
                                formName={selectedParentForm?.DisplayName}
                                serverError={serverError}
                                isParentChild={
                                    childRows.length > 0 ? true : false
                                }
                            />
                        )}
                    </GridColumn>
                    <Spacing mb={SpacingUnit.Five} />
                    <SwitchAccessSubmission
                        radioValue={radioValue}
                        selectedForms={selectedForms}
                        file={uploadedFile}
                        formName={selectedParentForm?.DisplayName}
                        parentId={selectedParentForm?.Key}
                        formData={parentChild?.selectedFormData}
                    />
                </GridRow>
            )}
            {!canRender && (
                <Loader show={showLoader} loadingText="Please wait a moment." />
            )}
        </>
    );
};

export default SwitchAccessGroup;
