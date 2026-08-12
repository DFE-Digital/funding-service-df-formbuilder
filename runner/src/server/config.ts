import dotEnv from "dotenv";
import Joi, { CustomHelpers } from "joi";

import { isUrlSecure } from "src/server/utils/url";

if (process.env.NODE_ENV !== "test") {
    dotEnv.config({ path: ".env" });
}

const minute = 60 * 1000;
const DEFAULT_SESSION_TTL = 20 * minute;
const DEFAULT_PORT = 3009;
const DEFAULT_LOG_LEVEL = "trace";
const DEFAULT_SERVICE_URL = "http://localhost:3009";
const DEFAULT_DOCUMENT_UPLOAD_API_URL = "http://localhost:9000";

function secureUrl(value: string, helper: CustomHelpers) {
    if (isUrlSecure(value)) {
        return value;
    }

    return helper.message({
        custom: `Provided ${helper.state.path} is insecure, please use https`,
    });
}

/**
 * joi schema validation is used here to ensure that there are not invalid key/values when a server is starting up.
 */
const schema = Joi.object({
    port: Joi.number().default(DEFAULT_PORT),
    env: Joi.string().valid(
        "development",
        "test",
        "preproduction",
        "production"
    ),
    appEnv: Joi.string().valid(
        "local",
        "dev",
        "test",
        "uat",
        "preproduction",
        "production"
    ),
    logLevel: Joi.string()
        .optional()
        .default(DEFAULT_LOG_LEVEL)
        .allow("trace", "debug", "info", "warn", "error"),
    ordnanceSurveyKey: Joi.string().optional(),
    browserRefreshUrl: Joi.string().optional(),
    feedbackLink: Joi.string().default(
        "https://digital-forms.education.gov.uk/pHimWsw_Cv/give-feedback-on-digital-forms"
    ),
    phaseTag: Joi.string()
        .optional()
        .valid("", "alpha", "beta")
        .default("Beta"),
    gtmId1: Joi.string().optional(),
    gtmId2: Joi.string().optional(),
    matomoId: Joi.string().optional(),
    matomoUrl: Joi.string().custom(secureUrl).optional(),
    payApiUrl: Joi.string()
        .custom(secureUrl)
        .default("https://publicapi.payments.service.gov.uk/v1"),
    payReturnUrl: Joi.string().custom(secureUrl),
    serviceUrl: Joi.string().optional().default(DEFAULT_SERVICE_URL),
    redisHost: Joi.string().optional(),
    redisPort: Joi.number().optional(),
    redisPassword: Joi.string().optional(),
    redisTls: Joi.boolean().optional(),
    redisExpiry: Joi.string().optional(),
    serviceName: Joi.string().optional(),
    documentUploadApiUrl: Joi.string().default(DEFAULT_DOCUMENT_UPLOAD_API_URL),
    previewMode: Joi.boolean().optional(),
    sslKey: Joi.string().optional(),
    sslCert: Joi.string().optional(),
    sessionTimeout: Joi.number().default(DEFAULT_SESSION_TTL),
    runnerTimeoutSeconds: Joi.number().optional(),
    sessionCookiePassword: Joi.string().optional(),
    rateLimit: Joi.boolean().optional(),
    fromEmailAddress: Joi.string().optional(),
    serviceStartPage: Joi.string().optional(),
    privacyPolicyUrl: Joi.string().optional(),
    notifyTemplateId: Joi.string().optional(),
        // .when("env", {
        //     is: "production",
        //     then: Joi.required(),
        //     otherwise: Joi.optional(),
        // })
        //.label("NOTIFY_TEMPLATE_ID"),
    notifyAPIKey: Joi.string().optional(),
        // .when("env", {
        //     is: "production",
        //     then: Joi.required(),
        //     otherwise: Joi.optional(),
        // })
        // .label("NOTIFY_API_KEY"),
    lastCommit: Joi.string().default("undefined"),
    lastTag: Joi.string().default("undefined"),
    apiEnv: Joi.string()
        .allow("test", "preproduction", "production", "")
        .optional(),
    authEnabled: Joi.boolean().optional(),
    authClientId: Joi.string().when("authEnabled", {
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
    authClientSecret: Joi.string().when("authEnabled", {
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
    authClientAuthUrl: Joi.string().when("authEnabled", {
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
    authClientTokenUrl: Joi.string().when("authEnabled", {
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
    authRedirectUrl: Joi.string().when("authEnabled", {
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
    authApiSecret: Joi.string().when("authEnabled", {
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
    apiUrl: Joi.string().when("authApiSecret", {
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
    authLogoutUrl: Joi.string().when("authEnabled", {
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
    scope: Joi.string().optional(),
    //cosmosEndpoint: Joi.string().optional(),
    //cosmosKey: Joi.string().optional(),
    responseCollectionName: Joi.string().default("responses"),
    instrumentationKey: Joi.string().default("local"),
    connectionString: Joi.string().default("local"),
    docUploadApi: Joi.string().required(),
    pdfApiUrl: Joi.string().required(),
    pdfApiKey: Joi.string().required(),
    fileShifterAPI: Joi.string().required(),
    fileShifterSubscriptionKey: Joi.string().required(),
    docCaptureSubscriptionKey: Joi.string().required(),
    blobServiceConnectionString: Joi.string().optional(),
    blobStorageContainer: Joi.string().optional(),
    dcBlobServiceConnectionString: Joi.string().optional(),
    dcStorageContainer: Joi.string().optional(),
    dfSqlApiUrl: Joi.string(),
    dfSqlApiKey: Joi.string(),
    fetchFromRedis: Joi.boolean().optional(),
    servicebusConnectionString: Joi.string().optional(),
    pdfPrintQueueName: Joi.string().optional(),
    isAPIM: Joi.boolean().optional(),
    payloadSize: Joi.number().optional(),
    isDebugging: Joi.boolean().optional(),
    loadTesting: Joi.boolean().optional(),
    globalTimeout: Joi.number().optional(),
});

export function buildConfig() {
    // Build conf
    const conf = {
        port: process.env.PORT,
        env: process.env.NODE_ENV,
        appEnv: process.env.APP_ENV || "dev",
        logLevel: process.env.LOG_LEVEL,
        ordnanceSurveyKey: process.env.ORDNANCE_SURVEY_KEY,
        browserRefreshUrl: process.env.BROWSER_REFRESH_URL,
        feedbackLink: process.env.FEEDBACK_LINK,
        phaseTag: process.env.PHASE_TAG,
        gtmId1: process.env.GTM_ID_1,
        gtmId2: process.env.GTM_ID_2,
        matomoId: process.env.MATOMO_ID,
        matomoUrl: process.env.MATOMO_URL,
        payApiUrl: process.env.PAY_API_URL,
        payReturnUrl: process.env.PAY_RETURN_URL,
        serviceUrl: process.env.SERVICE_URL,
        redisHost: process.env.REDIS_HOST,
        redisPort: process.env.REDIS_PORT,
        redisPassword: process.env.REDIS_PASSWORD,
        redisTls: process.env.REDIS_TLS === "true",
        redisExpiry: process.env.REDIS_KEY_EXPIRY || "23:59",
        serviceName: process.env.SERVICE_NAME,
        documentUploadApiUrl: process.env.DOCUMENT_UPLOAD_API_URL,
        previewMode: process.env.PREVIEW_MODE === "true",
        sslKey: process.env.SSL_KEY,
        sslCert: process.env.SSL_CERT,
        sessionTimeout: process.env.SESSION_TIMEOUT,
        sessionCookiePassword: process.env.PREVIEW_MODE === "true" 
            ? process.env.SESSION_COOKIE_PASSWORD_PREVIEW || process.env.SESSION_COOKIE_PASSWORD
            : process.env.SESSION_COOKIE_PASSWORD,
        rateLimit: process.env.RATE_LIMIT !== "false",
        fromEmailAddress: process.env.FROM_EMAIL_ADDRESS,
        serviceStartPage: process.env.SERVICE_START_PAGE,
        privacyPolicyUrl: process.env.PRIVACY_POLICY_URL,
        notifyTemplateId: process.env.NOTIFY_TEMPLATE_ID,
        notifyAPIKey: process.env.NOTIFY_API_KEY,
        lastCommit: process.env.LAST_COMMIT || process.env.LAST_COMMIT_GH,
        lastTag: process.env.LAST_TAG || process.env.LAST_TAG_GH,
        apiEnv: process.env.API_ENV,
        authEnabled: process.env.AUTH_ENABLED,
        authClientId: process.env.AUTH_CLIENT_ID,
        authClientSecret: process.env.AUTH_CLIENT_SECRET,
        authClientAuthUrl: process.env.AUTH_CLIENT_AUTH_URL,
        authClientTokenUrl: process.env.AUTH_CLIENT_TOKEN_URL,
        authRedirectUrl: process.env.AUTH_REDIRECT_URL,
        authApiSecret: process.env.AUTH_API_SECRET,
        apiUrl: process.env.API_URL,
        authLogoutUrl: process.env.AUTH_LOGOUT_URL,
        scope: process.env.SCOPE,
        //cosmosEndpoint: process.env.COSMOS_ENDPOINT,
        //cosmosKey: process.env.COSMOS_KEY,
        instrumentationKey: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
        connectionString: process.env.APPINSIGHTS_CONNECTION_STRING,
        responseCollectionName:
            process.env.RESPONSE_COLLECTION_NAME || "responses",
        docUploadApi: process.env.API_DOC_CAPTURE_UPLOAD || "http:local",
        pdfApiUrl: process.env.API_PDF_URL || "http:local",
        pdfApiKey: process.env.API_PDF_KEY || "http:local",
        fileShifterAPI: process.env.FILE_SHIFTER_API || "http://local",
        fileShifterSubscriptionKey:
            process.env.FileShifterSubscriptionKey || "sample",
        docCaptureSubscriptionKey:
            process.env.DocCaptureSubscriptionKey || "sample",
        blobServiceConnectionString:
            process.env.AZURE_STORAGE_CONNECTION_STRING || "sample",
        blobStorageContainer:
            process.env.BLOB_STORAGE_CONTAINER_NAME || "df-datasets",
        dcBlobServiceConnectionString:
            process.env.AZURE_DC_STORAGE_CONNECTION_STRING ||
            "connectionString",
        dcStorageContainer:
            process.env.DC_BLOB_STORAGE_CONTAINER_NAME ||
            "digital-forms-upload",
        dfSqlApiUrl: process.env.DF_SQL_API_URL,
        dfSqlApiKey: process.env.DF_SQL_API_KEY,
        fetchFromRedis: process.env.FETCH_FROM_REDIS || false,
        servicebusConnectionString:
            process.env.SB_CONNECTION_STRING || "CONN STRING",
        pdfPrintQueueName:
            process.env.PDF_PRINT_QUEUE_NAME || "dfsubmissions-pdfprintq",
        isAPIM: process.env.isAPIM || true,
        payloadSize: process.env.payloadSize || 209715200,
        isDebugging: process.env.ENABLE_DEBUGGING || false,
        loadTesting: process.env.PT_TESTING || false, 
        globalTimeout: process.env.GLOBAL_TIMEOUT || 300000, 
        // Optional global runner timeout (seconds) that can be used by client and server
        runnerTimeoutSeconds: process.env.RUNNER_TIMEOUT_SECONDS
            ? Number(process.env.RUNNER_TIMEOUT_SECONDS)
            : undefined, 
    };

    // Validate conf
    const result = schema.validate(conf, {
        abortEarly: false,
        convert: true,
    });

    // Throw if conf is invalid
    if (result.error) {
        throw new Error(`The server conf is invalid. ${result.error.message}`);
    }

    // Use the Joi validated value
    const value = result.value;

    value.isProd = value.env === "production";
    value.isPreProd = value.env === "preproduction";
    value.isDev = !value.isProd;
    value.isTest = value.env === "test";
    value.isSandbox = process.env.sandbox === "true"; // for heroku instances

    return value;
}

const conf = buildConfig();

export default conf;
