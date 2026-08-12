import * as Code from '@hapi/code';
import * as Lab from '@hapi/lab';
import { Result } from '../../../../../../src/server/plugins/engine/components';
import { ResultComponent } from '@xgovformbuilder/model';
import { FormModel } from '../../../../../../src/server/plugins/engine/models';
import { FormData, FormSubmissionErrors, FormSubmissionState } from '../../../../../../src/server/plugins/engine/types';
const lab = Lab.script();
exports.lab = lab;

const { expect, fail } = Code;
const { suite, describe, it, beforeEach } = lab;

suite('Result Component', () => {

    describe('Tests', () => {
        let componentDefinition: ResultComponent;
        let form: any;
        let formModel: FormModel;
        let component: any;

        beforeEach(async () => {
            componentDefinition = {
                name: "dVUDSX",
                displayName: "Add",
                options: {
                    hideResult: false
                },
                type: "Result",
                title: "Add 1",
                expression: "(EUEhfo) + (JtwCCr)",
                schema: {},
                content: ''
            };

            form = {
                lastDownloaded: '2023/03/15 17:19',
                lastModified: '2023/03/15 17:19',
                id: 'qwerty',
                key: 'qwerty',
                displayName: 'Qwerty',
                pages: [
                    {
                        path: "/second-page",
                        title: "Second page",
                        components: [
                            {
                                name: "EUEhfo",
                                options: {},
                                type: "NumberField",
                                title: "Number 1",
                                checked: true
                            },
                            {
                                name: "JtwCCr",
                                options: {},
                                type: "NumberField",
                                title: "Number 2",
                                checked: true
                            },
                            {
                                name: "dVUDSX",
                                displayName: "Add",
                                options: {
                                    hideResult: false
                                },
                                type: "Result",
                                title: "Add 1",
                                hint: "",
                                expression: "(EUEhfo) + (JtwCCr)",
                                schema: {}
                            }
                        ],
                    }
                ],
                conditions: [],
                lists: [],
                sections: [],
                confirmationMsg: 'Yes?',
                fees: [],
                calculations: [],
                startPage: '/first-page',
            };

            formModel = new FormModel(form, {});
            await formModel.init();
            component = new Result(componentDefinition, formModel);
        });

        it('check lang and items', () => {
            expect(component.lang).to.equal("en");
            component.lang = "en-US";
            expect(component.lang).to.equal("en-US")
        });

        it('verify view model', () => {
            const formData: FormData = {
                lang: "en",
            }
            const errors: FormSubmissionErrors = {
                titleText: "qwerty",
                errorList: []
            };
            const result = component.getViewModel(formData, errors);
            expect(result.id).to.equal("dVUDSX");
            expect(result?.label?.text).to.equal("Add 1");
        })

        it('check getFormDataFromState', () => {
            const data1: FormSubmissionState = { ["dVUDSX"]: "value", progress: [], result: "" };
            const positiveResult = component.getFormDataFromState(data1);
            if (!positiveResult) {
                fail();
                return;
            }
            // expect(Object.values(positiveResult)[0]).to.equal("value");
            const data2: FormSubmissionState = { ["AkGdOQ"]: "value", progress: [], result: "" };
            const negativeResult = component.getFormDataFromState(data2);
            expect(negativeResult).to.be.undefined();
        });

        it('check schemaKeys functions', () => {
            const formSchemaKeys = component.getFormSchemaKeys();
            const stateSchemaKeys = component.getStateSchemaKeys();
            expect(Object.keys(formSchemaKeys)[0]).to.equal("dVUDSX");
            expect(Object.keys(stateSchemaKeys)[0]).to.equal("dVUDSX");
        });

        it('check getStateValueFromValidForm and getDisplayStringFromState', () => {
            const displayStr = component.getDisplayStringFromState({ ["dVUDSX"]: "value" });;
            const result = component.getStateFromValidForm({ ["dVUDSX"]: "value", crumb: "" })
            expect(displayStr).to.equal("value");
            expect(Object.values(result)[0]).to.equal("value");
        })

        it('check localisedString', () => {
            const emptyStr = component.localisedString("");
            const simpleStr = component.localisedString("value");
            const objStr = component.localisedString({ en: "value" });
            expect(emptyStr).to.be.empty();
            expect(simpleStr).to.equal("value");
            expect(objStr).to.equal("value");
        })
    });
});
