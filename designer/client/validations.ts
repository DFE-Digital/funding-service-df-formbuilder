import { isEmpty } from "./helpers";
import { i18n } from "./i18n";

export function hasValidationErrors(errors = {}) {
    return Object.keys(errors).length > 0;
}

export function validateNotEmpty(
    id: string,
    fieldName: string,
    key: string,
    value: string,
    existingErrors = {}
) {
    const hasErrors = isEmpty(value);
    const errors = existingErrors;

    if (hasErrors) {
        errors[key] = {
            href: `#${id}`,
            children: [i18n("errors.field", { field: fieldName })],
        };
    }
    return errors;
}

export function validateName(
    id: string,
    fieldName: string,
    value: string,
    i18nProp?: any
) {
    const translate = i18nProp ?? i18n;
    const namesIsEmpty = isEmpty(value);
    const nameHasErrors = /\s/g.test(value);
    const errors: any = {};
    if (nameHasErrors) {
        const message = translate
            ? translate("name.errors.whitespace")
            : "Name must not contain spaces";
        errors.name = {
            href: `#${id}`,
            children: [message],
        };
    } else if (namesIsEmpty) {
        const message = translate
            ? translate("errors.field", { field: fieldName })
            : "Enter Name";
        errors.name = {
            href: `#${id}`,
            children: [message],
        };
    }
    return errors;
}

export function validateTitle(id: string, value: string, i18nProp?: any) {
    const translate = i18nProp ?? i18n;
    const titleHasErrors = isEmpty(value);
    const errors: any = {};
    if (titleHasErrors) {
        const message = translate
            ? translate("errors.field", { field: "$t(title)" })
            : "Enter title";

        errors.title = {
            href: `#${id}`,
            children: [message],
        };
    }
    return errors;
}

export function validateCalculationName(
    id: string,
    value: string,
    i18nProp?: any
) {
    const translate = i18nProp ?? i18n;
    const calculationNameHasErrors = isEmpty(value);
    const errors: any = {};
    if (calculationNameHasErrors) {
        const message = translate
            ? translate("errors.field", { field: "$t(Calculation Name)" })
            : "Enter Calculation Name";

        errors.calculationName = {
            href: `#${id}`,
            children: [message],
        };
    }
    return errors;
}

export function validateDuplicateFormName(
    id: string,
    value: string,
    i18nProp?: any
) {
    const translate = i18nProp ?? i18n;
    const duplicateNameHasErrors = isEmpty(value);
    const errors: any = {};
    if (duplicateNameHasErrors) {
        const message = translate
            ? translate("errors.field", {
                  field:
                      "$t(a different form title - This title is already in use for a different form)",
              })
            : "This title is already in use for a different form";

        errors.duplicateFormName = {
            href: `#${id}`,
            children: [message],
        };
    }
    return errors;
}
