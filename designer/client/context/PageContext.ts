import { createContext } from "react";

export const PageContext = createContext({
    count: 0,
    increment: () => {},
    decrement: () => {},
});
