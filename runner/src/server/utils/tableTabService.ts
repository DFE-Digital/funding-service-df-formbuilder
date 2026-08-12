import { ComponentTypeEnum, DesignedDataSet, FormDefinition, TabInputType } from "@xgovformbuilder/model";
import { CacheService } from "../services";
import { HapiRequest } from "../types";
import { downloadBlobToString } from "./blobService";
import { FormData } from "../plugins/engine/types";
import { debugConsoleLog } from "server/utils/commonUtils";
import { trackEvent } from "../logging/customTracker";

export const getBlobContent = async (fileId: string) => {
    const jsonResult = (await downloadBlobToString(fileId))?.replace(/^\uFEFF/, "");
    const parsedJson = JSON.parse(jsonResult);
    return parsedJson;
}

export const constructTableData = (json: any, ukprn: string, urn: string, tableData: DesignedDataSet) => {
    const keyIdentifier = tableData.keyIdentifier;
    const filteredContent = getUKPRNcontentFromJSON(json, keyIdentifier, ukprn, urn);
    formulateTableData(tableData?.data, filteredContent)
    return tableData?.data
}

const getUKPRNcontentFromJSON = (blobResponse, keyId, ukprn, urn) => {
    let ukprnMatch, urnMatch;
    if (keyId === "UKPRN") {
        ukprnMatch = blobResponse?.filter(
            (data) => data[keyId] === Number(ukprn)
        );
    } else if (keyId === "URN") {
        urnMatch = blobResponse?.filter(
            (data) => data[keyId] === Number(urn)
        );
    }
    else if (keyId === "district_administrative_code") {
        ukprnMatch = blobResponse?.filter(
            (data) => data[keyId] === (ukprn)
        );
    }

    const filteredContent =
        ukprnMatch?.length > 0
            ? ukprnMatch && ukprnMatch[0]
            : urnMatch
                ? urnMatch[0]
                : {};

    return filteredContent;
}

const formulateTableData = (formJSONData, filteredArr) => {
    formJSONData?.forEach((data) => {
        for (const item of data) {
            if (item?.type === "select_value") {
                const rawValue = item?.value == null ? "" : item.value.toString();
                if (!rawValue) continue;

                if (rawValue.includes("-Value")) {
                    const replacementValue = rawValue.split("-Value")[0];
                    item.value = filteredArr?.[replacementValue];
                } else {
                    item.value = rawValue.split("-Header")[0].split("_").join(" ");
                }
            }
        }
    });
}

/**
 * Initialises the table data for tab component in current page
 * @param request Contains the Http request info
 * @param cacheService used for accessing cache functions
 * @param organisationDetails contains details of UKPRN and URN
 * @param currentPage details of current page
 * @param config form details
 * @param formData filtered form data
 * @returns 
 */
export const initializeTableData = async (request: HapiRequest, cacheService: CacheService, organisationDetails: any, currentPage: any, config: FormDefinition, formData: FormData) => {
    let extractedDesignData: DesignedDataSet | undefined;
    // Extracts the designed data set & file id for the first table in tab, if available;
    try {
        if (currentPage) {
            currentPage?.forEach((page) => {
                if (extractedDesignData) return;
                if (page?.components?.length) {
                    page.components?.forEach((component) => {
                        if (extractedDesignData) return;
                        if (component?.type === ComponentTypeEnum.Tabs) {
                            const tabDetails = config.tabs!.find(tab => tab.id === component.name)!;
                            const tabData = tabDetails.tabData;
                            if (tabData?.length) {
                                if (tabData[0]?.type === TabInputType.SELECT_DATASET) {
                                    // Extract file id info from designed dataset
                                    const designedDataSetId: string = tabData[0].value;
                                    const selectedDesignDataSet = config?.designedDataSets?.find(dts => dts.id === designedDataSetId);
                                    if (selectedDesignDataSet) {
                                        extractedDesignData = selectedDesignDataSet;
                                        return;
                                    }

                                }
                            }
                        }
                    })
                }
            })
        }
        if (!extractedDesignData) return;
        if (extractedDesignData?.csvUsed) {
            let state = await cacheService.getState(request);
            // Check cache
            if (state?.tabTable?.[extractedDesignData.id]) {
                formData.initialTable = state.tabTable[extractedDesignData.id];
                state =await cacheService.mergeState(request, {
                    ...state,
                    formData,
                },state);
                return;
            }
            const jsonData = await getBlobContent(extractedDesignData.csvUsed);
            const parsedTableData = constructTableData(jsonData, organisationDetails?.ukprn ?? request.yar.get("organisation")?.DistrictAdministrative_code, organisationDetails?.ukprn ?? request.yar.get("organisation")?.DistrictAdministrative_code, extractedDesignData);
            formData.initialTable = parsedTableData;
            state = await cacheService.mergeState(request, {
                ...state,
                tabTable: {
                    [extractedDesignData.id]: parsedTableData
                },
            },state);
            state =   await cacheService.setState(state);
        }
    }
    catch (err) {
        debugConsoleLog(err)
    }
}