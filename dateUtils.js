/// <reference path="./typings/globals/es2015-array/index.d.ts" />
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    var dateNodeNamesRe = /(?:(?:(?:pub)|(?:cal)|(?:proc))date)|(?:metd)/;
    /**
     * Parses a yyyyMMdd date string into a date object.
     * @param {string} yyyyMMdd - Date string - Parts can optionally be separated by dashes or slashes.
     * @param {string} [hhmmss] - Time string
     * @returns {Date} Returns a date object equivalent to the input date and time strings.
     * @throws {Error} Throws an error if yyyyMMdd is in an unexpected format.
     */
    function parseDate(yyyyMMdd, hhmmss) {
        /**
         * Calls the date constructor with a variable number of parameters.
         */
        function createDate(a, b, c, d, e, f) {
            if (c === void 0) { c = 0; }
            if (d === void 0) { d = 0; }
            if (e === void 0) { e = 0; }
            if (f === void 0) { f = 0; }
            return new Date(a, b, c, d, e, f);
        }
        var re = /^(\d{4})(?:[-\/]?([0-1]\d)(?:[-\/]?([0-3]\d)?)?)?$/i;
        var match = yyyyMMdd.match(re);
        var date;
        if (match) {
            // Remove the first element, which is the entire matched part of the string.
            // We only want the digit groups.
            match = match.slice(1);
            // Create an array of the integers in the date string.
            var parts = [];
            // Loop through all of the matched parts, and add to number array,
            // stopping when a non-numerical string is found.
            for (var _i = 0, match_1 = match; _i < match_1.length; _i++) {
                var s = match_1[_i];
                var n = void 0;
                if (s !== undefined && s.length) {
                    n = parseInt(s, 10);
                    if (!isNaN(n)) {
                        parts.push(n);
                    }
                    else {
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
                var timeMatch = hhmmss.match(re);
                if (timeMatch) {
                    parts = parts.concat(timeMatch.map(function (s) {
                        return parseInt(s, 10);
                    }));
                }
            }
            // Stupidly, JavaScript Date months (and ONLY months) are zero based.
            // Decrease parsed month value by one.
            if (parts.length >= 2) {
                parts[1] = parts[1] - 1;
            }
            if (parts.length >= 3) {
                date = createDate.apply(null, parts);
            }
            else {
                date = createDate.apply(this, parts);
                var options = parts.length == 1 ? {
                    year: "numeric",
                    month: "long"
                }
                    : {
                        year: "numeric"
                    };
                var fmt = new Intl.DateTimeFormat(undefined, options);
                date = fmt.format(date);
            }
        }
        else {
            // If an unexpected date format is encountered,
            // try parsing using JavaScript built-in method.
            var dateInt = Date.parse(yyyyMMdd);
            if (!isNaN(dateInt)) {
                date = new Date(dateInt);
            }
            else {
                throw new Error("Unexpected date format");
            }
        }
        return date;
    }
    exports.parseDate = parseDate;
});
