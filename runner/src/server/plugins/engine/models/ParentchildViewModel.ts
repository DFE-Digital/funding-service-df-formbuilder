import { FormModel } from "./FormModel";
import { FormSubmissionState } from "../types";
import { HapiRequest } from "src/server/types";
import moment from "moment";
// import { checkSubmissionStatusByParentID } from "../services/formService";

/**
 * TODO - extract submission behaviour dependencies from the viewmodel
 * skipSummary (replace with reference to this.def.skipSummary?)
 * _payApiKey
 * replace result with errors?
 * remove state and value?
 *
 * TODO - Pull out summary behaviours into separate service classes?
 */
enum parentChildStatus {
    CSY = "Cannot Start Yet",
    NS = "NOT STARTED",
    IN = "IN PROGRESS",
    CMP = "COMPLETED",
}

enum tags {
    "NOT STARTED" = "red",
    "CANNOT START YET" = "grey",
    "COMPLETED" = "blue",
    "IN PROGRESS" = "yellow",
}
export class ParentchildViewModel {
    /**
     * Responsible for parsing state values to the govuk-frontend summary list template and parsing data for outputs
     * The plain object is also used to generate data for outputs
     */

    pageTitle: string;
    formName: string;
    childHeading: string | undefined;
    description: string | undefined;
    childConfigs: any[] | undefined;
    renderParentChild: boolean | undefined;
    dfeSignedInForm: boolean | undefined;
    backLink?: string;

    setTag = (tagName: tags | undefined) => {
        let fontWeightClass = "govuk-tag--";
        const tag = tagName?.toUpperCase();
        switch (tag) {
            case "NOT STARTED":
                fontWeightClass = fontWeightClass.concat("red");
                break;
            case "CANNOT START YET":
                fontWeightClass = fontWeightClass.concat("grey");
                break;
            case "IN PROGRESS":
                fontWeightClass = fontWeightClass.concat("yellow");
                break;
            case "COMPLETED":
                fontWeightClass = fontWeightClass.concat("blue");
                break;
        }
        return fontWeightClass;
    };

    addStatus = async (childConfigs) => {
        childConfigs.map(async (child) => {
            const currentDateTime = moment().format();
            const childDateTime = moment(child.dateComponent).format();
            const isAfter = moment(currentDateTime).isAfter(childDateTime);
            if (!isAfter && childDateTime !== "Invalid date") {
                child.formStatus = parentChildStatus.CSY;
                child.tag = this.setTag(child.formStatus);
                child.isAnchor = false;
            }

            if (child.formStatus) {
                child.tag = this.setTag(child.formStatus);
                child.isAnchor =
                    child.formStatus === "Cannot Start Yet" ? false : true;
            }
        });
    };

    checkDesignerConfig = (
        childConfigs,
        designerFormConfig,
        liveFormStatus
    ) => {
        childConfigs = childConfigs.filter(
            (child) => child.MappingStatus === "Mapped"
        );
        childConfigs.map((child) => {
            designerFormConfig.map((dep) => {
                if (child.childId === dep.childId) {
                    let result = dep?.dependentforms?.filter(
                        (desiredStatus) => {
                            const statusNotMatch = liveFormStatus.find(
                                (actualStatus) => {
                                    const checkStatus =
                                        desiredStatus.status ===
                                            "IN PROGRESS" &&
                                        (actualStatus.status ===
                                            "IN PROGRESS" ||
                                            actualStatus.status === "COMPLETED")
                                            ? desiredStatus.status
                                            : actualStatus.status;
                                    if (
                                        desiredStatus.id === actualStatus.id &&
                                        desiredStatus.status !== checkStatus
                                    ) {
                                        return actualStatus;
                                    }
                                }
                            );
                            return statusNotMatch;
                        }
                    );
                    if (result?.length > 0) {
                        child.isAnchor = false;
                        child.formStatus = parentChildStatus.CSY;
                        child.tag = this.setTag(child.formStatus);
                    }
                }
            });
        });
    };

    generateLiveFormStatus = (childConfigs) => {
        const liveForms = [];
        childConfigs.map((child) => {
            liveForms.push({
                id: child.childId,
                status: child.formStatus.toUpperCase(),
            });
        });
        return liveForms;
    };

    constructor(
        pageTitle: string,
        model: FormModel,
        state: FormSubmissionState,
        request: HapiRequest,
        // childCacheStatus: object[],
        childAndDependents: object[]
    ) {
        const { def } = model;
        this.pageTitle = pageTitle;
        const orgUKPRN = state?.orgUKPRN;
        this.formName = def.displayName;
        if (def?.parentChild?.parentChildConfig && def?.signInRequired) {
            this.renderParentChild = true;
            const {
                childHeading,
                description,
                childConfigs,
            } = def?.parentChild?.parentChildConfig;
            this.addStatus(childConfigs);
            const liveFormStatus = this.generateLiveFormStatus(childConfigs);
            this.checkDesignerConfig(
                childConfigs,
                childAndDependents,
                liveFormStatus
            );
            this.description = description;
            this.childHeading = childHeading;
            this.childConfigs = childConfigs;
            this.dfeSignedInForm = true;
        } else if (
            !def?.parentChild?.parentChildConfig &&
            def?.signInRequired
        ) {
            this.renderParentChild = false;
        } else if (
            def?.parentChild?.parentChildConfig &&
            !def?.signInRequired
        ) {
            this.dfeSignedInForm = false;
        }
    }
}
