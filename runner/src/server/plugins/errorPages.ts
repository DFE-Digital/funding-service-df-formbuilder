import { HapiRequest, HapiResponseToolkit } from "../types";
import { trackEvent, trackException } from "../logging/customTracker";
import config from "server/config";

/*
 * Add an `onPreResponse` listener to return error pages
 */
export default {
    plugin: {
        name: "error-pages",
        register: (server) => {
            server.ext(
                "onPreResponse",
                (request: HapiRequest, h: HapiResponseToolkit) => {
                    const response = request.response;
                    const session = request.yar;
                    const { isDebugging } = config;
                     trackEvent("response",{response}, false);
                    if ("isBoom" in response && response.isBoom) {
                         trackEvent("isBoom", response.isBoom, false);
                         trackEvent("output",  response.output.statusCode, false);
                         trackEvent("message",  response.message, false);
                        // An error was raised during
                        // processing the request
                        const statusCode = response.output.statusCode;
                        console.error(response.message);
                        // In the event of 404
                        // return the `404` view
                        if (statusCode === 404) {
                            return h.view("404", { 
                                    name: session.get("form-name"),
                                    accessibilityLink:
                                        "/accessibility-statement",
                                    cookiesLink: `/cookies`,
                                    privacyLink:
                                        "https://www.gov.uk/government/publications/privacy-information-education-providers-workforce-including-teachers/privacy-information-education-providers-workforce-including-teachers"
                                })
                                .code(statusCode);
                        }

                        if (statusCode === 403) {
                            const numOrganisations = session.get(
                                "allOrganisations"
                            )?.length ?? 0;
                            const orgUKPRN = session.get("organisation")?.ukprn;
                            const orgName = session.get("organisation")?.name;
                            trackEvent("orgUKPRN",  orgUKPRN, false);
                            trackEvent("orgName",  orgName, false);
                            trackEvent("orgName",  numOrganisations, false);
                            let message;
                            let displayProviderTable = false;
                            if (numOrganisations === 0) {
                                message =
                                    "Your account needs approving before you can access this form. We will email you when it is ready.";
                            } else if (numOrganisations > 1) {
                                message = `You cannot access this form through this UKPRN`;
                                displayProviderTable = true;
                            } else if (numOrganisations === 1) {
                                message = `You cannot access this form through this UKPRN`;
                                displayProviderTable = true;
                            } else {
                                message =
                                    "Sorry, you are not allowed to access this form";
                            }

                            return h
                                .view("403", {
                                    name: session.get("form-name"),
                                    accessibilityLink:
                                        "/accessibility-statement",
                                    cookiesLink: `/cookies`,
                                    privacyLink:
                                        "https://www.gov.uk/government/publications/privacy-information-education-providers-workforce-including-teachers/privacy-information-education-providers-workforce-including-teachers",
                                    message: message,
                                    orgName: orgName,
                                    orgUKPRN: orgUKPRN,
                                    displayProviderTable: displayProviderTable
                                })
                                .code(statusCode);
                        }

                        // The return the `500` view
                        trackException(
                            new Error(`Boom Error : ${response.message}`)
                        );
                        return h
                            .view("500", {
                                name: session.get("form-name"),
                                error: response.message,
                                debug: isDebugging,
                                accessibilityLink: "/accessibility-statement",
                                cookiesLink: `/cookies`,
                                privacyLink:
                                    "https://www.gov.uk/government/publications/privacy-information-education-providers-workforce-including-teachers/privacy-information-education-providers-workforce-including-teachers",
                            })
                            .code(statusCode);
                    }
                    return h.continue;
                }
            );
        },
    },
};
