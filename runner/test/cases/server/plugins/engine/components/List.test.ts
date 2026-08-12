import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { List } from "server/plugins/engine/components/List";
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
      { text: "1 hour", value: "1", condition: "test" },
      { text: "2 hours", value: "2" },
    ],
  },
];

suite("List", () => {
  let componentDefinition;
  let formModel;
  let component;

  beforeEach(() => {
    componentDefinition = {
      subType: "field",
      type: "List",
      name: "MyList",
      title: "Turnaround?",
      options: { type: "test" },
      list: "Turnaround",
      schema: {},
    };

    formModel = {
      getList: () => lists[0],
      makePage: () => sinon.stub(),
    };

    component = new List(componentDefinition, formModel);
  });

  describe("getViewModel", () => {
    it("it gets value correctly when state value is string", () => {
      const state: FormSubmissionState = {
        progress: [],
        MyList: "2",
      };
      expect(state.MyList).to.equal("2");
    });

    it("it gets value correctly when state value is number", () => {
      const state: FormSubmissionState = {
        progress: [],
        MyList: 2,
      };
      expect(state.MyList).to.equal(2);
    });


    it("get items", () => {
      expect(component.items.length).to.equal(2);
    });

    it("verify view model", () => {
      const viewModel = component.getViewModel({}, {})
      expect(viewModel.type).to.equal("test")
    });
  });
});
