import React from "react";
import { NewConfig } from "../NewConfig";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { server, rest } from "../../../../test/testServer";
import { MemoryRouter } from "react-router-dom";
import { renderWithProviders } from "../../../__tests__/helpers/RenderWithProviders";
import { MsalReactTester } from "../../../__tests__/helpers/MsalReactTester";
import MsalClientApplication from "../../../auth/clientApplication";

describe("Newconfig", () => {
  let msalTester: MsalReactTester;
  beforeAll(() => {
    window.env = "local";
    server.listen();
  });
  beforeEach(() => {
    msalTester = new MsalReactTester();
    msalTester.spyMsal();
    msalTester.isLogged();
     //@ts-ignore
     MsalClientApplication.instance = msalTester.client;
  })
  afterEach(() => {
    msalTester.resetSpyMsal();
    server.resetHandlers()
  });
  afterAll(() => server.close());

  test("new configuration is submitted correctly", async () => {
    let postBodyMatched = false;
    server.use(
      rest.get("/api/v2/checkFormExists/:name", (_req, res, ctx) => {
        return res(ctx.json(false));
      }),
      
      rest.post("/api/v2/createNewFormConfig", async (req, res, ctx) => {
        // const body = await req.json()
        return res(ctx.json({ id: "somekey", error: "", status: true }));
      })
    );
    const push = jest.fn();
    const history = { push: push };

    renderWithProviders(<MemoryRouter><NewConfig history={history} /></MemoryRouter>, { msalInstance: msalTester.client });
    expect(
      await screen.findByText(/Enter a name for your form/i)
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Test Form A" },
    });
    fireEvent.click(screen.getByText("Next"));
    await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
    expect(push).toBeCalledWith("designer/somekey");

    // expect(postBodyMatched).toBe(true);
  });

  test("it will not submit when alreadyExistsError", async () => {
    let apiCalled = false;
    server.use(
      rest.get("/api/v2/checkFormExists/:name", (_req, res, ctx) => {
        return res(ctx.json(true));
      }),
      
      rest.post("/api/new", (req, res, ctx) => {
        apiCalled = true;
        return res(ctx.json({ id: "somekey", previewUrl: "" }));
      })
    );
    const push = jest.fn();
    const history = { push: push };
    renderWithProviders(<MemoryRouter><NewConfig history={history} /></MemoryRouter>, { msalInstance: msalTester.client });

    expect(
      await screen.findByText(/Enter a name for your form/i)
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "My feedback form" },
    });
    fireEvent.click(screen.getByText("Next"));
    expect(apiCalled).toBeFalsy();
    expect(await screen.findByText(/There is a problem/i)).toBeInTheDocument();
    expect(
      await screen.findAllByText(/A form with this name already exists/i)
    ).toHaveLength(2);
  });

  test("Enter form name error shown correctly", async () => {
    renderWithProviders(<MemoryRouter><NewConfig /></MemoryRouter>, { msalInstance: msalTester.client });

    expect(
      await screen.findByText(/Enter a name for your form/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Next"));
    expect(await screen.findByText(/There is a problem/i)).toBeInTheDocument();
    expect(await screen.findAllByText(/Enter form name/i)).toHaveLength(2);
  });

  test("Form name with special characters results in error", async () => {
    let apiCalled = false;
    server.use(
      rest.post("/api/new", (req, res, ctx) => {
        apiCalled = true;
        return res(ctx.json({ id: "somekey", previewUrl: "" }));
      })
    );
    renderWithProviders(<MemoryRouter><NewConfig /></MemoryRouter>, { msalInstance: msalTester.client });

    expect(
      await screen.findByText(/Enter a name for your form/i)
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Visa & Form" },
    });
    fireEvent.click(screen.getByText("Next"));
    expect(apiCalled).toBeFalsy();
    expect(await screen.findByText(/There is a problem/i)).toBeInTheDocument();
    expect(
      await screen.findAllByText(
        /Form name should not contain special characters/i
      )
    ).toHaveLength(2);
  });
});