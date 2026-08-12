// CopyButton.tsx - Simple copy button component
import React, { useState, useCallback } from "react";
import { copyFromClassElements } from "../utils/copyToClipboard";

/**
 * Simple Copy Button Component
 * Searches for elements with 'copy-clipboard' class and copies their content
 */
export const CopyButton = ({
    // children = "Copy",
    className = "copy-clipboard",
    onSuccess,
    onError,
    disabled = false,
    ...props
}) => {
    const [message, setMessage] = useState("");

    const handleCopy = useCallback(() => {
        if (disabled) return;

        setMessage("");

        // Copy content from elements with specified class
        copyFromClassElements(className, {
            onSuccess: (text) => {
                setMessage("copied");
                if (onSuccess) onSuccess(text);

                // Clear message after 2 seconds
                setTimeout(() => setMessage(""), 2000);
            },
            onError: (error) => {
                setMessage("unable to copy");
                if (onError) onError(error);

                // Clear message after 2 seconds
                setTimeout(() => setMessage(""), 2000);
            },
        });
    }, [className, onSuccess, onError, disabled]);

    return (
        <div>
            <button
                className="govuk-button govuk-button--secondary govuk-!-margin-bottom-3"
                onClick={handleCopy}
                disabled={disabled}
                type="button"
                {...props}
            >
                Copy details to clipboard
            </button>
            {message && (
                <p className="govuk-body govuk-!-margin-0">{message}</p>
            )}
        </div>
    );
};
