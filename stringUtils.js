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
    /**
     * Converts a string to a valid class name.
     * @param {string} s - A string.
     * @returns {string} valid class name string
     */
    function toValidClassName(s) {
        if (s) {
            s = s.replace(/[^\-a-z0-9]+/i, "-");
        }
        return s;
    }
    exports.toValidClassName = toValidClassName;
    /**
     * Capitalizes the first character in a string.
     * @param {string} s - A string
     * @returns {string} - A copy of the input string, but with the first character capitalized.
     */
    function capitalizeFirstCharacter(s) {
        var output = Array.from(s, function (char, i) {
            if (i === 0) {
                return char.toUpperCase();
            }
            else {
                return char;
            }
        });
        return output.join("");
    }
    exports.capitalizeFirstCharacter = capitalizeFirstCharacter;
});
