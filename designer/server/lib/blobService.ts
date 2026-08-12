import config from "../config";
import { BlobDeleteResponse, BlobServiceClient } from "@azure/storage-blob";
require("dotenv").config();

/**
 * Fetches container client based on storage connection string and
 * blob container name provided
 * @returns container client
 */
async function fetchContainerClient() {
    const AZURE_STORAGE_CONNECTION_STRING = config.blobServiceConnectionString;
    const BLOB_CONTAINER_NAME = config.blobStorageContainer;

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
            fileJson.length
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
        const containerClient = await fetchContainerClient();
        const blobClient = await containerClient.getBlobClient(
            `${blobName}.json`
        );
        const downloadResponse = await blobClient.download();
        const downloaded: Buffer | null = await streamToBuffer(
            downloadResponse.readableStreamBody
        );
        if (!downloaded) return "";
        return downloaded.toString();
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

/**
 * Deletes blob based on given name
 * @param blobName name of the blob to be deleted
 * @returns blob delete response
 */
async function blobDelete(blobName: string): Promise<BlobDeleteResponse> {
    try {
        const containerClient = await fetchContainerClient();
        const blobClient = await containerClient.getBlobClient(
            `${blobName}.json`
        );
        const deleteResponse = await blobClient.delete();
        return deleteResponse;
    } catch (e) {
        throw Error("Issue in Deletion");
    }
}

export { blobUpload, downloadBlobToString, blobDelete };
