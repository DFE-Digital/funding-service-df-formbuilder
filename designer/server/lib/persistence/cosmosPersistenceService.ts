// /* istanbul ignore file */

// import { PersistenceService } from "./persistenceService";
// import { HapiServer } from "../../types";
// import { ProviderMapping } from "@xgovformbuilder/model";
// import { CosmosClient } from "@azure/cosmos";
// import {
//     _delete,
//     FormConfiguration,
//     FormDefinition,
//     FormStatus,
//     generateCosmosHeaders,
//     get,
//     HttpVerbs,
//     post,
// } from "@xgovformbuilder/model";
// import { nanoid } from "nanoid";
// import config from "../../config";

// export class CosmosPersistenceService implements PersistenceService {
//     logger: HapiServer["logger"];
//     formsEndpoint: string;
//     providersMappingEndpoint: string;
//     key: string;

//     constructor(server: HapiServer) {
//         this.logger = server.logger;
//         this.formsEndpoint = `${config.endpoint}dbs/df-forms/colls/forms/docs`;
//         this.providersMappingEndpoint = `${config.endpoint}dbs/df-forms/colls/providers-mapping/docs`;
//         this.key = config.key;
//     }

//     private static addLeadingZeroes(value: number): string {
//         return (value < 10 ? "0" : "") + value;
//     }
//     private static getFormattedTimestamp(): string {
//         const date = new Date();
//         return `${date.getFullYear()}/${this.addLeadingZeroes(
//             date.getMonth() + 1
//         )}/${this.addLeadingZeroes(date.getDate())} ${this.addLeadingZeroes(
//             date.getHours()
//         )}:${this.addLeadingZeroes(date.getMinutes())}`;
//     }
//     private static checkUserDetails(
//         userName: string | undefined,
//         userId: string | undefined
//     ): {
//         userName: string;
//         userId: string;
//     } {
//         let name = config.localUser ?? "devUser";
//         let id = config.localUserId ?? "devId";

//         //If defined, and have value, return original value
//         if (userName) {
//             if (userName.trim() !== "") {
//                 name = userName;
//             }
//         }
//         if (userId) {
//             if (userId.trim() !== "") {
//                 id = userId;
//             }
//         }
//         return { userId: id, userName: name };
//     }

//     /**
//      * Fetches the required fields for form configuration from all forms
//      * @returns FormConfiguration[]
//      */
//     async listAllConfigurations() {
//         const fieldsRequired = [
//             "id",
//             "displayName",
//             "createdBy",
//             "formStatus",
//             "lastModified",
//             "feedbackForm",
//             "userId",
//             "signInRequired",
//         ];
//         // Used to construct field query string E.g; id -> f.id,
//         let constructedFieldQueryStr = fieldsRequired.reduce((prev, curr) => {
//             if (!prev) return prev + `f.${curr}`;
//             return prev + ", " + `f.${curr}`;
//         }, "");
//         try {
//             const client = new CosmosClient({
//                 endpoint: config.endpoint,
//                 key: this.key,
//             });
//             const database = client.database("df-forms");
//             const container = database.container("forms");
//             const querySpec = {
//                 query: `SELECT ${constructedFieldQueryStr} from Forms f`,
//             };
//             const { resources: forms } = await container.items
//                 .query(querySpec)
//                 .fetchAll();
//             return forms.map((form) => {
//                 return new FormConfiguration(
//                     form.id,
//                     form.displayName,
//                     form.createdBy,
//                     form.formStatus,
//                     form.lastModified,
//                     form.feedbackForm,
//                     form.userId,
//                     form.signInRequired
//                 );
//             });
//         } catch (e) {
//             this.logger?.error(`error listing all configurations ${e}`);
//             return e;
//         }
//     }

//     async getConfiguration(id: string) {
//         try {
//             const url = `${this.formsEndpoint}/${id}`;
//             const headers = generateCosmosHeaders(
//                 this.key,
//                 HttpVerbs.GET,
//                 url,
//                 id
//             );
//             const cosmosResults = await get<FormDefinition>(url, {
//                 headers,
//             });
//             // console.log(cosmosResults);
//             return JSON.parse(
//                 cosmosResults.payload.toString()
//             ) as FormDefinition;
//         } catch (e) {
//             console.log(e);
//             //this.logger.error(`error getting configuration ${e}`);
//             return e;
//         }
//     }
//     async uploadProvidersMapping(
//         formId: string,
//         providerMapping: ProviderMapping
//     ): Promise<any> {
//         try {
//             const headers = generateCosmosHeaders(
//                 this.key,
//                 HttpVerbs.POST,
//                 this.providersMappingEndpoint,
//                 formId
//             );

//             //Enable upsert
//             headers["x-ms-documentdb-is-upsert"] = true;

//             const { payload } = await post(this.providersMappingEndpoint, {
//                 headers,
//                 payload: JSON.stringify(providerMapping),
//             });
//             return JSON.parse(payload.toString());
//         } catch (e) {
//             this.logger?.error(`error updating providers Mapping ${e}`);
//             return e;
//         }
//     }
//     async addConfiguration(name: string, configuration: FormDefinition) {
//         try {
//             const userDetails = CosmosPersistenceService.checkUserDetails(
//                 configuration.createdBy,
//                 configuration.userId
//             );
//             //Form metadata initialisation
//             configuration.id = nanoid(10);
//             configuration.key = configuration.id;
//             configuration.displayName = name;
//             configuration.name = name;
//             configuration.userId = userDetails.userId;
//             configuration.createdBy = userDetails.userName;
//             configuration.lastModified = CosmosPersistenceService.getFormattedTimestamp();
//             configuration.formStatus = FormStatus.InDevelopment;
//             const headers = generateCosmosHeaders(
//                 this.key,
//                 HttpVerbs.POST,
//                 this.formsEndpoint,
//                 configuration.id
//             );

//             const { payload } = await post(this.formsEndpoint, {
//                 headers,
//                 payload: JSON.stringify(configuration),
//             });
//             return JSON.parse(payload.toString());
//         } catch (e) {
//             this.logger?.error(`error creating configuration ${e}`);
//             return e;
//         }
//     }

//     async uploadConfiguration(id: string, configuration: FormDefinition) {
//         try {
//             //Ensure user details are added
//             const userDetails = CosmosPersistenceService.checkUserDetails(
//                 configuration.lastUpdatedByName,
//                 configuration.lastUpdatedById
//             );
//             configuration.lastUpdatedById = userDetails.userId;
//             configuration.lastUpdatedByName = userDetails.userName;
//             configuration.formStatus =
//                 configuration.formStatus ?? FormStatus.InDevelopment;
//             configuration.lastModified = CosmosPersistenceService.getFormattedTimestamp();
//             configuration.id = id; // Replace imported form's id to existing form id
//             configuration.key = id;

//             const headers = generateCosmosHeaders(
//                 this.key,
//                 HttpVerbs.POST,
//                 this.formsEndpoint,
//                 id
//             );

//             //Enable upsert
//             headers["x-ms-documentdb-is-upsert"] = true;

//             const { payload } = await post(this.formsEndpoint, {
//                 headers,
//                 payload: JSON.stringify(configuration),
//             });
//             return JSON.parse(payload.toString());
//         } catch (e) {
//             this.logger?.error(`error updating configuration ${e}`);
//             return e;
//         }
//     }

//     async copyConfiguration(
//         id: string,
//         newName: string,
//         userName: string,
//         userId: string
//     ) {
//         try {
//             const formToDuplicate = await this.getConfiguration(id);
//             formToDuplicate.id = nanoid(10);
//             formToDuplicate.key = formToDuplicate.id;
//             formToDuplicate.displayName = newName;

//             //Ensure user details are added
//             const userDetails = CosmosPersistenceService.checkUserDetails(
//                 userName,
//                 userId
//             );
//             formToDuplicate.userId = userDetails.userId;
//             formToDuplicate.createdBy = userDetails.userName;

//             formToDuplicate.lastModified = CosmosPersistenceService.getFormattedTimestamp();
//             formToDuplicate.formStatus = FormStatus.InDevelopment;

//             const headers = generateCosmosHeaders(
//                 this.key,
//                 HttpVerbs.POST,
//                 this.formsEndpoint,
//                 formToDuplicate.id
//             );

//             const { payload } = await post(this.formsEndpoint, {
//                 headers,
//                 payload: JSON.stringify(formToDuplicate),
//             });
//             return JSON.parse(payload.toString());
//         } catch (e) {
//             console.log(e);
//             //this.logger.error(`error copying configuration ${e}`);
//             return e;
//         }
//     }
//     async deleteConfiguration(id: string) {
//         try {
//             const url = `${this.formsEndpoint}/${id}`;
//             const headers = generateCosmosHeaders(
//                 this.key,
//                 HttpVerbs.DELETE,
//                 url,
//                 id
//             );
//             const cosmosResults = await _delete<FormDefinition>(url, {
//                 headers,
//             });
//             return cosmosResults.payload;
//         } catch (e) {
//             this.logger?.error(`error deleting configuration ${e}`);
//             return e;
//         }
//     }
// }
