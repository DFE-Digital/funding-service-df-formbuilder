import "whatwg-fetch";
import { rest } from "msw";
import { setupServer } from "msw/node";

const mockedFormConfigurations = [
    {
        Key: "Not-a-feedback-form",
        DisplayName: "Not a feedback form",
        CreatedBy: "User",
        FormStatus: "In development",
        LastModified: "2022/2/24 15:43",
        feedbackForm: false,
        UserId: "6dd6b773-a232-4594-a97c-db036b930778",
    },
    {
        Key: "My feedback form",
        DisplayName: "My feedback form",
        CreatedBy: "User",
        FormStatus: "In development",
        LastModified: "2022/2/24 15:43",
        feedbackForm: true,
        UserId: "6dd6b773-a232-4594-a97c-db036b930778",
    },
];

const server = setupServer(
    rest.get("/api/configurations", (_req, res, ctx) => {
        return res(ctx.json(mockedFormConfigurations));
    }),

    rest.get("*", (req, res, ctx) => {
        console.error(`Please add request handler for ${req.url.toString()}`);
        return res(
            ctx.status(500),
            ctx.json({ error: "You must add request handler." })
        );
    })
);

export { server, rest, mockedFormConfigurations };
