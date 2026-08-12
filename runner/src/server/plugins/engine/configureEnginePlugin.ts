import { plugin } from "./plugin";

type ConfigureEnginePlugin = () => {
    plugin: any;
    options: {
        modelOptions: {
            relativeTo: string;
        };
    };
};

const relativeTo = __dirname;

export const configureEnginePlugin: ConfigureEnginePlugin = () => {
    const modelOptions = {
        relativeTo,
    };

    return {
        plugin,
        options: { modelOptions },
    };
};
