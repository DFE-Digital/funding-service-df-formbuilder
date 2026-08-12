// import config from "../../config";
// import newFormJson from "../../../new-form.json";
// import { nanoid } from "nanoid";
// import { publish } from "../../lib/publish";
// import { ServerRoute } from "@hapi/hapi";
// import { HapiRequest, HapiResponseToolkit } from "../../types";
// import { FormDefinition } from "@xgovformbuilder/model";
// // import { CheckByName } from "./checkNameExists";

// export const registerNewFormWithRunner: ServerRoute = {
//     method: "post",
//     path: "/api/new",
//     options: {
//         handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
//             const { persistenceService } = request.services([]);
//             const { selected, name, userName, userId } = request.payload;

//             if (name && name !== "" && !name.match(/^[a-zA-Z0-9 _-]+$/)) {
//                 return h
//                     .response("Form name should not contain special characters")
//                     .type("application/json")
//                     .code(202);
//             }

//             let errorResponse = false;

//             let newName = name === "" ? nanoid(10) : name;

//             let newID = null;

//             try {
//                 if (selected.Key === "New") {
//                     if (config.persistentBackend !== "preview") {
//                         const newFormString = JSON.stringify(newFormJson);
//                         const form = JSON.parse(
//                             newFormString
//                         ) as FormDefinition;
//                         //Add user details from MSAL
//                         form.userId = userId;
//                         form.createdBy = userName;
//                         const uploadedForm = await persistenceService.addConfiguration(
//                             newName,
//                             form
//                         );
//                         newName = uploadedForm.id;
//                     } else {
//                         await publish(newName, newFormJson);
//                     }
//                 } else {
//                     const dbResponse = await CheckByName(newName);
//                     if (dbResponse?.length > 0) {
//                         errorResponse = true;
//                     } else {
//                         const copyVersion = await persistenceService.copyConfiguration(
//                             `${selected.Key}`,
//                             newName,
//                             userName,
//                             userId
//                         );
//                         newID = copyVersion.id;
//                         const copied = await persistenceService.getConfiguration(
//                             newName
//                         );
//                         await publish(newName, copied);
//                     }
//                 }
//             } catch (e) {
//                 console.log(e);
//                 //request.logger.error(e);
//             }

//             if (errorResponse) {
//                 return h
//                     .response(
//                         "Form is duplicated. Please enter a unique form name"
//                     )
//                     .type("application/json")
//                     .code(202);
//             } else {
//                 const response = {
//                     id: `${newName}`,
//                     formId: `${newID}`,
//                     previewUrl: config.previewUrl,
//                 };
//                 return h.response(response).type("application/json").code(201);
//             }
//         },
//     },
// };
