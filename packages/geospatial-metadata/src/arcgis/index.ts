/**
 * This module is for ArcGIS Metadata. 
 * @module
 */

import { parseDate } from "../dateUtils";

/**
 * Date data extracted from an XML element.
 */
interface ExtractDateOutput {
    prefix: string | null;
    date: Date | string | null;
    timeElement: ChildNode | null;
}

const dateElementPrefixRe = /^\w+(?=Date)/;

/**
 * Get the part of the element name that prefixes "Date".
 * E.g., "Sync" for "SyncDate".
 * @param elementOrName An element or an element's nodeName.
 * @param prefixRe Regular expression that determines the format of an element name containing a date.
 * @returns If the input was in the expected format, return the part of the string 
 * that comes before "...Date". Returns null otherwise.
 */
function getPrefixFromDateElementName(elementOrName: Node | string, prefixRe = dateElementPrefixRe) {
    // Get the part of the element name that prefixes "Date".
    // E.g., "Sync" for "SyncDate".
    const elementName = typeof elementOrName === "string" ? elementOrName : elementOrName.nodeName;
    const prefixMatch = elementName.match(prefixRe);
    if (!prefixMatch) {
        return null;
    }
    const prefix = prefixMatch[0];
    return prefix;
}

/**
 * 
 * @param dateElement An element containing a string representing a date.
 * @example A SyncDate element
 * @returns An object with all extracted date and time data that could be found.
 */
export function extractDate(dateElement: Node, prefixRe = dateElementPrefixRe): ExtractDateOutput {

    // Get matching time element from given date element.
    const prefix = getPrefixFromDateElementName(dateElement, prefixRe);

    let timeString: string | undefined;
    let date: Date | string | null = null;
    let timeElement: ChildNode | null = null;

    if (prefix) {
        // Get the corresponding time element.
        const timeElementName = `${prefix}Time`;
        // Filter the parent elements children to only get the corresponding ...Time node.
        const timeElements = dateElement.parentNode?.childNodes ? Array.from(dateElement.parentNode?.childNodes).filter(e => e.nodeName === timeElementName) : null;
        if (timeElements) {
            timeElement = timeElements[0];
            timeString = timeElements[0].nodeValue || undefined;
        }
    }
    const dateString = dateElement.nodeValue;

    if (dateString) {
        date = parseDate(dateString, timeString || undefined);
    }

    return { prefix, date, timeElement };
}

function* iterateNodes(element: Node, prefixRe: RegExp = dateElementPrefixRe) {
    for (const n of element.childNodes) {
        const { date, prefix } = extractDate(n);
        if (date) {
            yield [prefix, date] as [string, Date | string];
        }
    };
}

/**
 * Extracts the dates from child elements of input node
 * @param element 
 * @returns A mapping of dates keyed by prefix names.
 */
export function extractDates(element: Node, prefixRe = dateElementPrefixRe) {
    if (!element.hasChildNodes()) {
        return new Map<string, string | Date>(iterateNodes(element, prefixRe));
    }
    return null;
}