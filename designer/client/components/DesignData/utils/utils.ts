import { isEqual } from "lodash";
import {
    DataSet,
    DesignedDataSet,
    FormDefinition,
    InputType,
} from "@xgovformbuilder/model";
import { DesignerApi } from "../../../api/designerApi";
import randomId from "../../../randomId";
import {
    DynamicDataSet,
    SelectedDataSet,
    RenderTableType,
    TableDimension,
    TempDataSetFormat,
} from "../types";

/** Retrieves the keys from imported data set object */
export const retrieveKeys = (data: any) => {
    let keys;
    if (Array.isArray(data)) {
        keys = Object.keys(data[0]);
        return keys;
    }
    keys = Object.keys(data);
    return keys;
};

/** Generates options for select field in table from imported data set keys */
export const retrieveOptions = (selectedDataSet: SelectedDataSet): string[] => {
    const { keys } = selectedDataSet;
    const options: string[] = [];
    keys.forEach((key) => {
        options.push(`${key}-Header`);
        options.push(`${key}-Value`);
    });
    return options;
};

/**
 * Generates initial empty data set structure for Dynamic Table
 * @param {number} rows number of rows
 * @param {number} columns number of columns
 * @returns {DynamicDataSet} returns empty initial dynamic dataset
 */
export const generateEmptyDynamicDataSet = (
    rows: number,
    columns: number
): DynamicDataSet => {
    const result = {};
    for (let i = 1; i <= rows; i++) {
        for (let j = 1; j <= columns; j++) {
            result[`${i}-${j}`] = {
                type: InputType.CUSTOM,
                value: "",
                bold: false,
                calc: false,
                checked: false,
                numeric: false,
            };
        }
    }
    return result;
};

/**
 * Checks if all the cells in table are filled to enable save button
 * @param tableDimension number of rows and columns
 * @param dataset dataset entered by the user
 * @returns
 */
export const isReadyForSave = (
    tableDimension: TableDimension,
    dataset: DynamicDataSet,
    isEdit: boolean,
    formData: FormDefinition,
    selectedId: string | undefined,
    datasetName: string,
    selectedCSVId: string,
    key: string,
    duplicateTitleError: boolean
): boolean => {
    if (duplicateTitleError) return true;
    const { rows, columns } = tableDimension;
    if (!rows) return true;
    const indicesToBeChecked = constructIndicesArray(rows, columns);
    let indicesLeft = indicesToBeChecked.filter((index) => !dataset[index]);
    if (indicesLeft.length) return true;
    let flag = false;
    for (const value of Object.values(dataset)) {
        if (value?.type === InputType.FILLED && !value?.value) {
            flag = false;
            continue;
        }
        if (
            (value?.type === InputType.CUSTOM ||
                value?.type === InputType.SELECT) &&
            !!value?.value
        ) {
            flag = false;
            continue;
        }
        // Exits loop when even one cell data fails
        flag = true;
        break;
    }
    if (flag) return true;
    // Disables when value is same as saved on edit
    if (isEdit) {
        const selectedData = formData?.designedDataSets?.find(
            (dataset) => dataset.id === selectedId
        )!;
        const { title, data, csvUsed, keyIdentifier } = selectedData;
        const flattenedData = data.flat();
        const checkSame: boolean[] = [];
        // Checks if the value is same
        const isSameTableValue = flattenedData.every((obj) => {
            const obj1 = dataset[obj.index];
            const obj2 = {
                type: obj.type,
                value: obj.value,
                bold: obj.bold,
                calc: obj.calc,
                checked: obj.checked,
                numeric: obj.numeric,
                format: obj.format,
            };
            return isEqual(obj1, obj2);
        });
        checkSame.push(isSameTableValue);
        // Checks if the name is same
        const isSameName = datasetName === title;
        checkSame.push(isSameName);
        // Checks if the table dimension is same
        const isSameDimension =
            rows === data.length && columns === data[0].length;
        checkSame.push(isSameDimension);
        // Checks if selected CSV is same
        const isSameSelectedCSV = csvUsed === selectedCSVId;
        checkSame.push(isSameSelectedCSV);
        // Checks if key identifier is same
        const isSameKeyIdentifier = key === keyIdentifier;
        checkSame.push(isSameKeyIdentifier);
        if (checkSame.every((cond) => cond)) return true;
    }
    return flag;
};

/**
 * Formats the dynamic data set to desired arrays for storing in form data
 * @param tableDimension row and column count
 * @param dataset dynamic data set derived from table inputs
 * @param title name of the designed data set
 * @param csvId selected csv/imported data set
 * @param keyIdentifier key identifier selected from the csv/imported data set
 * @returns
 */
export const prepareDataSetForSave = (
    tableDimension: TableDimension,
    dataset: DynamicDataSet,
    title: string,
    csvId: string,
    keyIdentifier: string
): DesignedDataSet => {
    const { rows, columns } = tableDimension;
    const result = Array.from(Array(rows), () => new Array(columns));
    const tempResult: TempDataSetFormat[] = [];
    for (const [key, value] of Object.entries(dataset)) {
        const parsedStr = key.split("-");
        const row = parseInt(parsedStr[0]);
        const column = parseInt(parsedStr[1]);
        const data = {
            row,
            column,
            numericIndex: row * 10 + column,
            index: key,
            ...value,
        };
        tempResult.push(data);
    }
    tempResult.sort((a, b) => a.numericIndex - b.numericIndex);
    tempResult.forEach((obj) => {
        const formattedData = {
            index: obj.index,
            type: obj.type,
            value: obj.value,
            bold: obj.bold,
            calc: obj.calc,
            checked: obj.checked,
            numeric: obj.numeric,
            format: obj.format,
        };
        result[obj.row - 1][obj.column - 1] = formattedData;
    });
    const designedDataSet = {
        id: randomId(),
        title,
        uploadedDate: new Date(),
        csvUsed: csvId,
        keyIdentifier,
        data: result as DataSet[][],
    };
    return designedDataSet;
};

/**
 * Retrieves the CSV/Imported Data Set Name from the id given
 * @param data form data
 * @param id id of the csv/imported data set
 * @returns
 */
export const retrieveCsvName = (data: FormDefinition, id: string) => {
    const csvData = data?.importedDataSets?.find((obj) => obj.fileId === id);
    if (!csvData) return "";
    return csvData.fileTitle;
};

/**
 * Constructs an array of string containing indices from row and column count
 * @param rows number of rows
 * @param columns number of columns
 * @returns
 */
const constructIndicesArray = (rows: number, columns: number) => {
    const result: string[] = [];
    for (let i = 1; i <= rows; i++) {
        for (let j = 1; j <= columns; j++) {
            result.push(`${i}-${j}`);
        }
    }
    return result;
};

type ValidationOptionsForTableDimension = {
    tableDimension: TableDimension;
    dynamicTableDataSet: DynamicDataSet;
    setter: React.Dispatch<React.SetStateAction<DynamicDataSet>>;
};

/** Validates Data Set based on rows and columns set */
export const validateDataSetBasedOnTableDimension = ({
    tableDimension,
    dynamicTableDataSet,
    setter,
}: ValidationOptionsForTableDimension) => {
    if (tableDimension.rows && tableDimension.columns) {
        if (Object.keys(dynamicTableDataSet).length) {
            const { rows, columns } = tableDimension;
            const indicesToBeChecked = constructIndicesArray(rows, columns);
            const indicesAvailable = Object.keys(dynamicTableDataSet);
            const indicesToBeDeleted = indicesAvailable.filter(
                (index) => !indicesToBeChecked.includes(index)
            );
            const validatedDataSet = { ...dynamicTableDataSet };
            indicesToBeDeleted.forEach((index) => {
                delete validatedDataSet[index];
            });
            setter(validatedDataSet);
        }
    }
};

type ValidationOptionsForSelectedDataSet = {
    selectedDataSet: SelectedDataSet;
    dynamicTableDataSet: DynamicDataSet;
    setKeyIdentifier: React.Dispatch<React.SetStateAction<string>>;
    setDataSet: React.Dispatch<React.SetStateAction<DynamicDataSet>>;
};

/** Validates Data Set and Key Identifier when we select different data set (CSV) */
export const validateDataSetBasedOnSelectedDataSet = ({
    selectedDataSet,
    dynamicTableDataSet,
    setDataSet,
    setKeyIdentifier,
}: ValidationOptionsForSelectedDataSet) => {
    setKeyIdentifier("");
    if (Object.keys(dynamicTableDataSet).length) {
        const indicesToBeValidated: string[] = [];
        for (const [key, value] of Object.entries(dynamicTableDataSet)) {
            if (value.type === InputType.SELECT) {
                indicesToBeValidated.push(key);
            }
        }
        const validatedDataSet = { ...dynamicTableDataSet };
        indicesToBeValidated.forEach((index) => {
            validatedDataSet[index] = {
                type: InputType.CUSTOM,
                value: "",
                bold: false,
                calc: false,
                checked: false,
                numeric: false,
            };
        });
        setDataSet(validatedDataSet);
    }
};

type EditOptions = {
    data: DesignedDataSet;
    setName: React.Dispatch<React.SetStateAction<string>>;
    setRows: React.Dispatch<React.SetStateAction<number | null>>;
    setColumns: React.Dispatch<React.SetStateAction<number>>;
    setTableDimension: React.Dispatch<React.SetStateAction<TableDimension>>;
    setCSV: React.Dispatch<React.SetStateAction<SelectedDataSet>>;
    setKey: React.Dispatch<React.SetStateAction<string>>;
    setTableData: React.Dispatch<React.SetStateAction<DynamicDataSet>>;
    designerApi: DesignerApi;
    renderTable: React.Dispatch<React.SetStateAction<RenderTableType | null>>;
};

/**
 * Pre-populates state data when in edit mode
 * @param options contains setters and data for pre-population
 */
export const populateForEdit = async (options: EditOptions) => {
    const { data, csvUsed, title, keyIdentifier } = options.data;
    // Set Name
    options.setName(title);
    // Set Row, Column and Table Dimension
    const rows = data.length;
    const columns = data[0].length;
    options.setRows(rows);
    options.setColumns(columns);
    options.setTableDimension({ rows, columns });
    // Set CSV Used
    if (csvUsed) {
        const downloadedCSVData = await options.designerApi.getDataSet(csvUsed);
        const selectedCSVInfo = {
            datasetId: csvUsed,
            keys: retrieveKeys(downloadedCSVData),
        };
        options.setCSV(selectedCSVInfo);
    }
    // Set Dynamic Table Data
    const flattenedData = data.flat();
    const dataMap: DynamicDataSet = {};
    flattenedData.forEach((obj) => {
        dataMap[obj.index] = {
            type: obj.type,
            value: obj.value,
            bold: obj.bold,
            calc: obj.calc,
            checked: obj.checked,
            numeric: obj.numeric,
            format: obj.format,
        };
    });
    options.setTableData(dataMap);
    // Set Render
    options.renderTable(RenderTableType.INITIAL);
    // Set Key Identifier
    keyIdentifier && options.setKey(keyIdentifier);
};
