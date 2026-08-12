import config from "server/config";
import axios from "axios";
import { HapiRequest } from "server/types";
import jwt from "jsonwebtoken";

const getIdToken = async (request: HapiRequest, code: string) => {
  const makeRequest = async () => {
    return axios.post(
      `${config.authClientTokenUrl}`,
      {
        grant_type: "authorization_code",
        client_id: config.authClientId,
        client_secret: config.authClientSecret,
        redirect_uri: config.authRedirectUrl,
        code,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        transformRequest: getQueryString,
      }
    );
  };

  try {
    // First attempt
    let response;
    try {
      response = await makeRequest();
    } catch (err) {
      request.server.logger.warn(
        { exception: err.message },
        "Initial token request failed — retrying once"
      );

      // Retry once
      response = await makeRequest();
    }

    const data = response.data;
    request.yar.set("encoded_Id_token", data.id_token);
    let idtoken = jwt.decode(data.id_token);
    return idtoken;
  } catch (e) {
    request.server.logger.error(
      { exception: JSON.stringify(e.message) },
      "Error in ID token generation after retry"
    );
    return null;
  }
};
function getQueryString(data = {}) {
  return Object.entries(data)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");
}

export default getIdToken;
