export const renderDate = (dateString: Date): string => {
    const date = new Date(dateString);
    const year = date.getFullYear().toString();
    const month = date.getMonth() + 1; // Because Months are zero indexed
    const monthStr = month.toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    const time = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    return `${year}/${monthStr}/${day}, ${time}`;
};
