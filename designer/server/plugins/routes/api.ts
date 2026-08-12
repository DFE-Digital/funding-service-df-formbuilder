import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import newFormJson from "../../../new-form.json";
import { Schema, DOC_UPLOAD_PATH_PREFIX } from "@xgovformbuilder/model";
// import { UploadFile } from "../../lib/sharepointService";
import { ServerRoute, ResponseObject } from "@hapi/hapi";
import { publish } from "../../lib/publish";
import config from "../../config";
import {
    blobUpload,
    downloadBlobToString,
    blobDelete,
} from "../../lib/blobService";

import csvJSONConvert from "csvjson-csv2json";
import { HapiRequest, HapiResponseToolkit } from "../../types";

export const getFormWithId: ServerRoute = {
    // GET DATA
    method: "GET",
    path: "/api/{id}/data",
    options: {
        handler: async (request, h) => {
            const { persistenceService } = request.services([]);
            const { id } = request.params;
            let formJson = newFormJson;
            try {
                const response = await persistenceService.getConfiguration(id);

                return h
                    .response(response ?? formJson)
                    .type("application/json");
            } catch (error) {
                request.logger.error(error);
                return error;
            }
        },
    },
};

export const saveDataSet: ServerRoute = {
    method: "POST",
    path: "/api/{id}/saveDataSet",
    options: {
        payload: {
            maxBytes: config.payloadSize,
            parse: true,
            multipart: true,
        },
        handler: async (request, h) => {
            const { id } = request.params;
            const { persistenceService } = request.services([]);

            try {
                const csv = request.payload?.fileUpload;
                const fileJsonOutput = csvJSONConvert.csv2json(csv, {
                    parseNumbers: true,
                });

                const dataSetFileDetails = JSON.parse(
                    request.payload?.fileDetails
                );

                const blobResponse = await blobUpload(
                    dataSetFileDetails.fileId,
                    fileJsonOutput
                );

                if (blobResponse != undefined) {
                    request.server.log(
                        ["info", "Import Data Set Blob Storage"],
                        {
                            id,
                        }
                    );

                    return h
                        .response(dataSetFileDetails)
                        .type("application/json")
                        .code(201);
                } else {
                    return h
                        .response({ Ok: false })
                        .type("application/json")
                        .code(204);
                }
            } catch (error) {
                console.log("error@90", error);
                request.server.log(["error", "/saveDataSet"], error);
                // Return response with code 500 when error is caught
                return h
                    .response({ Ok: false })
                    .type("application/json")
                    .code(500);
            }
        },
    },
};

/**
 * Server Route: /api/{id}/getDataSet
 * Fetches imported data set content based on id provided in request params
 * and returns result as JSON object
 */
export const getDataSet: ServerRoute = {
    method: "GET",
    path: "/api/{id}/getDataSet",
    options: {
        handler: async (request, h) => {
            const { id } = request.params;
            try {
                const blobDataString = await downloadBlobToString(id);
                const responseJson = JSON.parse(blobDataString);
                return h
                    .response(responseJson)
                    .type("application/json")
                    .code(201);
            } catch (error: any) {
                request.server.log(["error", "/getDataSet"], error);
                // Return response with code 500 when error is caught
                return h
                    .response({ Ok: false })
                    .type("application/json")
                    .code(500);
            }
        },
    },
};

/**
 * Server Route: /api/{id}/getDocument
 * Fetches imported document content based on id provided in request params
 * and returns result as JSON object
 */
export const getDocument: ServerRoute = {
    method: "POST",
    path: "/api/{id}/getDocument",
    options: {
        payload: {
            maxBytes: config.payloadSize,
            parse: true,
        },
        handler: async (request, h) => {
            const { id } = request.params;
            const docApiUrl = config.docUploadApi;
            const accessKey = config.docCaptureSubscriptionKey;
            try {
                const formData = new FormData();
                const payload = JSON.parse(request.payload);
                const fileName = payload?.fileName;
                const filePath = payload?.filePath;
                formData.append("FilePath", filePath);
                formData.append("SourceSystem", "DigitalForms");

                const response = await axios.post(
                    `${docApiUrl}api/FileDownload/downloadFile`,
                    formData,
                    {
                        responseType: "arraybuffer",
                        headers: {
                            "Ocp-Apim-Subscription-Key": accessKey,
                        },
                    }
                );

                let buf = Buffer.from(response.data).toString();

                const fileJsonOutput = csvJSONConvert.csv2json(buf, {
                    parseJSON: true,
                });

                return h
                    .response(fileJsonOutput)
                    .type("application/json")
                    .code(200);
            } catch (error: any) {
                request.server.log(["error", "/getDocument"], error);
                // Return response with code 500 when error is caught
                return h
                    .response({ Ok: false })
                    .type("application/json")
                    .code(500);
            }
        },
    },
};

export const deleteDataSet: ServerRoute = {
    method: "DELETE",
    path: "/api/{id}/deleteDataSet",
    options: {
        payload: {
            maxBytes: config.payloadSize,
            parse: true,
        },
        handler: async (request, h) => {
            const { id } = request.params;
            try {
                const blobDeleteResponse = await blobDelete(id);
                return h
                    .response({ Ok: true })
                    .type("application/json")
                    .code(200);
            } catch (error: any) {
                request.server.log(["error", "/deleteDataSet"], error);
                // Return response with code 500 when error is caught
                return h
                    .response({ Ok: false })
                    .type("application/json")
                    .code(500);
            }
        },
    },
};

export const uploadToSharePoint: ServerRoute = {
    method: "POST",
    path: "/api/{id}/upload",
    options: {
        payload: {
            maxBytes: config.payloadSize,
            parse: true,
            multipart: true,
        },
        handler: async (request, h) => {
            const { id } = request.params;
            const { persistenceService } = request.services([]);
            try {
                const csv = request.payload?.fileupload;
                // const sharepointUploadResponse = UploadFile(csv, id); // Upload to sharepoint is disabled as per discussion with viswa
                const output = csvJSONConvert.csv2json(csv, {
                    parseNumbers: true,
                });
                let UKPRN: Long[] = [];
                let URN: Long[] = [];
                let ADMINS: Long[] = [];
                output.map((result) => {
                    if (
                        result.establishment_UKPRN !== "" &&
                        result.establishment_UKPRN !== undefined
                    )
                        UKPRN.push(result.establishment_UKPRN);
                    else if (
                        result.establishment_URN !== "" &&
                        result.establishment_URN !== undefined
                    ) {
                        URN.push(result.establishment_URN);
                    } else if (
                        result.district_administrative_code !== undefined &&
                        result.district_administrative_code !== ""
                    ) {
                        ADMINS.push(result.district_administrative_code);
                    }
                });
                const providersMapping = {
                    id: id,
                    providers: {
                        UKPRN: UKPRN,
                        URN: URN,
                        adminCode: ADMINS,
                    },
                };
                const prevResponse = JSON.parse(request.payload?.wholedoc);
                const FormDataWithUploadedFile = {
                    ...prevResponse,
                    // file: file, /* not required at this moment */
                };
                if (providersMapping) {
                    /* save into new providers-mapping table */
                    const result = await persistenceService.uploadProvidersMapping(
                        `${id}`,
                        providersMapping
                    );
                    if (result != undefined) {
                        request.server.log(
                            ["info", "DBUpload-providers-mapping"],
                            {
                                id,
                            }
                        );

                        await persistenceService.uploadConfiguration(`${id}`, {
                            ...FormDataWithUploadedFile,
                            file: request.payload.fileName,
                        });

                        request.server.log(["info", "DBUpdate-Forms"], { id });
                        return h
                            .response({ Ok: true })
                            .type("application/json")
                            .code(204);
                    }
                }
                // return h.response({ ok: true }).code(204);
            } catch (error) {
                console.log("error@90", error);
                request.server.log(["error", "/upload"], error);
                return;
            }
        },
    },
};

export const putFormWithId: ServerRoute = {
    // SAVE DATA
    method: "PUT",
    path: "/api/{id}/data",
    options: {
        payload: {
            parse: true,
        },
        handler: async (request, h) => {
            const { id } = request.params;
            const { persistenceService } = request.services([]);

            try {
                const { value, error } = Schema.validate(request.payload, {
                    abortEarly: false,
                });

                if (error) {
                    request.logger.error(
                        ["error", `/api/${id}/data`],
                        [error, request.payload]
                    );

                    throw new Error(
                        "Schema validation failed, reason: " + error.message
                    );
                }
                await persistenceService.uploadConfiguration(`${id}`, value);
                if (config.persistentBackend === "preview") {
                    await publish(id, value);
                }
                return h.response({ ok: true }).code(204);
            } catch (err) {
                request.logger.error(
                    "Designer Server PUT /api/{id}/data error:",
                    err
                );
                const errorSummary = {
                    id: id,
                    payload: request.payload,
                    errorMessage: err.message,
                    error: err.stack,
                };
                request.yar.set(`error-summary-${id}`, errorSummary);
                return h.response({ ok: false, err }).code(401);
            }
        },
    },
};

export const deleteFormWithId: ServerRoute = {
    // DELETE DATA
    method: "DELETE",
    path: "/api/{id}/data",
    options: {
        handler: async (request, h) => {
            const { id } = request.params;
            const { persistenceService } = request.services([]);

            try {
                await persistenceService.deleteConfiguration(`${id}`);
                return h.response({ ok: true }).code(200);
            } catch (err) {
                request.logger.error(
                    "Designer Server DELETE /api/{id}/data error:",
                    err
                );
                const errorSummary = {
                    id: id,
                    payload: request.payload,
                    errorMessage: err.message,
                    error: err.stack,
                };
                request.yar.set(`error-summary-${id}`, errorSummary);
                return h.response({ ok: false, err }).code(401);
            }
        },
    },
};

export const getAllPersistedConfigurations: ServerRoute = {
    method: "GET",
    path: "/api/configurations",
    options: {
        handler: async (request, h): Promise<ResponseObject | undefined> => {
            const { persistenceService } = request.services([]);
            try {
                const response = await persistenceService.listAllConfigurations();
                return h.response(response).type("application/json");
            } catch (error) {
                request.server.log(["error", "/configurations"], error);
                return;
            }
        },
    },
};

export const log: ServerRoute = {
    method: "POST",
    path: "/api/log",
    options: {
        handler: async (request, h): Promise<ResponseObject | undefined> => {
            try {
                request.server.log(request.payload.toString());
                return h.response({ ok: true }).code(204);
            } catch (error) {
                return h.response({ ok: false }).code(500);
            }
        },
    },
};

export const fileUpload: ServerRoute = {
    method: "post",
    path: "/api/{id}/file-upload",
    options: {
        payload: {
            maxBytes: config.payloadSize,
            parse: true,
            multipart: true,
            output: "file",
        },
        handler: async (_request: HapiRequest, h: HapiResponseToolkit) => {
            // 'id' generated from client-side
            const { id } = _request.params;
            // Doc API URL and Access Key from config
            const docApiUrl = config.docUploadApi;
            const accessKey = config.docCaptureSubscriptionKey;
            // Construct formData for /fileUpload API from request payload
            const formData = new FormData();
            const payload = _request.payload;
            const document = payload?.document;
            const fileType: string = payload["fileType"] ?? "";
            const fileName: string = payload["fileName"] ?? "";
            const filePath: string = document?.path ?? "";
            const data = fs.createReadStream(filePath);
            const blobPath = `${DOC_UPLOAD_PATH_PREFIX}/${id}/${fileName}`;

            formData.append("File", data);
            formData.append("FileName", blobPath);
            formData.append("FileType", fileType);
            formData.append("SourceApplication", "DigitalForms");
            formData.append("IsAllowed", "true");
            try {
                const response = await axios.post(
                    `${docApiUrl}api/FileUpload/UploadFile`,
                    formData,
                    {
                        headers: {
                            "Ocp-Apim-Subscription-Key": accessKey,
                        },
                    }
                );
                return h
                    .response({ status: true, data: response.data })
                    .type("application/json")
                    .code(200);
            } catch (error) {
                _request.logger.error(
                    "Designer Server, POST /api/{id}/file-upload Error:",
                    error
                );
                return h
                    .response({
                        status: false,
                        error: "Failed to upload file",
                    })
                    .type("application/json")
                    .code(500);
            }
        },
    },
};
