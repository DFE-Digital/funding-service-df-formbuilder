import { i18n } from "../i18n/index";

/* Always use 'title' as key inside your translation json to use dynamic value like formname*/
export const stringToHTMLFromJSON = (translationKey, dynamicMsg?) => {
    const message = `<span>${i18n(translationKey, {
        title: dynamicMsg,
    })}</span>`;
    return { __html: message };
};
