import React, { useCallback, useEffect, useMemo, useState } from "react";
import Autocomplete from "accessible-autocomplete/react";

export type AutocompleteOptions = {
    id: string;
    key?: string;
    title: string;
};

type Props = {
    id: string;
    name: string;
    value: string;
    options: AutocompleteOptions[];
    onChange: (nextId: string) => void;
    hasError?: boolean;

    /** Optional id that should be treated as “null/clear” when selected (e.g., 'none'). */
    nullOptionId?: string;
    /** Menu heading text (non-clickable). If empty, heading is hidden. */
    headingText?: string;
    /** “No results” text (supports \n line breaks). */
    noResultsText?: string;
    /** Minimum characters before suggestions appear. Default: 2. */
    minLength?: number;
    /** Show all values on click. Default: true. */
    showAllValues?: boolean;
    /** 'overlay' used for flyout. */
    displayMenu?: "overlay" | "inline";
    /** Prevent accidental confirm when closing flyout. Default: false. */
    confirmOnBlur?: boolean;
    /** Additional classes to add to the input element. */
    inputClasses?: string;
    /** Additional classes to add to the menu element. */
    menuClasses?: string;
};

/* --- Safe HTML helpers for suggestion highlighting --- */
const escapeHtml = (s: unknown) =>
    String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

/** Bold (<strong>) every case-insensitive occurrence of `query` in `label`. */
const highlightMatches = (label: string, query: string) => {
    if (!query) return escapeHtml(label);
    const src = String(label);
    const lc = src.toLowerCase();
    const q = String(query).toLowerCase();

    let out = "";
    let from = 0;
    let idx = lc.indexOf(q, from);

    while (idx !== -1) {
        out += escapeHtml(src.slice(from, idx)); // text before match
        out +=
            "<strong>" +
            escapeHtml(src.slice(idx, idx + q.length)) +
            "</strong>";
        from = idx + q.length;
        idx = lc.indexOf(q, from);
    }
    out += escapeHtml(src.slice(from));
    return out;
};

const AutocompleteInput = (props: Props) => {
    const {
        id,
        name,
        value,
        options,
        onChange,
        hasError = false,
        nullOptionId,
        headingText = "",
        noResultsText = "No results found",
        minLength = 3,
        showAllValues = true,
        displayMenu = "overlay",
        confirmOnBlur = false,
        inputClasses = "",
        menuClasses = "",
    } = props;

    const [instanceKey, setInstanceKey] = useState(0);

    /** Prefill text for the input (defaultValue must be a STRING per AA docs). */
    const defaultLabel = options.find((o) => o.id === value)?.title ?? "";

    /**
     * SOURCE: If at least one option matches the query (case-insensitive substring),
     * return ALL options; otherwise NONE. Precompute highlighted HTML once here. */
    const source = useCallback(
        (query: string, populateResults: (rows: any[]) => void) => {
            const q = (query ?? "").trim().toLowerCase();
            const anyMatch =
                q.length > 0 &&
                options.filter((o) => o.title.toLowerCase().includes(q));

            const rows = anyMatch
                ? anyMatch.map((o) => ({
                      ...o,
                      __html: highlightMatches(o.title, q),
                  }))
                : [];

            populateResults(rows);
        },
        [options]
    );

    /**
     * TEMPLATES:
     * - inputValue: string to insert into the input after selection.
     * - suggestion: HTML string for each row.
     * AA may pass a plain string (seeded from defaultValue) at first focus,
     * so we handle both string and object values.  */
    const templates = useMemo(
        () => ({
            inputValue: (v: unknown) =>
                typeof v === "string" ? v : (v as any)?.title ?? "",

            suggestion: (v: unknown) => {
                if (typeof v === "string") return escapeHtml(v);
                return (
                    (v as any)?.__html ?? escapeHtml((v as any)?.title ?? "")
                );
            },
        }),
        []
    );

    /**
     * onConfirm:
     * - Normal path: AA passes the OBJECT we returned in `source` => use `id`.
     * - Prefilled-edge-case: clicking the seeded default string returns a STRING;
     *   if it equals `defaultLabel`, keep the current value; otherwise ignore.  */
    const handleConfirm = (selected: any) => {
        if (typeof selected === "string") {
            if (selected === defaultLabel) {
                onChange(value ?? "");
            }
            // Ignore other strings.
            return;
        }

        if (!selected) {
            onChange("");
            return;
        }

        if (nullOptionId && selected.id === nullOptionId) {
            onChange("");
            return;
        }

        onChange(selected.id ?? "");
    };

    // Add id-based blur listener
    useEffect(() => {
        const input = document.getElementById(
            `${name}-${id}`
        ) as HTMLInputElement | null;
        if (!input) return;

        const handleBlur = () => {
            const text = input.value.trim();
            const matchesOption = options.some(
                (o) => o.title.toLowerCase() === text.toLowerCase()
            );

            if (!matchesOption) {
                setInstanceKey((k) => k + 1);
                onChange(""); // clear stored value
            }
        };

        input.addEventListener("blur", handleBlur);
        return () => input.removeEventListener("blur", handleBlur);
    }, [id, options, onChange]);

    return (
        <div
            className={`${
                hasError
                    ? "govuk-form-group govuk-form-group--error"
                    : "govuk-form-group"
            } govuk-!-margin-0`}
        >
            <Autocomplete
                key={instanceKey}
                id={`${name}-${id}`}
                source={source}
                templates={templates}
                minLength={minLength}
                confirmOnBlur={confirmOnBlur}
                onConfirm={handleConfirm}
                defaultValue={instanceKey === 0 ? defaultLabel : ""} // visually empty on remount
                displayMenu={displayMenu}
                showAllValues={showAllValues}
                showNoOptionsFound={true}
                tNoResults={() => noResultsText}
                menuClasses={`govuk-label menu--with-heading menu--custom ${menuClasses}`}
                menuAttributes={{
                    "data-heading": headingText || "",
                }}
                inputClasses={inputClasses}
            />
        </div>
    );
};

export default AutocompleteInput;
