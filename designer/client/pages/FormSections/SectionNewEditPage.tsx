import React from "react";
import {
    BackLink,
    Button,
    CheckboxInput,
    Heading,
    HeadingType,
    Hint,
    Para,
    SelectInput,
    Spacing,
    SpacingUnit,
    TextFormComponent,
} from "../../ui";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    addSection,
    formSectionSelector,
    selectConditionComp,
    selectNumberComp,
    setSectionName,
    setSectionTitle,
    toggleSectionRepeatable,
} from "../../store/reducers/formSectionReducer";

type Props = {
    isEdit: boolean;
};

const SectionNewEditPage = (props: Props) => {
    const { isEdit } = props;
    const dispatch = useAppDispatch();
    const formSections = useAppSelector(formSectionSelector);
    const makeRepeatableValue = "make-repeatable";
    const section = isEdit
        ? formSections.selectedSection
        : formSections.newSection;

    const onBack = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        history.back();
    };
    const isDisabled = () => {
        if (!(!!section?.title && !!section?.name)) {
            return true;
        }

        if (section?.repeatableSection) {
            const isInvalidComp =
                (!section.numberComp || section.numberComp === "none") &&
                (!section.conditionComp || section.conditionComp === "none");
            return isInvalidComp;
        }

        return false;
    };
    const onMakeRepeatableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(toggleSectionRepeatable({ isEdit }));
    };
    const onSectionTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setSectionTitle({ title: e.target.value, isEdit }));
    };
    const onSectionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setSectionName({ name: e.target.value, isEdit }));
    };
    const onNumberCompSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value === "none" ? null : e.target.value;
        dispatch(selectNumberComp({ id: value, isEdit }));
    };
    const onConditionCompSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value === "none" ? null : e.target.value;
        dispatch(selectConditionComp({ id: value, isEdit }));
    };
    const onAddSection = () => {
        dispatch(addSection({ state: formSections, isEdit }));
        history.back();
    };

    return (
        <>
            <BackLink onClick={onBack}>Back</BackLink>
            <Heading
                text={isEdit ? "Edit section" : "Add a new section"}
                type={HeadingType.M}
            />
            <Spacing mb={SpacingUnit.Seven} />
            <TextFormComponent
                name={"section-title"}
                label={"Title"}
                hint="Enter the name for your new section. Appears above the page title. However, if these titles are the same, the form will only show the page title."
                value={section?.title ?? ""}
                onChange={onSectionTitleChange}
            />
            <Spacing mb={SpacingUnit.Seven} />
            <TextFormComponent
                name={"section-name"}
                label={"Section name"}
                hint="This is generated automatically and does not show on the page. Only change it if required by an integration, such as GOV.UK Notify. It must not contain spaces."
                value={section?.name}
                onChange={onSectionNameChange}
            />
            <Spacing mb={SpacingUnit.Seven} />
            <CheckboxInput
                id={"repeatable-section"}
                name={"repeatable-section"}
                selectedValue={
                    section?.repeatableSection ? makeRepeatableValue : ""
                }
                options={[
                    {
                        key: makeRepeatableValue,
                        value: makeRepeatableValue,
                        label: "Make this section repeatable (optional)",
                        labelBold: true,
                        hint: !section?.repeatableSection
                            ? "Tick this box if you want to make this section repeatable in the runner by adding a trigger in the designer"
                            : undefined,
                        onChange: onMakeRepeatableChange,
                        renderConditional: () => {
                            return (
                                <>
                                    <Para
                                        text={
                                            "Select a number component to act as trigger (optional)"
                                        }
                                    />
                                    <Spacing mb={SpacingUnit.Three} />
                                    <SelectInput
                                        id={"select-number-comp"}
                                        name={"select-number-comp"}
                                        value={section?.numberComp ?? ""}
                                        options={formSections.numberComponents}
                                        onChange={onNumberCompSelect}
                                    />
                                    <Spacing mb={SpacingUnit.Six} />
                                    <Para
                                        text={
                                            "Select a conditional component to act as trigger (optional)"
                                        }
                                    />
                                    <Spacing mb={SpacingUnit.Two} />
                                    <Hint
                                        id={"select-conditional-comp"}
                                        text={
                                            "This needs to be added on the page after a particular section group"
                                        }
                                    />
                                    <SelectInput
                                        id={"select-conditional-comp"}
                                        name={"select-conditional-comp"}
                                        value={section?.conditionComp ?? ""}
                                        options={
                                            formSections.conditionalComponents
                                        }
                                        onChange={onConditionCompSelect}
                                    />
                                </>
                            );
                        },
                    },
                ]}
            />
            <Spacing mb={SpacingUnit.Eight} />
            <Button
                text={isEdit ? "Save section" : "Add section"}
                name={"add-section"}
                isDisabled={isDisabled()}
                onButtonClick={onAddSection}
            />
        </>
    );
};

export default SectionNewEditPage;
