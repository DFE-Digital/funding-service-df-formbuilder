import config from "../config";
import axios from "axios";
import FormData from "form-data";
import { BlobServiceClient } from "@azure/storage-blob";
import csvJSONConvert from "csvjson-csv2json";
import { setExpiry } from "src/server/utils/commonUtils";
import { RedisService } from "src/server/services";
import { trackEvent } from "../logging/customTracker";
require("dotenv").config();

const { fetchFromRedis } = config;
/**
 * Fetches container client based on storage connection string and
 * blob container name provided
 * @returns container client
 */
async function fetchContainerClient(storageAccount: string = "dfshared") {
    let AZURE_STORAGE_CONNECTION_STRING, BLOB_CONTAINER_NAME;
    if (storageAccount === "dfshared") {
        AZURE_STORAGE_CONNECTION_STRING = config.blobServiceConnectionString;
        BLOB_CONTAINER_NAME = config.blobStorageContainer;
    } else {
        AZURE_STORAGE_CONNECTION_STRING = config.dcBlobServiceConnectionString;
        BLOB_CONTAINER_NAME = config.dcStorageContainer;
    }


    if (!AZURE_STORAGE_CONNECTION_STRING) {
        throw Error("Azure Storage Connection string not found");
    }

    if (!BLOB_CONTAINER_NAME) {
        throw Error("Azure Storage Blob Container Name not found");
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION_STRING
    );

    let availableContainerNames: string[] = [];

    // Fetch and Collect available container names
    for await (const container of blobServiceClient.listContainers()) {
        availableContainerNames.push(container.name);
    }

    // Check if container exists
    const validContainerName = availableContainerNames.find(
        (val) => val === BLOB_CONTAINER_NAME
    );

    if (!validContainerName) {
        throw Error("Container not available");
    }

    const blobCont = blobServiceClient.getContainerClient(validContainerName);

    return blobCont;
}

/**
 * Uploads blob to a container
 * @param fileId id of the file (used as name)
 * @param fileJson content of file as JSON object
 * @returns {Promise<BlockBlobUploadResponse>}
 */
async function blobUpload(fileId: string, fileJson: any) {
    // Get the container client
    const blobCont = await fetchContainerClient();
    const blobName = fileId + ".json";

    // Get a block blob client
    const blockBlobClient = blobCont.getBlockBlobClient(blobName);

    const buffer = Buffer.from(JSON.stringify(fileJson));

    try {
        const uploadBlobResponse = await blockBlobClient.upload(
            buffer,
            fileJson?.length
        );
        return uploadBlobResponse;
    } catch (error) {
        throw error;
    }
}

/**
 * Downloads blob and converts the content to string
 * @param blobName name of the blob to be downloaded
 * @returns blob content as string
 */
async function downloadBlobToString(blobName: string): Promise<string> {
    try {

        if (fetchFromRedis) {
            const seconds = setExpiry();
            try {
                const findblobFromRedis = await RedisService.getCache(`${blobName}`);
                if (findblobFromRedis) {
                    return findblobFromRedis
                        .toString()
                        .replace(/^\uFEFF/, "");
                }
            } catch (redisErr: any) {
                trackEvent(`⚠️  Failed to fetch blob from Redis cache:`, redisErr?.message, true);
                console.error(`⚠️ Failed to fetch blob from Redis cache: ${redisErr?.message}`);
                // Continue to fetch from blob storage
            }

            const containerClient = await fetchContainerClient("dfshared");
            const blobClient = await containerClient.getBlobClient(
                `${blobName}.json`
            );
            const downloadResponse = await blobClient.download();
            const downloaded: Buffer | null = await streamToBuffer(
                downloadResponse.readableStreamBody
            );
            if (!downloaded) return "";

            // Try to cache but don't fail if it doesn't work
            try {
                await RedisService.setCache(
                    `${blobName}`,
                    downloaded.toString(),
                    "EX",
                    seconds
                );
            } catch (cacheErr: any) {
                trackEvent(`⚠️  Failed to cache blob in Redis:`, cacheErr?.message, true);
                console.error(`⚠️ Failed to cache blob in Redis: ${cacheErr?.message}`);
                // Continue - data was fetched successfully even if caching failed
            }

            return downloaded.toString();
        }
        else {
            const containerClient = await fetchContainerClient("dfshared");
            const blobClient = await containerClient.getBlobClient(
                `${blobName}.json`
            );
            const downloadResponse = await blobClient.download();
            const downloaded: Buffer | null = await streamToBuffer(
                downloadResponse.readableStreamBody
            );
            if (!downloaded) return "";
            return downloaded.toString();
        }
    } catch (e: any) {
        throw Error("Issue in download");
    }
}

async function downloadBlobDocToJSON(blobName: string, fileNameFN: string, filePathFP: string): Promise<string> {
    try {
        if (fetchFromRedis) {
            const seconds = setExpiry();
            try {
                const findblobFromRedis = await RedisService.getCache(`${blobName}`);
                if (findblobFromRedis) {
                    if (typeof findblobFromRedis === "string") {
                        try {
                            return JSON.parse(
                                findblobFromRedis.replace(/^\uFEFF/, "")
                            );
                        } catch {
                            return findblobFromRedis.replace(/^\uFEFF/, "");
                        }
                    }
                    return findblobFromRedis;
                }
            } catch (redisErr: any) {
                trackEvent(`⚠️  Failed to fetch document blob from Redis cache:`, redisErr?.message, true);
                console.error(`⚠️ Failed to fetch document blob from Redis cache: ${redisErr?.message}`);
                // Continue to fetch from API
            }

            const docApiUrl = config.docUploadApi;
            const accessKey = config.docCaptureSubscriptionKey;
            const formData = new FormData();
            const fileName = fileNameFN;
            const filePath = filePathFP;
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

            // Try to cache but don't fail if it doesn't work
            try {
                await RedisService.setCache(
                    `${blobName}`,
                    fileJsonOutput[0],
                    "EX",
                    seconds
                );
            } catch (cacheErr: any) {
                trackEvent(`⚠️  Failed to cache document blob in Redis:`, cacheErr?.message, true);
                console.error(`⚠️ Failed to cache document blob in Redis: ${cacheErr?.message}`);
                // Continue - data was fetched successfully even if caching failed
            }

            return fileJsonOutput[0];
        }
        else {
            const docApiUrl = config.docUploadApi;
            const accessKey = config.docCaptureSubscriptionKey;

            const formData = new FormData();

            const fileName = fileNameFN;
            const filePath = filePathFP;
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

            return fileJsonOutput[0];
        }
    } catch (e) {
        throw Error("Issue in download");
    }
}

/**
 * Converts stream to buffer
 * @param readableStream
 * @returns buffer
 */
async function streamToBuffer(
    readableStream: NodeJS.ReadableStream | undefined
): Promise<Buffer | null> {
    if (!readableStream) return null;
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
            //@ts-ignore
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on("error", reject);
    });
}

export { blobUpload, downloadBlobToString, downloadBlobDocToJSON };