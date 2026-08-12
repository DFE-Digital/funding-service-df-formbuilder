import React, { useContext, useEffect, useState } from "react";
import { ComponentDef, ComponentTypeEnum } from "@xgovformbuilder/model";
import { i18n } from "../i18n";
import { CheckboxInput, Heading, HeadingType, Para, WarningText } from "../ui";
import { CopyButton } from "../ui/CopyButton";
import { DataContext } from "../context";
import { getLinkedPropertyEffectReport, Module } from "./linkedProperties";

type Props = {
    module: Module;
    selectedComponent: Partial<ComponentDef>;
    confirm: boolean;
    setConfirm: React.Dispatch<React.SetStateAction<boolean>>;
    setAffectedModules?: React.Dispatch<React.SetStateAction<string[]>>;
    isEdit?: boolean;
};

const componentTypeLabelMap = (type: ComponentTypeEnum): string => {
    switch (type) {
        case ComponentTypeEnum.TextField:
            return "Text input component";
        case ComponentTypeEnum.MultilineTextField:
            return "Multiline text input component";
        case ComponentTypeEnum.YesNoField:
            return "YesNo selection component";
        case ComponentTypeEnum.DateAndTimeField:
            return "Date and time component";
        // case ComponentTypeEnum.DateField:
        //     return "Date picker component";
        // case ComponentTypeEnum.TimeField:
        //     return "Time picker component";
        // case ComponentTypeEnum.DateTimeField:
        //     return "Date & Time picker component";
        // case ComponentTypeEnum.DatePartsField:
        //     return "Date parts component";
        // case ComponentTypeEnum.MonthYearField:
        //     return "Month & Year picker component";
        // case ComponentTypeEnum.DateTimePartsField:
        //     return "Date & Time parts component";
        case ComponentTypeEnum.SelectField:
            return "Dropdown select component";
        case ComponentTypeEnum.AutocompleteField:
            return "Autocomplete component";
        case ComponentTypeEnum.RadiosField:
            return "Radio buttons component";
        case ComponentTypeEnum.CheckboxesField:
            return "Checkboxes component";
        case ComponentTypeEnum.NumberField:
            return "Number input component";
        case ComponentTypeEnum.UkAddressField:
            return "UK address component";
        case ComponentTypeEnum.TelephoneNumberField:
            return "Telephone number component";
        case ComponentTypeEnum.EmailAddressField:
            return "Email address component";
        case ComponentTypeEnum.FileUploadField:
            return "File upload component";
        case ComponentTypeEnum.Para:
            return "Paragraph component";
        case ComponentTypeEnum.Result:
            return "Result display component";
        case ComponentTypeEnum.Html:
            return "HTML content component";
        case ComponentTypeEnum.InsetText:
            return "Inset text component";
        case ComponentTypeEnum.Details:
            return "Details toggle component";
        case ComponentTypeEnum.FlashCard:
            return "Flash card component";
        case ComponentTypeEnum.List:
            return "List component";
        case ComponentTypeEnum.TableDataset:
            return "Table dataset component";
        case ComponentTypeEnum.Tabs:
            return "Tabs component";
        case ComponentTypeEnum.Filedownload:
            return "File download component";
        case ComponentTypeEnum.DataImport:
            return "Data import component";
        case ComponentTypeEnum.DSIAccess:
            return "DSI access component";
        default:
            return type;
    }
};

const moduleTypeLabelMap = (module: Module): string => {
    switch (module) {
        case Module.Document:
            return "document";
        case Module.ImportedDataSet:
            return "import data set";
        case Module.DesignedDataSet:
            return "design data set";
        case Module.Condition:
            return "condition";
        case Module.Section:
            return "section";
        case Module.List:
            return "list";
        case Module.Calculation:
            return "calculation";
        case Module.Page:
            return "page";
        default:
            return "component";
    }
};

const LinkedPropertiesDetails = (props: Props) => {
    const { data, save } = useContext(DataContext);
    const [affectedConditions, setAffectedConditions] = useState<
        { name: string; title: string }[]
    >([]);
    const [affectedTypes, setAffectedTypes] = useState<string[]>([]);
    const [affectedSections, setAffectedsections] = useState<
        { name: string; title: string }[]
    >([]);
    const [affectedOutputs, setAffectedoutputs] = useState<
        { name: string; title: string }[]
    >([]);
    const [affectedLists, setAffectedLists] = useState<
        { name: string; title: string }[]
    >([]);
    const [affectedChildren, setAffectedChildren] = useState<
        { name: string; title: string }[]
    >([]);
    const [affectedCalculations, setAffectedcalculations] = useState<
        { name: string; title: string }[]
    >([]);
    const [affectedPages, setAffectedPages] = useState<
        { name: string; title: string }[]
    >([]);
    const [affectedComponents, setAffectedComponents] = useState<
        { name: string; title: string; type: string }[]
    >([]);
    const [affectedComponentTypes, setAffectedComponentTypes] = useState<
        string[]
    >([]);
    const [affectedDataSets, setAffectedDataSets] = useState<
        { name: string; title: string }[]
    >([]);
    const affectedmoduleTypes: string[] = [];
    const moduleType = moduleTypeLabelMap(props.module);

    useEffect(() => {
        const modules = getLinkedPropertyEffectReport(
            props.module,
            props.selectedComponent,
            data
        );
        setAffectedConditions(modules.affectedConditions ?? []);
        setAffectedsections(modules.affectedSections ?? []);
        setAffectedoutputs(modules.affectedOutputs ?? []);
        setAffectedLists(modules.affectedLists ?? []);
        setAffectedChildren(modules.affectedChildren ?? []);
        setAffectedcalculations(modules.affectedCalculations ?? []);
        setAffectedPages(modules.affectedPages ?? []);
        setAffectedComponents(modules.affectedComponents ?? []);
        setAffectedComponentTypes(modules.affectedComponentTypes ?? []);
        setAffectedDataSets(modules.affectedDatasets ?? []);

        if (modules.affectedConditions?.length ?? 0 >= 1) {
            affectedmoduleTypes.push("Conditions");
        }
        if (modules.affectedSections?.length ?? 0 >= 1) {
            affectedmoduleTypes.push("Sections");
        }
        if (modules.affectedPages?.length ?? 0 >= 1) {
            affectedmoduleTypes.push("Pages");
        }
        if (modules.affectedOutputs?.length ?? 0 >= 1) {
            affectedmoduleTypes.push("Outputs");
        }
        if (modules.affectedLists?.length ?? 0 >= 1) {
            affectedmoduleTypes.push("Lists");
        }
        if (modules.affectedChildren?.length ?? 0 >= 1) {
            affectedmoduleTypes.push("Child Forms");
        }
        if (modules.affectedComponents?.length ?? 0 >= 1) {
            affectedmoduleTypes.push("Form components");
        }
        if (modules.affectedDatasets?.length ?? 0 >= 1) {
            affectedmoduleTypes.push("Design data sets");
        }
        if (modules.affectedCalculations?.length ?? 0 >= 1) {
            affectedmoduleTypes.push("Calculations");
        }

        setAffectedTypes(affectedmoduleTypes);
        props.setAffectedModules?.(affectedmoduleTypes);
    }, [props.selectedComponent]);

    const categories = [
        { label: "Conditions", items: affectedConditions },
        { label: "Sections", items: affectedSections },
        { label: "Outputs", items: affectedOutputs },
        { label: "Lists", items: affectedLists },
        { label: "Child Forms", items: affectedChildren },
        { label: "Calculations", items: affectedCalculations },
        { label: "Pages", items: affectedPages },
        { label: "Design data set", items: affectedDataSets },
    ];

    return (
        <div>
            {affectedTypes?.length >= 1 ? (
                <>
                    <WarningText
                        text={
                            props.isEdit
                                ? i18n(
                                      "common.linkedProperties.moduleWarningMessageEdit",
                                      { moduleType }
                                  )
                                : i18n(
                                      "common.linkedProperties.moduleWarningMessage",
                                      { moduleType }
                                  )
                        }
                    />
                    <Para
                        text={i18n(
                            "common.linkedProperties.confimationMessage"
                        )}
                    />
                    <Heading
                        text="Potentially affected modules are:"
                        type={HeadingType.S}
                    />
                    <br />
                    <ul className="govuk-list govuk-list--bullet">
                        {affectedTypes?.map((type) => (
                            <li key={type}>{type}</li>
                        ))}
                    </ul>
                    <div className="copy-clipboard" style={{ display: "none" }}>
                        <Heading
                            text="Potentially affected modules are:"
                            type={HeadingType.S}
                        />
                        <ul>
                            {categories.map(
                                (cat) =>
                                    cat.items.length > 0 && (
                                        <li key={cat.label}>
                                            {cat.label}:{" "}
                                            {cat.items
                                                .map(
                                                    (it) =>
                                                        `${it.title} (${it.name})`
                                                )
                                                .join(", ")}
                                        </li>
                                    )
                            )}
                            {affectedComponentTypes?.length >= 1 &&
                                affectedComponentTypes.map((type) => (
                                    <li key={type}>
                                        {componentTypeLabelMap(
                                            type as ComponentTypeEnum
                                        )}
                                        :{" "}
                                        {affectedComponents
                                            ?.filter(
                                                (comp) => comp.type === type
                                            )
                                            .map(
                                                (comp) =>
                                                    `${comp.title} (${comp.name})`
                                            )
                                            .join(", ") || ""}
                                    </li>
                                ))}
                        </ul>
                    </div>
                    <CopyButton
                        onSuccess={() => {}}
                        onError={() => {}}
                        className="copy-clipboard"
                        disabled={false}
                    />
                    <br />
                    <Para
                        text={
                            props.isEdit
                                ? i18n(
                                      "common.linkedProperties.confirmationNoteEdit",
                                      {
                                          moduleType,
                                      }
                                  )
                                : i18n(
                                      "common.linkedProperties.confirmationNote",
                                      {
                                          moduleType,
                                      }
                                  )
                        }
                    />
                    <br />
                    <Para
                        text="The .JSON will refresh automatically."
                        bold={true}
                        additionalClasses="govuk-details__text_highlight"
                    />
                </>
            ) : (
                <Para
                    text={`${
                        props.isEdit ? "Editing" : "Deleting"
                    } this ${moduleType} does not affect any other modules.`}
                />
            )}
            <br />
            <CheckboxInput
                id={"delete-confirm"}
                name={"delete-confirm"}
                selectedValue={props.confirm ? 1 : 0}
                options={[
                    {
                        key: "1",
                        value: 1,
                        label: i18n("common.linkedProperties.checkboxMessage"),
                        onChange: () => props.setConfirm((value) => !value),
                    },
                ]}
            />
            <br />
        </div>
    );
};

export default LinkedPropertiesDetails;
