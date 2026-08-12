/**
 * Validates the selected based on type and extension
 * @param selectedFile
 * @param acceptedTypes
 * @param acceptedExtensions
 * @returns
 */
export const validateFileTypeAndExtension = (
    selectedFile: File,
    acceptedTypes: string[],
    acceptedExtensions: string[]
) => {
    const fileExt = selectedFile.name.split(".").pop();
    const isSupportedExtension = acceptedExtensions.includes(
        `.${fileExt?.toLowerCase()}` ?? ""
    );
    const isSupportedType = acceptedTypes.includes(selectedFile.type);
    return !(isSupportedType || isSupportedExtension);
};

/** Validates the selected file based on its name
 * ( to not allow consecutive special characters )
 * @param selectedFile
 * @returns
 */
export const validateFileName = (selectedFile: File) => {
    const specialCharactersNotToBeRepeated = [
        "%",
        "\\",
        "/",
        "&",
        "?",
        ",",
        "'",
        '"',
        ";",
        ":",
        "!",
        "-",
        "+",
        "=",
    ];
    const regExpForConsSpecialChar = new RegExp(
        `^(?!.*[\\${specialCharactersNotToBeRepeated.join("\\")}]{2}).*$`
    );
    const result = regExpForConsSpecialChar.test(selectedFile.name);
    return !result;
};
