import moment from "moment";

/**
 * Converts date time string format to desired form
 * i.e from "YYYY/MM/DD h:mm" to "YYYY/MM/DD h:mm:ss A"
 * @param dateTimeStr
 * @returns string formattedDate
 */
export const convertDateTimeString = (dateTimeStr: string): string => {
    const isCorrectFormat = /^d{4}\/\d{2}\/\d{2}, \d{1,2}:\d{2}:\d{2} [APMapm]{2}$/.test(
        dateTimeStr
    );

    const actualDate = isCorrectFormat
        ? moment(dateTimeStr, "YYYY/MM/DD, h:mm:ss A")
        : moment(dateTimeStr, "YYYY/MM/DD h:mm");

    const formattedDate = actualDate.format("YYYY/MM/DD, h:mm:ss A");
    return formattedDate;
};

export const getTimestampStr = (date: Date): string => {
    return moment(date).format("YYYY/MM/DD, h:mm:ss A");
};

export const getDateDetailsFromStr = (dateStr?: string) => {
    if (!dateStr) return null;
    const momentDate = moment(dateStr, "YYYY/MM/DD, h:mm:ss A");
    return {
        day: momentDate.date(),
        month: momentDate.month() + 1, // adding 1 since it returns zero-indexed value
        year: momentDate.year(),
        hour: momentDate.hour(),
        minute: momentDate.minute(),
    };
};
export const convertLastDownloaded = (dateTimeStr: string): string => {
    const isCorrectFormat = /^d{2}\/\d{2}\/\d{4}, \d{1,2}:\d{2}:\d{2} [APMapm]{2}$/.test(
        dateTimeStr
    );

    const actualDate = isCorrectFormat
        ? moment(dateTimeStr, "DD/MM/YYYY, h:mm:ss a")
        : moment(dateTimeStr, "YYYY/MM/DD, h:mm:ss a");

    const formattedDate = actualDate.format("YYYY/MM/DD, h:mm:ss A");
    return formattedDate;
};
