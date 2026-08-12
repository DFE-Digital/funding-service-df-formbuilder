import * as Code from '@hapi/code';
import * as Lab from '@hapi/lab';
import { Filedownload } from '../../../../../../src/server/plugins/engine/components';
import { FiledownloadComponent } from '@xgovformbuilder/model';
import { FormModel } from '../../../../../../src/server/plugins/engine/models';
import { FormData, FormSubmissionErrors } from '../../../../../../src/server/plugins/engine/types';
const lab = Lab.script();
exports.lab = lab;

const { expect } = Code;
const { suite, describe, it, beforeEach } = lab;

suite('File Download Component', () => {

    describe('Generated schema', () => {
        let componentDefinition: FiledownloadComponent;
        let form: any;
        let formModel: FormModel;
        let component: any;

        beforeEach(async () => {
            componentDefinition = {
                name: "sVSWpb",
                options: {},
                type: "Filedownload",
                title: "file-download-1",
                selectedDocument: "cbGJoV",
                displayName: 'file-download-1',
                content: '',
                expression: '',
                schema: {}
            };

            form = {
                lastDownloaded: '2023/03/15 17:19',
                lastModified: '2023/03/15 17:19',
                id: 'qwerty',
                key: 'qwerty',
                displayName: 'Qwerty',
                pages: [
                    {
                        path: "/first-page",
                        title: "First page",
                        components: [
                            {
                                name: "sVSWpb",
                                options: {},
                                type: "Filedownload",
                                title: "file-download-1",
                                selectedDocument: "cbGJoV"
                            }
                        ],
                        next: [
                            {
                                "path": "/summary"
                            }
                        ]
                    }
                  ],
                conditions: [],
                lists: [],
                sections: [],
                confirmationMsg: 'Yes?',
                fees: [],
                calculations: [],
                startPage: '/first-page',
                documents: [
                    {
                      id: "cbGJoV",
                      title: "Doc 1",
                      uploadedDate: "2023-05-15T19:22:51.436Z",
                      type: "csv",
                      fileName: "sample-csv-file.csv",
                      path: "designer/documents/cbGJoV/sample-csv-file.csv"
                    }
                  ],
            };

            formModel = new FormModel(form, {});
            await formModel.init();
            component = new Filedownload(componentDefinition, formModel);
        });

        it('check lang', () => {
            expect(component.lang).to.equal("en");
            component.lang = "en-US";
            expect(component.lang).to.equal("en-US")
        });

            it('check schemaKeys functions', () => {

            const formSchemaKeys = component.getFormSchemaKeys();
            const stateSchemaKeys = component.getStateSchemaKeys();

            const formSchema = formSchemaKeys["sVSWpb"];
            const stateSchema = stateSchemaKeys["sVSWpb"];

            expect(formSchema.validate([]).error).to.be.null;
            expect(stateSchema.validate([]).error).to.be.null;
            });

        it('check localisedString', () => {
            const emptyStr = component.localisedString("");
            const simpleStr = component.localisedString("value");
            const objStr = component.localisedString({ en: "value" });
            expect(emptyStr).to.be.empty();
            expect(simpleStr).to.equal("value");
            expect(objStr).to.equal("value");
        })

        it('formulate view model', () => {
            const formData: FormData = {
                lang: "en",
            }
            const errors: FormSubmissionErrors = {
                titleText: "qwerty",
                errorList: []
            };
            const result = component.getViewModel(formData, errors);
            expect(result.id).to.equal("sVSWpb");
            expect(result?.label?.text).to.equal("file-download-1");
        })
    });
});
