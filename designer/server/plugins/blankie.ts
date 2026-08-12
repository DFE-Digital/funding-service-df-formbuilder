import Blankie from "blankie";
import { ServerRegisterPluginObject } from "@hapi/hapi";

export const configureBlankiePlugin = (): ServerRegisterPluginObject<
    Blankie
> => {
    return {
        plugin: Blankie,
        options: {
            defaultSrc: ["self"],
            fontSrc: ["self", "data:"],
            connectSrc: [
                "self",
                "https://login.microsoftonline.com/fad277c9-c60a-4da1-b5f3-b3b8b34a82f9/v2.0/.well-known/openid-configuration",
                "https://login.microsoftonline.com/fad277c9-c60a-4da1-b5f3-b3b8b34a82f9/oauth2/v2.0/token",
                "https://dev-api-customerengagement.platform.education.gov.uk/",
            ],
            scriptSrc: [
                "self",
                "unsafe-inline",
                "unsafe-eval",
                // "https://unpkg.com/react@16/umd/react.development.js",
                // "https://unpkg.com/react-dom@16/umd/react-dom.development.js",
            ],
            styleSrc: ["self"],
            imgSrc: ["self", "data:"],
            generateNonces: false,
        },
    };
};
