import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { Html } from "server/plugins/engine/components/Html";

const lab = Lab.script();
exports.lab = lab;

const { expect } = Code;
const { suite, describe, it } = lab;

suite("Html", () => {
  describe("Generated schema", () => {
    const componentDefinition = {
      subType: "field",
      type: "Html",
      name: "firstName",
      title: "What's your first name?",
      options: {
        autocomplete: "given-name",
      },
      schema: {},
    };

    const formModel = {
      makePage: () => sinon.stub(),
    };

    const component = new Html(componentDefinition, formModel);

    it("is required by default", () => {
      expect(component.formSchema.describe().flags.presence).to.equal(
        "required"
      );
    });

    it("is not required when explicitly configured", () => {
      const component = new Html(
        {
          ...componentDefinition,
          options: { required: false },
        },
        formModel
      );
      expect(component.formSchema.describe().flags.presence).to.not.equal(
        "required"
      );
    });

    it("validates correctly", () => {
      expect(component.formSchema.validate({}).error).to.exist();
    });
  });
});
