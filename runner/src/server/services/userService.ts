import { get } from "@xgovformbuilder/model";

import config from "../config";
import jwt from "jsonwebtoken";
import { HapiRequest, HapiServer } from "../types";

export type User = {
    id: string;
    organization: Organization | undefined;
    email: string;
    name: string;
};
export type Organization = {
    ukprn: string;
    urn: string;
    name: string;
};

export class UserService {
    logger: HapiServer["logger"];
    constructor(server: HapiServer) {
        this.logger = server.logger;
    }

    async generateApiToken() {
        const payload = {
            iss: config.authClientId,
            aud: "signin.education.gov.uk",
        };
        const apiToken = jwt.sign(payload, config.authApiSecret);
        return apiToken;
    }

    async getOrganizations(idToken: any) {
        try {
            const { payload } = await get(
                `${config.apiUrl}/users/${idToken.sub}/organisations`,
                {
                    headers: {
                        Authorization:
                            "bearer " + (await this.generateApiToken()),
                    },
                }
            );
            return JSON.parse(payload.toString());
        } catch (e: any) {
            console.error("Error", e.message);
            return null;
        }
    }

    async buildUserDetails(request: HapiRequest) {
        const session = request.yar;
        const token = session.get("id_token");
        const organization = session.get("organisation");
        let userdetails: User | undefined;
        if (token !== null && token !== undefined) {
            userdetails = {
                id: token.sub,
                email: token?.email,
                name: `${token?.given_name ?? ""} ${token?.family_name ?? ""}`,
                organization:
                    organization !== null
                        ? {
                              ukprn:
                                  organization.ukprn ??
                                  organization.DistrictAdministrative_code,
                              urn: organization.urn,
                              name: organization.name,
                          }
                        : undefined,
            };
        }
        return userdetails;
    }
}
