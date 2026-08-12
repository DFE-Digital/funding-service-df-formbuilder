import { ResponseObject, ServerRoute } from "hapi";
import {
    UPLOAD_PROVIDER_MAPPING_URL,
    UPLOAD_MULTIPLE_PROVIDER_MAPPING_URL,
} from "../../../constants";
import { addApiKeyToHeader } from "../../../utils";
import config from "../../../config";

export const addProviderMapping: ServerRoute = {
    method: "POST",
    path: "/api/v2/uploadProvidersMapping",
    options: {
        payload: {
            maxBytes: config.payloadSize,
            parse: true,
        },
        handler: async (request, h): Promise<ResponseObject | undefined> => {
            try {
                console.log(
                    "UPLOAD_PROVIDER_MAPPING_URL URL",
                    UPLOAD_PROVIDER_MAPPING_URL
                );
                var response = await fetch(UPLOAD_PROVIDER_MAPPING_URL, {
                    method: "POST",
                    headers: addApiKeyToHeader({
                        Accept: "application/json",
                        ["Content-Type"]: "application/json",
                    }),
                    body: JSON.stringify(request.payload),
                });
                console.log(
                    "UPLOAD_PROVIDER_MAPPING_URL response for provide mapping",
                    response
                );
                var apiResponse = (await (response.json() as unknown)) as boolean;
                console.log("apiResponse for provide mapping", apiResponse);
                if (apiResponse === true) {
                    return h
                        .response({ status: true })
                        .type("application/json")
                        .code(200);
                } else {
                    return h
                        .response({ status: false })
                        .type("application/json")
                        .code(500);
                }
            } catch (e: any) {
                return h
                    .response({ status: false })
                    .type("application/json")
                    .code(500);
            }
        },
    },
};

export const addMultipleProviderMapping: ServerRoute = {
    method: "POST",
    path: "/api/v2/uploadMultipleProvidersMapping",
    options: {
        handler: async (request, h): Promise<ResponseObject | undefined> => {
            try {
                console.log(request.payload);
                const response = await fetch(
                    UPLOAD_MULTIPLE_PROVIDER_MAPPING_URL,
                    {
                        method: "POST",
                        headers: addApiKeyToHeader({
                            Accept: "application/json",
                            ["Content-Type"]: "application/json",
                        }),
                        body: JSON.stringify(request.payload),
                    }
                );
                const apiResponse = (await (response.json() as unknown)) as boolean;
                return h
                    .response({ status: true })
                    .type("application/json")
                    .code(200);
            } catch (e: any) {
                return h
                    .response({ status: false })
                    .type("application/json")
                    .code(500);
            }
        },
    },
};
