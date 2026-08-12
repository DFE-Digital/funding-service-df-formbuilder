import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { TelephoneNumberField } from "server/plugins/engine/components/TelephoneNumberField";

const lab = Lab.script();
exports.lab = lab;

const { expect } = Code;
const { suite, describe, it } = lab;

suite("TelephoneNumberField", () => {
  describe("Generated schema", () => {
    const componentDefinition = {
      subType: "field",
      type: "TelephoneNumberField",
      name: "firstName",
      title: "What's your telephone number?",
      hint: "a hint",
      options: {
        customValidationMessage: "Invalid telephone number entered",
      },
      schema: {},
    };

    const formModel = {
      makePage: () => sinon.stub(),
    };

    const component = new TelephoneNumberField(componentDefinition, formModel);

    it("is required by default", () => {
      expect(component.schema.describe().flags.label).to.equal(
        "What's your telephone number?"
      );
    });

    it("is not required when explicitly configured", () => {
      const component = new TelephoneNumberField(
        componentDefinition,
        formModel
      );
      expect(component.schema.describe().flags.label).to.not.equal(
        "Phone number"
      );
    });

    it("validates correctly", () => {
      expect(component.schema.validate({}).error).to.exist();
    });
    it("get validation error", () => {
      expect(component.schema.validate({}).error.details[0].message).to.equal(
        `"What's your telephone number?" must be a string`
      );
    });
  });
});
