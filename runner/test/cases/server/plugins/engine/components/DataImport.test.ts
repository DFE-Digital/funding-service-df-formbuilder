import * as Code from '@hapi/code';
import * as Lab from '@hapi/lab';
import { DataImport } from '../../../../../../src/server/plugins/engine/components';
import { DataImportComponent } from '@xgovformbuilder/model';
import { FormModel } from '../../../../../../src/server/plugins/engine/models';
import { FormData, FormSubmissionErrors, FormSubmissionState } from '../../../../../../src/server/plugins/engine/types';
const lab = Lab.script();
exports.lab = lab;

const { expect, fail } = Code;
const { suite, describe, it, beforeEach } = lab;

suite('Data Import Component', () => {
    describe('Tests', () => {
        let componentDefinition: DataImportComponent;
        let form: any;
        let formModel: FormModel;
        let component: any;

        beforeEach(async () => {
            componentDefinition =  {
                name: 'lSSrsa',
                options: {},
                type: 'DataImport',
                title: 'Test 1',
                documentName: 'sample-csv-file.csv',
                addedFileTypes: ['PDF', 'PNG', 'JPG/JPEG', 'DOC/DOCX', 'XLS/XLSX', 'CSV'],
                columns: [
                  {
                    columnId: 'GZNgwj',
                    columnType: 'Text',
                    selectedColumnHeaderType: 'custom_column',
                    selectedColumnHeaderValue: 'Column 1',
                    columnSchema: {
                      maxLength: '10'
                    },
                    isEdited: false
                  }
                ]
            };

            form = {
                metadata: {},
                startPage: '/first-page',
                pages: [
                  {
                    path: '/second-page',
                    title: 'Second page',
                    components: [
                      {
                        name: 'lSSrsa',
                        options: {},
                        type: 'DataImport',
                        title: 'Test 1',
                        documentName: 'sample-csv-file.csv',
                        columns: [
                          {
                            columnId: 'GZNgwj',
                            columnType: 'Text',
                            selectedColumnHeaderType: 'custom_column',
                            selectedColumnHeaderValue: 'Column 1',
                            columnSchema: {
                              maxLength: '10'
                            },
                            isEdited: false
                          }
                        ]
                      }
                    ],
                    next: [
                      {
                        path: '/summary'
                      }
                    ]
                  }
                ],
                lists: [],
                sections: [],
                conditions: [],
                fees: [],
                outputs: [],
                version: 2,
                userId: 'ab5e4f5b',
                createdBy: 'TestUser1',
                id: 'fNrjANBoEK',
                key: 'fNrjANBoEK',
                displayName: 'table-test-1',
                name: 'table-test-1',
                lastModified: '2023/05/12 02:22',
                formStatus: 'In development',
                file: 'TestFile2',
                lastUpdatedByName: 'TestUser1',
                lastUpdatedById: 'ab5e4f5b',
                skipSummary: false,
                signInRequired: true,
                documents: [
                  {
                    id: 'RJUHte',
                    title: 'sample-1',
                    uploadedDate: '2023-05-23T08:38:34.799Z',
                    type: 'csv',
                    fileName: 'sample-csv-file.csv',
                    path: 'designer/documents/RJUHte/sample-csv-file.csv'
                  }
                ]
            };

            formModel = new FormModel(form, {});
            await formModel.init();
            component = new DataImport(componentDefinition, formModel);
        });
        it('check schemaKeys functions', () => {
            const formSchemaKeys = component.getFormSchemaKeys();
            const stateSchemaKeys = component.getStateSchemaKeys();
            expect(Object.keys(formSchemaKeys)[0]).to.equal('lSSrsa');
            expect(Object.keys(stateSchemaKeys)[0]).to.equal('lSSrsa');
        });

        it('verify view model', () => {
            const formData: FormData = {
                lang: 'en',
            };
            const errors: FormSubmissionErrors = {
                titleText: 'qwerty',
                errorList: []
            };
            const result = component.getViewModel(formData, errors);
            expect(result.id).to.equal('lSSrsa');
            expect(result?.label?.text).to.equal('Test 1');
        });
    });
});
