import { nanoid } from "nanoid";

const useUid = (): string => {
    return nanoid(5);
};

export default useUid;
