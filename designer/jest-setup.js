import "@testing-library/jest-dom";
import "./test/testServer";
import { initI18n } from "./client/i18n";
import { faker } from "@faker-js/faker";
initI18n();

const mockNanoid = {
    customAlphabet: (str, num1) => (num2) => faker.string.alphanumeric(num2),
    nanoid: (num) => faker.string.alphanumeric(num),
};

jest.mock("nanoid", () => mockNanoid);

beforeEach(() => {
    jest.resetAllMocks();
    expect.hasAssertions();
    document.body.innerHTML = `
    <div>
      <main id="root"></main>
      <div id="portal-root"></div>
      <div id="backLink"><div>
    </div>
  `;
});
