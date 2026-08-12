import pkg from "../../package.json";
import {
    //newConfig,
    api,
    app,
    formConfigurationsApi,
    providerMappingApi,
} from "./routes";
import { envStore, flagg } from "flagg";

export const designerPlugin = {
    plugin: {
        name: pkg.name,
        version: pkg.version,
        multiple: true,
        dependencies: "vision",
        register: async (server) => {
            server.route({
                method: "get",
                path: "/",
                options: {
                    handler: async (_request, h) => {
                        return h.redirect("/app");
                    },
                },
            });

            // This is old url , redirecting it to new
            server.route(app.redirectNewToApp);

            server.route(app.getApp);

            server.route(app.getFormBuilder);

            server.route(app.getAppChildRoutes);

            server.route(app.getErrorCrashReport);

            // This is old url , redirecting it to new
            server.route(app.redirectOldUrlToDesigner);

            server.route({
                method: "GET",
                path: "/feature-toggles",
                options: {
                    handler: async (request, h) => {
                        const featureFlags = flagg({
                            store: envStore(process.env),
                            definitions: {
                                featureEditPageDuplicateButton: {
                                    default: true,
                                },
                            },
                        });

                        return h
                            .response(
                                JSON.stringify(featureFlags.getAllResolved())
                            )
                            .code(200);
                    },
                },
            });

            //server.route(newConfig.registerNewFormWithRunner);
            server.route(api.getFormWithId);
            server.route(api.uploadToSharePoint);
            server.route(api.saveDataSet);
            server.route(api.getDataSet);
            server.route(api.getDocument);
            server.route(api.deleteDataSet);
            server.route(api.putFormWithId);
            server.route(api.deleteFormWithId);
            server.route(api.getAllPersistedConfigurations);
            server.route(api.log);
            server.route(api.fileUpload);

            // Proxy SQL APIs
            server.route(formConfigurationsApi.listFormConfigurations);
            server.route(formConfigurationsApi.deleteFormConfigurations);
            server.route(formConfigurationsApi.deleteRepeatableQuestionForm);
            server.route(formConfigurationsApi.addFormConfiguration);
            server.route(formConfigurationsApi.uploadFormConfiguration);
            server.route(formConfigurationsApi.checkFormNameExists);
            server.route(formConfigurationsApi.getConfiguration);
            server.route(formConfigurationsApi.updateParentChild);
            server.route(providerMappingApi.addProviderMapping);
            server.route(providerMappingApi.addMultipleProviderMapping);
            server.route(formConfigurationsApi.createNewFormConfig);
            server.route(formConfigurationsApi.importSavedForm);
            server.route(formConfigurationsApi.duplicateForm);
            server.route(formConfigurationsApi.updateMultipleFormStatus);
            server.route(
                formConfigurationsApi.deleteMultipleFormConfigurations
            );
        },
    },
};
