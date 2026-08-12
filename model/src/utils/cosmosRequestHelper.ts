import hmacSHA256 from "crypto-js/hmac-sha256";
import Base64 from "crypto-js/enc-base64";
export enum HttpVerbs {
    GET = "get",
    POST = "post",
    PUT = "put",
    DELETE = "delete",
}
export type CosmosHeaders = {
    Accept: string;
    "x-ms-version": string;
    authorization: string;
    "x-ms-date": string;
    "x-ms-max-item-count": string;
    "x-ms-documentdb-partitionkey"?: string;
    Host: string;
    "Cache-Control": string;
};
export const generateCosmosHeaders = (
    masterKey: string,
    verb: HttpVerbs,
    url: string,
    partitionKey?: string
): CosmosHeaders => {
    const date = generateFormattedDate();
    //Partition key only needed for "GetById" type requests
    if (partitionKey) {
        return {
            //Accept value will not change
            Accept: "application/json",
            //2018-12-31 is the latest version as of time of writing
            //Value doesn't change enough to warrant being a param
            "x-ms-version": "2018-12-31",
            authorization: generateAuthToken(masterKey, date, verb, url),
            "x-ms-date": date,
            "x-ms-max-item-count": "1000",
            Host: parseHostName(url),
            "Cache-Control": "no-cache",
            "x-ms-documentdb-partitionkey": `[\"${partitionKey}\"]`,
        };
    }
    return {
        //Accept value will not change
        Accept: "application/json",
        //2018-12-31 is the latest version as of time of writing
        //Value doesn't change enough to warrant being a param
        "x-ms-version": "2018-12-31",
        authorization: generateAuthToken(masterKey, date, verb, url),
        "x-ms-date": date,
        "x-ms-max-item-count": "1000",
        Host: parseHostName(url),
        "Cache-Control": "no-cache",
    };
};
export const generateAuthToken = (
    mastKey: string,
    date: string,
    verb: HttpVerbs,
    url: string
): string => {
    //Throw if any param is empty
    if (!mastKey || !date || !verb) {
        throw new Error(
            `Empty parameter to generate cosmos auth token. mastKey: ${mastKey}. date: ${date}, verb: ${verb}`
        );
    }

    // Define resource ID and type
    // This gets documents only, currently no need for other searches
    const { resType, resourceId } = parseResourceIdAndType(url);

    // parse our master key out as base64 encoding
    const key = Base64.parse(mastKey);

    // build up the request text for the signature so can sign it along with the key
    const text =
        (verb || "").toLowerCase() +
        "\n" +
        (resType || "").toLowerCase() +
        "\n" +
        (resourceId || "") +
        "\n" +
        (date || "").toLowerCase() +
        "\n" +
        "" +
        "\n";

    const signature = hmacSHA256(text, key);

    const base64Bits = Base64.stringify(signature);

    // format our authentication token and URI encode it.
    const MasterToken = "master";
    const TokenVersion = "1.0";
    return encodeURIComponent(
        "type=" + MasterToken + "&ver=" + TokenVersion + "&sig=" + base64Bits
    );
};

export const parseResourceIdAndType = (
    url: string
): { resType: string; resourceId: string } => {
    // strip the url of the hostname up and leading slash
    let strippedUrl = url.replace(new RegExp("^https?://[^/]+/"), "/");

    // push the parts down into an array so we can determine if the call is on a specific item
    // or if it is on a resource (odd would mean a resource, even would mean an item)
    const strippedParts = strippedUrl.split("/");
    const trueStrippedCount = strippedParts.length - 1;

    // define resourceId/Type now so we can assign based on the amount of levels
    let resourceId: string = "";
    let resType: string;

    // its odd (resource request)
    if (trueStrippedCount % 2) {
        // assign resource type to the last part we found.
        resType = strippedParts[trueStrippedCount];

        if (trueStrippedCount > 1) {
            // now pull out the resource id by searching for the last slash and substringing to it.
            const lastPart = strippedUrl.lastIndexOf("/");
            resourceId = strippedUrl.substring(1, lastPart);
        }
    } // its even (item request on resource)
    else {
        // assign resource type to the part before the last we found (last is resource id)
        resType = strippedParts[trueStrippedCount - 1];

        // finally remove the leading slash which we used to find the resource if it was
        // only one level deep.
        strippedUrl = strippedUrl.substring(1);

        // assign our resourceId
        resourceId = strippedUrl;
    }
    return { resType, resourceId };
};

export const parseHostName = (url: string): string => {
    let hostName;
    const matches = url.match(
        /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/
    );

    if (matches) {
        matches.forEach((match) => {
            if (!match.includes("http" || "https")) {
                hostName = match;
            }
        });
    }

    return hostName;
};

export const generateFormattedDate = (): string => {
    // Output date as RFC1123 format for the request
    return new Date().toUTCString();
};
