import { FormDefinition, ImportedDataSet } from "@xgovformbuilder/model";
import React, { useContext, useState } from "react";
import { DesignerApi } from "../../api/designerApi";
import { DataContext } from "../../context";
import { i18n } from "../../i18n";
import randomId from "../../randomId";
import { renderDate } from "../../utils/renderDate";
import SummaryScreen from "../DataSets/SummaryScreen";
import { Flyout } from "../Flyout";
import "./ImportData.scss";
import ImportDataFileUpload from "./ImportDataFileUpload";
import { updateDataObjectForNewDataSet } from "./utility/helperFunctions";
import {
    Module,
    handleLinkedPropertyEffect,
    PropertyAction,
} from "../../utils";
import { Module as ReportModule } from "../../utils/linkedProperties";

export default function ImportData() {
    const designerApi = new DesignerApi();
    const { data, save } = useContext(DataContext);

    const [
        selectedDataSet,
        setSelectedDataSet,
    ] = useState<ImportedDataSet | null>();
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [uploadedFile, setUploadedFile] = useState();
    const [serverError, setServerError] = useState(false);
    const [confirm, setConfirm] = useState(false);

    const columns = [
        {
            key: "title",
            label: "importData.summaryPage.table.firstHeading",
            render: (val) => val,
            class: "title-ellipsis",
        },
        {
            key: "date",
            label: "importData.summaryPage.table.secondHeading",
            render: renderDate,
        },
    ];

    const rows = data?.importedDataSets?.map((dataSet) => ({
        id: dataSet.fileId,
        title: dataSet.fileTitle,
        date: dataSet.uploadedDate,
        fileName: dataSet.fileName,
    }));

    const saveDataSet = async (
        e,
        { fileTitle, fileName }: { fileTitle: string; fileName: string }
    ) => {
        e.preventDefault();
        // If file is selected and saving then we are EDITNG
        if (selectedDataSet) {
            await editExistingDataSet({ fileName, fileTitle });
        } else {
            // Otherwise saving a new data set
            await saveNewDataSet({ fileName, fileTitle });
        }

        setSelectedDataSet(undefined);
        setShowFileUpload(false);
    };

    const saveNewDataSet = async ({ fileTitle, fileName }) => {
        // Below for importing NEW dataset
        const newImportedDataSet = {
            fileTitle,
            fileName,
            uploadedDate: new Date(),
            fileId: randomId(),
        };

        // First upload to blob and then update Data Content and DB
        const blobStorageResponse = await designerApi.saveDataSet(
            data.id,
            newImportedDataSet,
            uploadedFile
        );

        if (blobStorageResponse.ok === true) {
            setServerError(false);
            const updatedDataObject = updateDataObjectForNewDataSet({
                newImportedDataSet,
                uploadedFile,
                data,
            });
            await save(updatedDataObject);
        } else {
            setServerError(true);
        }
    };

    const editExistingDataSet = async ({ fileTitle, fileName }) => {
        // If new file uploaded then need to generate new File id so it doesnt clash with existing in blob storage
        if (uploadedFile) {
            const edittedImportedDataSet = {
                fileTitle,
                fileName,
                uploadedDate: new Date(),
                fileId: randomId(),
            };

            const updatedImportedDataSets = data?.importedDataSets?.map(
                (dataSet) => {
                    if (dataSet.fileId === selectedDataSet?.fileId) {
                        return edittedImportedDataSet;
                    }
                    return dataSet;
                }
            );

            // Delete existing file in blob storage
            const response = await designerApi.deleteDataSet(
                selectedDataSet!.fileId
            );

            // Need to also upload new file into blob storage
            const blobStorageResponse = await designerApi.saveDataSet(
                data.id,
                edittedImportedDataSet,
                uploadedFile
            );

            if (blobStorageResponse.ok === true) {
                setServerError(true);
                let updatedDataObject: FormDefinition = {
                    ...data,
                    importedDataSets: updatedImportedDataSets,
                };
                updatedDataObject = handleLinkedPropertyEffect(
                    Module.ImportedDataSet,
                    selectedDataSet!,
                    PropertyAction.Edited,
                    updatedDataObject
                );
                await save(updatedDataObject);
            }
        } else {
            setServerError(true);
            // If only title changed then just need to update fileTitle field
            const updatedImportedDataSets = data?.importedDataSets?.map(
                (dataSet) => {
                    if (dataSet.fileId === selectedDataSet?.fileId) {
                        return { ...dataSet, fileTitle };
                    }
                    return dataSet;
                }
            );
            const updatedDataObject = {
                ...data,
                importedDataSets: updatedImportedDataSets,
            };
            await save(updatedDataObject);
        }
    };

    const deleteDataSet = async (e) => {
        e.preventDefault();

        const updatedImportedDataSets = data?.importedDataSets?.filter(
            (dataSet) => dataSet.fileId !== selectedDataSet?.fileId
        );

        let updatedDataObject: FormDefinition = {
            ...data,
            importedDataSets: updatedImportedDataSets,
        };
        updatedDataObject = handleLinkedPropertyEffect(
            Module.ImportedDataSet,
            selectedDataSet!,
            PropertyAction.Deleted,
            updatedDataObject
        );
        // Delete blob storage
        const response = await designerApi.deleteDataSet(
            selectedDataSet!.fileId
        );

        // Update form json in db too
        await save(updatedDataObject);
        setSelectedDataSet(undefined);
        setConfirm(false);
    };

    const onAddNewDataSet = () => {
        setSelectedDataSet(undefined);
        setUploadedFile(undefined);
        setShowFileUpload(true);
    };

    const onEditDataSet = () => {
        setUploadedFile(undefined);
        setShowFileUpload(true);
    };

    const onItemSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e?.target?.value) {
            const selected = data?.importedDataSets?.find(
                (obj) => obj.fileId === e.target.value
            );
            setSelectedDataSet(selected);
            setConfirm(false);
        }
    };

    const isChecked = (id) => {
        return selectedDataSet?.fileId === id;
    };

    if (showFileUpload) {
        return (
            <Flyout
                show={showFileUpload}
                onHide={() => setShowFileUpload(false)}
                width="md2"
            >
                <ImportDataFileUpload
                    selectedDataSet={selectedDataSet}
                    previouslyUploadedFile={selectedDataSet}
                    setShowFileUpload={setShowFileUpload}
                    saveDataSet={saveDataSet}
                    uploadedFile={uploadedFile}
                    setUploadedFile={setUploadedFile}
                    serverError={serverError}
                />
            </Flyout>
        );
    }

    return (
        <SummaryScreen
            selectedDataSet={selectedDataSet}
            introMesage={i18n("importData.summaryPage.intro")}
            addLabel={i18n("importData.summaryPage.buttons.import")}
            editLabel={i18n("importData.summaryPage.buttons.edit")}
            deleteLabel={i18n("importData.summaryPage.buttons.delete")}
            onAdd={onAddNewDataSet}
            onEdit={onEditDataSet}
            onDelete={deleteDataSet}
            emptyMessage={i18n("importData.summaryPage.table.emptyDataMessage")}
            onItemSelect={onItemSelect}
            isChecked={isChecked}
            columns={columns}
            rows={rows}
            moduleType={ReportModule.ImportedDataSet}
            confirm={confirm}
            setConfirm={setConfirm}
        />
    );
}
