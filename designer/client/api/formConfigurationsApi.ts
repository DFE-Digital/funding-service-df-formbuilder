import {
    FormConfiguration,
    FormDefinition,
    updateMultileForms,
} from "@xgovformbuilder/model";
import {
    ADD_CONFIG_API_URL,
    CHECK_NAME_EXISTS_URL,
    CREATE_NEW_CONFIG_URL,
    DELETE_CONFIG_API_URL,
    DELETE_MULTIPLE_CONFIG_API_URL,
    DUPLICATE_FORM_URL,
    GET_CONFIG_API_URL,
    IMPORT_FORM_CONFIG_URL,
    LIST_CONFIG_API_URL,
    UPDATE_PARENT_CHILD_URL,
    UPLOAD_CONFIG_API_URL,
    DELETE_REPEATABLEQUESTION_URL,
} from "./constants";
import { getCurrentUserData } from "./usersApi";

const addLeadingZeroes = (value: number): string => {
    return (value < 10 ? "0" : "") + value;
};

const getAMPM = (hrs: number) => {
    return hrs > 12 ? "PM" : "AM";
};

const getHour = (hrs: number) => {
    return hrs > 12 ? hrs - 12 : hrs;
};

const getFormattedTimestamp = (): string => {
    const date = new Date();
    return `${date.getFullYear()}/${addLeadingZeroes(
        date.getMonth() + 1
    )}/${addLeadingZeroes(date.getDate())} ${addLeadingZeroes(
        getHour(date.getHours())
    )}:${addLeadingZeroes(date.getMinutes())}:${addLeadingZeroes(
        date.getSeconds()
    )} ${getAMPM(date.getHours())}`;
};

type listFormConfigurationsResponse = {
    data: FormConfiguration[];
    error: string;
};

export const fetchAllformConfigs = async () => {
    try {
        const response = await fetch(LIST_CONFIG_API_URL, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        });
        const result = (await (response.json() as unknown)) as listFormConfigurationsResponse;
        return result;
    } catch (e: any) {
        return {
            data: [],
            error: e.toString(),
        } as listFormConfigurationsResponse;
    }
};

export type getFormConfigurationsResponse = {
    data: FormDefinition;
    error: string;
};

export const getConfiguration = async (id: string) => {
    try {
        const response = await window.fetch(`${GET_CONFIG_API_URL}/${id}`, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        });
        const result = (await (response.json() as unknown)) as getFormConfigurationsResponse;
        return result.data;
    } catch (e) {
        return null;
    }
};

type deleteFormConfigurationsResponse = {
    status: boolean;
    error: string;
};

export const deleteFormConfig = async (id: string) => {
    try {
        const response = await fetch(`${DELETE_CONFIG_API_URL}/${id}`, {
            method: "DELETE",
        });
        const result = (await (response.json() as unknown)) as deleteFormConfigurationsResponse;
        return result;
    } catch (e: any) {
        return {
            status: false,
            error: e.toString(),
        } as deleteFormConfigurationsResponse;
    }
};

export const deleteRepeatableQuestionForm = async (formId: string) => {
    try {
        const response = await fetch(
            `${DELETE_REPEATABLEQUESTION_URL}/${formId}`,
            {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    ["Content-Type"]: "application/json",
                },
                body: JSON.stringify({ formId }),
            }
        );
        const result = (await response.json()) as boolean; // Awaiting the JSON response
        return result;
    } catch (e: any) {
        return false;
    }
};
type createNewFormConfigurationsResponse = {
    status: boolean;
    error: string;
    id: string;
};

type createNewFormConfigArgs = {
    name: string;
    userName: string;
    userId: string;
};

export const createNewFormConfig = async (arg: createNewFormConfigArgs) => {
    try {
        const response = await fetch(CREATE_NEW_CONFIG_URL, {
            method: "POST",
            headers: {
                Accept: "application/json",
                ["Content-Type"]: "application/json",
            },
            body: JSON.stringify(arg),
        });
        const result = (response.json() as unknown) as createNewFormConfigurationsResponse;
        return result;
    } catch (e: any) {
        return {
            status: false,
            id: "",
            error: e.toString(),
        } as createNewFormConfigurationsResponse;
    }
};

type importFormConfigurationsResponse = {
    status: boolean;
    error: string;
    id: string;
};

export const importSavedForm = async (form: FormDefinition) => {
    try {
        const response = await fetch(IMPORT_FORM_CONFIG_URL, {
            method: "POST",
            headers: {
                Accept: "application/json",
                ["Content-Type"]: "application/json",
            },
            body: JSON.stringify(form),
        });
        const result = (response.json() as unknown) as importFormConfigurationsResponse;
        return result;
    } catch (e: any) {
        return {
            status: false,
            error: "server-error",
            id: "",
        } as importFormConfigurationsResponse;
    }
};

type checkIfFormNameExistsResponse = {
    exists: boolean;
    error: string;
};

export const checkIfFormNameExists = async (name: string) => {
    try {
        const response = await fetch(
            `${CHECK_NAME_EXISTS_URL}?name=${encodeURIComponent(name)}`,
            {
                method: "GET",
            }
        );
        const result = (response.json() as unknown) as checkIfFormNameExistsResponse;
        return result;
    } catch (e: any) {
        return {
            exists: false,
            error: e.toString(),
        } as checkIfFormNameExistsResponse;
    }
};

type DuplicateFormResponse = {
    status: boolean;
    id: string;
    error: string;
};

type DuplicateFormArgs = {
    formId: string;
    name: string;
    userName: string;
    userId: string;
    duplicatedWithChild: boolean;
    childIdMap?: { [formId: string]: { id: string; name: string } };
};

export const duplicateFormConfiguration = async (args: DuplicateFormArgs) => {
    try {
        const response = await fetch(DUPLICATE_FORM_URL, {
            method: "POST",
            headers: {
                Accept: "application/json",
                ["Content-Type"]: "application/json",
            },
            body: JSON.stringify(args),
        });
        const result = (response.json() as unknown) as DuplicateFormResponse;
        return result;
    } catch (e: any) {
        return {
            status: false,
            error: "server-error",
            id: "",
        } as DuplicateFormResponse;
    }
};

export const updateForm = async (form: FormDefinition) => {
    try {
        const response = await window.fetch(UPLOAD_CONFIG_API_URL, {
            method: "PUT",
            body: JSON.stringify(form),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response;
    } catch (err: any) {
        throw Error(err);
    }
};

export const updateMultipleForms = async (form: updateMultileForms) => {
    try {
        const response = await window.fetch(UPDATE_PARENT_CHILD_URL, {
            method: "POST",
            body: JSON.stringify(form),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        if (response.status === 500) {
            return response;
        }
        return response;
    } catch (err: any) {
        throw Error(err);
    }
};

export const deleteMultipleFormConfig = async (ids: string[]) => {
    try {
        const response = await fetch(`${DELETE_MULTIPLE_CONFIG_API_URL}`, {
            method: "DELETE",
            body: JSON.stringify(ids),
        });
        const result = (await (response.json() as unknown)) as deleteFormConfigurationsResponse;
        return result;
    } catch (e: any) {
        return {
            status: false,
            error: e.toString(),
        } as deleteFormConfigurationsResponse;
    }
};
