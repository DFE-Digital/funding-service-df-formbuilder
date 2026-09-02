import Lab from "@hapi/lab";
import { expect } from "@hapi/code";

import {
  getTabId,
  getNavigationToken,
  isTrustedNavigation,
} from "server/plugins/engine/plugin";

const { test, suite } = (exports.lab = Lab.script());

suite("Navigation guard", () => {
  test("reads a tab id and navigation token from the query string", () => {
    const request = {
      query: {
        tabId: "tab-123",
        navToken: "token-456",
      },
    };

    expect(getTabId(request)).to.equal("tab-123");
    expect(getNavigationToken(request)).to.equal("token-456");
  });

  test("accepts only trusted app-generated navigation for the current tab", () => {
    const request = {
      query: {
        tabId: "tab-123",
        navToken: "token-456",
      },
    };
    const session = {
      get: (key) => (key === "navToken:tab-123" ? "token-456" : undefined),
    };

    expect(isTrustedNavigation(request, session)).to.equal(true);
  });

  test("rejects missing or mismatched navigation tokens", () => {
    const mismatchedRequest = {
      query: {
        tabId: "tab-123",
        navToken: "wrong-token",
      },
    };
    const session = {
      get: (key) => (key === "navToken:tab-123" ? "token-456" : undefined),
    };

    expect(isTrustedNavigation(mismatchedRequest, session)).to.equal(false);
    expect(isTrustedNavigation({ query: { tabId: "tab-123" } }, session)).to.equal(false);
    expect(isTrustedNavigation({ query: { navToken: "token-456" } }, session)).to.equal(false);
  });
});
