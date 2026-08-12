import Lab from "@hapi/lab";
import { expect } from "@hapi/code";
const Hapi = require("@hapi/hapi");
import config from "../../../src/server/config";

const { before, test, suite, after } = (exports.lab = Lab.script());

suite(`/health-check Route`, () => {
  let server;

  before(async () => {
    config.lastCommit = "Last Commit";
    config.lastTag = "Last Tag";
    server = new Hapi.Server();
  });

  test("/health-check route response is correct", async () => {
    server.route({
      method: "GET",
      path: "/health-check",
      handler: async (request) => {
        return {
          lastCommit: "Last Commit",
          lastTag: "Last Tag",
        };
      },
    });
    const options = {
      method: "GET",
      url: "/health-check",
    };

    const { result } = await server.inject(options);

    expect(result.lastCommit).to.equal("Last Commit");
    expect(result.lastTag).to.equal("Last Tag");
  });
});
