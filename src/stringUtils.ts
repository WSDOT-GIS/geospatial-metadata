/**
 * Converts a string to a valid class name.
 * @param {string} s - A string.
 * @returns {string} valid class name string
 */
export function toValidClassName(s: string): string {
    if (s) {
        s = s.replace(/[^\-a-z0-9]+/i, "-");
    }
    return s;
}

/**
 * Capitalizes the first character in a string.
 * @param {string} s - A string
 * @returns {string} - A copy of the input string, but with the first character capitalized.
 */
export function capitalizeFirstCharacter(s: string): string {
    const output = Array.from(s, (char, i) => {
        if (i === 0) {
            return char.toUpperCase();
        } else {
            return char;
        }
    });
    return output.join("");
}
