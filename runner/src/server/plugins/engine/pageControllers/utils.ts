import _ from "lodash";
import { CacheService } from "src/server/services";
import config from "server/config";
import { RedisService } from "src/server/services";
import { HapiRequest } from "src/server/types";

import { ComponentTypeEnum, DataImportStatus } from "@xgovformbuilder/model";

import { FormSubmissionState } from "../types";
import { ComponentCollectionViewModel } from "../components/types";
import { FormModel, SummaryViewModel } from "../models";
import { setExpiry } from "src/server/utils/commonUtils";
import { trackEvent } from "src/server/logging/customTracker";
import { ComponentBase } from "../components/ComponentBase";

const { fetchFromRedis } = config;

type ViewModel = {
    components: ComponentCollectionViewModel;
};

export const initializeDataImportStatus = async (
    request: HapiRequest,
    viewModel: ViewModel,
    state: FormSubmissionState,
    cacheService: CacheService
) => {
    const dataImportStatuses = state.dataImportStatus ?? {};
    viewModel.components?.forEach((comp) => {
        if (comp?.type === ComponentTypeEnum.DataImport) {
            const compName = comp.model.name;
            if (!compName) return;
            if (dataImportStatuses[compName]) return;
            dataImportStatuses[compName] = DataImportStatus.INITIAL;
        }
    });
    state = await cacheService.mergeState(
        request,
        {
            dataImportStatus: dataImportStatuses,
        },
        state
    );
};

/**
 * Checks if the data import components in the page are validated.
 * Adds an error message if a file is uploaded but not validated
 * @param viewModel
 * @param formResult
 */
export const checkDataImportValidation = (
    viewModel: ViewModel,
    formResult: any
) => {
    const dataImportFields = viewModel.components
        ?.filter((component) => component?.type === "DataImport")
        .map((component) => component.model);
    if (dataImportFields?.length > 0) {
        const dataImportCompWithPendingValidation = dataImportFields?.filter(
            (field) => {
                return field.status === DataImportStatus.UPLOADED;
            }
        );
        const reformattedErrors = dataImportCompWithPendingValidation.map(
            (field) => {
                return {
                    path: field.name,
                    href: `#${field.name}`,
                    name: field.name,
                    text:
                        "Select your file and click the 'Validate the file' button to proceed",
                };
            }
        );

        if (reformattedErrors?.length > 0) {
            formResult.errors = Object.is(formResult.errors, null)
                ? { titleText: "Fix the following errors" }
                : formResult.errors;
            formResult.errors.errorList = reformattedErrors;
        }
    }
};

export const numberWithCommas = (x: number | string) => {
    return x?.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
};

export const assignFileErrors = (
    payload: any,
    formResult: any,
    fileFields: any
) => {
    fileFields?.forEach((fileField) => {
        const name = fileField.name;
        const filesizeerror = payload[`filesizeerror_${name}`];
        const filenameerror = payload[`filenameerror_${name}`];
        const filebandwidtherror = payload[`filebandwidtherror_${name}`];
        if (filesizeerror === "true") {
            formResult.errors = {
                titleText: "Fix the following errors",
            };
            formResult.errors.errorList = formResult.errors.errorList ?? [];
            formResult.errors.errorList.push({
                path: name,
                href: `#${name}`,
                name: name,
                text: "The file must be smaller than 10MB",
            });
        }
        if (filenameerror === "true") {
            formResult.errors = {
                titleText: "Fix the following errors",
            };
            formResult.errors.errorList = formResult.errors.errorList ?? [];
            formResult.errors.errorList.push({
                path: name,
                href: `#${name}`,
                name: name,
                text: "The selected file must use the correct file name format",
            });
        }
        if (filebandwidtherror === "true") {
            formResult.errors = {
                titleText: "There is a problem",
            };
            formResult.errors.errorList = formResult.errors.errorList ?? [];
            formResult.errors.errorList.push({
                path: name,
                href: `#${name}`,
                name: name,
                text: "Local network connectivity or bandwidth error. Try again to upload your file",
            });
        }
    });
};

const isResultCompMandatory = (
    model: FormModel,
    comp: ComponentBase,
    state: FormSubmissionState
) => {
    //@ts-ignore
    const componentCondition = comp?.options?.condition;
    if (componentCondition) {
        const condition = model.conditions[componentCondition];
        if (condition) {
            return condition.fn(state);
        } else {
            return false;
        }
    } else {
        return true;
    }
};

export const validateMandatoryFields = (
    model: FormModel,
    viewModel: SummaryViewModel,
    state: FormSubmissionState
) => {
    const mandatoryFields = model.pages.flatMap((page) =>
        page.components.items?.filter((component) => {
            if (
                component?.type === ComponentTypeEnum.NumberField ||
                component?.type === ComponentTypeEnum.TextField ||
                component?.type === ComponentTypeEnum.RadiosField ||
                component?.type === ComponentTypeEnum.CheckboxesField ||
                component?.type === ComponentTypeEnum.MultilineTextField ||
                component?.type === ComponentTypeEnum.EmailAddressField ||
                // component?.type === ComponentTypeEnum.DateField ||
                component?.type === ComponentTypeEnum.AutocompleteField ||
                component?.type === ComponentTypeEnum.TelephoneNumberField ||
                // component?.type === ComponentTypeEnum.DatePartsField ||
                component?.type === ComponentTypeEnum.DateAndTimeField ||
                component?.type === ComponentTypeEnum.YesNoField ||
                component?.type === ComponentTypeEnum.SelectField ||
                component?.type === ComponentTypeEnum.FileUploadField ||
                component?.type === ComponentTypeEnum.DataImport ||
                // component?.type === ComponentTypeEnum.TimeField ||
                component?.type === ComponentTypeEnum.UkAddressField
            ) {
                const isOptional = component.options.required === false;
                return !isOptional;
            } else if (component?.type === ComponentTypeEnum.Result) {
                return isResultCompMandatory(model, component, state);
            } else {
                return false;
            }
        })
    );
    const filteredMandatoryFields = viewModel.details.flatMap((detail) =>
        detail.items?.filter((item) =>
            mandatoryFields.some((field) => field.name === item.name)
        )
    );
    const missingFields = filteredMandatoryFields?.filter((field) => {
        const page = model.pages.find((page) =>
            page.components.items.some((item) => item.name === field.name)
        );
        const sectionName = page?.section?.name;
        return sectionName
            ? state?.[sectionName]?.[field.name] == null
            : state[field.name] == null;
    });
    return missingFields;
};

export const getEmailBodyFromRedis = async (
    notifyClient: any,
    templateId: string
): Promise<string> => {
    try {
        let emailBody: string | null = null;
        if (fetchFromRedis) {
            try {
                emailBody = (await RedisService.getCache(
                    `${templateId}`
                )) as string;
                if (emailBody) {
                    return emailBody;
                }
            } catch (redisErr: any) {
                trackEvent(`⚠️  Failed to fetch email template from Redis:`, { msg: redisErr?.message }, true);
            }

            const seconds = setExpiry();
            const response = await notifyClient.getTemplateById(templateId);
            emailBody = response.body.body as string;
            try {
                await RedisService.setCache(
                    `${templateId}`,
                    emailBody,
                    "EX",
                    seconds
                );
            } catch (redisErr: any) {
                trackEvent(`⚠️ Failed to cache email template ${templateId} in Redis:`, redisErr?.message, true);
                // Continue without caching - template was fetched successfully
            }
            return emailBody;
        } else {
            const response = await await notifyClient.getTemplateById(
                templateId
            );
            emailBody = response.body.body as string;
            return emailBody;
        }
    } catch (err) {
        console.error(err);
        trackEvent(
            `Fetching email body - Error`,
            {
                error: err,
            },
            true
        );
        return "";
    }
};

export const lastElementIsNumber = (path?: string) => {
    if (!path) return false;
    const lastElement = path.split("-").pop();
    if (!lastElement) return false;
    return !isNaN(Number(lastElement));
};
