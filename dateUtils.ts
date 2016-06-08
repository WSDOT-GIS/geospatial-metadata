/// <reference path="./typings/globals/es2015-array/index.d.ts" />

let dateNodeNamesRe = /(?:(?:(?:pub)|(?:cal)|(?:proc))date)|(?:metd)/;

/**
 * Parses a yyyyMMdd date string into a date object.
 * @param {string} yyyyMMdd - Date string - Parts can optionally be separated by dashes or slashes.
 * @param {string} [hhmmss] - Time string
 * @returns {Date} Returns a date object equivalent to the input date and time strings.
 * @throws {Error} Throws an error if yyyyMMdd is in an unexpected format.
 */
export function parseDate(yyyyMMdd: string, hhmmss?: string): Date | string {

    /**
     * Calls the date constructor with a variable number of parameters.
     */
    function createDate(a: number, b: number, c: number = 0, d: number = 0, e: number = 0, f: number = 0) {
        return new Date(a, b, c, d, e, f);
    }

    let re = /^(\d{4})(?:[-\/]?([0-1]\d)(?:[-\/]?([0-3]\d)?)?)?$/i;
    let match = yyyyMMdd.match(re);
    var date;
    if (match) {
        // Remove the first element, which is the entire matched part of the string.
        // We only want the digit groups.
        match = match.slice(1);

        // Create an array of the integers in the date string.
        let parts: number[] = [];
        // Loop through all of the matched parts, and add to number array,
        // stopping when a non-numerical string is found.
        for (let s of match) {
            let n: number;
            if (s !== undefined && s.length) {
                n = parseInt(s, 10);
                if (!isNaN(n)) {
                    parts.push(n);
                } else {
                    n = undefined;
                }
            }
            if (n === undefined) {
                break;
            }
        }

        // Parse the time from string if provided and
        // if the date value represents a specific day
        // of the year (as opposed to just a year or a month.)
        if (hhmmss && parts.length > 3) {
            // Match each occurance of a number
            re = /\d{2}/g;
            let timeMatch = hhmmss.match(re);
            if (timeMatch) {
                parts = parts.concat(timeMatch.map((s) => {
                    return parseInt(s, 10);
                }))
            }
        }

        // Stupidly, JavaScript Date months (and ONLY months) are zero based.
        // Decrease parsed month value by one.
        if (parts.length >= 2) {
            parts[1] = parts[1] - 1;
        }

        if (parts.length >= 3) {
            date = createDate.apply(null, parts);
            // date = new Date(...parts);
        } else {
            date = createDate.apply(this, parts);
            let options: Intl.DateTimeFormatOptions = parts.length == 1 ? {
                year: "numeric",
                month: "long"
            }
                : {
                    year: "numeric"
                }

            let fmt = new Intl.DateTimeFormat(undefined, options);
            date = fmt.format(date);
        }
    } else {
        // If an unexpected date format is encountered,
        // try parsing using JavaScript built-in method.
        let dateInt = Date.parse(yyyyMMdd);
        if (!isNaN(dateInt)) {
            date = new Date(dateInt);
        } else {
            throw new Error("Unexpected date format");
        }
    }

    return date;
}