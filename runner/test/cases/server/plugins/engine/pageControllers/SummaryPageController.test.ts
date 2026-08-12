import * as Code from '@hapi/code';
import * as Lab from '@hapi/lab';
import { SummaryPageController } from '../../../../../../src/server/plugins/engine/pageControllers';
import { FormModel } from '../../../../../../src/server/plugins/engine/models';
const lab = Lab.script();
exports.lab = lab;

const { expect, fail } = Code;
const { suite, describe, it } = lab;

suite('SummaryPageController Component', () => {

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
        "userId": "TestUserId",
        "createdBy": "UserTest1",
        "id": "fNrjANBoEK",
        "key": "fNrjANBoEK",
        "displayName": "table-test-1",
        "name": "table-test-1",
        "lastModified": "2023/05/12 02:22",
        "formStatus": "In development",
        "file": "TestFile",
        "importedDataSets": [
            {
                "fileTitle": "DataSet 1",
                "fileName": "sample-csv-file.csv",
                "uploadedDate": "2023-05-12T01:20:22.170Z",
                "fileId": "VMLjjr"
            }
        ],
        "lastUpdatedByName": "UserTest1",
        "lastUpdatedById": "TestUserId",
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
        "feedback": {
            feedbackForm: true,
            url: "url",
            emailAddress: "string@test.com",
        },
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

    const model: FormModel = new FormModel(def, options)

    const pageDef =
    {
        title: "Summary",
        path: "/summary",
        controller: "./pages/summary.js",
        components: []
    };

    const page = new SummaryPageController(model, pageDef)
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
        logger: { error: (str: string, obj: any) => null }
    };

    const h = {
        view: (str: string, obj: any) => str,
        redirect: (url: any) => url
    };

    describe('Tests', () => {
        it('check next page', () => {
            expect(page.hasNext).to.equal(false);
        });

        it("verify postRouteOptions", async () => {
            const postRouteOptions = page.postRouteOptions;
            //@ts-ignore
            const result = await postRouteOptions.ext.onPreHandler.method({}, { continue: true })
            expect(result).to.equal(true);
        })

        it.skip("verify makeGetRouteHandler", async () => {
            const makeGetRouteHandler = page.makeGetRouteHandler();
            const result = await makeGetRouteHandler(request, h)
            expect(result).to.equal('/basePath/second-page');
        })

        it.skip("verify makePostRouteHandler", async () => {
            const makePostRouteHandler = page.makePostRouteHandler();
            const result = await makePostRouteHandler(request, h)
            expect(result).to.equal('/basePath/first-page');
        })

        it("verify getFeedbackContextInfo", () => {
            const decoded = page.getFeedbackContextInfo(request);
            if (!decoded) {
                fail()
                return;
            }
            expect(decoded.formTitle).to.equal("test")
        })

        it("verify feedbackUrlFromRequest", () => {
            const resultString = page.feedbackUrlFromRequest(request);
            if (!resultString) {
                fail()
                return;
            }
            expect(resultString).to.equal("url?f_t=eyJmb3JtVGl0bGUiOiJ0YWJsZS10ZXN0LTEiLCJwYWdlVGl0bGUiOiJTdW1tYXJ5IiwidXJsIjoicGF0aHNlYXJjaCJ9")
        })
    })
});