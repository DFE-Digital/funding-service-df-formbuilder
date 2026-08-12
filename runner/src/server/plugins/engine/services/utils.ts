import config from "../../../config";

/** Base URL for EAPIM APIs under the Digital Forms service */
export const API_BASE_URL = `${config.dfSqlApiUrl ?? ""}/api`;

/** URL for individual APIs */
export const UPLOAD_CONFIG_API_URL = `${API_BASE_URL}/uploadConfiguration`;
export const GET_CONFIG_API_URL = `${API_BASE_URL}/getConfiguration`;
export const LIST_CONFIG_API_URL = `${API_BASE_URL}/listFormConfigurations`;
export const DELETE_CONFIG_API_URL = `${API_BASE_URL}/deleteConfiguration`;
export const ADD_CONFIG_API_URL = `${API_BASE_URL}/addConfiguration`;
export const CHECK_NAME_EXISTS_URL = `${API_BASE_URL}/checkFormExists`;
export const GET_ALL_FORMS_URL = `${API_BASE_URL}/getAllForms`;
export const CREATE_DOCUMENT_URL = `${API_BASE_URL}/createDocument`;
export const CHECK_PROVIDER_MAPPING_URL = `${API_BASE_URL}/CheckProvidersMappingById`;
export const CHECK_SUBMISSION_STATUS_BY_PARENTID_URL = `${API_BASE_URL}/getSubmittedStatusbyParentId`;
//Save and Resume changes start
export const ADD_UPDATE_DRAFT_RESPONSE = `${API_BASE_URL}/CreateDraftResponse`;
export const GET_DRAFT_RESPONSE = `${API_BASE_URL}/GetDraftResponse`;
//Save and Resume changes end
//Repeatable section API's
export const POST_REPEATABLE_FORM_DATA = `${API_BASE_URL}/PostRepeatableFormsData`;
export const GET_REPEATABLE_FORM_DATA = `${API_BASE_URL}/GetRepeatableFormsData`;
// User details API
export const GET_USER_DETAILS_API_URL = `${API_BASE_URL}/getUserDetailById`;
export const UPDATE_USER_DETAILS_API_URL = `${API_BASE_URL}/updateUserDetail`;

export const addApiKeyToHeader = (headers: { [key: string]: any }) => {
    const { isAPIM } = config;
    if (isAPIM) {
        return {
            ...headers,
            ["Ocp-Apim-Subscription-Key"]: config.dfSqlApiKey ?? "",
        };
    } else {
        return {
            ...headers,
        };
    }
};

type ExtendedHeader = HeadersInit & {
    id: string;
    ukprn?: number;
    urn?: number;
    admincode?: string;
    ["Ocp-Apim-Subscription-Key"]?: string;
};

export const addProviderMappingToHeader = (
    id: string,
    ukprn?: number,
    urn?: number,
    admincode?: string
) => {
    let header: ExtendedHeader = {
        id,
    };
    if (ukprn) {
        //@ts-ignore
        header = {
            ...header,
            ukprn: ukprn,
        };
    }
    if (urn) {
        //@ts-ignore
        header = {
            ...header,
            urn: urn,
        };
    }
    if (admincode) {
        //@ts-ignore
        header = {
            ...header,
            admincode: admincode,
        };
    }
    //@ts-ignore
    header = addApiKeyToHeader(header);
    return header;
};

/**
 * Sets the expiry in .env configurations and calculates the number of seconds until the expiry.
 *
 * @return {number} The number of seconds until the expiry.
 */
export const setExpiry = () => {
    // Set expiry in .env configurations
    const EXPIRY_VALUE = config.redisExpiry ?? "23:59";
    // split hours and minutes
    const endHours = Number(EXPIRY_VALUE?.split(":")[0]);
    const endMinutes = Number(EXPIRY_VALUE?.split(":")[1]);
    // convert to ISO standard time
    const endDay = new Date(
        new Date(new Date().setHours(endHours, endMinutes, 59, 999))
            .toString()
            .split("GMT")[0] + " UTC"
    ).toISOString();
    // Current time
    const currentTime = new Date();
    // end time in proper date format
    const endDate = new Date(endDay);
    // End time - current time in seconds
    const seconds = Math.floor(
        (endDate.getTime() - currentTime.getTime()) / 1000
    );
    return seconds;
};
