import { HapiRequest } from "../types";

const isUAT = (request: HapiRequest) => {
    return request.url.hostname.toLocaleLowerCase().includes("uat");
}

export default isUAT;