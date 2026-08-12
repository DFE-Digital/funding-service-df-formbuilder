import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, describe, it } = lab;
import sinon from "sinon";
import { MultilineTextField } from "../../../../../../src/server/plugins/engine/components";
import { FormSubmissionError } from "../../../../../../src/server/plugins/engine/types";

const lists = [
  {
    name: "Countries",
    title: "Countries",
    type: "string",
    items: [
      {
        text: "United Kingdom",
        value: "United Kingdom",
        description: "",
        condition: "",
      },
      {
        text: "Thailand",
        value: "Thailand",
        description: "",
        condition: "",
      },
      {
        text: "Spain",
        value: "Spain",
        description: "",
        condition: "",
      },
      {
        text: "France",
        value: "France",
        description: "",
        condition: "",
      },
      {
        text: "Thailand",
        value: "Thailand",
        description: "",
        condition: "",
      },
    ],
  },
];

suite("MultilineTextField", () => {
  const formModel = {
    getList: (_name) => lists[0],
    makePage: () => sinon.stub(),
  };

  describe("Generated schema", () => {
    const componentDefinition = {
      subType: "field",
      type: "MultilineTextField",
      name: "MyMultilineTextField",
      title: "Test title",
      options: {
        hideTitle: false,
        required: true,
        optionalText: false,
        rows: 5
      },
      schema: {
        max: "5",
        min: "1",
      },
    };

    const typedComponentDefinition = {
      ...componentDefinition,
      schema: {
        max: Number(componentDefinition.schema.max),
        min: Number(componentDefinition.schema.min),
      },
    };

    // @ts-ignore
    const component = new MultilineTextField(typedComponentDefinition, formModel);

    it("checks schema options values", () => {
      expect(component.schemaOptions).to.equal({
        max: 5,
        min: 1,
      });
    });

    it("validates correctly via Joi schema keys", () => {
      const formSchema = component.getFormSchemaKeys();
      expect(formSchema["MyMultilineTextField"].validate("abc").error).to.be.undefined();
      expect(formSchema["MyMultilineTextField"].validate("123456").error).to.exist();
    });

    it("includes the first empty item in items list", () => {
      expect(component.options["required"]).to.equal(true);
    });

    it('check schemaKeys functions', () => {
      const formSchemaKeys = component.getFormSchemaKeys();
      const stateSchemaKeys = component.getStateSchemaKeys();
      expect(Object.keys(formSchemaKeys)[0]).to.equal("MyMultilineTextField");
      expect(Object.keys(stateSchemaKeys)[0]).to.equal("MyMultilineTextField");
    });

    it('check view model', () => {
      const viewModel = component.getViewModel({}, { titleText: "", errorList: [] });
      expect(viewModel.name).to.equal("MyMultilineTextField");
      expect(viewModel.attributes.maxlength).to.equal(5);
      expect(viewModel.attributes.min).to.equal(1);
    });
  });

  describe("length + min/max precedence", () => {
    const componentDefinition = {
      subType: "field",
      type: "MultilineTextField",
      name: "MyMultilineTextFieldLength",
      title: "Test title",
      options: {
        hideTitle: false,
        required: true,
        optionalText: false,
        rows: 5,
      },
      schema: {
        min: "1",
        max: "10",
        length: "6",
      },
    };

    const typedComponentDefinition = {
      ...componentDefinition,
      schema: {
        min: Number(componentDefinition.schema.min),
        max: Number(componentDefinition.schema.max),
        length: Number(componentDefinition.schema.length),
      },
    };

    // @ts-ignore
    const component = new MultilineTextField(typedComponentDefinition, formModel);

    it("should use length in the schema and drop min/max", () => {
      expect(component.schema.max).to.equal(6);
      expect(component.schema.min).to.be.undefined();
      expect(component.schema.length).to.be.undefined();
    });

    it("should set maxlength from length only", () => {
      const viewModel = component.getViewModel({}, { titleText: "", errorList: [] });
      expect(viewModel.attributes.maxlength).to.equal(6);
      expect(viewModel.attributes.min).to.be.undefined();
    });
  });
});
