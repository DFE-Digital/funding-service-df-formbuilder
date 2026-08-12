import { Options } from "./types";

interface ConditionAction {
    type: Options.EDIT_OPTIONS_CONDITION;
    payload: string;
}

interface AnyAction {
    type: Options;
    payload: any;
}

type OptionsActions = ConditionAction | AnyAction;

export function optionsReducer(state, action: OptionsActions) {
    const { type, payload } = action;
    const { selectedComponent } = state;
    const { options, fileTypes = [] } = selectedComponent;
    switch (type) {
        case Options.EDIT_OPTIONS_HIDE_TITLE:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    options: { ...options, hideTitle: payload },
                },
            };
        case Options.EDIT_OPTIONS_REQUIRED:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    options: { ...options, required: payload },
                },
            };
        case Options.EDIT_OPTIONS_ROWS:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    options: { ...options, rows: payload },
                },
            };

        case Options.EDIT_OPTIONS_HIDE_OPTIONAL:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    options: { ...options, optionalText: payload },
                },
            };
        case Options.EDIT_OPTIONS_FILE_UPLOAD_MULTIPLE:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    addedFileTypes: payload,
                },
            };
        case Options.EDIT_OPTIONS_CLASSES:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    options: { ...options, classes: payload },
                },
            };

        case Options.EDIT_OPTIONS_MAX_DAYS_IN_FUTURE:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    options: { ...options, maxDaysInFuture: payload },
                },
            };
        case Options.EDIT_OPTIONS_MAX_DAYS_IN_PAST:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    options: { ...options, maxDaysInPast: payload },
                },
            };
        case Options.EDIT_DATA_IMPORT:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    columns: [...(selectedComponent.columns || []), payload],
                },
            };
        case Options.EDIT_DELETE_COLUMN:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    columns: payload,
                },
            };
        case Options.COLUMN_EDITED:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    columnEdited: payload,
                },
            };
        case Options.COMPONENT_EDITED:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    componentEdited: payload,
                },
            };
        case Options.EDIT_OPTIONS_CONDITION:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    options: { ...options, condition: payload },
                },
            };
        case Options.EDIT_OPTIONS_TYPE:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    options: { ...options, type: payload },
                },
            };
        case Options.EDIT_OPTIONS_AUTOCOMPLETE:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    options: { ...options, autocomplete: payload },
                },
            };
        case Options.EDIT_OPTIONS_CUSTOM_MESSAGE:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    options: { ...options, customValidationMessage: payload },
                },
            };
        case Options.EDIT_OPTIONS_LIST_FORMAT:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    options: { ...options, format: payload },
                },
            };
        case Options.EDIT_OPTIONS_ADD_PREFIX_TYPE:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    options: { ...options, prefixType: payload },
                },
            };
        case Options.EDIT_OPTIONS_ADD_SUFFIX_TYPE:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    options: { ...options, suffixType: payload },
                },
            };
        case Options.EDIT_OPTIONS_ADD_PREFIX_VALUE:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    options: { ...options, prefixValue: payload },
                },
            };
        case Options.EDIT_OPTIONS_ADD_SUFFIX:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    options: { ...options, suffixValue: payload },
                },
            };
        case Options.EDIT_OPTIONS_HIDE_RESULT:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    options: { ...options, hideResult: payload },
                },
            };
        case Options.EDIT_OPTIONS_HIDE_RESULT_ON_PAGE: {
            const updatedOptions = { ...options };

            if (
                Object.prototype.hasOwnProperty.call(
                    updatedOptions,
                    "hideResult"
                )
            ) {
                const legacy = updatedOptions.hideResult as boolean;

                // Backfill sibling from legacy on first migration
                updatedOptions.hideResultOnSummary = legacy;

                delete updatedOptions.hideResult;
            }

            updatedOptions.hideResultOnPage = payload;

            return {
                selectedComponent: {
                    ...selectedComponent,
                    options: updatedOptions,
                },
            };
        }
        case Options.EDIT_OPTIONS_HIDE_RESULT_ON_SUMMARY: {
            const updatedOptions = { ...options };

            if (
                Object.prototype.hasOwnProperty.call(
                    updatedOptions,
                    "hideResult"
                )
            ) {
                const legacy = updatedOptions.hideResult as boolean;

                // Backfill sibling from legacy on first migration
                updatedOptions.hideResultOnPage = legacy;

                delete updatedOptions.hideResult;
            }

            updatedOptions.hideResultOnSummary = payload;

            return {
                selectedComponent: {
                    ...selectedComponent,
                    options: updatedOptions,
                },
            };
        }
        case Options.EDIT_OPTIONS_BOLD:
            return {
                selectedComponent: {
                    ...selectedComponent,
                    options: { ...options, bold: payload },
                },
            };
    }
}
