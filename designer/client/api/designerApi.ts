import { FormDefinition, ImportedDataSet } from "@xgovformbuilder/model";
import { FileUploadResponse } from "./types";
import logger from "../plugins/logger";
import { GET_CONFIG_API_URL } from "./constants";
import {
    getConfiguration,
    getFormConfigurationsResponse,
    updateForm,
} from "./formConfigurationsApi";

export class DesignerApi {
    async save(
        id: string,
        updatedData: FormDefinition
    ): Promise<Response | any> {
        const response = await updateForm(updatedData);
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response;
    }

    async upload(id: string, document: any) {
        const data = new FormData();
        data.append("fileName", document.file.name);
        data.append("fileupload", document.file);
        data.append("wholedoc", JSON.stringify(document));
        const response = await window.fetch(`/api/${id}/upload`, {
            method: "post",
            body: data,
        });
        return response;
    }

    async fileUpload(id: string, document: File): Promise<FileUploadResponse> {
        const data = new FormData();
        data.append("fileName", document.name);
        data.append("fileType", document.type);
        data.append("document", document);
        const response = await window.fetch(`/api/${id}/file-upload`, {
            method: "post",
            body: data,
        });
        return response.json();
    }

    /**
     * Fetches content of dataset based on id
     * @param id id/name of the imported data set
     * @returns imported data set content as json
     */
    async getDataSet(id: string) {
        if (!id) return {};
        try {
            const response = await window.fetch(`/api/${id}/getDataSet`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });
            const responseJson = await response.json();
            if (responseJson.error) return {};
            return responseJson;
        } catch (error) {
            logger.error("fetchData", error);
        }
    }

    /**
     * Fetches content of document based on id
     * @param id id/name of the imported document
     * @returns imported document content as json
     */
    async getDocument(id: string, file: any) {
        if (!id) return {};
        const data = new FormData();
        data.append("fileUpload", file);
        try {
            const response = await window.fetch(`/api/${id}/getDocument`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain",
                    "Content-Type": "application/json;charset=UTF-8",
                },
                mode: "no-cors",
                body: JSON.stringify({
                    fileName: file.fileName,
                    filePath: file.path,
                }),
            });

            const responseJson = await response.json();
            if (responseJson.error) return {};
            return responseJson;
        } catch (error) {
            logger.error("fetch Document Data", error);
        }
    }

    async saveDataSet(id: string, newDataSet: ImportedDataSet, file: any) {
        const data = new FormData();
        data.append("fileDetails", JSON.stringify(newDataSet));
        data.append("fileUpload", file);
        const response = await window.fetch(`/api/${id}/saveDataSet`, {
            method: "post",
            body: data,
        });
        return response;
    }

    async deleteDataSet(id: string) {
        const response = await window.fetch(`/api/${id}/deleteDataSet`, {
            method: "DELETE",
        });
        return response;
    }

    async fetchData(id: string) {
        try {
            const result = await getConfiguration(id);
            return result;
        } catch (e) {
            logger.error("fetchData", e);
            return null;
        }
    }
    async deleteData(id: string): Promise<Response | any> {
        const response = await window.fetch(`/api/${id}/data`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response;
    }
    async fetchAllConfigs() {
        try {
            const response = await window.fetch("/api/configurations", {
                method: "get",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });

            return response.json();
        } catch (e) {
            logger.error("fetchData", e);
        }
    }
}
