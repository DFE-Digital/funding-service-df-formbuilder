import config from "server/config";
import { HapiRequest, HapiResponseToolkit } from "server/types";
import { redirectTo } from "server/plugins/engine";
import getIdToken from "server/utils/odic";
import store from "store2";
import FormAuthorization from "server/plugins/authorize";
import { debugConsoleLog } from "server/utils/commonUtils";

export const shouldLogin = (signInRequired?: boolean) =>
    signInRequired == true && config.authEnabled === true;

export const verifyValidTokenExist = (
    request: HapiRequest,
    h: HapiResponseToolkit
) => {
    const session = request.yar;
    const verifyParentAndChildRelation = store.get("formid");
    debugConsoleLog(verifyParentAndChildRelation);
    const idToken = session.get("id_token");
    if (idToken !== null) {
        const tokenExpire = new Date(idToken.exp * 1000);
        const dateNow = new Date();
        if (dateNow >= tokenExpire) {
            return false;
        } else {
            request.auth.isAuthenticated = true;
            return true;
        }
    }
    return false;
};

export default {
    plugin: {
        name: "auth",
        register: async (server) => {
            if (!config.authEnabled) {
                return;
            }
            server.route({
                method: ["GET", "POST"],
                path: "/login",
                handler: async (
                    request: HapiRequest,
                    h: HapiResponseToolkit
                ) => {
                    let session = request.yar;
                    const force = session.get("forceLogin") === true;
                    // Always clear the flag immediately so it only applies once
                    session.clear("forceLogin");
                    if (session.get("returnUrl") === null)
                        session.set("returnUrl", request.query.returnUrl);
                    const dsiAuthUrl = `${config.authClientAuthUrl}?client_id=${
                        config.authClientId
                    }&redirect_uri=${encodeURI(config.authRedirectUrl)}&scope=${
                        config.scope
                    }&response_type=code&state=${session.id}${
                        force ? "&prompt=login&max_age=0" : ""
                    }`;
                    return redirectTo(request, h, dsiAuthUrl);
                },
            });

            server.route({
                method: "GET",
                path: "/auth/callback",
                handler: async (
                    request: HapiRequest,
                    h: HapiResponseToolkit
                ) => {
                    let session = request.yar;
                    const { code, state } = request.query;
                    let token = await getIdToken(request, code);
                    if (token === null) {
                        const returnUrl = session.get("returnUrl");
                        store.clear();
                        request.yar.reset();
                        request.yar.set("forceLogin", true);
                        return redirectTo(request, h, returnUrl);
                    }
                    session.set("userId", token?.sub);
                    const { userService } = request.services([]);
                    let userOrganisations = await userService.getOrganizations(
                        token
                    );
                    if (userOrganisations) {
                        const organisation = userOrganisations?.find(
                            (org) => org.id == token.organisation.id
                        );
                        debugConsoleLog(
                            "AUTH Organisation Details",
                            organisation
                        );
                        session.set("organisation", organisation);
                        store.set("organisation", organisation);
                        session.set("allOrganisations", userOrganisations);
                        store.set("allOrganisations", userOrganisations);
                    }
                    if (await FormAuthorization(request)) {
                        request.yar.set("id_token", token);
                        const organisationDetails =
                            request.yar?._store?.organisation;
                        debugConsoleLog(
                            "AUTH organisationDetails",
                            organisationDetails
                        );
                        session.set("state", state);
                        store.set("formid", request.yar.get("formId"));
                        h.state("testCookie", "testing");
                    }
                    return h.redirect(`/user-information`);
                },
            });

            server.route({
                method: "get",
                path: "/logout",
                handler: async (
                    request: HapiRequest,
                    h: HapiResponseToolkit
                ) => {
                    var token = request.yar.get("encoded_Id_token");
                    store.clear();
                    const url = token
                        ? encodeURI(
                              `${config.authLogoutUrl}?id_token_hint=${token}&post_logout_redirect_uri=https://${request.url.host}/clear-session`
                          )
                        : encodeURI(
                              `https://${request.url.host}/clear-session`
                          );

                    return redirectTo(request, h, url);
                },
            });
        },
    },
};
