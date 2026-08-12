import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { FlashCard } from "server/plugins/engine/components/FlashCard";
import { FormSubmissionState } from "server/plugins/engine";
const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, describe, it, beforeEach } = lab;

const lists = [
  {
    title: "Turnaround",
    name: "Turnaround",
    type: "string",
    items: [
      { text: "1 hour", value: "1" },
      { text: "2 hours", value: "2" },
    ],
  },
];

suite("FlashCard", () => {
  let componentDefinition;
  let formModel;
  let component;

  beforeEach(() => {
    componentDefinition = {
      subType: "field",
      type: "FlashCard",
      name: "MyFlashCard",
      title: "Turnaround?",
      options: {},
      list: "Turnaround",
      schema: {},
    };

    formModel = {
      getList: () => lists[0],
      makePage: () => sinon.stub(),
    };

    component = new FlashCard(componentDefinition, formModel);
  });

  describe("getViewModel", () => {
    it("it gets value correctly when state value is string", () => {
      const state: FormSubmissionState = {
        progress: [],
        MyFlashCard: "2",
      };
      expect(state.MyFlashCard).to.equal("2");
    });

    it("it gets value correctly when state value is number", () => {
      const state: FormSubmissionState = {
        progress: [],
        MyFlashCard: 2,
      };
      expect(state.MyFlashCard).to.equal(2);
    });
  });
});
