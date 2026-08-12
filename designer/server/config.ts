import dotenv from "dotenv";
import joi from "joi";
dotenv.config({ path: ".env" });

export interface Config {
    env: "local" | "development" | "test" | "preproduction" | "production";
    deploymentEnvironment:
        | "local"
        | "development"
        | "test"
        | "preproduction"
        | "production";
    port: number;
    previewUrl: string;
    preprodPreviewUrl: string;
    publishUrl: string;
    persistentBackend: "cosmos" | "blob" | "preview";
    s3Bucket?: string;
    logLevel: "trace" | "info" | "debug" | "error";
    phase?: "alpha" | "beta";
    footerText?: string;
    isLocal: boolean;
    isProd: boolean;
    isPreProd: boolean;
    isDev: boolean;
    isTest: boolean;
    lastCommit: string;
    lastTag: string;
    sessionTimeout: number;
    sessionCookiePassword: string;
    cosmosPort: number;
    dbName: string;
    //endpoint: string;
    //key: string;
    localUser: string;
    localUserId: string;
    sharepointClientId: string;
    sharepointClientSecret: string;
    blobServiceConnectionString: string;
    blobStorageContainer: string;
    docUploadApi: string;
    docCaptureSubscriptionKey: string;
    feedbackLink: string;
    dfSqlApiUrl: string;
    dfSqlApiKey: string;
    isAPIM: boolean;
    payloadSize: number;
    providerChunkSize: number;
}

// server-side storage expiration - defaults to 20 minutes
const sessionSTimeoutInMilliseconds = 20 * 60 * 1000;

// Define config schema
const schema = joi.object({
    port: joi.number().default(3000),
    env: joi
        .string()
        .valid("local", "development", "test", "preproduction", "production")
        .default("development"),
    deploymentEnvironment: joi
        .string()
        .valid("local", "development", "test", "preproduction", "production")
        .default("local"),
    previewUrl: joi.string(),
    publishUrl: joi.string(),
    persistentBackend: joi
        .string()
        .valid("cosmos", "blob", "preview")
        .optional(),
    s3Bucket: joi.string().optional(),
    logLevel: joi
        .string()
        .valid("trace", "info", "debug", "error")
        .default("debug"),
    phase: joi.string().valid("alpha", "beta").optional(),
    footerText: joi.string().optional(),
    lastCommit: joi.string().default("undefined"),
    lastTag: joi.string().default("undefined"),
    sessionTimeout: joi.number().default(sessionSTimeoutInMilliseconds),
    sessionCookiePassword: joi.string().optional(),
    //endpoint: joi.string().optional(),
    //key: joi.string().optional(),
    localUser: joi.string().optional(),
    localUserId: joi.string().optional(),
    preprodPreviewUrl: joi.string().required(),
    sharepointClientId: joi.string().optional(),
    sharepointClientSecret: joi.string().optional(),
    blobServiceConnectionString: joi.string().optional(),
    blobStorageContainer: joi.string().optional(),
    docUploadApi: joi.string().optional(),
    docCaptureSubscriptionKey: joi.string().optional(),
    feedbackLink: joi.string(),
    dfSqlApiUrl: joi.string(),
    dfSqlApiKey: joi.string(),
    isAPIM: joi.boolean().optional(),
    payloadSize: joi.number().optional(),
    providerChunkSize: joi.number().default(100),
});

// Build config
const config = {
    port: process.env.PORT,
    env: process.env.NODE_ENV || "development",
    deploymentEnvironment: process.env.DEPLOYMENT_ENVIRONMENT || "local",
    previewUrl: process.env.PREVIEW_URL || "http://localhost:3009",
    preprodPreviewUrl:
        process.env.PREPROD_PREVIEW_URL ||
        "https://test.digital-forms.education.gov.uk",
    publishUrl: process.env.PUBLISH_URL || "http://localhost:3009",
    persistentBackend: process.env.PERSISTENT_BACKEND || "preview",
    s3Bucket: process.env.S3_BUCKET,
    logLevel: process.env.LOG_LEVEL || "error",
    phase: process.env.PHASE || "alpha",
    footerText: process.env.FOOTER_TEXT,
    lastCommit: process.env.LAST_COMMIT || process.env.LAST_COMMIT_GH,
    lastTag: process.env.LAST_TAG || process.env.LAST_TAG_GH,
    sessionTimeout: process.env.SESSION_TIMEOUT,
    sessionCookiePassword: process.env.SESSION_COOKIE_PASSWORD,
    //endpoint: process.env.ENDPOINT,
    // key: process.env.KEY,
    localUser: process.env.LOCAL_USER,
    localUserId: process.env.LOCAL_USER_ID,
    sharepointClientId: process.env.SHAREPOINT_CLIENT_ID,
    sharepointClientSecret: process.env.SHAREPOINT_CLIENT_SECRET,
    blobServiceConnectionString:
        process.env.AZURE_STORAGE_CONNECTION_STRING || "sample",
    blobStorageContainer:
        process.env.BLOB_STORAGE_CONTAINER_NAME || "df-datasets",
    docUploadApi: process.env.API_DOC_CAPTURE_UPLOAD || "http:local",
    docCaptureSubscriptionKey:
        process.env.DocCaptureSubscriptionKey || "sample",
    feedbackLink:
        "https://digital-forms.education.gov.uk/pHimWsw_Cv/give-feedback-on-digital-forms",
    dfSqlApiUrl: process.env.DF_SQL_API_URL,
    dfSqlApiKey: process.env.DF_SQL_API_KEY,
    isAPIM: process.env.isAPIM || true,
    payloadSize: process.env.payloadSize || 209715200,
    providerChunkSize: process.env.PROVIDER_CHUNK_SIZE || 900,
};

// Validate config
const result = schema.validate(
    {
        ...config,
    },
    { abortEarly: false }
);

// Throw if config is invalid
if (result.error) {
    throw new Error(`The server config is invalid. ${result.error.message}`);
}

// Use the joi validated value
const value: Config = result.value;

value.isProd = value.env === "production";
value.isPreProd = value.env === "preproduction";
value.isDev = !value.isProd;
value.isTest = value.env === "test";

export default value;
