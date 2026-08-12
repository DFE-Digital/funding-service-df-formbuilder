import config from "./config";

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
