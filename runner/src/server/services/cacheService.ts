import hoek from "hoek";
import { HapiRequest, HapiServer } from "../types";
import { FormSubmissionState } from "../plugins/engine/types";
import {
    getSqlCacheById,
    setSqlCacheById,
} from "server/plugins/engine/services/formService";
const partition = "cache";

enum ADDITIONAL_IDENTIFIER {
    Confirmation = ":confirmation",
}

export class CacheService {
    /**
     * This service is responsible for getting, storing or deleting a user's session data in the cache. This service has been registered by {@link createServer}
     */
    cache: any;
    logger: HapiServer["logger"];

    constructor(server: HapiServer) {
        this.cache = server.cache({ segment: "cache" });
        this.logger = server.logger;
    }

    async getState(request: HapiRequest): Promise<FormSubmissionState> {
        this.logger.debug(
            { key: JSON.stringify(this.Key(request)), path: request.path },
            "getState-begin"
        );
        let id =
            request.yar.get("formId") +
            (request.yar.get("organisation") !== null
                ? request.yar.get("organisation")?.ukprn ??
                  request.yar.get("organisation")?.DistrictAdministrative_code
                : request.yar.id);
        id =
            id +
            (request.url.hostname.toLocaleLowerCase().includes("uat")
                ? "UAT"
                : "");
        var cacheid = await getSqlCacheById(id);
        if (cacheid === "Data not found") {
            cacheid = {};
        }
        this.logger.debug(
            { state: JSON.stringify(cacheid) },
            "getState-end ukprn"
        );
        return cacheid || {};
    }

    async mergeState(
        request: HapiRequest,
        value: object,
        state: any | undefined = undefined,
        nullOverride = true,
        arrayMerge = false
    ) {
        let id =
            request.yar.get("formId") +
            (request.yar.get("organisation") !== null
                ? request.yar.get("organisation")?.ukprn ??
                  request.yar.get("organisation")?.DistrictAdministrative_code
                : request.yar.id);
        id =
            id +
            (request.url.hostname.toLocaleLowerCase().includes("uat")
                ? "UAT"
                : "");
        if (state === undefined) {
            state = await this.getState(request);
        }
        state.id = id;
        hoek.merge(state, value, nullOverride, arrayMerge);
        //await setSqlCacheById(id, state);
        return state;
    }

    async setState(state: FormSubmissionState) {
        await setSqlCacheById(state.id, state);
        return state;
    }

    async getConfirmationState(request: HapiRequest) {
        return await this.getState(request);
    }

    async setConfirmationState(request: HapiRequest, viewModel) {
        let id =
            request.yar.get("formId") +
            (request.yar.get("organisation") !== null
                ? request.yar.get("organisation")?.ukprn ??
                  request.yar.get("organisation")?.DistrictAdministrative_code
                : request.yar.id);
        id =
            id +
            (request.url.hostname.toLocaleLowerCase().includes("uat")
                ? "UAT"
                : "");
        return await setSqlCacheById(id, viewModel);
    }

    async clearState(request: HapiRequest) {
        if (request.yar?.id) {
            this.cache.drop(this.Key(request));
            request.yar.reset();
        }
    }

    /**
     * The key used to store user session data against.
     * If there are multiple forms on the same runner instance, for example `form-a` and `form-a-feedback` this will prevent CacheService from clearing data from `form-a` if a user gave feedback before they finished `form-a`
     *
     * @param request - hapi request object
     * @param additionalIdentifier - appended to the id
     */
    Key(request: HapiRequest, additionalIdentifier?: ADDITIONAL_IDENTIFIER) {
        if (!request?.yar?.id) {
            throw Error("No session ID found");
        }
        return {
            segment: partition,
            id: `${request.yar.id}:${request.params.id}${additionalIdentifier}`,
        };
    }
}
