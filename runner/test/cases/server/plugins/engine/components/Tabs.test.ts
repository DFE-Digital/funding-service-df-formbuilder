import * as Code from '@hapi/code';
import * as Lab from '@hapi/lab';
import { Tabs } from '../../../../../../src/server/plugins/engine/components';
import { TabsComponent } from '@xgovformbuilder/model';
import { FormModel } from '../../../../../../src/server/plugins/engine/models';
import { FormData, FormSubmissionErrors } from '../../../../../../src/server/plugins/engine/types';
const lab = Lab.script();
exports.lab = lab;

const { expect, fail } = Code;
const { suite, describe, it, beforeEach } = lab;

suite('Tab Component', () => {

    describe('Generated schema', () => {
        let componentDefinition: TabsComponent;
        let form: any;
        let formModel: FormModel;
        let component: any;

        beforeEach(async () => {
            componentDefinition = {
                name: "cbXpuG",
                options: {},
                type: "Tabs",
                title: "Tabs 1",
                schema: {},
                hint: "",
                displayName: "Tabs 1"
            };

            form = {
                lastDownloaded: '2023/03/15 17:19',
                lastModified: '2023/03/15 17:19',
                id: 'qwerty',
                key: 'qwerty',
                displayName: 'Qwerty',
                pages: [{
                    path: "/first-page",
                    title: "First page",
                    components: [
                        {
                            name: "cbXpuG",
                            options: {},
                            type: "Tabs",
                            title: "Tabs 1",
                            schema: {},
                            hint: "",
                            displayName: "Tabs 1"
                        }
                    ],
                    next: [
                        {
                            "path": "/summary"
                        }
                    ]
                }],
                conditions: [],
                lists: [],
                sections: [],
                confirmationMsg: 'Yes?',
                fees: [],
                calculations: [],
                startPage: '/first-page',
                designedDataSets: [
                    {
                        id: "BWMSfF",
                        title: "Designed dataset 1",
                        uploadedDate: "2023-03-27T16:41:47.782Z",
                        csvUsed: "XYRVCH",
                        keyIdentifier: "UKPRN",
                        data: [
                            [
                                {
                                    index: "1-1",
                                    type: "select_value",
                                    value: "UKPRN-Header",
                                    bold: true
                                },
                                {
                                    index: "1-2",
                                    type: "select_value",
                                    value: "Org-Header",
                                    bold: true
                                }
                            ],
                            [
                                {
                                    index: "2-1",
                                    type: "select_value",
                                    value: "UKPRN-Value",
                                    bold: false
                                },
                                {
                                    index: "2-2",
                                    type: "select_value",
                                    value: "Org-Value",
                                    bold: false
                                }
                            ]
                        ]
                    }
                ],
                tabs: [
                    {
                        id: "cbXpuG",
                        tabData: [
                            {
                                tabLabel: "Table label",
                                tabHeader: "Table 1",
                                type: "select_dataset",
                                value: "BWMSfF"
                            },
                            {
                                tabLabel: "Para Label 1",
                                tabHeader: "Para",
                                type: "paragraph_text",
                                value: "Hi, Am I working fine?"
                            }
                        ]
                    }
                ],
            };

            formModel = new FormModel(form, {});
            await formModel.init();
            component = new Tabs(componentDefinition, formModel);
        });

        it('formulate tab data', () => {
            const formData: FormData = {
                lang: "en",
                initialTable: []
            }
            const errors: FormSubmissionErrors = {
                titleText: "qwerty",
                errorList: []
            };
            const result = component.getViewModel(formData, errors);
            expect(result.id).to.equal("cbXpuG");
            expect(result?.label?.text).to.equal("Tabs 1");
        })

        it('check schemaKeys functions', () => {
            const formSchemaKeys = component.getFormSchemaKeys();
            const stateSchemaKeys = component.getStateSchemaKeys();
            expect(formSchemaKeys["cbXpuG"].type).to.equal("string");
            expect(stateSchemaKeys["cbXpuG"].type).to.equal("string");
        });

        it('check localisedString', () => {
            const emptyStr = component.localisedString("");
            const simpleStr = component.localisedString("value");
            const objStr = component.localisedString({ en: "value" });
            expect(emptyStr).to.be.empty();
            expect(simpleStr).to.equal("value");
            expect(objStr).to.equal("value");
        })

        it('check getFormDataFromState function', () => {
            const data1 = component.getFormDataFromState({
                initialTabTable: ["check"],
                progress: [],
                result: "",
                ["cbXpuG"]: "value"
            });
            expect(data1?.initialTable[0]).to.equal("check");
            const data2 = component.getFormDataFromState({
                progress: [],
                result: "",
                ["cbXpuG"]: "value"
            });
            if (!data2) {
                fail()
                return;
            }
            expect(data2["cbXpuG"]).to.equal("value");
        });

        it('check getStateFromValidForm & getDisplayStringFromState function', () => {
            const data = component.getStateFromValidForm({
                ["cbXpuG"]: "value",
                crumb: ''
            });
            expect(Object.values(data)[0]).to.equal("value");
            const result = component.getDisplayStringFromState({ ["cbXpuG"]: "value" })
            expect(result).to.equal("value");
        });
    });
});
