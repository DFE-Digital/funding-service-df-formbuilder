/** Base URL for Proxy Node APIs */
export const API_BASE_URL = `/api/v2`;

/** URL for individual APIs */
export const UPLOAD_CONFIG_API_URL = `${API_BASE_URL}/uploadConfiguration`;
export const GET_CONFIG_API_URL = `${API_BASE_URL}/getConfiguration`;
export const LIST_CONFIG_API_URL = `${API_BASE_URL}/listFormConfigurations`;
export const DELETE_CONFIG_API_URL = `${API_BASE_URL}/deleteConfiguration`;
export const DELETE_MULTIPLE_CONFIG_API_URL = `${API_BASE_URL}/deleteMultipleConfiguration`;
export const ADD_CONFIG_API_URL = `${API_BASE_URL}/addConfiguration`;
export const CHECK_NAME_EXISTS_URL = `${API_BASE_URL}/checkFormExists`;
export const UPLOAD_PROVIDER_MAPPING_URL = `${API_BASE_URL}/uploadProvidersMapping`;
export const UPLOAD_MULTIPLE_PROVIDER_MAPPING_URL = `${API_BASE_URL}/uploadMultipleProvidersMapping`;
export const UPDATE_PARENT_CHILD_URL = `${API_BASE_URL}/updateParentChild`;
export const UPDATE_MULTIPLE_FORM_STATUS = `${API_BASE_URL}/changeMultipleformstatus`;
export const DELETE_REPEATABLEQUESTION_URL = `${API_BASE_URL}/DeleteRepeatableFormsData`;

/** URL for advanced APIs */
export const CREATE_NEW_CONFIG_URL = `${API_BASE_URL}/createNewFormConfig`;
export const IMPORT_FORM_CONFIG_URL = `${API_BASE_URL}/importSavedForm`;
export const DUPLICATE_FORM_URL = `${API_BASE_URL}/duplicateForm`;
