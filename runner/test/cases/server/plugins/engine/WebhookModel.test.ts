import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { WebhookModel } from "../../../../../src/server/plugins/engine/models/submission/WebhookModel";
import form from "./SummaryViewModel.json";
import {
  FormModel,
  SummaryViewModel,
} from "../../../../../src/server/plugins/engine/models";
const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { afterEach, beforeEach, suite, test } = lab;

const testDetails = [
  {
    items: [
      {
        name: "caz",
        path: "/first-page",
        label: "caz zone",
        value: "Bath",
        rawValue: "1",
        url: "/test/first-page?returnUrl=%2Ftest%2Fsummary",
        pageId: "/test/first-page",
        type: "SelectField",
        title: "caz zone",
        dataType: "list",
        options: {
          required: true,
        },
        result: [],
      },
    ],
    name: undefined,
    title: undefined,
  },
  {
    name: "aSection",
    title: "Named Section",
    items: [
      {
        name: "fullDate",
        path: "/second-page",
        label: "full date",
        value: "11 December 2000",
        rawValue: "2000-12-11T00:00:00.000Z",
        url: "/test/second-page?returnUrl=%2Ftest%2Fsummary",
        pageId: "/test/second-page",
        type: "DatePartsField",
        title: "full date",
        dataType: "date",
        options: {
          required: false,
        },
        result: undefined,
      },
    ],
  },
];


suite("WebhookModel", () => {
  let formModel;
  let viewModel;
  afterEach(() => {
    sinon.restore();
  });
  beforeEach(async () => {
    formModel = new FormModel(form, {});
    await formModel.init();
    formModel.basePath = "test";
    formModel.name = "My Service";
    viewModel = new SummaryViewModel(
      "summary",
      formModel,
      {
        progress: ["/test/first-page", "/test/second-page"],
        approximate: {
          approximate__month: 1,
          approximate__year: 2000,
        },
        caz: "1",
        selectField: {
          caz: "Bath"
        },
        aSection: {
          fullDate: "2000-12-11T00:00:00.000Z",
        },
        result: [],
      },
      {
        app: {
          location: "/",
        },
        path: "/test/summary",
        query: {},
        state: {
          cookie_policy: {},
        },
      }
    );
  });

  test.skip("parses Details correctly", () => {
    expect(viewModel.details).to.equal(testDetails);
    const fees = 0;
    const parsed = WebhookModel(
      formModel.pages.filter((page) => page.path !== "/summary"),
      viewModel.details,
      formModel,
      fees
    );
    expect(parsed).to.equal({
      metadata: {},
      name: "My Service",
      questions: [
        {
          category: undefined,
          fields: [
            {
              answer: "2000-01",
              key: "approximate",
              title: "Approximate date of marriage",
              type: "monthYear",
            },
            {
              answer: "1",
              key: "caz",
              title: "caz zone",
              type: "list",
            },
          ],
          
          question: "When will you get married?",
        },
        {
          category: "aSection",
          fields: [
            {
              answer: "2000-12-11",
              key: "fullDate",
              title: "full date",
              type: "date",
            },
          ],
          
          question: "Second page",
        },
      ],
    });
  });
});
