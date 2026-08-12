import { createServer } from "../../../createServer";

//@ts-ignore
const startServer = async (): Promise<hapi.Server> => {
    const server = await createServer();
    await server.start();
    return server;
};

let server;

beforeAll(async () => {
    server = await startServer();
});

afterAll(async () => {
    await server.stop();
});

beforeEach(() => {
    global.fetch = jest.fn();
});

afterEach(() => {
    // @ts-ignore
    fetch.mockClear();
});

const newForm = {
    metadata: {},
    startPage: "/first-page",
    pages: [
        {
            title: "First page",
            path: "/first-page",
            components: [],
            next: [
                {
                    path: "/second-page",
                },
            ],
        },
        {
            path: "/second-page",
            title: "Second page",
            components: [],
            next: [
                {
                    path: "/summary",
                },
            ],
        },
        {
            title: "Summary",
            path: "/summary",
            controller: "./pages/summary.js",
            components: [],
        },
    ],
    lists: [],
    sections: [],
    conditions: [],
    fees: [],
    outputs: [],
    version: 2,
    userId: "test-user-id",
    createdBy: "test-user",
    key: "test-key",
    id: "test-key",
    status: "In development",
    lastModified: "2023-11-10 03:43:23 PM",
    name: "test-form",
    displayName: "test-form",
};

describe("Form Configuration API", () => {
    test("Get Configuration", async () => {
        //@ts-ignore
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve(newForm),
                text: () => Promise.resolve(newForm),
                status: 200
            })
        );
        const options = {
            method: "GET",
            url: "/api/v2/getConfiguration/test-key",
        };
        const result = await server.inject(options);
        expect(result.result.data.id).toEqual("test-key");
    });

    test("Get Configuration - Error", async () => {
        //@ts-ignore
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.reject("Server down"),
                text: () => Promise.reject("Server down"),
                status: 500
            })
        );
        const options = {
            method: "GET",
            url: "/api/v2/getConfiguration/test-key",
        };
        const result = await server.inject(options);
        expect(result.statusCode).toEqual(500);
    });
    test("List Form Configurations", async () => {
        //@ts-ignore
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve([newForm]),
                text: () => Promise.resolve([newForm]),
                status: 200
            })
        );
        const options = {
            method: "GET",
            url: "/api/v2/listFormConfigurations",
        };
        const result = await server.inject(options);
        expect(result.result.data[0].id).toEqual("test-key");
    });

    test("List Form Configurations - Error", async () => {
        //@ts-ignore
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.reject("Server down"),
                text: () => Promise.reject("Server down"),
                status: 500
            })
        );
        const options = {
            method: "GET",
            url: "/api/v2/listFormConfigurations",
        };
        const result = await server.inject(options);
        expect(result.statusCode).toEqual(500);
    });

    test("Delete Form Configurations", async () => {
        //@ts-ignore
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                text: () => Promise.resolve("Form data deleted successfully."),
                json: () => Promise.resolve("Form data deleted successfully."),
                status: 200
            })
        );
        const options = {
            method: "DELETE",
            url: "/api/v2/deleteConfiguration/test-id",
        };
        const result = await server.inject(options);
        expect(result.statusCode).toEqual(200);
    });

    test("Delete Form Configurations - Form doesn't exist", async () => {
        //@ts-ignore
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                text: () => Promise.resolve("Form doesnt exist in the db"),
                json: () => Promise.resolve("Form doesnt exist in the db"),
                status: 200
            })
        );
        const options = {
            method: "DELETE",
            url: "/api/v2/deleteConfiguration/test-id",
        };
        const result = await server.inject(options);
        expect(result.statusCode).toEqual(200);
    });

    test("Delete Form Configurations - Error", async () => {
        //@ts-ignore
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                text: () => Promise.reject("Server down"),
                json: () => Promise.reject("Server down"),
                status: 500
            })
        );
        const options = {
            method: "DELETE",
            url: "/api/v2/deleteConfiguration/test-id",
        };
        const result = await server.inject(options);
        expect(result.statusCode).toEqual(404);
    });

    test("Add Form Configurations", async () => {
        //@ts-ignore
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve(newForm),
                text: () => Promise.resolve(newForm),
                status: 200
            })
        );
        const options = {
            method: "POST",
            url: "/api/v2/addConfiguration",
            payload: JSON.stringify(newForm),
        };
        const result = await server.inject(options);
        expect(result.statusCode).toEqual(200);
    });

    test("Add Form Configurations - Server error", async () => {
        //@ts-ignore
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                text: () => Promise.reject("Server down"),
                json: () => Promise.reject("Server down"),
                status: 500
            })
        );
        const options = {
            method: "POST",
            url: "/api/v2/addConfiguration",
            payload: JSON.stringify(newForm),
        };
        const result = await server.inject(options);
        expect(result.statusCode).toEqual(500);
    });

    test("Upload Form Configurations", async () => {
        //@ts-ignore
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve(newForm),
                text: () => Promise.resolve(newForm),
                status: 200
            })
        );
        const options = {
            method: "PUT",
            url: "/api/v2/uploadConfiguration",
            payload: JSON.stringify(newForm),
        };
        const result = await server.inject(options);
        expect(result.statusCode).toEqual(200);
    });

    test("Upload Form Configurations - Error", async () => {
        //@ts-ignore
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.reject("Server down"),
                text: () => Promise.reject("Server down"),
                status: 500
            })
        );
        const options = {
            method: "PUT",
            url: "/api/v2/uploadConfiguration",
            payload: JSON.stringify(newForm),
        };
        const result = await server.inject(options);
        expect(result.statusCode).toEqual(500);
    });

    test("Check if form name exists", async () => {
        //@ts-ignore
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve(true),
                text: () => Promise.resolve(true),
                status: 200
            })
        );
        const options = {
            method: "GET",
            url: "/api/v2/checkFormExists?name=test-name",
        };
        const result = await server.inject(options);
        expect(result.statusCode).toEqual(200);
    });

    test("Check if form name exists - error", async () => {
        //@ts-ignore
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.reject("Server down"),
                text: () => Promise.reject("Server down"),
                status: 500
            })
        );
        const options = {
            method: "GET",
            url: "/api/v2/checkFormExists?name=test-name",
        };
        const result = await server.inject(options);
        expect(result.statusCode).toEqual(500);
    });

    test("Create New Form Configurations", async () => {
        //@ts-ignore
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve(newForm),
                text: () => Promise.resolve(newForm),
                status: 200
            })
        );
        const options = {
            method: "POST",
            url: "/api/v2/createNewFormConfig",
            payload: JSON.stringify({
                name: "test-name",
                userName: "test-user",
                userId: "test-user-id",
            }),
        };
        const result = await server.inject(options);
        expect(result.statusCode).toEqual(200);
    });

    test("Create New Form Configurations - Server error", async () => {
        //@ts-ignore
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.reject("Server form"),
                text: () => Promise.reject("Server form"),
                status: 500
            })
        );
        const options = {
            method: "POST",
            url: "/api/v2/createNewFormConfig",
            payload: JSON.stringify({
                name: "test-name",
                userName: "test-user",
                userId: "test-user-id",
            }),
        };
        const result = await server.inject(options);
        expect(result.statusCode).toEqual(500);
    });

    test("Import Form Configurations", async () => {
        //@ts-ignore
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve(false),
                text: () => Promise.resolve(false),
                status: 200
            })
        );
        //@ts-ignore
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve(newForm),
                text: () => Promise.resolve(newForm),
                status: 200
            })
        );
        const options = {
            method: "POST",
            url: "/api/v2/importSavedForm",
            payload: JSON.stringify(newForm),
        };
        const result = await server.inject(options);
        expect(result.statusCode).toEqual(200);
    });
});
