import * as Code from '@hapi/code';
import * as Lab from '@hapi/lab';
import { TableDataset } from '../../../../../../src/server/plugins/engine/components';
import { TableDatasetComponent } from '@xgovformbuilder/model';
import { FormModel } from '../../../../../../src/server/plugins/engine/models';
import { FormData, FormSubmissionErrors, FormSubmissionState } from '../../../../../../src/server/plugins/engine/types';
const lab = Lab.script();
exports.lab = lab;

const { expect, fail } = Code;
const { suite, describe, it, beforeEach } = lab;

suite('Table Component', () => {

    describe('Generated schema', () => {
        let componentDefinition: TableDatasetComponent;
        let form: any;
        let formModel: FormModel;
        let component: any;

        beforeEach(async () => {
            componentDefinition = {
                name: "LkfdOz",
                options: {},
                type: "TableDataset",
                title: "Table 1",
                content: "BWMSfF",
                schema: {}
            };

            form = {
                lastDownloaded: '2023/03/15 17:19',
                lastModified: '2023/03/15 17:19',
                id: 'qwerty',
                key: 'qwerty',
                displayName: 'Qwerty',
                pages: [],
                conditions: [],
                lists: [],
                sections: [],
                confirmationMsg: 'Yes?',
                fees: [],
                calculations: [],
                startPage: '/first-page',
                importedDataSets: [
                    {
                        fileTitle: "DataSet 1",
                        fileName: "sample-csv-file.csv",
                        uploadedDate: "2023-05-12T01:20:22.170Z",
                        fileId: "VMLjjr"
                    }
                ],
                designedDataSets: [
                    {
                        id: "FRldVi",
                        title: "DDS1",
                        uploadedDate: "2023-05-12T01:21:19.478Z",
                        csvUsed: "VMLjjr",
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
            };

            formModel = new FormModel(form, {});
            await formModel.init();
            component = new TableDataset(componentDefinition, formModel);
        });

        it('check lang and items', () => {
            expect(component.items).to.be.empty();
            expect(component.lang).to.equal("en");
            component.lang = "en-US";
            expect(component.lang).to.equal("en-US")
        });

        it('formulate table data', () => {
            const formData: FormData = {
                lang: "en",
                tableData: {
                    orgData: {
                        urn: "119183",
                        ukprn: "10077231",
                    },
                    blobData: [
                        {
                            "Id": 1,
                            "UKPRN": 707679,
                            "URN": 644132,
                            "Org": "Org 1"
                        },
                        {
                            "Id": 2,
                            "UKPRN": 782584,
                            "URN": 61644,
                            "Org": "Org 2"
                        },
                        {
                            "Id": 3,
                            "UKPRN": 696325,
                            "URN": 470611,
                            "Org": "Org 3"
                        },
                        {
                            "Id": 4,
                            "UKPRN": 452522,
                            "URN": 831760,
                            "Org": "Org 4"
                        },
                        {
                            "Id": 5,
                            "UKPRN": 903042,
                            "URN": 681024,
                            "Org": "Org 5"
                        },
                        {
                            "Id": 6,
                            "UKPRN": 10077231,
                            "URN": 121241,
                            "Org": "Org 6"
                        },
                        {
                            "Id": 7,
                            "UKPRN": 10078006,
                            "URN": 12123,
                            "Org": "Org 7"
                        },
                        {
                            "Id": 8,
                            "UKPRN": 10078001,
                            "URN": 23653,
                            "Org": "Org 8"
                        },
                        {
                            "Id": 9,
                            "UKPRN": 10073532,
                            "URN": 4687475,
                            "Org": "Org 9"
                        }
                    ],
                    fileId: "VMLjjr",
                    dataset: "FRldVi",
                },
            }
            const errors: FormSubmissionErrors = {
                titleText: "qwerty",
                errorList: []
            };
            const result = component.getViewModel(formData, errors);
            expect(result.id).to.equal("LkfdOz");
            expect(result?.label?.text).to.equal("Table 1");
        })

        it('check getFormDataFromState', () => {
            const data1: FormSubmissionState = { ["LkfdOz"]: "value", progress: [], result: "" };
            const positiveResult = component.getFormDataFromState(data1);
            if (!positiveResult) {
                fail();
                return;
            }
            expect(Object.values(positiveResult)[0]).to.equal("value");
            const data2: FormSubmissionState = { ["AkGdOQ"]: "value", progress: [], result: "" };
            const negativeResult = component.getFormDataFromState(data2);
            expect(negativeResult).to.be.undefined();
        });

        it('check schemaKeys functions', () => {
            const formSchemaKeys = component.getFormSchemaKeys();
            const stateSchemaKeys = component.getStateSchemaKeys();
            expect(Object.keys(formSchemaKeys)[0]).to.equal("LkfdOz");
            expect(Object.keys(stateSchemaKeys)[0]).to.equal("LkfdOz");
        });

        it('check getStateValueFromValidForm and getDisplayStringFromState', () => {
            const displayStr = component.getDisplayStringFromState({ ["LkfdOz"]: "value" });;
            const result = component.getStateFromValidForm({ ["LkfdOz"]: "value", crumb: "" })
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
