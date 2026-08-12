import React, { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";

import {
    SelectInput,
    SelectOptions,
    TextInput,
    TextFormComponent,
    Tag,
    MultilineTextInput,
    MultilineFormComponent,
    Heading,
    HeadingType,
    Spacing,
    SpacingUnit,
    Para,
    ParaType,
    ParaFontSizes,
    Table,
    TableCaptionSize,
    SelectFormComponent,
    RadioInput,
    RadioFormComponent,
    CheckboxInput,
    CheckboxFormComponent,
    RadioOption,
    LabelSizes,
    LegendSizes,
    Sortable,
    DateTimeInput,
    Button,
    ButtonType,
    ButtonVariant,
    ButtonGroup,
    SearchInput,
    GridRow,
    GridColumn,
    GridColumnType,
    FormFilter,
    Tab,
    FormTableLegend,
    Hint,
    Legend,
    Label,
    Generics,
    GenericsColor,
} from "../../ui";
import ComponentContainer from "./ComponentContainer";
import { NameCell, makeData, SubRowToggle } from "./Table";
import { useUid } from "../../hooks";

import type { Employee } from "./Table";

import "./playground.scss";
import { DashboardFilters } from "../../store/types";
import { initialFilterState } from "../../store/reducers/dashboardReducer";

type Props = {};

const Playground = (props: Props) => {
    /** Select Input Component **/
    const [selectValue, setSelectValue] = useState("one");
    const selectOptions: SelectOptions[] = [
        {
            id: "one",
            key: "one",
            title: "One",
        },
        {
            id: "two",
            key: "two",
            title: "Two",
        },
        {
            id: "three",
            key: "three",
            title: "Three",
        },
    ];
    const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectValue(e.target.value);
    };
    /** Tab Component */
    const [selectedTab, setSelectedTab] = useState("past-day");
    /** Radios Input Component **/
    const [radioValue, setRadioValue] = useState("one");
    const onRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRadioValue(e.target.value);
    };
    const radioOptions: RadioOption[] = [
        {
            key: "one",
            value: "one",
            label: "One",
            onChange: onRadioChange,
            renderConditional: () => {
                return <Para text={"conditional render"} />;
            },
        },
        {
            key: "two",
            value: "two",
            label: "Two",
            hint: "hint for two",
            onChange: onRadioChange,
        },
        {
            key: "three",
            value: "three",
            label: "Three",
            onChange: onRadioChange,
        },
    ];
    /** Filter component */
    const [showFilter, setShowFilter] = useState(true);
    /** Table Component */
    const columnHelper = createColumnHelper<Employee>();
    const nameColumn = columnHelper.display({
        id: "name",
        cell: NameCell,
        header: "Name",
    });
    const subRowToggle = columnHelper.display({
        id: "toggle",
        cell: SubRowToggle,
        header: "",
    });
    const jobTitleColumn = columnHelper.accessor("jobTitleName", {
        id: "jobTitle",
        header: "Job Title",
        enableSorting: true,
    });
    const empCodeColumn = columnHelper.accessor("employeeCode", {
        id: "empCode",
        header: "Code",
    });
    const regionColumn = columnHelper.accessor("region", {
        id: "region",
        header: "Region",
    });
    const phNumColumn = columnHelper.accessor("phoneNumber", {
        id: "phoneNumber",
        header: "Phone no.",
    });
    const columns = [
        nameColumn,
        jobTitleColumn,
        empCodeColumn,
        regionColumn,
        phNumColumn,
    ];

    const columnsWithSubRows = [
        subRowToggle,
        nameColumn,
        jobTitleColumn,
        empCodeColumn,
        regionColumn,
        phNumColumn,
    ];

    const ComponentList = [
        {
            title: "Text input component",
            key: "text-component",
            component: (
                <>
                    <div>
                        <TextInput
                            id={useUid()}
                            name={"text-input"}
                            value={""}
                            onChange={function (
                                e: React.ChangeEvent<HTMLInputElement>
                            ): void {
                                throw new Error("Function not implemented.");
                            }}
                        />
                    </div>
                    <Spacing mb={SpacingUnit.Three} />
                    <TextFormComponent
                        name={"text-form-comp"}
                        label={"Text label"}
                        hint={"Text hint"}
                        error={"Test error message"}
                        value={""}
                        onChange={function (
                            e: React.ChangeEvent<HTMLInputElement>
                        ): void {
                            throw new Error("Function not implemented.");
                        }}
                    />
                </>
            ),
        },
        {
            title: "Multiline text input component",
            key: "multiline-text-component",
            component: (
                <>
                    <MultilineTextInput
                        id={useUid()}
                        name={"multiline-text-input"}
                        rows={5}
                        value={""}
                        onChange={function (
                            e: React.ChangeEvent<HTMLTextAreaElement>
                        ): void {
                            throw new Error("Function not implemented.");
                        }}
                    />
                    <Spacing mb={SpacingUnit.Three} />
                    <MultilineFormComponent
                        name={"multilinetext-form-comp"}
                        label={"Multiline text label"}
                        hint={"Multiline text hint"}
                        error={"Test error message"}
                        rows={5}
                        value={""}
                        onChange={function (
                            e: React.ChangeEvent<HTMLTextAreaElement>
                        ): void {
                            throw new Error("Function not implemented.");
                        }}
                    />
                </>
            ),
        },
        {
            title: "Select input component",
            key: "select-component",
            component: (
                <>
                    <SelectInput
                        id={useUid()}
                        name="select-input"
                        options={selectOptions}
                        value={selectValue}
                        onChange={onSelectChange}
                        hasError={true}
                    />
                    <Spacing mb={SpacingUnit.Three} />
                    <SelectFormComponent
                        name="select-form-comp"
                        label="Select label"
                        hint={"Select hint"}
                        error="Test error message"
                        options={selectOptions}
                        value={selectValue}
                        onChange={onSelectChange}
                    />
                </>
            ),
        },
        {
            title: "Tag component",
            key: "tag-component",
            component: (
                <Tag
                    title="One"
                    onClickClose={() => console.log("Tag close clicked!")}
                />
            ),
        },
        {
            title: "Generics component",
            key: "generics-component",
            component: <Generics text="ONE" color={GenericsColor.Green} />,
        },
        {
            title: "Heading component",
            key: "heading-component",
            component: (
                <>
                    <Heading
                        text={"Extra large heading"}
                        caption="Extra large caption"
                        type={HeadingType.XL}
                    />
                    <Spacing mb={SpacingUnit.Four} />
                    <Heading
                        text={"Large heading"}
                        type={HeadingType.L}
                        caption="Large caption"
                    />
                    <Spacing mb={SpacingUnit.Four} />
                    <Heading
                        text={"Medium heading"}
                        type={HeadingType.M}
                        caption="Medium caption"
                    />
                    <Spacing mb={SpacingUnit.Four} />
                    <Heading text={"Small heading"} type={HeadingType.S} />
                </>
            ),
        },
        {
            title: "Hint component",
            key: "hint-component",
            component: (
                <>
                    <Hint id="hint-id" text={"Sample hint"} />
                    <Spacing mb={SpacingUnit.Four} />
                </>
            ),
        },
        {
            title: "Legend component",
            key: "legend-component",
            component: (
                <>
                    <Legend text={"Legend small"} size={LegendSizes.S} />
                    <Spacing mb={SpacingUnit.Four} />
                    <Legend text={"Legend medium"} size={LegendSizes.M} />
                    <Spacing mb={SpacingUnit.Four} />
                    <Legend text={"Legend large"} size={LegendSizes.L} />
                    <Spacing mb={SpacingUnit.Four} />
                    <Legend
                        text={"Legend heading"}
                        size={LegendSizes.L}
                        isHeading
                    />
                    <Spacing mb={SpacingUnit.Four} />
                </>
            ),
        },
        {
            title: "Label component",
            key: "legend-component",
            component: (
                <>
                    <Label text={"Label small"} size={LabelSizes.S} />
                    <Spacing mb={SpacingUnit.Four} />
                    <Label text={"Label medium"} size={LabelSizes.M} />
                    <Spacing mb={SpacingUnit.Four} />
                    <Label text={"Label large"} size={LabelSizes.L} />
                    <Spacing mb={SpacingUnit.Four} />
                </>
            ),
        },
        {
            title: "Para component",
            key: "para-component",
            component: (
                <>
                    <Para text={"Large/Lead para"} type={ParaType.L} />
                    <Spacing mb={SpacingUnit.Four} />
                    <Para text={"Medium/Regular para"} type={ParaType.M} />
                    <Spacing mb={SpacingUnit.Four} />
                    <Para text={"Small para"} type={ParaType.S} />
                    <Spacing mb={SpacingUnit.Six} />
                    <Para text={"Para with font bold override"} bold={true} />
                    <Spacing mb={SpacingUnit.Six} />
                    <Para
                        text={"Para with font override - 14"}
                        size={ParaFontSizes.S14}
                    />
                    <Spacing mb={SpacingUnit.Four} />
                    <Para
                        text={"Para with font override - 16"}
                        size={ParaFontSizes.S16}
                    />
                    <Spacing mb={SpacingUnit.Four} />
                    <Para
                        text={"Para with font override - 19"}
                        size={ParaFontSizes.S19}
                    />
                    <Spacing mb={SpacingUnit.Four} />
                    <Para
                        text={"Para with font override - 24"}
                        size={ParaFontSizes.S24}
                    />
                    <Spacing mb={SpacingUnit.Four} />
                    <Para
                        text={"Para with font override - 27"}
                        size={ParaFontSizes.S27}
                    />
                    <Spacing mb={SpacingUnit.Four} />
                    <Para
                        text={"Para with font override - 36"}
                        size={ParaFontSizes.S36}
                    />
                    <Spacing mb={SpacingUnit.Four} />
                    <Para
                        text={"Para with font override - 48"}
                        size={ParaFontSizes.S48}
                    />
                    <Spacing mb={SpacingUnit.Four} />
                    <Para
                        text={"Para with font override - 80"}
                        size={ParaFontSizes.S80}
                    />
                </>
            ),
        },
        {
            title: "Table component",
            key: "table-component",
            component: (
                <>
                    <Table
                        rows={makeData(40)}
                        columns={columns}
                        name={"employee-table-1"}
                        emptyMessage="No employees found"
                        renderPagination
                    />
                    <Spacing mb={SpacingUnit.Three} />
                    <Table
                        rows={makeData(7)}
                        columns={columns}
                        name={"employee-table-2"}
                        emptyMessage="No employees found"
                        caption="Employee Table (with caption)"
                        captionSize={TableCaptionSize.M}
                        renderPagination
                    />
                    <Spacing mb={SpacingUnit.Three} />
                    <Table
                        rows={[] as Employee[]}
                        columns={columns}
                        name={"employee-table-3"}
                        emptyMessage="No <b>employees</b> found"
                        renderPagination
                    />
                    <Spacing mb={SpacingUnit.Three} />
                    <Table
                        rows={makeData(12, 4)}
                        columns={columnsWithSubRows}
                        name={"employee-table-3"}
                        emptyMessage="No <b>employees</b> found"
                        caption="Employee Table (with sub rows)"
                        captionSize={TableCaptionSize.M}
                        getSubRows={(row) => row.subRows!}
                        renderPagination
                    />
                </>
            ),
        },
        {
            title: "Radio component",
            key: "radio-component",
            component: (
                <>
                    <RadioInput
                        id={`radio-input-${useUid()}`}
                        name={"radio-input-1"}
                        selectedValue={radioValue}
                        options={radioOptions}
                    />
                    <Spacing mb={SpacingUnit.Five} />
                    <RadioInput
                        id={`radio-input-${useUid()}`}
                        name={"radio-input-2"}
                        selectedValue={radioValue}
                        options={radioOptions}
                        isSmall={true}
                    />
                    <Spacing mb={SpacingUnit.Five} />
                    <RadioFormComponent
                        name={"radio-form-component"}
                        label={"Radio label"}
                        labelSize={LegendSizes.S}
                        value={radioValue}
                        options={radioOptions}
                    />
                    <Spacing mb={SpacingUnit.Three} />
                    <RadioFormComponent
                        name={"radio-form-component"}
                        label={"Radio label"}
                        labelSize={LegendSizes.S}
                        value={radioValue}
                        options={radioOptions}
                        hint="Radio hint"
                        error="Sample radio error"
                    />
                    <Spacing mb={SpacingUnit.Three} />
                    <RadioFormComponent
                        name={"radio-form-component-inline"}
                        label={"Radio label"}
                        labelSize={LegendSizes.S}
                        hint="Radio hint"
                        value={radioValue}
                        options={radioOptions}
                        isInline={true}
                    />
                    <Spacing mb={SpacingUnit.Three} />
                </>
            ),
        },
        {
            title: "Checkbox component",
            key: "checkbox-component",
            component: (
                <>
                    <CheckboxInput
                        id={`checkbox-input-${useUid()}`}
                        name={"checkbox-input"}
                        selectedValue={radioValue}
                        options={radioOptions}
                    />
                    <Spacing mb={SpacingUnit.Three} />
                    <CheckboxInput
                        id={`checkbox-input-${useUid()}`}
                        name={"checkbox-input"}
                        selectedValue={radioValue}
                        options={radioOptions}
                        isSmall={true}
                    />
                    <Spacing mb={SpacingUnit.Three} />
                    <CheckboxFormComponent
                        name={"checkbox-form-component"}
                        label="Checkbox label"
                        labelSize={LegendSizes.S}
                        value={radioValue}
                        options={radioOptions}
                        error="Sample checkbox error"
                    />
                </>
            ),
        },
        {
            title: "Sortable component",
            key: "sortable-component",
            component: (
                <>
                    <Sortable
                        items={[{ id: "1" }, { id: "2" }, { id: "3" }]}
                        renderSortableBox={() => {
                            return (
                                <>
                                    <Spacing mt={SpacingUnit.Five} />
                                    <RadioFormComponent
                                        name={"radio-form-component"}
                                        label={"Radio label"}
                                        labelSize={LegendSizes.S}
                                        value={radioValue}
                                        options={radioOptions}
                                    />
                                    <Spacing mb={SpacingUnit.Three} />
                                </>
                            );
                        }}
                        onDragEnd={(e) => null}
                    ></Sortable>
                </>
            ),
        },
        {
            title: "Date Time component",
            key: "date-time-component",
            component: (
                <>
                    <DateTimeInput
                        name={"sample-date-time"}
                        onChange={function (
                            e: React.ChangeEvent<HTMLInputElement>
                        ): void {
                            throw new Error("Function not implemented.");
                        }}
                        day={""}
                        month={""}
                        year={""}
                        hour={""}
                        minute={""}
                    />
                    <Spacing mb={SpacingUnit.Three} />
                </>
            ),
        },
        {
            title: "Button component",
            key: "date-time-component",
            component: (
                <>
                    <ButtonGroup>
                        <Button
                            name={"primary-button"}
                            type={ButtonType.Submit}
                            text="Primary button"
                        />
                        <Button
                            name={"secondary-button"}
                            text="Secondary button"
                            variant={ButtonVariant.Secondary}
                        />
                        <Button
                            name={"warning-button"}
                            variant={ButtonVariant.Warning}
                            text="Warning button"
                        />
                        <Button
                            name={"inverse-button"}
                            variant={ButtonVariant.Inverse}
                            text="Inverse button"
                        />
                        <Button
                            name={"start-button"}
                            text="Start button"
                            variant={ButtonVariant.Start}
                            isAnchor={true}
                        />
                    </ButtonGroup>
                </>
            ),
        },
        {
            title: "Search component",
            key: "search-component",
            component: (
                <GridRow>
                    <SearchInput
                        name={"sample-search-component"}
                        label="Search forms"
                        value={""}
                        onSearchChange={function (
                            e: React.ChangeEvent<HTMLInputElement>
                        ): void {
                            throw new Error("Function not implemented.");
                        }}
                    />
                    <GridColumn
                        type={GridColumnType.OneHalf}
                        additionalClasses="govuk-!-padding-left-0"
                    >
                        <Spacing mt={SpacingUnit.Six} />
                        <ButtonGroup>
                            <Button
                                name={"sample-button"}
                                text={"Show filters"}
                                variant={ButtonVariant.Secondary}
                            />
                        </ButtonGroup>
                    </GridColumn>
                    <Spacing mb={SpacingUnit.Three} />
                </GridRow>
            ),
        },
        {
            title: "Form filter component",
            key: "form-filter-component",
            component: (
                <>
                    <GridRow>
                        <GridColumn type={GridColumnType.Full}>
                            <ButtonGroup>
                                <Button
                                    name={"sample-button"}
                                    text={"Show filters"}
                                    variant={ButtonVariant.Secondary}
                                    onButtonClick={() => {
                                        setShowFilter((value) => !value);
                                    }}
                                />
                            </ButtonGroup>
                            <Spacing mb={SpacingUnit.Three} />
                        </GridColumn>
                    </GridRow>
                    <GridRow>
                        <GridColumn type={GridColumnType.Full}>
                            <FormFilter
                                show={showFilter}
                                onClose={() => {
                                    setShowFilter(false);
                                }}
                                filters={initialFilterState}
                                setFormStatus={(formStatus: any) => {
                                    console.log(formStatus);
                                }}
                                setFormAccessType={(formAccessType: any) => {
                                    console.log(formAccessType);
                                }}
                                setCreatedby={(createdBy: any) => {
                                    console.log(createdBy);
                                }}
                                createdByList={[]}
                                setModifedOn={(modifiedOn: any) => {
                                    console.log(modifiedOn);
                                }}
                            />
                        </GridColumn>
                    </GridRow>
                </>
            ),
        },
        {
            title: "Tab component",
            key: "tab-component",
            component: (
                <>
                    <Tab
                        name={"sample-tabs"}
                        selectedTab={selectedTab}
                        childs={[
                            {
                                id: "past-week",
                                label: "Past week",
                                render: () => {
                                    return <div>Past Week</div>;
                                },
                            },
                            {
                                id: "past-day",
                                label: "Past day",
                                render: () => {
                                    return <div>Past day</div>;
                                },
                            },
                            {
                                id: "past-month",
                                label: "Past month",
                                render: () => {
                                    return <div>Past month</div>;
                                },
                            },
                        ]}
                        title={"Sample title"}
                        onSelectTab={(tabId) => {
                            setSelectedTab(tabId);
                        }}
                    />
                    <Spacing mb={SpacingUnit.Three} />
                </>
            ),
        },
        {
            title: "Form table legend component",
            key: "form-table-legend-component",
            component: (
                <>
                    <FormTableLegend />
                    <Spacing mb={SpacingUnit.Eight} />
                </>
            ),
        },
    ];
    return (
        <div className="playground-container">
            {ComponentList.map((componentInfo) => (
                <ComponentContainer
                    title={componentInfo.title}
                    key={componentInfo.key}
                >
                    {componentInfo.component}
                </ComponentContainer>
            ))}
        </div>
    );
};

export default Playground;
