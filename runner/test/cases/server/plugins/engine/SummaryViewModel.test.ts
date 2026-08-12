import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import {
  FormModel,
  SummaryViewModel,
} from "../../../../../src/server/plugins/engine/models";
import config from "../../../../../src/server/config";
import form from "./SummaryViewModel.json";
import { OutputType } from "../../../../../../model/src/data-model/types";
const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { afterEach, beforeEach, suite, test } = lab;

suite("SummaryViewModel", () => {
  afterEach(() => {
    sinon.restore();
  });

  let formModel;
  let viewModel;

  beforeEach(async () => {
    formModel = new FormModel(form, {});
    await formModel.init();
    viewModel = new SummaryViewModel(
      "summary",
      formModel,
      {
        progress: [],
        result: {},
        dataImportStatus: {},
      },
      {
        app: {
          location: "/",
        },
        query: {},
        state: {
          cookie_policy: {},
        },
      }
    );
  });

  test("returns the correct apiKey", async () => {
    sinon.stub(config, "apiEnv").value("test");

    expect(viewModel.payApiKey).to.equal("test_api_key");
    sinon.stub(config, "apiEnv").value("production");
    expect(viewModel.payApiKey).to.equal("production_api_key");
  });

  test("returns the correct outputs", async () => {
    expect(viewModel.outputs).to.equal([
      {
        name: "webhook",
        title: "webhook",
        type: OutputType.Webhook,
        outputConfiguration: {
          url: "https://b4bf0fcd-1dd3-4650-92fe-d1f83885a447.mock.pstmn.io",
        },
      },
    ]);
  });
});
