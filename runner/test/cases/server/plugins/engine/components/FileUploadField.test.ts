import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { FileUploadField } from "../../../../../../src/server/plugins/engine/components/FileUploadField";
import { FormSubmissionState } from "server/plugins/engine";
//"../../../../../../src/server/plugins/engine";
const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, describe, it, beforeEach } = lab;

suite("FileUploadField", () => {
  let componentDefinition;
  let formModel;
  let component;

  beforeEach(() => {
    componentDefinition = {
      subType: "field",
      type: "FileUploadField",
      name: "MyFileUploadField",
      title: "MyTest Upload?",
      options: {},
      schema: {},
    };

    formModel = {
      makePage: () => sinon.stub(),
    };

    component = new FileUploadField(componentDefinition, formModel);
  });

  describe("getDisplayStringFromState", () => {
    it("it gets value correctly when state value is string", () => {
      const state: FormSubmissionState = {
        progress: [],
        MyFileUploadField: "2",
      };
      expect(component.getDisplayStringFromState(state)).to.equal("2");
      expect(component.getViewModel(state).value).to.equal("2");
    });

    it("it gets value correctly when state value is number", () => {
      const state: FormSubmissionState = {
        progress: [],
        MyFileUploadField: 2,
      };
      expect(component.getDisplayStringFromState(state)).to.equal(2);
      expect(component.getViewModel(state).value).to.equal(2);
    });
  });
});
