export function updateDataObjectForNewDataSet({
    newImportedDataSet,
    data,
    uploadedFile,
}) {
    let updatedDataObject;
    if (Array.isArray(data.importedDataSets)) {
        updatedDataObject = {
            ...data,
            importedDataSets: [...data.importedDataSets, newImportedDataSet],
        };
    } else {
        updatedDataObject = {
            ...data,
            importedDataSets: [newImportedDataSet],
        };
    }
    return updatedDataObject;
}
