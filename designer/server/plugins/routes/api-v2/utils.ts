import moment from "moment";

export enum TableNameType {
    FORMS = "Forms",
    PAGES = "Pages",
    SECTIONS = "Sections",
    CONDITIONS = "Conditions",
    LISTS = "Lists",
    CALCULATIONS = "Calculations",
    DOCUMENTS = "Documents",
}

const formsTableKeys = [
    "file",
    "signInRequired",
    "formStatus",
    "createdBy",
    "id",
    "key",
    "displayName",
];
const pagesTableKeys = ["pages"];
const listTableKeys = ["lists"];
const sectionsTableKeys = ["sections"];
const conditionTableKeys = ["conditions"];
const calculationsTableKeys = ["calculations"];
const documentsTableKeys = ["documents"];

type FieldType = {
    formId: string;
    FieldChanges: Object;
};

const findInArray = (array1, array2) => {
    return array1.some((value) => array2.includes(value));
};

const getTimestamp = (): string => {
    return moment(new Date()).format("YYYY/MM/DD, h:mm:ss A");
};

export const tableMapper = (fields: FieldType) => {
    fields?.map((field) => {
        const fieldKeys = Object.keys(field.FieldChanges);
        if (findInArray(fieldKeys, formsTableKeys)) {
            field.tableName = TableNameType.FORMS;
            // field.lastModified = getTimestamp();
        } else if (findInArray(fieldKeys, pagesTableKeys)) {
            field.tableName = TableNameType.PAGES;
        } else if (findInArray(fieldKeys, listTableKeys)) {
            field.tableName = TableNameType.LISTS;
        } else if (findInArray(fieldKeys, sectionsTableKeys)) {
            field.tableName = TableNameType.SECTIONS;
        } else if (findInArray(fieldKeys, conditionTableKeys)) {
            field.tableName = TableNameType.CONDITIONS;
        } else if (findInArray(fieldKeys, calculationsTableKeys)) {
            field.tableName = TableNameType.CALCULATIONS;
        } else if (findInArray(fieldKeys, documentsTableKeys)) {
            field.tableName = TableNameType.DOCUMENTS;
        }
    });
};

export const isValidName = (name) => {
    // rejects &, /, <, >, +, !
    return !(name && name !== "" && /[&/<>+!]/.test(name));
};
