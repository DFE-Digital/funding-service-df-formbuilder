import { HapiRequest } from "server/types";
import { CheckProvidersMappingById } from "server/plugins/engine/services/formService";
import Boom from "boom";
import store from "store2";
import { debugConsoleLog } from "server/utils/commonUtils";
import { FormSubmissionState } from "./engine/types";
import {
    getUserDetail,
    updateUserDetails,
    UserDetail,
} from "./engine/services/formService";

const updateUserEmailIfChanged = async (
    tokenInfo: any,
     request: HapiRequest
) => {
    let userDetails = request.yar.get("userDetails");
    if (userDetails == null) {
        userDetails = await getUserDetail(tokenInfo?.sub);
        request.yar.set("userDetails", userDetails);
    }    
    if (!userDetails) return;
    if (userDetails.email !== tokenInfo?.email) {
        debugConsoleLog(
            `User email has changed from ${userDetails.email} to ${tokenInfo?.email}, updating user details.`
        );
        const updatedUserDetails: UserDetail = {
            ...userDetails,
            email: tokenInfo?.email,
        };
        // Update user email
        const isUpdated = await updateUserDetails(updatedUserDetails);
        if (!isUpdated) {
            debugConsoleLog(
                `Unable to update user details - ${userDetails.userId}`
            );
        }
    }
};

const setOrgDetailsInCache = async (
    request: HapiRequest,
    state: FormSubmissionState
) => {
    const { cacheService } = request.services([]);
    const session = request.yar;
    const organizationalDetails =
        session.get("organisation") ?? store.get("organisation");
    const tokenInfo = session.get("id_token");
    if (tokenInfo && organizationalDetails) {
        await updateUserEmailIfChanged(tokenInfo,request);
        state = await cacheService.mergeState(
            request,
            {
                orgUKPRN:
                    organizationalDetails?.ukprn ??
                    organizationalDetails.DistrictAdministrative_code,
                organisationDetails: organizationalDetails,
                dsiSignInEmail: tokenInfo?.email,
            },
            state
        );
        state = await cacheService.setState(state);
    }
};

const FormAuthorization = async (
    request: HapiRequest,
    state: FormSubmissionState
) => {
    const formId = store.get("formId");
    const sessionId = request.yar.get("formId");
    debugConsoleLog("authorize file session id", request.yar.get("formId"));
    debugConsoleLog("authorize file store id", store.get("formId"));
    if (!sessionId && formId) {
        request.yar.set("formId", formId);
    }
    let providersMappingFound, userOrgs;
    try {
        userOrgs = request.yar.get("organisation");                                   
        if (userOrgs !== null) {
             var PM_ukprn = userOrgs?.ukprn ?? userOrgs?.DistrictAdministrative_code;
             providersMappingFound=request.yar.get("providersMappingFound" + PM_ukprn);
            if ( providersMappingFound == null) {
            providersMappingFound = await CheckProvidersMappingById(
                request.yar.get("formId") ?? formId,
                +userOrgs.ukprn,
                +userOrgs.urn,
                userOrgs.DistrictAdministrative_code
            );
            request.yar.set("providersMappingFound" + PM_ukprn, providersMappingFound);
        }
            
            await setOrgDetailsInCache(request, state);
            request.server.logger.debug(
                {
                    data: JSON.stringify({
                        provider: providersMappingFound,
                        id: request.yar.get("formId"),
                        ukprn: userOrgs.ukprn,
                        urn: userOrgs.urn,
                        district_administrative_code:
                            userOrgs.DistrictAdministrative_code,
                    }),
                },
                "FormAuthorization"
            );
        } else {
            request.auth.isAuthenticated = true;
            throw Boom.forbidden("Form Access Denied");
        }
        if (!providersMappingFound) {
            request.auth.isAuthenticated = true;
            throw Boom.forbidden("Form Access Denied");
        } else return true;
    } catch (error) {
        request.server.logger.debug(
            {
                data: error,
            },
            "FormAuthorization-error"
        );
        //@ts-ignore
        if (error?.message == "Form Access Denied")
            throw Boom.forbidden("Form Access Denied");
        return false;
    }
};
export default FormAuthorization;
