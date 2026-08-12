import { Fields } from "./types";

export function fieldsReducer(
    state,
    action: {
        type: Fields;
        payload: any;
    }
) {
    const { type, payload } = action;
    const { selectedComponent } = state;

    switch (type) {
        case Fields.EDIT_CONTENT:
            return {
                selectedComponent: { ...selectedComponent, content: payload },
            };
        case Fields.EDIT_TITLE:
            return {
                selectedComponent: { ...selectedComponent, title: payload },
            };
        case Fields.EDIT_NAME: {
            return {
                ...state,
                selectedComponent: {
                    ...selectedComponent,
                    name: payload,
                    nameHasError: /\s/g.test(payload),
                },
            };
        }
        case Fields.EDIT_TYPE: {
            return {
                ...state,
                selectedComponent: {
                    ...selectedComponent,
                    ...payload,
                },
            };
        }
        case Fields.EDIT_HELP:
            return {
                ...state,
                selectedComponent: { ...selectedComponent, hint: payload },
            };
        case Fields.EDIT_DOCUMENT:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    selectedDocument: payload,
                },
            };
        case Fields.DOCUMENT_NAME:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    documentName: payload,
                },
            };
        case Fields.DOCUMENT_FIELDS:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    columnNames: payload,
                },
            };
        case Fields.ADD_PREFIX_TYPE:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    prefixType: payload,
                },
            };
        case Fields.ADD_PREFIX_VALUE:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    prefixValue: payload,
                },
            };
        case Fields.ADD_SUFFIX:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    suffixValue: payload,
                },
            };
        case Fields.ADD_CONDITION:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    condition: payload,
                },
            };
        case Fields.ADD_DISPLAY_NAME:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    displayName: payload,
                },
            };
        case Fields.ADD_CALCULATION:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    ...payload,
                },
            };
    }
}
