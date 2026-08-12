// $lab:coverage:off$
import { HapiRequest, HapiServer, HapiResponseToolkit } from "../types";
import {
    CacheService,
    NotifyService,
    PayService,
    WebhookService,
    UserService,
} from "server/services";
import { trackEvent, trackTrace } from "../logging/customTracker";
import { SendNotificationArgs } from "server/services/notifyService";
import { Output, WebhookOutputConfiguration } from "@xgovformbuilder/model";
import type { NotifyModel } from "../plugins/engine/models/submission";
import { ComponentCollection } from "server/plugins/engine/components/ComponentCollection";
import { FormSubmissionState } from "server/plugins/engine/types";
import { FormModel } from "server/plugins/engine/models";
import { nanoid } from "nanoid";
import { createDocument } from "server/plugins/engine/services/formService";
import axios from "axios";
import config from "../config";
import Boom from "boom";
import isUAT from "../utils/isUAT";
import { redirectTo } from "../plugins/engine/helpers";
import { debugConsoleLog } from "server/utils/commonUtils";

type WebhookModel = WebhookOutputConfiguration & {
    formData: object;
};

type OutputArgs = {
    notify: SendNotificationArgs[];
    webhook: WebhookModel[];
};

type OutputModel = Output & {
    outputData: NotifyModel | WebhookModel;
};

function isWebhookModel(
    output: OutputModel["outputData"]
): output is WebhookModel {
    return (output as WebhookModel)?.url !== undefined;
}

function isNotifyModel(
    output: OutputModel["outputData"]
): output is NotifyModel {
    return (output as NotifyModel)?.emailAddress !== undefined;
}

export class StatusService {
    /**
     * StatusService handles sending data at the end of the form to the configured `Outputs`
     */
    logger: HapiServer["logger"];
    cacheService: CacheService;
    webhookService: WebhookService;
    notifyService: NotifyService;
    payService: PayService;
    userService: UserService;

    constructor(server: HapiServer) {
        this.logger = server.logger;
        const {
            cacheService,
            webhookService,
            notifyService,
            payService,
            userService,
        } = server.services([]);
        this.cacheService = cacheService;
        this.webhookService = webhookService;
        this.notifyService = notifyService;
        this.payService = payService;
        this.userService = userService;
    }

    async shouldRetryPay(request): Promise<boolean> {
        const { pay } = await this.cacheService.getState(request);
        if (!pay) {
            this.logger.info(
                ["StatusService", "shouldRetryPay"],
                "No pay state detected, skipping"
            );
            return false;
        } else {
            const { self, meta } = pay;
            const { query } = request;
            let { state } = await this.payService.payStatus(
                self,
                meta.payApiKey
            );
            const userSkippedOrLimitReached =
                query?.continue === "true" || meta?.attempts >= 3;

            state = await this.cacheService.mergeState(
                request,
                {
                    pay: {
                        ...pay,
                        paymentSkipped: userSkippedOrLimitReached,
                        state,
                    },
                },
                state
            );

            const shouldRetry =
                state.status === "failed" && !userSkippedOrLimitReached;

            this.logger.info(
                ["StatusService", "shouldRetryPay"],
                `user ${request.yar.id} - shouldRetryPay: ${shouldRetry}`
            );

            return shouldRetry;
        }
    }

    submitFiles = async (details, reference, formId) => {
        try {
            const fileShifterApiUrl = config.fileShifterAPI;
            const accessKey = config.fileShifterSubscriptionKey;
            let fileComps = [];
            for (var index in details) {
                let comps = details[index].fields.filter(
                    (item) => item?.type === "file" && item.answer !== ""
                );
                fileComps = fileComps.concat(comps);
            }
            for (var index in fileComps) {
                let fileId = fileComps[index].answer.split("|")[0];
                let filePath = fileComps[index].answer.split("|")[1];
                let res = await axios.post(
                    `${fileShifterApiUrl}`,
                    {
                        fileId: fileId,
                        sourceSystem: "DigitalForms",
                        targetFilePath: filePath,
                        targetRootFolder: `${formId}/${reference}`,
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Ocp-Apim-Subscription-Key": accessKey,
                        },
                    }
                );
            }
        } catch (err: any) {
            trackEvent(
                `File Shifter:Error`,
                {
                    error: JSON.stringify(err.message),
                },
                true
            );
            throw Boom.badImplementation(
                "Error in External file shifter Api " + err
            );
        }
    };

    async outputRequests(request: HapiRequest, h: HapiResponseToolkit) {
        let state = await this.cacheService.getState(request);
        let newReference;
        const { outputs } = state;
        const { isDebugging } = config;
        trackEvent(
            `Application Insights: status service page - outputRequests method called`,
            {
                outputs,
                newReference,
            }
        );
        if (outputs && outputs.length > 0) {
            const {
                outputs: [{ outputData }],
            } = state;
            trackEvent(
                `Application Insights: status service page - output present`,
                {
                    dsiEmail: state.dsiSignInEmail,
                    emailFlag: state.sendEmail,
                }
            );
            if (state.dsiSignInEmail && state.sendEmail) {
                state = await this.cacheService.mergeState(
                    request,
                    Object.assign(state, {
                        outputs: [
                            {
                                outputData: {
                                    ...outputData,
                                    emailAddress: state.dsiSignInEmail,
                                },
                            },
                        ],
                        sendEmail: true,
                    })
                );
            }
        }
        if (!state?.reference) {
            newReference = nanoid(10);
        } else {
            newReference = state?.referenceIsStored;
        }

        const firstWebhook = outputs?.find(
            (output) => output?.type === "webhook"
        );
        const otherOutputs = outputs?.filter(
            (output) => output !== firstWebhook
        );
        let formData = this.webhookArgsFromState(state);
        formData.formId =
            request?.params?.id === state?.Formid
                ? request?.params?.id
                : state?.Formid;
        await this.submitFiles(
            formData.questions,
            newReference,
            formData.formId
        );
        trackEvent(
            `Application Insights: status service page - submitFiles method completed`,
            {
                newReference,
            }
        );

        formData.id = newReference;

        formData.user = await this.userService?.buildUserDetails(request);
        try {
            if (isDebugging) {
                const jsonData = JSON.stringify(formData);
                const chunks = Math.ceil(jsonData.length / 7000);
                const splitData = [];
                let start = 1;
                for (let i = 1; i <= chunks; i++) {
                    let end = i * 7000;
                    splitData.push(jsonData.slice(start, end));
                    start += 7000;
                }
                debugConsoleLog(splitData);
                for (let i = 0; i < splitData.length; i++) {
                    const formData = splitData[i];
                    trackEvent(
                        `Application Insights: status service page - before create document${i}`,
                        {
                            formData,
                            newReference,
                        }
                    );
                }
            }

            const response = await createDocument(
                newReference,
                formData,
                isUAT(request)
            );
            trackEvent(
                `Application Insights: status service page - document created or entry added`,
                {
                    response,
                }
            );
            if (response) {
                state = await this.cacheService.mergeState(
                    request,
                    {
                        reference: newReference,
                        formDataId: newReference,
                        referenceIsStored: newReference,
                        user: formData.user,
                        formid: formData.formId,
                    },
                    state
                );
            } else {
                trackTrace(
                    "Document not created",
                    {
                        auth: request.auth,
                        sessionId: request.yar?.id,
                        reference: newReference,
                        outputs,
                        payload: request.payload,
                        state: state,
                        timestamp: new Date().toISOString(),
                        headers: request.headers,
                    },
                    true // mustLog
                );
                return {
                    reference: newReference,
                    results: null,
                    error: "Document not created",
                };
                // redirectTo(request, h, `/${request?.params?.id}/error`);
                // throw new Error("Document not created");
            }

            const { notify = [], webhook = [] } = this.outputArgs(
                otherOutputs,
                formData,
                newReference,
                state.pay
            );

            const requests = [
                ...notify.map((args) =>
                    this.notifyService.sendNotification(args, state.sendEmail)
                ),
                ...webhook.map(({ url, formData }) =>
                    this.webhookService.postRequest(url, formData)
                ),
            ];
            trackEvent(`Application Insights: status service page success`, {
                reference: newReference,
                results: Promise.allSettled(requests),
            });
            return {
                reference: newReference,
                results: Promise.allSettled(requests),
            };
        } catch (e) {
            trackEvent(
                `Application Insights: create document failed`,
                {
                    error: e,
                    errorMsg: e?.message,
                },
                true
            );
            throw e;
        }
    }

    /**
     * Appends `{paymentSkipped: true}` to the `metadata` property and drops the `fees` property if the user has chosen to skip payment
     */
    webhookArgsFromState(state) {
        const { pay = {}, webhookData } = state;
        const { paymentSkipped } = pay;
        const { metadata, fees, ...rest } = webhookData;
        return {
            ...rest,
            ...(!paymentSkipped && { fees }),
            metadata: {
                ...metadata,
                paymentSkipped: paymentSkipped ?? false,
            },
        };
    }

    emailOutputsFromState(
        outputData,
        reference,
        payReference
    ): SendNotificationArgs {
        //emit from server -> go to clietn -> get the stream data
        const {
            apiKey,
            templateId,
            emailAddress,
            personalisation = {},
            addReferencesToPersonalisation = false,
        } = outputData;

        return {
            personalisation: {
                ...personalisation,
                ...(addReferencesToPersonalisation && {
                    hasWebhookReference: !!reference,
                    webhookReference: reference || "",
                    hasPaymentReference: !!payReference,
                    paymentReference: payReference || "",
                }),
            },
            reference,
            apiKey,
            templateId,
            emailAddress,
        };
    }

    outputArgs(
        outputs: OutputModel[] = [],
        formData = {},
        reference,
        payReference
    ): OutputArgs {
        this.logger.trace(
            ["StatusService", "outputArgs"],
            JSON.stringify(outputs)
        );
        return outputs.reduce<OutputArgs>(
            (previousValue: OutputArgs, currentValue: OutputModel) => {
                let { notify, webhook } = previousValue;
                if (isNotifyModel(currentValue.outputData)) {
                    const args = this.emailOutputsFromState(
                        currentValue.outputData,
                        reference,
                        payReference
                    );
                    this.logger.trace(
                        ["StatusService", "outputArgs", "notify"],
                        JSON.stringify(args)
                    );
                    notify.push(args);
                }
                if (isWebhookModel(currentValue.outputData)) {
                    const { url } = currentValue.outputData;
                    webhook.push({ url, formData });
                    this.logger.trace(
                        ["StatusService", "outputArgs", "webhookArgs"],
                        JSON.stringify({ url, formData })
                    );
                }
                return { notify, webhook };
            },
            {
                notify: [],
                webhook: [],
            }
        );
    }

    getViewModel(
        state: FormSubmissionState,
        formModel: FormModel | null,
        newReference?: string
    ) {
        if (!formModel) {
            throw new Error("Empty FormModel");
        }
        const { reference, pay } = state;
        this.logger.info(
            ["StatusService", "getViewModel"],
            `generating viewModel for ${newReference ?? reference}`
        );
        const confirmationPage = formModel.def.specialPages?.confirmationPage;
        const referenceToDisplay =
            newReference === "UNKNOWN" ? reference : newReference ?? reference;

        let model = {
            reference: referenceToDisplay,
            ...(pay && { paymentSkipped: pay.paymentSkipped }),
            name: formModel.name,
            pageTitle: "Confirmation Page",
        };

        if (!confirmationPage) {
            return model;
        }

        model.customText = confirmationPage.customText;

        const components = new ComponentCollection(
            confirmationPage?.components ?? [],
            formModel
        );
        model.components = components.getViewModel(
            state,
            undefined,
            formModel.conditions
        );

        return model;
    }
}
// $lab:coverage:on$
