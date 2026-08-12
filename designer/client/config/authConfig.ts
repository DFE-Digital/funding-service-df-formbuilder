import { LogLevel } from "@azure/msal-browser";

interface CosmosSettings {
    clientId: string;
    authorityId: string;
    redirectUri: string;
}
const ua = window.navigator.userAgent;
const msie = ua.indexOf("MSIE ");
const msie11 = ua.indexOf("Trident/");
const msedge = ua.indexOf("Edge/");
const firefox = ua.indexOf("Firefox");
const isIE = msie > 0 || msie11 > 0;
const isEdge = msedge > 0;
const isFirefox = firefox > 0; // Only needed if you need to support the redirect flow in Firefox incognito

const cosmosDetails: CosmosSettings = getCosmosDetails();
function getCosmosDetails(): CosmosSettings {
    //set cosmos values
    switch (window.env) {
        case "development": {
            return {
                clientId: "abaf3232-179d-4305-aa84-3b3800302ab0",
                authorityId: "fad277c9-c60a-4da1-b5f3-b3b8b34a82f9",
                redirectUri:
                    "https://dev.designer.digital-forms.education.gov.uk/app/dashboard",
            };
        }
        case "test": {
            return {
                clientId: "83ba6f86-cb2f-4457-9af9-f9938e0c4540",
                authorityId: "fad277c9-c60a-4da1-b5f3-b3b8b34a82f9",
                redirectUri:
                    "https://test.designer.digital-forms.education.gov.uk/app/dashboard",
            };
        }
        case "preproduction": {
            return {
                clientId: "95d6abde-d56e-4ac5-aeab-0125960a4740",
                authorityId: "fad277c9-c60a-4da1-b5f3-b3b8b34a82f9",
                redirectUri:
                    "https://preprod.designer.digital-forms.education.gov.uk/app/dashboard",
            };
        }
        case "production": {
            return {
                clientId: "0b6f3329-3e37-452c-8fbe-522841cd21d2",
                authorityId: "fad277c9-c60a-4da1-b5f3-b3b8b34a82f9",
                redirectUri:
                    "https://designer.digital-forms.education.gov.uk/app/dashboard",
            };
        }
        case "local": {
            return {
                clientId: "11188457-c3c0-44a9-8fb5-33aebc0d9a52",
                authorityId: "fad277c9-c60a-4da1-b5f3-b3b8b34a82f9",
                redirectUri: "http://localhost:3000/app/dashboard",
            };
        }
        default: {
            return {
                clientId: "abaf3232-179d-4305-aa84-3b3800302ab0",
                authorityId: "fad277c9-c60a-4da1-b5f3-b3b8b34a82f9",
                redirectUri:
                    "https://s255d01as-df-designer.azurewebsites.net/app/dashboard",
            };
        }
    }
}
export const msalConfig = {
    auth: {
        clientId: cosmosDetails.clientId,
        authority: `https://login.microsoftonline.com/${cosmosDetails.authorityId}`,
        redirectUri: cosmosDetails.redirectUri,
        knownAuthorities: [
            `https://login.microsoftonline.com/${cosmosDetails.authorityId}`,
        ],
        postLogoutRedirectUri: "/", // Indicates the page to navigate after logout.
        navigateToLoginRequestUrl: false, // If "true", will navigate back to the original request location before processing the auth code response.
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: isIE || isEdge || isFirefox,
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                } // eslint-disable-next-line
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                }
            },
        },
    },
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
    scopes: ["User.Read"],
};
export const silentRequest = {
    scopes: ["openid", "profile"],
};
