import {
    ChildConfig,
    DependentForm,
    FormConfiguration,
    FormDefinition,
    FormStatus,
    ImportedDataSet,
    nanoid,
} from "@xgovformbuilder/model";
import { ServerRoute, ResponseObject } from "@hapi/hapi";
import moment from "moment";
import {
    ADD_CONFIG_API_URL,
    CHECK_NAME_EXISTS_URL,
    DELETE_CONFIG_API_URL,
    DELETE_MULTIPLE_CONFIG_API_URL,
    GET_CONFIG_API_URL,
    LIST_CONFIG_API_URL,
    UPDATE_MULTIPLE_FORM_STATUS,
    UPDATE_PARENT_CHILD_URL,
    UPLOAD_CONFIG_API_URL,
    DELETE_REPEATABLEQUESTION_URL,
} from "../../../constants";
import { addApiKeyToHeader } from "../../../utils";
import newFormJson from "../../../../new-form.json";
import { isValidName, tableMapper } from "./utils";
import config from "../../../config";
import { blobUpload, downloadBlobToString } from "../../../lib/blobService";
import randomId from "../../../../client/randomId";

const addLeadingZeroes = (value: number): string => {
    return (value < 10 ? "0" : "") + value;
};

const getAMPM = (hrs: number) => {
    return hrs > 11 ? "PM" : "AM";
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

const getTimestamp = (): string => {
    return moment(new Date()).format("YYYY/MM/DD, h:mm:ss A");
};

async function throwOnServerError(res: Response) {
    if (res.status === 200) return;
    const errorMessage = await res.text();
    throw Error(errorMessage);
}

const checkFormHeaders = () => {
    return addApiKeyToHeader({
        Accept: "application/json",
    });
};

export const getConfiguration: ServerRoute = {
    method: "GET",
    path: "/api/v2/getConfiguration/{id}",
    options: {
        handler: async (request, h): Promise<ResponseObject | undefined> => {
            try {
                const { id } = request.params;
                const response = await fetch(`${GET_CONFIG_API_URL}/${id}`, {
                    method: "GET",
                    headers: addApiKeyToHeader({
                        Accept: "application/json",
                    }),
                });
                const checkHeaders = checkFormHeaders();
                console.log("checkHeaders", JSON.stringify(checkHeaders));
                await throwOnServerError(response);
                const result = (await (response.json() as unknown)) as FormDefinition;
                return h
                    .response({
                        data: result,
                        error: "",
                    })
                    .type("application/json")
                    .code(200);
            } catch (error: any) {
                request.server.log(["error", "/getConfiguration"], error);
                return h
                    .response({ data: null, error: error.toString() })
                    .type("application/json")
                    .code(500);
            }
        },
    },
};

export const listFormConfigurations: ServerRoute = {
    method: "GET",
    path: "/api/v2/listFormConfigurations",
    options: {
        handler: async (request, h): Promise<ResponseObject | undefined> => {
            try {
                const response = await fetch(LIST_CONFIG_API_URL, {
                    method: "GET",
                    headers: addApiKeyToHeader({
                        Accept: "application/json",
                    }),
                });
                await throwOnServerError(response);
                const result = (await response.json()) as FormConfiguration[];
                return h
                    .response({
                        data: result,
                        error: "",
                    })
                    .type("application/json")
                    .code(200);
            } catch (error: any) {
                console.log(
                    "error - /listFormConfigurations",
                    error.toString()
                );
                request.server.log(
                    ["error", "error - /listFormConfigurations"],
                    error
                );
                return h
                    .response({ data: [], error: error.toString() })
                    .type("application/json")
                    .code(500);
            }
        },
    },
};

export const deleteFormConfigurations: ServerRoute = {
    method: "DELETE",
    path: "/api/v2/deleteConfiguration/{id}",
    options: {
        payload: {
            maxBytes: config.payloadSize,
        },
        handler: async (request, h): Promise<ResponseObject | undefined> => {
            try {
                const { id } = request.params;
                const response = await fetch(`${DELETE_CONFIG_API_URL}/${id}`, {
                    method: "DELETE",
                    headers: addApiKeyToHeader({}),
                });
                // "Form data deleted successfully."
                // "Form doesnt exist in the db"
                const result = (await (response.text() as unknown)) as string;
                await throwOnServerError(response);
                if (result === "Form doesnt exist in the db") {
                    return h
                        .response({ status: false, error: "" })
                        .type("application/json")
                        .code(200);
                }
                return h
                    .response({ status: true, error: "" })
                    .type("application/json")
                    .code(200);
            } catch (error: any) {
                request.server.log(`error deleting configuration ${error}`);
                return h
                    .response({ status: false, error: error.toString() })
                    .type("application/json")
                    .code(404);
            }
        },
    },
};

export const deleteRepeatableQuestionForm: ServerRoute = {
    method: "DELETE",
    path: "/api/v2/DeleteRepeatableFormsData/{formId}",
    options: {
        payload: {
            maxBytes: config.payloadSize,
        },
        handler: async (request, h): Promise<ResponseObject | undefined> => {
            try {
                const { formId } = request.params;
                const response = await fetch(
                    `${DELETE_REPEATABLEQUESTION_URL}/${formId}`,
                    {
                        method: "DELETE",
                        headers: addApiKeyToHeader({}),
                    }
                );
                // "Form data deleted successfully."
                // "Form doesnt exist in the db"
                const result = (await (response.text() as unknown)) as string;
                await throwOnServerError(response);
                if (result === "Form doesnt exist in the db") {
                    return h
                        .response({ status: false, error: "" })
                        .type("application/json")
                        .code(200);
                }
                return h
                    .response({ status: true, error: "" })
                    .type("application/json")
                    .code(200);
            } catch (error: any) {
                request.server.log(`error deleting configuration ${error}`);
                return h
                    .response({ status: false, error: error.toString() })
                    .type("application/json")
                    .code(404);
            }
        },
    },
};
export const addFormConfiguration: ServerRoute = {
    method: "POST",
    path: "/api/v2/addConfiguration",
    options: {
        payload: {
            parse: true,
            maxBytes: config.payloadSize,
        },
        handler: async (request, h): Promise<ResponseObject | undefined> => {
            try {
                const response = await fetch(ADD_CONFIG_API_URL, {
                    method: "POST",
                    headers: addApiKeyToHeader({
                        Accept: "application/json",
                        ["Content-Type"]: "application/json",
                    }),
                    body: JSON.stringify(request.payload),
                });
                await throwOnServerError(response);
                const apiResponse = (await (response.json() as unknown)) as FormDefinition;
                return h
                    .response({
                        status: true,
                        error: "",
                        id: "",
                    })
                    .type("application/json")
                    .code(200);
            } catch (e: any) {
                return h
                    .response({
                        status: false,
                        error: `server-error - ${e.toString()}`,
                        id: "",
                    })
                    .type("application/json")
                    .code(500);
            }
        },
    },
};

export const uploadFormConfiguration: ServerRoute = {
    method: "PUT",
    path: "/api/v2/uploadConfiguration",
    options: {
        payload: {
            parse: true,
            maxBytes: config.payloadSize,
        },
        handler: async (request, h): Promise<ResponseObject | undefined> => {
            try {
                const form = { ...request.payload } as FormDefinition;
                form.lastModified = getTimestamp();
                const response = await fetch(UPLOAD_CONFIG_API_URL, {
                    method: "PUT",
                    body: JSON.stringify(form),
                    headers: addApiKeyToHeader({
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    }),
                });
                await throwOnServerError(response);
                const apiResponse = (await (response.json() as unknown)) as FormDefinition;
                return h
                    .response(apiResponse)
                    .type("application/json")
                    .code(200);
            } catch (e: any) {
                request.server.log(["error", "/uploadConfiguration"], e);
                return h
                    .response(e.toString())
                    .type("application/json")
                    .code(500);
            }
        },
    },
};

export const updateParentChild: ServerRoute = {
    method: "POST",
    path: "/api/v2/updateParentChild",
    options: {
        handler: async (request, h): Promise<ResponseObject | undefined> => {
            try {
                const payload = JSON.parse(request.payload);
                tableMapper(payload);
                // form.lastModified = getTimestamp();
                const response = await fetch(UPDATE_PARENT_CHILD_URL, {
                    method: "POST",
                    body: JSON.stringify(payload),
                    headers: addApiKeyToHeader({
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    }),
                });
                await throwOnServerError(response);
                const apiResponse = await (response.json() as unknown);
                return h
                    .response(apiResponse)
                    .type("application/json")
                    .code(200);
            } catch (e: any) {
                request.server.log(["error", "/updateParentChild"], e);
                return h
                    .response(e.toString())
                    .type("application/json")
                    .code(500);
            }
        },
    },
};

export const checkFormNameExists: ServerRoute = {
    method: "GET",
    path: "/api/v2/checkFormExists",
    options: {
        handler: async (request, h): Promise<ResponseObject | undefined> => {
            try {
                const { name } = request.query;
                if (!isValidName(name)) {
                    return h
                        .response({
                            exists: false,
                            error: "special-character-error",
                        })
                        .type("application/json")
                        .code(200);
                }
                const response = await fetch(
                    `${CHECK_NAME_EXISTS_URL}/${name}`,
                    {
                        method: "GET",
                        headers: addApiKeyToHeader({
                            Accept: "application/json",
                        }),
                    }
                );
                await throwOnServerError(response);
                const result = (await (response.json() as unknown)) as boolean;
                if (result) {
                    return h
                        .response({ exists: true, error: "" })
                        .type("application/json")
                        .code(200);
                } else {
                    return h
                        .response({ exists: false, error: "" })
                        .type("application/json")
                        .code(500);
                }
            } catch (error: any) {
                request.server.log(["error", "/checkFormNameExists"], error);
                return h
                    .response({ exists: false, error: "" })
                    .type("application/json")
                    .code(500);
            }
        },
    },
};

type createNewFormConfigArgs = {
    name: string;
    userName: string;
    userId: string;
};

export const createNewFormConfig: ServerRoute = {
    method: "POST",
    path: "/api/v2/createNewFormConfig",
    options: {
        payload: {
            parse: true,
            maxBytes: config.payloadSize,
        },
        handler: async (request, h): Promise<ResponseObject | undefined> => {
            try {
                const arg = request.payload as createNewFormConfigArgs;
                if (
                    arg.name &&
                    arg.name !== "" &&
                    !arg.name.match(/^[a-zA-Z0-9 _-]+$/)
                ) {
                    return h
                        .response({
                            status: false,
                            id: "",
                            error:
                                "Form name should not contain special characters",
                        })
                        .type("application/json")
                        .code(200);
                }
                const newId = nanoid(10);
                const modifiedNewForm = {
                    ...newFormJson,
                    id: newId,
                    key: newId,
                    createdBy: arg.userName,
                    userId: arg.userId,
                    lastModified: getFormattedTimestamp(),
                    formStatus: FormStatus.InDevelopment,
                    displayName: arg.name,
                    name: arg.name,
                };
                const response = await fetch(ADD_CONFIG_API_URL, {
                    method: "POST",
                    headers: addApiKeyToHeader({
                        Accept: "application/json",
                        ["Content-Type"]: "application/json",
                    }),
                    body: JSON.stringify(modifiedNewForm),
                });
                await throwOnServerError(response);
                const apiResponse = (await (response.json() as unknown)) as FormDefinition;
                return h
                    .response({
                        status: true,
                        error: "",
                        id: newId,
                    })
                    .type("application/json")
                    .code(200);
            } catch (e: any) {
                return h
                    .response({
                        status: false,
                        error: `server-error - ${e.toString()}`,
                        id: "",
                    })
                    .type("application/json")
                    .code(500);
            }
        },
    },
};

export const importSavedForm: ServerRoute = {
    method: "POST",
    path: "/api/v2/importSavedForm",
    options: {
        payload: {
            parse: true,
            maxBytes: config.payloadSize,
        },
        handler: async (request, h): Promise<ResponseObject | undefined> => {
            try {
                const form = { ...request.payload } as FormDefinition;
                if (
                    form.name &&
                    form.name !== "" &&
                    !form.name.match(/^[a-zA-Z0-9 _-]+$/)
                ) {
                    return h
                        .response({
                            status: false,
                            error: "special-character-error",
                            id: "",
                        })
                        .type("application/json")
                        .code(200);
                }
                if (!form.name) {
                    return h
                        .response({
                            status: false,
                            error: "no-name-error",
                            id: "",
                        })
                        .type("application/json")
                        .code(200);
                }
                const dbResponse = await fetch(
                    `${CHECK_NAME_EXISTS_URL}/${form.name}`,
                    {
                        method: "GET",
                        headers: addApiKeyToHeader({
                            Accept: "application/json",
                        }),
                    }
                );
                const formExistsResult = (await (dbResponse.json() as unknown)) as boolean;
                if (formExistsResult) {
                    return h
                        .response({
                            status: false,
                            error: "duplicate-name-error",
                            id: "",
                        })
                        .type("application/json")
                        .code(200);
                }
                // Delete existing FID
                delete form.Fid;
                //Form metadata initialisation
                form.id = nanoid(10);
                form.key = form.id;
                form.lastModified = getFormattedTimestamp();
                form.formStatus = FormStatus.InDevelopment;
                if (form.parentChild) delete form.parentChild;
                if (form.parentDetails) delete form.parentDetails;
                const response = await fetch(ADD_CONFIG_API_URL, {
                    method: "POST",
                    headers: addApiKeyToHeader({
                        Accept: "application/json",
                        ["Content-Type"]: "application/json",
                    }),
                    body: JSON.stringify(form),
                });
                await throwOnServerError(response);
                const apiResponse = (await (response.json() as unknown)) as FormDefinition;
                return h
                    .response({
                        status: true,
                        error: "",
                        id: form.id,
                    })
                    .type("application/json")
                    .code(200);
            } catch (e: any) {
                return h
                    .response({
                        status: false,
                        error: `server-error - ${e.toString()}`,
                        id: "",
                    })
                    .type("application/json")
                    .code(500);
            }
        },
    },
};

type DuplicateFormArgs = {
    formId: string;
    name: string;
    userName: string;
    userId: string;
    duplicatedWithChild: boolean;
    childIdMap?: { [formId: string]: { id: string; name: string } };
};

export const duplicateForm: ServerRoute = {
    method: "POST",
    path: "/api/v2/duplicateForm",
    options: {
        payload: {
            parse: true,
            maxBytes: config.payloadSize,
        },
        handler: async (request, h): Promise<ResponseObject | undefined> => {
            try {
                const args = request.payload as DuplicateFormArgs;
                if (!isValidName(args.name)) {
                    return h
                        .response({
                            status: false,
                            error: "special-character-error",
                            id: "",
                        })
                        .type("application/json")
                        .code(200);
                }
                const formAPIResponse = await fetch(
                    `${GET_CONFIG_API_URL}/${args.formId}`,
                    {
                        method: "GET",
                        headers: addApiKeyToHeader({
                            Accept: "application/json",
                        }),
                    }
                );
                const formResponse = (await (formAPIResponse.json() as unknown)) as FormDefinition;
                if (!formResponse) {
                    return h
                        .response({
                            status: false,
                            error: "no-form-found-error",
                            id: "",
                        })
                        .type("application/json")
                        .code(200);
                }
                const form = formResponse;
                const dbResponse = await fetch(
                    `${CHECK_NAME_EXISTS_URL}/${args.name}`,
                    {
                        method: "GET",
                        headers: addApiKeyToHeader({
                            Accept: "application/json",
                        }),
                    }
                );
                const formExistsResult = (await (dbResponse.json() as unknown)) as boolean;
                if (formExistsResult) {
                    return h
                        .response({
                            status: false,
                            error: "duplicate-name-error",
                            id: "",
                        })
                        .type("application/json")
                        .code(200);
                }
                //Form metadata initialisation
                const newId = nanoid(10);
                form.id = newId;
                form.key = newId;
                form.name = args.name;
                form.displayName = args.name;
                form.lastModified = getFormattedTimestamp();
                form.formStatus = FormStatus.InDevelopment;
                form.createdBy = args.userName;
                form.userId = args.userId;
                // Remove SQL Form ID
                delete form.Fid;
                if (!args.duplicatedWithChild) {
                    delete form.parentChild;
                    delete form.parentDetails;
                } else {
                    if (args.childIdMap) {
                        form.parentChild!.parentChildConfig.childConfigs = form.parentChild!.parentChildConfig.childConfigs.reduce(
                            (filtered, childConfig) => {
                                const newInfo = args.childIdMap![
                                    childConfig.childId
                                ];
                                const filteredChildDependents = childConfig.dependentforms.reduce(
                                    (filteredDependents, dependent) => {
                                        const newDependentInfo = args.childIdMap![
                                            dependent.id
                                        ];
                                        if (newDependentInfo?.id) {
                                            return filteredDependents.concat({
                                                ...dependent,
                                                id: newDependentInfo.id,
                                                name: newDependentInfo.name,
                                            });
                                        }
                                        return filteredDependents;
                                    },
                                    [] as DependentForm[]
                                );
                                if (newInfo?.id) {
                                    return filtered.concat({
                                        ...childConfig,
                                        childId: newInfo.id,
                                        parentId: newId,
                                        childFormName: newInfo.name,
                                        dependentforms: filteredChildDependents,
                                    });
                                }
                                return filtered;
                            },
                            [] as ChildConfig[]
                        );
                        form.parentChild!.id = newId;
                    }
                }
                // Loop through imported datasets in original form and duplicate in blob storage with new Ids
                // Then use new Ids in duplicate form
                const updatedDataSets = form.importedDataSets?.map(
                    async (dataset) => {
                        try {
                            const blobDataString = await downloadBlobToString(
                                dataset.fileId
                            );
                            const responseJson = JSON.parse(blobDataString);

                            const dataSetFileDetails = {
                                fileTitle: dataset.fileTitle,
                                fileName: dataset.fileName,
                                uploadedDate: new Date(),
                                fileId: randomId(),
                            };

                            const blobResponse = await blobUpload(
                                dataSetFileDetails.fileId,
                                responseJson
                            );

                            if (blobResponse != undefined) {
                                request.server.log(
                                    ["info", "Import Data Set Blob Storage"],
                                    {
                                        id: form.id,
                                    }
                                );

                                // Loop through designed datasets and change blob storage reference to new value
                                const newDesignedDataSets = form.designedDataSets?.map(
                                    (designedDataset) =>
                                        designedDataset.csvUsed ===
                                        dataset.fileId
                                            ? {
                                                  ...designedDataset,
                                                  csvUsed:
                                                      dataSetFileDetails.fileId,
                                              }
                                            : designedDataset
                                );

                                form.designedDataSets = newDesignedDataSets;

                                return dataSetFileDetails as ImportedDataSet;
                            } else {
                                return null;
                            }
                        } catch (error) {
                            console.log("error@90", error);
                            return null;
                        }
                    }
                );

                form.importedDataSets = updatedDataSets
                    ? (await Promise.all(updatedDataSets)).filter(
                          (dataset) => dataset !== null
                      )
                    : [];

                const response = await fetch(ADD_CONFIG_API_URL, {
                    method: "POST",
                    headers: addApiKeyToHeader({
                        Accept: "application/json",
                        ["Content-Type"]: "application/json",
                    }),
                    body: JSON.stringify(form),
                });
                await throwOnServerError(response);
                const apiResponse = (await (response.json() as unknown)) as FormDefinition;
                return h
                    .response({
                        status: true,
                        error: "",
                        id: newId,
                    })
                    .type("application/json")
                    .code(200);
            } catch (e: any) {
                return h
                    .response({
                        status: false,
                        error: `server-error - ${e.toString()}`,
                        id: "",
                    })
                    .type("application/json")
                    .code(500);
            }
        },
    },
};

type MutipleFormStatusPayload = {
    FormId: string;
    Status: FormStatus;
};

export const updateMultipleFormStatus: ServerRoute = {
    method: "POST",
    path: "/api/v2/changeMultipleformstatus",
    options: {
        handler: async (request, h): Promise<ResponseObject | undefined> => {
            try {
                const payload = request.payload as MutipleFormStatusPayload[];
                const response = await fetch(UPDATE_MULTIPLE_FORM_STATUS, {
                    method: "POST",
                    body: JSON.stringify(payload),
                    headers: addApiKeyToHeader({
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    }),
                });
                await throwOnServerError(response);
                const apiResponse = (await (response.json() as unknown)) as FormDefinition;
                return h
                    .response(apiResponse)
                    .type("application/json")
                    .code(200);
            } catch (e: any) {
                request.server.log(["error", "/changeMultipleformstatus"], e);
                return h
                    .response(e.toString())
                    .type("application/json")
                    .code(500);
            }
        },
    },
};

export const deleteMultipleFormConfigurations: ServerRoute = {
    method: "DELETE",
    path: "/api/v2/deleteMultipleConfiguration",
    options: {
        handler: async (request, h): Promise<ResponseObject | undefined> => {
            try {
                const body = request.payload;
                const response = await fetch(
                    `${DELETE_MULTIPLE_CONFIG_API_URL}`,
                    {
                        method: "DELETE",
                        headers: addApiKeyToHeader({
                            Accept: "application/json",
                            "Content-Type": "application/json",
                        }),
                        body: body,
                    }
                );
                // "Form data deleted successfully."
                // "Form doesnt exist in the db"
                const result = (await (response.text() as unknown)) as string;
                await throwOnServerError(response);
                if (result === "Form doesnt exist in the db") {
                    return h
                        .response({ status: false, error: "" })
                        .type("application/json")
                        .code(200);
                }
                return h
                    .response({ status: true, error: "" })
                    .type("application/json")
                    .code(200);
            } catch (error: any) {
                request.server.log(
                    `error deleting multiple configuration ${error}`
                );
                return h
                    .response({ status: false, error: error.toString() })
                    .type("application/json")
                    .code(404);
            }
        },
    },
};
