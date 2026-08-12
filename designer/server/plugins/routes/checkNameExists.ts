// import { CosmosClient } from "@azure/cosmos";
// import config from "../../config";
// const formsEndpoint = config.endpoint;
// const key: any = config.key;

// export const CheckByName = async (name: string) => {
//     try {
//         const client = new CosmosClient({ endpoint: formsEndpoint, key });
//         const database = client.database("df-forms");
//         const container = database.container("forms");
//         const querySpec = {
//             query: 'SELECT * from c where c.displayName="' + name + '"',
//         };
//         const data = await container.items.query(querySpec).fetchAll();
//         return data.resources;
//     } catch (e) {
//         console.error(`Unable to getmappingsByName ${name}`, e.message);
//     }
//     return false;
// };
