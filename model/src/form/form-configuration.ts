import { FormStatus } from "../data-model/types";

export class FormConfiguration {
    Key: string;
    Name: string;
    DisplayName: string;
    CreatedBy: string | undefined;
    FormStatus: FormStatus | undefined;
    LastModified: string | undefined;
    feedbackForm: boolean | undefined;
    UserId: string | undefined;
    signInRequired: boolean | undefined; //Public/DFE SignIn
    lastModifiedByName: string | undefined;
    lastModifiedById: string | undefined;
    childAndDependentsForms: string[] | undefined;
    constructor(
        Key: string,
        Name: string,
        DisplayName?: string,
        CreatedBy?: string,
        FormStatus?: FormStatus,
        LastModified?: string,
        feedbackForm?: boolean,
        UserId?: string,
        signInRequired?: boolean,
        lastModifiedByName?: string,
        lastModifiedById?: string,
        childAndDependentsForms?: string[]
    ) {
        if (!Key) {
            throw Error("Form configuration must have a key");
        }
        this.Key = Key;
        this.Name = Name;
        this.DisplayName = DisplayName || Key;
        this.CreatedBy = CreatedBy;
        this.FormStatus = FormStatus;
        this.LastModified = LastModified;
        this.feedbackForm = feedbackForm || false;
        this.UserId = UserId;
        this.signInRequired = signInRequired;
        this.lastModifiedByName = lastModifiedByName;
        this.lastModifiedById = lastModifiedById;
        this.childAndDependentsForms = childAndDependentsForms;
    }
}
