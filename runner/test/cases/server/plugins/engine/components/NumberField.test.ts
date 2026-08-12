import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { NumberField } from "server/plugins/engine/components/NumberField";

const lab = Lab.script();
exports.lab = lab;

const { expect } = Code;
const { suite, describe, it } = lab;

suite("NumberField", () => {
  describe("Generated schema", () => {
    const componentDefinition = {
      subType: "field",
      type: "NumberField",
      name: "firstName",
      title: "Enter number between 2 and 5",
      options: {
        autocomplete: "given-name",
      },
      schema: {},
    };

    const formModel = {
      makePage: () => sinon.stub(),
    };

    const component = new NumberField(componentDefinition, formModel);

    it("is required by default", () => {
      expect(component.schema.describe().flags.label).to.equal(
        "Enter number between 2 and 5"
      );
    });

    it("is not required when explicitly configured", () => {
      const component = new NumberField(
        {
          ...componentDefinition,
          options: { label: "test" },
        },
        formModel
      );
      expect(component.schema.describe().flags.label).to.not.equal(
        "Enter number between 0 and 1"
      );
    });

    it("validates correctly", () => {
      expect(component.schema.validate({}).error).to.exist();
    });
  });
});
