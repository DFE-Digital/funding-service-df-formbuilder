import csvtojson from "csvtojson";
import {
    UPLOAD_PROVIDER_MAPPING_URL,
    UPLOAD_MULTIPLE_PROVIDER_MAPPING_URL,
} from "./constants";
import { convertProviderMappingData } from "./utils";
import { updateForm, updateMultipleForms } from "./formConfigurationsApi";

export const uploadProvidersMapping = async (id, form, parentChild = false) => {
    try {
        const updatedForm = {
            ...form,
            file: form.file.name,
            signInRequired: true,
        };
        const { multipleParentChildData } = form;
        const FETCH_URL = parentChild
            ? UPLOAD_MULTIPLE_PROVIDER_MAPPING_URL
            : UPLOAD_PROVIDER_MAPPING_URL;
        const csvtojsonParser = csvtojson({
            colParser: {
                establishment_URN: "number",
                establishment_UKPRN: "number",
                establishment_name: "string",
                district_administrative_code: "string",
            },
            checkType: true,
        });
        // helper to upload chunks sequentially
        const uploadChunk = async (chunkPayload) => {
            const response = await fetch(FETCH_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(chunkPayload),
            });
            if (!response.ok) {
                throw new Error(
                    `Chunk upload failed with status ${response.status}`
                );
            }
        };
        return new Promise((resolve, reject) => {
            const reader = new window.FileReader();
            reader.readAsText((form.file as unknown) as File, "UTF-8");
            reader.onload = async function (evt) {
                try {
                    if (!evt.target?.result) return;
                    const content = await csvtojsonParser.fromString(
                        evt.target.result as string
                    );
                    const providersMapping = await convertProviderMappingData(
                        id,
                        content
                    );
                    //@ts-ignore
                    let CHUNK_SIZE = parseInt(window?.providerChunkSize);
                    CHUNK_SIZE = isNaN(CHUNK_SIZE) ? 1000 : CHUNK_SIZE;
                    const providersArray = providersMapping.providers
                        .split(",")
                        .map((v) => v.trim())
                        .filter(Boolean);
                    const totalRecords = providersArray.length;
                    console.log(
                        `Uploading ${totalRecords} records in chunks of ${CHUNK_SIZE}...`
                    );
                    const chunkedPayloads: {
                        id: string;
                        providers: string;
                        date: string;
                    }[] = [];
                    const currentdate = new Date().toUTCString();
                    for (let i = 0; i < totalRecords; i += CHUNK_SIZE) {
                        const chunk = providersArray.slice(i, i + CHUNK_SIZE);
                        const chunkPayload = {
                            id: providersMapping.id,
                            providers: Array.isArray(chunk)
                                ? chunk.join(",")
                                : chunk,
                            date: currentdate,
                        };
                        chunkedPayloads.push(chunkPayload);
                        console.log(`pushed chunk ${i / CHUNK_SIZE + 1}`);
                    }
                    for (const payload of chunkedPayloads) {
                        await uploadChunk(payload);
                    }
                    let result;
                    if (parentChild) {
                        result = await updateMultipleForms(
                            //@ts-ignore
                            JSON.stringify(multipleParentChildData)
                        );
                    } else {
                        result = await updateForm(updatedForm);
                    }
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = (error) => {
                reject(error);
            };
        });
    } catch (e: any) {
        console.error("Upload failed:", e);
        return false;
    }
};
