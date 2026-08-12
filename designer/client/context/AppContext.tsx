import { createContext } from "react";

export interface LastModifiedForm {
    formGroup: string;
    formName: string;
    formKey: string;
}

const initialState = {
    lastModifiedForm: undefined,
    setLastModifiedForm: () => undefined,
    previouslyUploadedFile: "",
    setPreviouslyUploadedFile: () => undefined,
    uploadedFile: undefined,
    setUploadedFile: () => undefined,
    hasNewFileBeenUploaded: false,
    incorrectFileType: false,
    setIncorrectFileTypeError: (err: boolean) => undefined,
};

export const AppContext = createContext<{
    lastModifiedForm: LastModifiedForm | undefined;
    setLastModifiedForm: React.Dispatch<React.SetStateAction<undefined>>;
    previouslyUploadedFile?: string;
    setPreviouslyUploadedFile: (fileName) => void;
    uploadedFile: File | undefined | null;
    setUploadedFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
    hasNewFileBeenUploaded: boolean;
    incorrectFileType: boolean;
    setIncorrectFileTypeError: (err: boolean) => void;
}>(initialState);
