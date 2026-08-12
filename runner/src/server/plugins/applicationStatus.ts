import { redirectTo } from "./engine";
import { HapiRequest, HapiResponseToolkit } from "../types";
import { getFormById } from "server/plugins/engine/services/formService";
import { FormModel } from "server/plugins/engine/models";
import { trackEvent } from "../logging/customTracker";
import store from "store2";

const applicationStatus = {
    plugin: {
        name: "applicationStatus",
        dependencies: "vision",
        multiple: true,
        register: (server) => {
            server.route({
                method: "get",
                path: "/{id}/status",
                options: {
                    pre: [
                        {
                            method: (request) => {
                                const { statusService } = request.services([]);
                                return statusService.shouldRetryPay(request);
                            },
                            assign: "shouldRetryPay",
                        },
                        {
                            method: (request) => {
                                const { cacheService } = request.services([]);
                                return cacheService.getConfirmationState(
                                    request
                                );
                            },
                            assign: "confirmationViewModel",
                        },
                    ],
                    handler: async (
                        request: HapiRequest,
                        h: HapiResponseToolkit
                    ) => {
                        const {
                            statusService,
                            cacheService,
                        } = request.services([]);
                        const { params } = request;
                        const config = await getFormById(params.id);

                        const form = config
                            ? new FormModel(config, {
                                basePath: params.id,
                            })
                            : null;
                        if (form?.def.signInRequired)
                            request.auth.isAuthenticated = true;
                        else request.auth.isAuthenticated = false;
                        if (!!request.pre.confirmationViewModel?.confirmation) {
                            request.logger.info(
                                [`/${params.id}/status`],
                                `${request.yar.id} confirmationViewModel found for user`
                            );
                            return h.view("confirmation", {
                                ...request.pre.confirmationViewModel
                                    .confirmation,
                                confirmationMsg: form?.def.confirmationMsg,
                            });
                        }

                        if (request.pre.shouldRetryPay) {
                            return h.view("pay-error", {
                                errorList: [
                                    "there was a problem with your payment",
                                ],
                            });
                        }

                        var state = await cacheService.getState(request);

                        if (state?.userCompletedSummary !== true) {
                            request.logger.error(
                                [`/${params.id}/status`],
                                `${request.yar.id} user has incomplete state`
                            );
                            return h.redirect(`/${params.id}/summary`);
                        }
                        try {
                            const {
                                reference: newReference,
                            } = await statusService.outputRequests(request);
                            // if (
                            //     newReference === "UNKNOWN" ||
                            //     newReference === null
                            // ) {
                            //     throw new Error("Unknown reference");
                            // }
                            trackEvent(
                                `Application Insights: applicationStatus page new reference created`,
                                {
                                    newReference,
                                },
                                true
                            );
                            //state = await cacheService.getState(request);
                            const viewModel = statusService.getViewModel(
                                state,
                                form,
                                newReference
                            );

                            await cacheService.setConfirmationState(request, {
                                confirmation: viewModel,
                            });

                            state = await cacheService.mergeState(
                                request,
                                {
                                    reference: newReference,
                                },
                                state
                            );
                            state = await cacheService.setState(state);
                            store.clear();
                            if (state?.referenceIsStored) {
                                viewModel.accessibilityLink =
                                    "/accessibility-statement";
                                return h.view("confirmation", {
                                    ...viewModel,
                                    confirmationMsg: form?.def.confirmationMsg,
                                    accessibilityLink:
                                        "/accessibility-statement",
                                    cookiesLink: `/cookies`,
                                    privacyLink:
                                        "https://www.gov.uk/government/publications/privacy-information-education-providers-workforce-including-teachers/privacy-information-education-providers-workforce-including-teachers",
                                });
                            } else {
                                state = await cacheService.mergeState(
                                    request,
                                    {
                                        ...state,
                                        referenceIsStored: newReference,
                                    },
                                    state
                                );

                                state = await cacheService.setState(state);
                                return h.redirect(`/${params.id}/summary`);
                            }
                        } catch (e) {
                            trackEvent(
                                `Application Insights: outputRequests failed`,
                                {
                                    error: e?.message,
                                },
                                false
                            );
                            throw e;
                        }
                        finally {
                            store.clear();
                            request.yar.reset();
                        }
                    },
                },
            });

            server.route({
                method: "post",
                path: "/{id}/status",
                handler: async (
                    request: HapiRequest,
                    h: HapiResponseToolkit
                ) => {
                    try
                    {
                    const { payService, cacheService } = request.services([]);

                    let state = await cacheService.getState(request);
                    const { pay } = state;
                    if (pay) {
                        pay.meta.attempts++;
                    }
                    const res = await payService.retryPayRequest(pay);
                    state = await cacheService.mergeState(
                        request,
                        {
                            pay: {
                                payId: res.payment_id,
                                reference: res.reference,
                                self: res._links.self.href,
                                meta: pay.meta ?? {},
                            },
                        },
                        state
                    );

                    state = await cacheService.setState(state);
                    return redirectTo(request, h, res._links.next_url.href);
                } catch (e) {
                            throw e;
                }
                finally {
                    store.clear();
                    request.yar.reset();   
                }
                }
            });
        },
    },
};

export default applicationStatus;
