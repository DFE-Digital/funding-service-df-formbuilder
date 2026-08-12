import config from "server/config";


/**
 * Sets the expiry in .env configurations and calculates the number of seconds until the expiry.
 *
 * @return {number} The number of seconds until the expiry.
 */
export const setExpiry = () => {
    // Set expiry in .env configurations
    const EXPIRY_VALUE = process.env.REDIS_KEY_EXPIRY ?? "23:59";
    // split hours and minutes
    const endHours = Number(EXPIRY_VALUE?.split(":")[0]);
    const endMinutes = Number(EXPIRY_VALUE?.split(":")[1]);
    // convert to ISO standard time
    const endDay = new Date(
        new Date(new Date().setHours(endHours, endMinutes, 59, 999))
            .toString()
            .split("GMT")[0] + " UTC"
    ).toISOString();
    // Current time
    const currentTime = new Date();
    // end time in proper date format
    const endDate = new Date(endDay);
    // End time - current time in seconds
    const seconds = Math.floor(
        (endDate.getTime() - currentTime.getTime()) / 1000
    );
    return seconds;
};

export const debugConsoleLog = (...args) => {
    const { isDebugging } = config
    if (isDebugging) {
        console.log(args)
    } else return;
}