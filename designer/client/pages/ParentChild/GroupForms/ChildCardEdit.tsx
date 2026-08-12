import React, { useContext, useEffect, useState } from "react";
import { useRouteMatch, useHistory } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import {
    Button,
    ButtonGroup,
    ButtonVariant,
    DateTimeFormComponent,
    GridColumn,
    GridRow,
    Label,
    LabelSizes,
    LinkComponent,
    Para,
    RadioInput,
    SelectFormComponent,
    Spacing,
    SpacingUnit,
    Table,
    TableCell,
    Tag,
    TextFormComponent,
} from "../../../ui";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
    addChildFromNew,
    cancelEditChildConfig,
    editChildConfigSelector,
    newChildConfigSelector,
    parentChildSelector,
    removeDependentForm,
    resetNewChildConfig,
    saveEditChildConfig,
    setChildConfigHelpText,
    setChildConfigTimeDependency,
    setDependentFormStatus,
    setSelectedDependentForms,
    setChildCondition,
} from "../../../store/reducers/parentChildReducer";
import { ChildConfig, DependentForm } from "../../../store/types";
import { DependentFormStatus } from "../../../utils";
import {
    getDateDetailsFromStr,
    getTimestampStr,
} from "../../../utils/date-time-fns";
import { FormDefinition } from "@xgovformbuilder/model";

type Props = {
    isNewChild: boolean;
    formData: FormDefinition | null;
};

const ChildCardEdit = (props: Props) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const { url } = useRouteMatch();
    // const parentChild = useAppSelector(parentChildSelector);
    const formData = props.formData;
    const { conditions } = formData!;
    const [dateIncomplete, setDateIncomplete] = useState(false);
    const [dateError, setDateError] = useState(false);
    const newChildConfig = useAppSelector(newChildConfigSelector);
    const editChildConfig = useAppSelector(editChildConfigSelector);
    const childConfigValue = !props.isNewChild
        ? editChildConfig.editChild!
        : newChildConfig;
    const dateDetails = getDateDetailsFromStr(childConfigValue.dateComponent);
    const parentChildState = useAppSelector(parentChildSelector);

    const onDependentFormSearch = (
        e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();
        dispatch(setSelectedDependentForms(childConfigValue.dependentforms));
        history.push(`${url}/add-dependent-forms`);
    };

    const onChildFormSearch = (
        e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();
        dispatch(setSelectedDependentForms([]));
        history.push(`${url}/add-child-forms`);
    };

    const onDependentFormRemove = (index: number) => {
        return (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
            dispatch(removeDependentForm({ index, isEdit: !props.isNewChild }));
        };
    };

    const onDependentFormStatusChange = (index: number) => {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value as DependentFormStatus;
            dispatch(
                setDependentFormStatus({
                    index,
                    status: value,
                    isEdit: !props.isNewChild,
                })
            );
        };
    };

    const onAddChild = (
        e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>
    ) => {
        dispatch(addChildFromNew());
    };

    const onHelpTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(
            setChildConfigHelpText({
                value: e.target.value,
                isEdit: !props.isNewChild,
            })
        );
    };

    const onSaveEditChild = (
        e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>
    ) => {
        dispatch(saveEditChildConfig());
    };

    const onCancelEditChild = (
        e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
    ) => {
        dispatch(cancelEditChildConfig());
    };

    const isAddNewDisabled = () => {
        const statusFilledForDependents = childConfigValue?.dependentforms.every(
            (dpdt) => dpdt.status !== null
        );

        if (childConfigValue.childId) {
            if (
                childConfigValue?.dependentforms.length === 0 ||
                statusFilledForDependents
            ) {
                return dateIncomplete || dateError;
            } else if (
                childConfigValue?.dependentforms.length > 0 &&
                !statusFilledForDependents
            ) {
                return true;
            } else {
                return true;
            }
        } else {
            return true;
        }
    };

    const isEditDisabled = () => {
        if (checkIfChildValueMatches()) {
            return true;
        }
        return isAddNewDisabled();
    };

    const checkIfChildValueMatches = () => {
        const updatedChild = childConfigValue;
        const originalChild = parentChildState.childConfigs.find(
            (conf) => conf.childId === childConfigValue.childId
        );
        if (
            updatedChild.childFormName === originalChild?.childFormName &&
            updatedChild.childFormTitle === originalChild?.childFormTitle &&
            updatedChild.helpText === originalChild.helpText &&
            updatedChild.dateComponent === originalChild.dateComponent &&
            updatedChild.condition === originalChild.condition &&
            checkIfDependentsMatch(updatedChild, originalChild)
        ) {
            return true;
        } else {
            return false;
        }
    };

    const checkIfDependentsMatch = (
        updated: ChildConfig,
        original: ChildConfig
    ) => {
        if (updated.dependentforms.length === original.dependentforms.length) {
            return updated.dependentforms.every((updatedDpnd) => {
                const found = original.dependentforms.find(
                    (d) => d.id === updatedDpnd.id
                );
                if (!found) return false;
                return found.status === updatedDpnd.status;
            });
        } else {
            return false;
        }
    };

    const columnHelper = createColumnHelper<DependentForm>();
    const columns = [
        columnHelper.accessor("name", {
            id: "dependentFormName",
            header: "Dependent form name",
            enableSorting: false,
            size: 350,
            cell: (ctx) => (
                <TableCell>
                    <span title={ctx.getValue()}>{ctx.getValue()}</span>
                </TableCell>
            ),
        }),
        columnHelper.accessor("status", {
            id: "dependentFormStatus",
            header: "Dependent form submission status",
            cell: (ctx) => (
                <RadioInput
                    options={[
                        {
                            key: DependentFormStatus.InProgress,
                            value: DependentFormStatus.InProgress,
                            label: "In progress",
                            onChange: onDependentFormStatusChange(
                                ctx.row.index
                            ),
                            additionalClasses: "form-status-radios",
                        },
                        {
                            key: DependentFormStatus.Completed,
                            value: DependentFormStatus.Completed,
                            label: "Completed",
                            onChange: onDependentFormStatusChange(
                                ctx.row.index
                            ),
                            additionalClasses: "form-status-radios",
                        },
                    ]}
                    selectedValue={ctx.getValue() ?? ""}
                    id={`dependent-form-status-${ctx.row.index}`}
                    name={`dependent-form-status-${ctx.row.index}`}
                    isInline
                    isSmall
                />
            ),
            enableSorting: false,
        }),
        columnHelper.display({
            id: "action",
            header: "Action",
            cell: (ctx) => (
                <LinkComponent
                    text={"Remove"}
                    color="red"
                    onClick={onDependentFormRemove(ctx.row.index)}
                />
            ),
            enableSorting: false,
        }),
    ];

    const selectOptions = conditions.map((condition) => {
        return {
            id: condition.name,
            key: condition.name,
            title: condition.displayName,
        };
    });

    // const { name } = conditions?.find((c) => c?.name === condition) ?? "";

    const onConditionsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === "none") {
            dispatch(
                setChildCondition({
                    value: "",
                    title: "",
                    isEdit: !props.isNewChild,
                })
            );
            return;
        }
        dispatch(
            setChildCondition({
                value: e.target.value,
                title: e.target.options[e.target.selectedIndex].text,
                isEdit: !props.isNewChild,
            })
        );
    };

    return (
        <GridRow additionalClasses={"border-container"}>
            <Spacing ml={SpacingUnit.Four} />
            <GridColumn>
                <Spacing mt={SpacingUnit.Four} />
                <Label
                    text={"Child form, form dependencies and status"}
                    size={LabelSizes.S}
                />
                <Para text="You can add multiple child forms to this form marked as a parent, add a dependent form to a child form along with the dependency status." />
                <Spacing mb={SpacingUnit.Four} />
                <Label text={"Add child forms"} size={LabelSizes.S} />
                <Spacing mb={SpacingUnit.Three} />
                {childConfigValue.childId && (
                    <Tag
                        title={childConfigValue.childFormName}
                        onClickClose={(e) => {
                            dispatch(resetNewChildConfig());
                        }}
                    />
                )}
                <Spacing mb={SpacingUnit.Three} />
                <Button
                    name={"search-form"}
                    text={"Search form"}
                    variant={ButtonVariant.Secondary}
                    onButtonClick={onChildFormSearch}
                    href={`${url}/add-child-forms`}
                    isAnchor
                />
                <Spacing mb={SpacingUnit.Four} />
                <Table
                    name={"selected-dependent-forms"}
                    rows={childConfigValue.dependentforms ?? []}
                    columns={columns}
                    renderPagination={false}
                    autoResetPageIndex
                    additionalClasses="dependent-form-table-3"
                />
                <Spacing mb={SpacingUnit.Four} />
                <Button
                    name={"search-dependent-forms-button"}
                    text={"Search forms"}
                    variant={ButtonVariant.Secondary}
                    onButtonClick={onDependentFormSearch}
                    isDisabled={!childConfigValue.childId}
                    href={`${url}/add-dependent-forms`}
                    isAnchor
                />
                <Spacing mb={SpacingUnit.Four} />
                <DateTimeFormComponent
                    label={"Date and time dependency (optional)"}
                    name={"date-time-dependency-parent-child"}
                    isFuture={true}
                    key={childConfigValue.childId}
                    isEdit={!props.isNewChild}
                    value={{
                        day: dateDetails?.day ?? "",
                        month: dateDetails?.month ?? "",
                        year: dateDetails?.year ?? "",
                        hour: dateDetails?.hour ?? "",
                        minute: dateDetails?.minute ?? "",
                    }}
                    noValidate={false}
                    setIncomplete={setDateIncomplete}
                    setError={setDateError}
                />
                <Spacing mb={SpacingUnit.Four} />
                <TextFormComponent
                    name={"child-help-text"}
                    label="Help text (optional)"
                    labelSize={LabelSizes.S}
                    hint="This is displayed on the runner page for individual child row"
                    value={childConfigValue.helpText ?? ""}
                    onChange={onHelpTextChange}
                />
                <Spacing mb={SpacingUnit.Four} />
                <SelectFormComponent
                    name={`pnc-condition`}
                    label="Set a condition (optional)"
                    hint="Shows the list of available conditions"
                    value={
                        childConfigValue.condition === ""
                            ? "none"
                            : childConfigValue.condition
                    }
                    options={selectOptions}
                    onChange={onConditionsChange}
                />
                <Spacing mb={SpacingUnit.Four} />
                {!props.isNewChild ? (
                    <ButtonGroup>
                        <Button
                            name={"save-child"}
                            text={"Save"}
                            variant={ButtonVariant.Secondary}
                            onButtonClick={onSaveEditChild}
                            isDisabled={isEditDisabled()}
                        />
                        <LinkComponent
                            text={"Cancel"}
                            onClick={onCancelEditChild}
                        />
                    </ButtonGroup>
                ) : (
                    <Button
                        name={"add-child"}
                        text={"Add child"}
                        onButtonClick={onAddChild}
                        isDisabled={isAddNewDisabled()}
                    />
                )}
            </GridColumn>
            <Spacing mr={SpacingUnit.Four} />
        </GridRow>
    );
};

export default ChildCardEdit;
