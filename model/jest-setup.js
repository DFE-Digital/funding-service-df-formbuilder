const mockNanoid = {
    customAlphabet: (str, num1) => (num2) => "123qwerty45",
    nanoid: (num) => "12qwe3",
};

jest.mock("nanoid", () => mockNanoid);
