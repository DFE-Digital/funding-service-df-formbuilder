import * as sprequest from "sp-request";
import config from "../config";

export const UploadFile = async function (
    fileContent: any,
    formId: string
): Promise<any> {
    var credentialOptions = {
        clientId: config.sharepointClientId,
        clientSecret: config.sharepointClientSecret,
    };
    let filename = `${formId}.csv`;
    let spr = sprequest.create(credentialOptions);
    spr.post(
        `https://educationgovuk.sharepoint.com/sites/DigitalForms/_api/web/GetFolderByServerRelativeUrl(\'Shared%20Documents\\AccessList\')/files/add(overwrite=true,url=\'${filename}\')`,
        {
            body: fileContent,
            json: undefined,
            headers: {
                Accept: "application/json; odata=verbose",
                "content-type": "application/json; odata=verbose",
                "X-RequestDigest": "formdigest",
                "X-Http-Method": "POST",
                "IF-MATCH": "*",
                ServerRelativeUrl: "Shared%20Documents/AccessList",
            },
        }
    )
        .then((result) => {
            console.log(result);
        })
        .catch((err) => {
            console.log(err);
        });
};
