import { PageController } from "./PageController";
import { HapiRequest, HapiResponseToolkit } from "server/types";
import { ParentchildViewModel } from "../models";
import { getSqlCacheById } from "../services/formService";
import { checkSubmissionStatusByParentID } from "../services/formService";

export class ParentchildPageController extends PageController {
    async getFormsCacheStatus(childIds, request) {
        const childForms = [];
        for (const formId of childIds) {
            let id =
                formId +
                (request.yar.get("organisation") !== null
                    ? request.yar.get("organisation")?.ukprn ??
                      request.yar.get("organisation")
                          ?.DistrictAdministrative_code
                    : request.yar.id);
            id =
                id +
                (request.url.hostname.toLocaleLowerCase().includes("uat")
                    ? "UAT"
                    : "");
            var cacheid = await getSqlCacheById(id);

            if (cacheid !== "Data not found") {
                childForms.push({ id: formId, status: cacheid });
            } else {
                childForms.push({ id: formId, status: "Not found" });
            }
        }
        return childForms;
    }

    async checkSubmissions(parentId, orgUKPRN, childConfigs, isUATVariable) {
        var dbResponse = await checkSubmissionStatusByParentID(
            parentId,
            orgUKPRN,
            isUATVariable
        );
        childConfigs.map(async (child) => {
            const DBresult = dbResponse.find((o) => o.item1 === child.childId);
            child.formStatus = DBresult.item2;
            child.MappingStatus = DBresult.item3;
            child.dependentforms.map(async (dependentform) => {
                const DBresult = dbResponse.find((o) => o.item1 === dependentform.id);
                dependentform.MappingStatus = DBresult.item3;
                
            });
        });
        childConfigs.splice(0, childConfigs.length, ...childConfigs.filter(child => child.MappingStatus === "Mapped"));
        return dbResponse;
    }

    childAndDependentsMapper(childConfigs) {
        const childAndDependents = [];
        childConfigs.map((child) => {
            const { childId } = child;
            if (child.dependentforms?.length > 0) {
                child.dependentforms.map((form) => {
                    form.status = form.status.toUpperCase().replace("_", " ");
                });
                childAndDependents.push({
                    childId,
                    dependentforms: child.dependentforms,
                });
            }
        });
        return childAndDependents;
    }

    conditionEvaluations(model, state, condition) {
        const selectedCondition = model.conditions[condition];
        return selectedCondition.fn(state);
    }
    makeGetRouteHandler() {
        return async (request: HapiRequest, h: HapiResponseToolkit) => {
            const { cacheService } = request.services([]);
            const model = this.model;
            var state = await cacheService.getState(request);
            const progress = state.progress || [];
            const {
                def: { parentChild },
            } = model;
            const parentId = model.def.id;
            const {
                parentChildConfig: { childConfigs },
            } = parentChild;
            
            const childIds = childConfigs.map((value) => value.childId);
            
            const orgUKPRN =
                request.yar.get("organisation")?.ukprn ??
                request.yar.get("organisation")?.DistrictAdministrative_code;
            const isUAT = request.url.hostname
                .toLocaleLowerCase()
                .includes("uat");
            const dbResponses = await this.checkSubmissions(
                parentId,
                orgUKPRN,
                childConfigs,
                isUAT
            );
            const designerChildDependentsConfig = this.childAndDependentsMapper(
                 childConfigs 

            );
            // Parent and child conditions rendering logic
            if (model && state && childConfigs) {
                childConfigs.map((child) => {
                    const { condition } = child;
                    if (condition && condition !== "" && condition !== "none") {
                        const condEval = this.conditionEvaluations(
                            model,
                            state,
                            condition
                        );
                        child.render = condEval;
                    } else {
                        child.render = true;
                    }
                });
            }
            const viewModel = new ParentchildViewModel(
                "Parent & Child Page",
                model,
                state,
                request,
                designerChildDependentsConfig
            );
            viewModel.backLink = progress[progress.length - 1];
            return h.view("parentchild", viewModel);
        };
    }
}
