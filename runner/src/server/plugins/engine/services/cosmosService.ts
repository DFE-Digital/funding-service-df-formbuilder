// import config from "server/config";
// import {
//     get,
//     post,
//     FormDefinition,
//     generateCosmosHeaders,
//     HttpVerbs,
// } from "@xgovformbuilder/model";
// import { trackEvent, trackTrace } from "../../../logging/customTracker";
// import { RedisService } from "src/server/services";
// import { Container, CosmosClient, Database } from "@azure/cosmos";
// import { bool } from "aws-sdk/clients/signer";
// import { FormSubmissionState } from "../types";
// import { setExpiry } from "src/server/utils/commonUtils";
// const formsEndpoint = `${config.cosmosEndpoint}dbs/df-forms/colls/forms/docs`;

// const CacheEndpoint = `${config.cosmosEndpoint}dbs/df-forms/colls/RunnerDraftData/docs`;
// const responsesEndpoint = `${config.cosmosEndpoint}dbs/df-forms/colls/${config.responseCollectionName}/docs`;
// const key: string = config.cosmosKey;
// const { fetchFromRedis, isDebugging } = config;
// const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
// let retry = false;

// const GetDataFromDB = async (
//     id: string,
//     url: string
// ): Promise<FormDefinition | FormDefinition[]> => {
//     let data: any;
//     try {
//         if (id != "") {
//             const headers = generateCosmosHeaders(key, HttpVerbs.GET, url, id);
//             const cosmosResults = await get<FormDefinition>(url, {
//                 headers,
//             });
//             data = JSON.parse(
//                 cosmosResults.payload.toString()
//             ) as FormDefinition;
//         } else {
//             const headers = generateCosmosHeaders(key, HttpVerbs.GET, url);
//             const cosmosResults = await get<FormDefinition[]>(url, {
//                 headers,
//             });
//             data = JSON.parse(
//                 cosmosResults.payload.toString()
//             ) as FormDefinition[];
//         }
//     } catch (e: any) {
//         trackEvent(
//             `Unable to getdata - ${id}`,
//             {
//                 error: JSON.stringify(e.message),
//             },
//             true
//         );
//         console.error(`Unable to getdata - ${id}`, e.message);
//         if (e.message == "Response Error: 429 Too Many Requests") {
//             try {
//                 await sleep(2000);
//                 data = GetData(id, url);
//             } catch (e: any) {
//                 trackEvent(
//                     `Unable to getById - getCacheById - retry ${id}`,
//                     {
//                         error: JSON.stringify(e.message),
//                     },
//                     true
//                 );
//                 console.error(
//                     `Unable to getById - getCacheById - retry ${id}`,
//                     e.message
//                 );
//             }
//         }
//         if (e.message == "Response Error: 404 Not Found") {
//             await sleep(2000);
//             if (!retry) {
//                 retry = true;
//                 data = GetData(id, url);
//             } else {
//                 data = "Data not found";
//             }
//         }
//     }
//     return data;
// };

// const GetData = async (
//     id: string,
//     url: string
// ): Promise<FormDefinition | FormDefinition[]> => {
//     let data: any;
//     if (fetchFromRedis) {
//         trackEvent("Redis getData function is called", {
//             id,
//         });
//         const findIdFromRedis = await RedisService.getCache(`${id}`);
//         trackEvent("cacheData from redis check", {
//             id,
//             cacheData: findIdFromRedis,
//         });
//         if (findIdFromRedis) {
//             trackEvent("cacheData from redis is found", {
//                 id,
//                 cacheData: findIdFromRedis,
//             });
//             data = JSON.parse(findIdFromRedis) as FormDefinition;
//         } else {
//             try {
//                 const seconds = setExpiry();
//                 isDebugging &&
//                     trackEvent("Redis seconds expiry", {
//                         id,
//                         seconds,
//                     });
//                 if (id != "") {
//                     const headers = generateCosmosHeaders(
//                         key,
//                         HttpVerbs.GET,
//                         url,
//                         id
//                     );
//                     const cosmosResults = await get<FormDefinition>(url, {
//                         headers,
//                     });
//                     data = JSON.parse(
//                         cosmosResults.payload.toString()
//                     ) as FormDefinition;
//                     if (id.length === 10) {
//                         await RedisService.setCache(
//                             `${id}`,
//                             JSON.stringify(data),
//                             "EX",
//                             seconds
//                         );
//                     }
//                 } else {
//                     const headers = generateCosmosHeaders(
//                         key,
//                         HttpVerbs.GET,
//                         url
//                     );
//                     const cosmosResults = await get<FormDefinition[]>(url, {
//                         headers,
//                     });
//                     data = JSON.parse(
//                         cosmosResults.payload.toString()
//                     ) as FormDefinition[];
//                     if (id.length === 10) {
//                         await RedisService.setCache(
//                             `${id}`,
//                             JSON.stringify(data),
//                             "EX",
//                             seconds
//                         );
//                     }
//                 }
//             } catch (e: any) {
//                 trackEvent(
//                     `Unable to getdata - ${id}`,
//                     {
//                         error: JSON.stringify(e.message),
//                     },
//                     true
//                 );
//                 console.error(`Unable to getdata - ${id}`, e.message);
//                 if (e.message == "Response Error: 429 Too Many Requests") {
//                     try {
//                         await sleep(2000);
//                         data = GetData(id, url);
//                     } catch (e: any) {
//                         trackEvent(
//                             `Unable to getById - getCacheById - retry ${id}`,
//                             {
//                                 error: JSON.stringify(e.message),
//                             },
//                             true
//                         );
//                         console.error(
//                             `Unable to getById - getCacheById - retry ${id}`,
//                             e.message
//                         );
//                     }
//                 }
//                 if (e.message == "Response Error: 404 Not Found") {
//                     await sleep(2000);
//                     if (!retry) {
//                         retry = true;
//                         data = GetData(id, url);
//                     } else {
//                         data = "Data not found";
//                     }
//                 }
//             }
//         }
//     } else {
//         data = GetDataFromDB(id, url);
//     }
//     return data;
// };

// export const createDocument = async (
//     id: string,
//     form: any
// ): Promise<any | null> => {
//     let headers: any;
//     try {
//         headers = generateCosmosHeaders(
//             key,
//             HttpVerbs.POST,
//             responsesEndpoint,
//             id
//         );
//         const { payload } = await post(responsesEndpoint, {
//             headers,
//             payload: JSON.stringify(form),
//         });
//         return JSON.parse(payload.toString());
//     } catch (e: any) {
//         console.error(`Unable to create document. ${form}`, e.message);
//         trackEvent(
//             `Unable to create document. ${form}`,
//             {
//                 error: JSON.stringify(e.message),
//             },
//             true
//         );
//         if (e.message == "Response Error: 429 Too Many Requests") {
//             try {
//                 await sleep(2000);
//                 const { payload } = await post(responsesEndpoint, {
//                     headers,
//                     payload: JSON.stringify(form),
//                 });
//                 return JSON.parse(payload.toString());
//             } catch (e: any) {
//                 console.error(
//                     `Unable to create document - retry. ${form}`,
//                     e.message
//                 );
//                 trackEvent(
//                     `Unable to create document - retry. ${form}`,
//                     {
//                         error: JSON.stringify(e.message),
//                     },
//                     true
//                 );
//             }
//         }
//     }

//     return null;
// };

// export const getAllForms = async (): Promise<FormDefinition[]> => {
//     let forms: FormDefinition[] = [];
//     let url = `${formsEndpoint}`;
//     let data: any;
//     try {
//         data = GetData("", url);
//         forms = data.Documents;
//     } catch (e: any) {
//         console.error("Unable to getAllForms", e.message);
//         trackEvent(
//             `Unable to getAllForms`,
//             {
//                 error: JSON.stringify(e.message),
//             },
//             true
//         );
//     }

//     return forms;
// };

// export const getFormById = async (
//     id: string
// ): Promise<FormDefinition | null> => {
//     const url = `${formsEndpoint}/${id}`;
//     let data: any;
//     try {
//         data = GetData(id, url);
//     } catch (e: any) {
//         trackEvent(
//             `Unable to getById - getFormById ${id}`,
//             {
//                 error: JSON.stringify(e.message),
//             },
//             true
//         );
//         console.error(`Unable to getById - getFormById ${id}`, e.message);
//     }
//     return data;
// };

// export const getCacheById = async (id: string): Promise<any> => {
//     const url = `${CacheEndpoint}/${id}`;
//     let data: any;
//     try {
//         data = GetData(id, url);
//     } catch (e: any) {
//         trackEvent(
//             `Unable to getById - getCacheById ${id}`,
//             {
//                 error: JSON.stringify(e.message),
//             },
//             true
//         );
//         console.error(`Unable to getById - getCacheById ${id}`, e.message);
//     }
//     return data;
// };

// export const setCacheById = async (
//     id: string,
//     state: FormSubmissionState
// ): Promise<any | null> => {
//     let client: CosmosClient,
//         data: any,
//         database: Database,
//         container: Container;
//     client = new CosmosClient({
//         endpoint: config.cosmosEndpoint,
//         key,
//     });
//     database = client.database("df-forms");
//     container = database.container("RunnerDraftData");
//     try {
//         data = await container.items.upsert<FormSubmissionState>(state);
//     } catch (e: any) {
//         console.error(`Unable to upsert document.${state}`, e.message);
//         trackEvent(
//             `Unable to gupsert document.${state}`,
//             {
//                 error: JSON.stringify(e.message),
//             },
//             true
//         );
//         if (e.message == "Response Error: 429 Too Many Requests") {
//             try {
//                 await sleep(2000);
//                 data = await container.items.upsert<FormSubmissionState>(state);
//             } catch (e: any) {
//                 console.error(
//                     `Unable to upsert document-retry.${state}`,
//                     e.message
//                 );
//                 trackEvent(
//                     `Unable to upsert document-retry.${state}`,
//                     {
//                         error: JSON.stringify(e.message),
//                     },
//                     true
//                 );
//             }
//         }
//         return {};
//     }
//     return JSON.stringify(data.resource);
// };

// export const CheckProvidersMappingById = async (
//     id: string,
//     ukPRN: number,
//     urn: number,
//     adminCode: string
// ): Promise<bool | false> => {
//     try {
//         const client = new CosmosClient({
//             endpoint: config.cosmosEndpoint,
//             key,
//         });
//         const database = client.database("df-forms");
//         const container = database.container("providers-mapping");
//         const querySpec = {
//             query: 'SELECT * from c where c.id="' + id + '"',
//         };
//         const data = await container.items.query(querySpec).fetchNext();
//         let validUKPRN, validURN, validAdminCode;
//         validUKPRN = data?.resources[0]?.providers.UKPRN.includes(ukPRN);
//         if (!validUKPRN || validUKPRN == undefined) {
//             validURN = data?.resources[0]?.providers.URN.includes(urn);
//         }
//         if (
//             (!validUKPRN || validUKPRN == undefined) &&
//             (!validURN || validURN == undefined)
//         ) {
//             validAdminCode = data?.resources[0]?.providers.adminCode.includes(
//                 adminCode
//             );
//         }
//         return validUKPRN || validURN || validAdminCode;
//     } catch (e: any) {
//         trackEvent(
//             `CheckProvidersMappingById - Error`,
//             {
//                 error: JSON.stringify(e.message),
//             },
//             true
//         );
//         console.error(`Unable to getmappingsById ${id}`, e.message);
//     }
//     return false;
// };
