import React, { useContext } from "react";
import {
    ComponentTypeEnum,
    ComponentTypes,
    Page,
} from "@xgovformbuilder/model";
import { ComponentContext } from "./reducers/component/componentReducer";
import FieldEdit from "./field-edit";
import ListFieldEdit from "./components/FieldEditors/list-field-edit";
import SelectFieldEdit from "./components/FieldEditors/select-field-edit";
import { TextFieldEdit } from "./components/FieldEditors/text-field-edit";
import { MultilineTextFieldEdit } from "./multiline-text-field-edit";
import { FileUploadFieldEdit } from "./file-upload-field-edit";
import { NumberFieldEdit } from "./components/FieldEditors/number-field-edit";
import DateAndTimeFieldEdit from "./components/FieldEditors/date-and-time";
import { ParaEdit } from "./components/FieldEditors/para-edit";
import DetailsEdit from "./components/FieldEditors/details-edit";
// import CalculationBuilder from "./components/FieldEditors/calculation-builder";
import Filedownload from "./components/FieldEditors/file-download";
import DataImport from "./components/DataImport/data-import";
import DSIDataEdit from "./components/FieldEditors/DSIDataEdit";
import TableEdit from "./components/FieldEditors/TableEdit/TableEdit";
import TabEdit from "./components/FieldEditors/TabEdit/TabEdit";
import ResultEdit from "./components/FieldEditors/result-edit";

const componentTypeEditors = {
    TextField: TextFieldEdit,
    EmailAddressField: TextFieldEdit,
    TelephoneNumberField: TextFieldEdit,
    MultilineTextField: MultilineTextFieldEdit,
    NumberField: NumberFieldEdit,
    AutocompleteField: ListFieldEdit,
    SelectField: SelectFieldEdit,
    RadiosField: ListFieldEdit,
    CheckboxesField: ListFieldEdit,
    // FlashCard: ListFieldEdit,
    List: ListFieldEdit,
    Details: DetailsEdit,
    Para: ParaEdit,
    Html: ParaEdit,
    InsetText: ParaEdit,
    WarningText: ParaEdit,
    FileUploadField: FileUploadFieldEdit,
    DateAndTimeField: DateAndTimeFieldEdit,
    // DatePartsField: DateFieldEdit,
    // DateTimeField: DateFieldEdit,
    // DateTimePartsField: DateFieldEdit,
    // DateField: DateFieldEdit,
    // Result: CalculationBuilder,
    Result: ResultEdit,
    TableDataset: TableEdit,
    Tabs: TabEdit,
    Filedownload: Filedownload,
    DataImport: DataImport,
    DSIAccess: DSIDataEdit,
};

type Props = {
    page: Page;
    isEdit?: boolean;
    toggleShowEditor?: () => void;
};

function ComponentTypeEdit(props: Props) {
    const { page, isEdit = false } = props;
    const { state } = useContext(ComponentContext);
    const { selectedComponent } = state;
    const type = ComponentTypes.find(
        (t) => t.name === selectedComponent?.type ?? ""
    );

    const needsFieldInputs =
        (type?.subType !== "content" ||
            [
                // "FlashCard",
                "List",
                ComponentTypeEnum.TableDataset,
                ComponentTypeEnum.Tabs,
                "Filedownload",
                ComponentTypeEnum.Result,
            ].includes(type?.name)) &&
        type?.name !== "DSIAccess";
    const TagName = componentTypeEditors[type?.name ?? ""];
    return (
        <div>
            {needsFieldInputs && (
                <FieldEdit
                    isContentField={type?.subType === "content"}
                    isEdit={isEdit}
                />
            )}
            {TagName && (
                <TagName
                    page={page}
                    toggleShowEditor={props.toggleShowEditor}
                    isEdit={isEdit}
                    type={type?.name}
                />
            )}
        </div>
    );
}

export default ComponentTypeEdit;
