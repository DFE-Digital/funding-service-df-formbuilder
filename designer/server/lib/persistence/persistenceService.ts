import { FormConfiguration, FormDefinition } from "@xgovformbuilder/model";

export interface PersistenceService {
    uploadProvidersMapping(id: string, providers: any);
    logger: any;
    listAllConfigurations(): Promise<FormConfiguration[]>;

    getConfiguration(id: string): Promise<string>;
    addConfiguration(id: string, configuration: FormDefinition): Promise<any>;
    uploadConfiguration(
        id: string,
        configuration: FormDefinition | string
    ): Promise<any>;
    copyConfiguration(
        configurationId: string,
        newName: string,
        userName: string,
        userId: string
    ): Promise<any>;
    deleteConfiguration(configurationId: string): Promise<any>;
}

export class StubPersistenceService implements PersistenceService {
    logger: any;
    uploadConfiguration(_id: string, _configuration: any) {
        return Promise.resolve(undefined);
    }
    addConfiguration(_id: string, _configuration: any) {
        return Promise.resolve(undefined);
    }
    listAllConfigurations() {
        return Promise.resolve([]);
    }
    getConfiguration(_id: string) {
        return Promise.resolve("");
    }
    copyConfiguration(_configurationId: string, _newName: string) {
        return Promise.resolve("");
    }
    deleteConfiguration(_configurationId: string) {
        return Promise.resolve("");
    }
}
