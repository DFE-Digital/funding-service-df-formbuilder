// copyUtils.js - Utility functions for copy to clipboard functionality

/**
 * Core copy function based on copy-to-clipboard library
 * @param {string} text - Text to copy
 * @param {Object} options - Copy options
 * @returns {boolean} - Success status
 */
export const copyToClipboard = (text, options = {}) => {
    let success = false;
    const debug = options.debug || false;

    try {
        // Create a temporary element
        const mark = document.createElement("span");
        mark.textContent = text;
        mark.ariaHidden = "true";
        mark.style.all = "unset";
        mark.style.position = "fixed";
        mark.style.top = "0";
        mark.style.clip = "rect(0, 0, 0, 0)";
        mark.style.whiteSpace = "pre";
        mark.style.webkitUserSelect = "text";
        mark.style.MozUserSelect = "text";
        mark.style.msUserSelect = "text";
        mark.style.userSelect = "text";

        // Add copy event listener
        mark.addEventListener("copy", function (e) {
            e.stopPropagation();
            if (options.format) {
                e.preventDefault();
                if (typeof e.clipboardData === "undefined") {
                    // IE 11
                    debug && console.warn("unable to use e.clipboardData");
                    window.clipboardData.clearData();
                    const format =
                        options.format === "text/html" ? "Url" : "Text";
                    window.clipboardData.setData(format, text);
                } else {
                    // Modern browsers
                    e.clipboardData.clearData();
                    e.clipboardData.setData(options.format, text);
                }
            }
            if (options.onCopy) {
                e.preventDefault();
                options.onCopy(e.clipboardData);
            }
        });

        document.body.appendChild(mark);

        // Create range and select
        const range = document.createRange();
        const selection = document.getSelection();
        range.selectNodeContents(mark);
        selection.removeAllRanges();
        selection.addRange(range);

        // Execute copy command
        const successful = document.execCommand("copy");
        if (!successful) {
            throw new Error("copy command was unsuccessful");
        }
        success = true;

        // Cleanup
        document.body.removeChild(mark);
        selection.removeAllRanges();
    } catch (err) {
        debug && console.error("unable to copy using execCommand: ", err);
        try {
            window.clipboardData.setData(options.format || "text", text);
            options.onCopy && options.onCopy(window.clipboardData);
            success = true;
        } catch (err) {
            debug && console.error("unable to copy using clipboardData: ", err);
            const message = "Copy to clipboard: Ctrl+C, Enter";
            window.prompt(message, text);
        }
    }

    return success;
};

/**
 * Convert HTML content to formatted text for notepad
 * @param {string} htmlString - HTML content to convert
 * @returns {string} - Formatted plain text
 */
export const htmlToFormattedText = (htmlString) => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;

    // Function to recursively process nodes
    const processNode = (node) => {
        let text = "";

        for (let child of node.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
                // Add text content, trimming excessive whitespace
                const textContent = child.textContent
                    .replace(/\s+/g, " ")
                    .trim();
                if (textContent) {
                    text += textContent;
                }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                const tagName = child.tagName.toLowerCase();

                switch (tagName) {
                    case "li":
                        text += "\n• " + processNode(child).trim();
                        break;
                    case "ul":
                    case "ol":
                        text += "\n" + processNode(child);
                        break;
                    case "br":
                        text += "\n";
                        break;
                    case "p":
                    case "div":
                        const childText = processNode(child).trim();
                        if (childText) {
                            text += "\n" + childText;
                        }
                        break;
                    case "b":
                    case "strong":
                        text += processNode(child);
                        break;
                    case "h1":
                    case "h2":
                    case "h3":
                    case "h4":
                    case "h5":
                    case "h6":
                        text += "\n" + processNode(child).trim() + "\n";
                        break;
                    default:
                        text += processNode(child);
                }
            }
        }

        return text;
    };

    let formattedText = processNode(tempDiv);

    // Clean up the text
    formattedText = formattedText
        .replace(/\n\s*\n\s*\n/g, "\n\n") // Remove excessive line breaks
        .replace(/^\s+|\s+$/g, "") // Trim start and end
        .replace(/\n\s+/g, "\n") // Remove spaces after line breaks
        .replace(/\s+\n/g, "\n"); // Remove spaces before line breaks

    return formattedText;
};

/**
 * Find and copy content from elements with specific class name
 * @param {string} className - CSS class name to search for (default: 'copy-clipboard')
 * @param {Object} options - Copy options
 * @returns {boolean} - Success status
 */
export const copyFromClassElements = (
    className = "copy-clipboard",
    options = {}
) => {
    try {
        // Find all elements with the specified class
        const elements = document.querySelectorAll(`.${className}`);

        if (elements.length === 0) {
            console.error(`No elements found with class "${className}"`);
            if (options.onError) {
                options.onError(`No elements found with class "${className}"`);
            }
            return false;
        }

        // Combine content from all matching elements
        let combinedContent = "";
        elements.forEach((element, index) => {
            const htmlContent = element.innerHTML;
            const formattedText = htmlToFormattedText(htmlContent);

            if (index > 0) {
                combinedContent += "\n\n"; // Add spacing between multiple elements
            }
            combinedContent += formattedText;
        });

        // Copy the combined content
        const success = copyToClipboard(combinedContent, {
            format: "text/plain",
            debug: options.debug || false,
            onCopy: options.onCopy,
        });

        if (success && options.onSuccess) {
            options.onSuccess(combinedContent);
        }

        if (!success && options.onError) {
            options.onError("Failed to copy content to clipboard");
        }

        return success;
    } catch (error) {
        console.error("Error copying from class elements:", error);
        if (options.onError) {
            options.onError(error.message);
        }
        return false;
    }
};
