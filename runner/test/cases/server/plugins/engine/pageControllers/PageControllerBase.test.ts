import * as Code from '@hapi/code';
import * as Lab from '@hapi/lab';
import sinon from "sinon";
const fs = require('fs')
import { PageControllerBase } from '../../../../../../src/server/plugins/engine/pageControllers';
import * as BlobService from "../../../../../../src/server/utils/blobService";

import { FormModel } from '../../../../../../src/server/plugins/engine/models';
import { FormPayload, FormSubmissionState } from '../../../../../../src/server/plugins/engine/types';

const lab = Lab.script();
exports.lab = lab;

const { expect, fail } = Code;
const { suite, describe, it, before, after, beforeEach } = lab;

suite('PageControllerBase Component', () => {
    let blobStub;
    let fileSync;
    before(() => {
        const response = JSON.stringify({ key: "test", value: "sample" })
        blobStub = sinon.stub(BlobService, "downloadBlobDocToJSON").resolves(Promise.resolve(response))
        fileSync = sinon.stub(fs, 'readFileSync').returns('fake text')
    })
    after(() => {
        if (blobStub) blobStub.reset();
        if (fileSync) fileSync.reset();
    })
    const def = {
        "metadata": {},
        "startPage": "/first-page",
        "pages": [
            {
                "title": "First page",
                "path": "/first-page",
                "components": [],
                "next": [
                    {
                        "path": "/second-page"
                    }
                ]
            },
            {
                "path": "/second-page",
                "title": "Second page",
                "components": [
                    {
                        "name": "EUEhfo",
                        "options": {},
                        "type": "NumberField",
                        "title": "Number 1",
                        "checked": true,
                        "schema": {
                            min: 0,
                            max: 9999
                        }
                    },
                    {
                        "name": "JtwCCr",
                        "options": {},
                        "type": "NumberField",
                        "title": "Number 2",
                        "checked": true,
                        "schema": {
                            min: 0,
                            max: 9999
                        }
                    },
                    {
                        "name": "dVUDSX",
                        "displayName": "Add",
                        "options": {
                            "hideResult": false
                        },
                        "type": "Result",
                        "title": "Add 1",
                        "hint": "",
                        "expression": "(EUEhfo) + (JtwCCr)",
                        "schema": {}
                    }
                ],
                "next": [
                    {
                        "path": "/summary",
                        "condition": ""
                    },
                    {
                        "path": "/condition-page",
                        "condition": "dDkTJC"
                    }
                ]
            },
            {
                "title": "Summary",
                "path": "/summary",
                "controller": "./pages/summary.js",
                "components": []
            },
            {
                "path": "/condition-page",
                "title": "Condition Page",
                "components": [],
                "next": [
                    {
                        "path": "/summary"
                    }
                ]
            }
        ],
        "lists": [],
        "sections": [],
        "conditions": [
            {
                "displayName": "TestCondition",
                "name": "dDkTJC",
                "value": {
                    "name": "TestCondition",
                    "conditions": [
                        {
                            "field": {
                                "name": "dVUDSX",
                                "type": "Result",
                                "display": "Add 1"
                            },
                            "operator": "is",
                            "value": {
                                "type": "Value",
                                "value": "24",
                                "display": "24"
                            }
                        }
                    ]
                }
            }
        ],
        "fees": [],
        "outputs": [],
        "version": 2,
        "userId": "ab5e4f5b-16f5-4a4e-a6f6-7d7e43fff7fb",
        "createdBy": "UserTest1",
        "id": "fNrjANBoEK",
        "key": "fNrjANBoEK",
        "displayName": "table-test-1",
        "name": "table-test-1",
        "lastModified": "2023/05/12 02:22",
        "formStatus": "In development",
        "file": "TestFile",
        "feedback": {
            "url": "/feedback",
            "feedbackForm": true,
            "emailAddress": "test@abc.com"
        },
        "importedDataSets": [
            {
                "fileTitle": "DataSet 1",
                "fileName": "sample-csv-file.csv",
                "uploadedDate": "2023-05-12T01:20:22.170Z",
                "fileId": "VMLjjr"
            }
        ],
        "lastUpdatedByName": "UserTest1",
        "lastUpdatedById": "ab5e4f5b-16f5-4a4e-a6f6-7d7e43fff7fb",
        "designedDataSets": [
            {
                "id": "FRldVi",
                "title": "DDS1",
                "uploadedDate": "2023-05-12T01:21:19.478Z",
                "csvUsed": "VMLjjr",
                "keyIdentifier": "UKPRN",
                "data": [
                    [
                        {
                            "index": "1-1",
                            "type": "select_value",
                            "value": "UKPRN-Header",
                            "bold": true
                        },
                        {
                            "index": "1-2",
                            "type": "select_value",
                            "value": "Org-Header",
                            "bold": true
                        }
                    ],
                    [
                        {
                            "index": "2-1",
                            "type": "select_value",
                            "value": "UKPRN-Value",
                            "bold": false
                        },
                        {
                            "index": "2-2",
                            "type": "select_value",
                            "value": "Org-Value",
                            "bold": false
                        }
                    ]
                ]
            }
        ],
        "skipSummary": false,
        "signInRequired": true,
        "documents": [
            {
                "id": "RJUHte",
                "title": "sample-1",
                "uploadedDate": "2023-05-23T08:38:34.799Z",
                "type": "csv",
                "fileName": "sample-csv-file.csv",
                "path": "designer/documents/RJUHte/sample-csv-file.csv"
            }
        ],
        "declaration": "Yes?",
        "calculations": [
            {
                "displayName": "Add",
                "hint": "",
                "type": "arithmetic",
                "name": "dVUDSX",
                "pageLocation": "Second page",
                "components": [
                    {
                        "title": "Number 1",
                        "name": "EUEhfo",
                        "type": "NumberField",
                        "options": {},
                        "checked": true,
                        "schema": {
                            min: 0,
                            max: 9999
                        }
                    },
                    {
                        "title": "Number 2",
                        "name": "JtwCCr",
                        "type": "NumberField",
                        "options": {},
                        "checked": true,
                        "schema": {
                            min: 0,
                            max: 9999
                        }
                    }
                ],
                "expression": "(EUEhfo) + (JtwCCr)",
                "title": "Add 1",
                "hideResult": false
            }
        ]
    };

    const options = {
        basePath: "basePath"
    }

    let model: FormModel;

    const pageDef = {
        "path": "/second-page",
        "title": "Second page",
        "components": [
            {
                "name": "EUEhfo",
                "options": {},
                "type": "NumberField",
                "title": "Number 1",
                "checked": true,
                "schema": {
                    min: 0,
                    max: 9999
                }
            },
            {
                "name": "JtwCCr",
                "options": {},
                "type": "NumberField",
                "title": "Number 2",
                "checked": true,
                "schema": {
                    min: 0,
                    max: 9999
                }
            },
            {
                "name": "dVUDSX",
                "displayName": "Add",
                "options": {
                    "hideResult": false
                },
                "type": "Result",
                "title": "Add 1",
                "hint": "",
                "expression": "(EUEhfo) + (JtwCCr)",
                "schema": {}
            }
        ],
        "next": [
            {
                "path": "/summary",
                "condition": ""
            },
            {
                "path": "/condition-page",
                "condition": "dDkTJC"
            }
        ]
    };

    let page: PageControllerBase;

    const state = {
        reference: "testreference",
        referenceIsStored: "testreference"
    }
    const cacheService = {
        getState: async (req: any) => state,
        mergeState: async (req: any, obj: any) => null,
    }
    const payService = {
        descriptionFromFees: (model: any) => "desc",
        payRequest: async () => {
            return {
                payment_id: "id",
                reference: "ref",
                _links: {
                    self: { href: "href" }
                }
            }
        }
    }
    const yar = {
        lang: "en-US",
        declarationError: []
    };
    const searchParams = {
        ["f_t"]: "eyJmb3JtVGl0bGUiOiJ0ZXN0IiwicGFnZVRpdGxlIjoidGVzdCIsInVybCI6InVybCJ9"
    }
    const services = { cacheService, payService }

    const request = {
        query: { lang: "en-US" },
        yar: { get: (key: string) => yar[key], flash: (key: string) => yar[key] },
        services: (arr: any[]) => services,
        url: {
            searchParams: {
                get: (key: string) => searchParams[key]
            },
            pathname: "path",
            search: "search"
        },
        logger: { error: (str: string, obj: any) => null },
        server: { logger: { debug: (obj: any, str: string) => null } },
        payload: {
            filedata: {
                path: "testPath"
            }
        },
        pre: { errors: [] }
    };

    const h = {
        view: (str: string, obj: any) => str,
        redirect: (url: any) => url
    };


    describe('Tests', () => {
        beforeEach(async () => {
            model = new FormModel(def, options);
            await model.init();
            page = new PageControllerBase(model, pageDef);
        });

        it('check next page', () => {
            expect(page.hasNext).to.equal(true);
            expect(page.containsAnyLetter("A")).to.equal(true)
        });

        it('verify get next page', () => {
            const state: FormSubmissionState = {
                progress: [],
                result: {},
                JtwCCr: "12",
                EUEhfo: "12",
                dataImportStatus: {}
            }
            const nextPage = page.getNextPage(state, false)
            expect(nextPage && typeof nextPage.hasNext !== 'undefined' ? nextPage.hasNext : false).to.equal(false);
        });

        it('verify get next page', () => {
            const state: FormSubmissionState = {
                progress: [],
                result: {},
                JtwCCr: "12",
                EUEhfo: "12",
                dataImportStatus: {}
            }
            const nextPage = page.getNextPage(state, false)
            expect(nextPage && typeof nextPage.hasNext !== 'undefined' ? nextPage.hasNext : false).to.equal(false);
        });

        it('verify get next page path', () => {
            const state: FormSubmissionState = {
                progress: [],
                result: {},
                JtwCCr: 12,
                EUEhfo: 12,
                dataImportStatus: {}
            }
            const nextPagePath = page.getNext(state)
            expect(nextPagePath).to.equal("/basePath/summary");
        });

        it('verify get next page path', () => {
            const state: FormSubmissionState = {
                progress: [],
                result: {},
                JtwCCr: 12,
                EUEhfo: 12,
                dataImportStatus: {}
            }
            const nextPagePath = page.getNext(state)
            expect(nextPagePath).to.equal("/basePath/summary");
        });

        it("verify getFormDataFromState and getStateFromValidForm", () => {
            const formData = page.getFormDataFromState({
                progress: [],
                result: "",
                JtwCCr: 12,
                EUEhfo: 12
            }, 1)
            expect(formData["JtwCCr"]).to.equal('12');
            const formPayload: FormPayload = {
                crumb: '',
                JtwCCr: 12,
                EUEhfo: 12
            }
            const state = page.getStateFromValidForm(formPayload);
            expect(state["JtwCCr"]).to.equal(12);
        })

        it("verify getCurrentPage", () => {
            const currentPage = page.getCurrentPage("/second-page", [{ path: "/second-page", check: true }])
            expect(currentPage[0].check).to.equal(true)
        })

        it("verify validateFileextensionerror", () => {
            // Case 1
            const error1 = "true_CSV";
            let formResult1: any = {};
            let fileFields1 = [{ name: "CSV" }];
            page.validateFileextensionerror(error1, formResult1, fileFields1);
            expect(formResult1.errors.titleText).to.equal("Fix the following errors")
            // Case 2
            const error2 = "default value"
            const formResult2 = {
                errors: {
                    errorList: [{
                        text: '"filextensionerror" is not allowed'
                    }]
                }
            };
            const fileFields2 = [];
            page.validateFileextensionerror(error2, formResult2, fileFields2);
            // Case 3
            const error3 = "default value"
            const formResult3 = {
                errors: {
                    errorList: [{
                        name: "test",
                        text: '"filextensionerror" is not allowed'
                    }, {
                        name: "filextensionerror",
                        text: '"filextensionerror" is not allowed'
                    }]
                }
            };
            const fileFields3 = [];
            page.validateFileextensionerror(error3, formResult3, fileFields3);
        })

        it('verify view model', () => {
            const state: FormSubmissionState = {
                progress: [],
                result: "",
                JtwCCr: 12,
                EUEhfo: 12
            }
            const viewModel = page.getViewModel(state, "", [])
            expect(viewModel.name).to.equal("table-test-1");
        });

        it.skip("verify makeGetRouteHandler", async () => {
            const makeGetRouteHandler = page.makeGetRouteHandler();
            const result = await makeGetRouteHandler(request, h)
            expect(result).to.equal('/basePath/first-page');
        })

        it.skip("verify makePostRouteHandler", async () => {
            const makePostRouteHandler = page.makePostRouteHandler();
            const result = await makePostRouteHandler(request, h)
            expect(result).to.equal('index');
        })

        it("verify setFeedbackDetails", async () => {
            const viewModel: any = {};
            page.setFeedbackDetails(viewModel, request)
            expect(viewModel.name).to.equal("test");
            expect(viewModel.feedbackLink).to.equal("mailto:test@abc.com");
        })

        it("verify makeGetRoute and makePostRoute", async () => {
            const result1 = page.makeGetRoute();
            const result2 = page.makePostRoute()
            expect(result1.method).to.equal('get');
            expect(result2.method).to.equal('post');
        })

        it("verify findPageByPath", async () => {
            const pageFound = page.findPageByPath("/second-page")
            expect(pageFound && pageFound.name ? pageFound.name : undefined).to.equal("table-test-1")
        })

        it("verify proceed", async () => {
            const formState: FormSubmissionState = {
                progress: [],
                result: "",
                JtwCCr: 12,
                EUEhfo: 12,
                previousPage: "/first-page"
            }
            const result = page.proceed(request, h, formState)
            expect(result).to.equal("/basePath/summary")
        })

        it('check localisedString', () => {
            const emptyStr = page.localisedString("", "");
            const simpleStr = page.localisedString("value", "");
            const emptyObjStr = page.localisedString({ en: "value" }, "en");
            const objStr = page.localisedString({ en: "value" }, "en");
            expect(emptyStr).to.be.empty();
            expect(simpleStr).to.equal("value");
            expect(emptyObjStr).to.equal("value");
            expect(objStr).to.equal("value");
        })

        it('check getters', () => {
            expect(page.defaultNextPath).to.equal("/basePath/summary");
            expect(page.conditionOptions.allowUnknown).to.equal(true);
            expect(page.errorSummaryTitle).to.equal("There is a problem");
        })

        it('verify numberToCol', () => {
            const result = page.numberToCol(129);
            expect(result).to.equal("DY");
        })

        it('verify numberToCol', async () => {
            const validate = page.ValidateFile();
            const validateFile = await validate(request, h)
            expect(validateFile).to.exist();
        })

    })
});