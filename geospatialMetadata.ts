/// <reference path="./typings/globals/es2015-array/index.d.ts" />
/// <reference path="./interfaces.d.ts" />

import * as csdgmAliases from "./csdgmAliases"

/**
 * XMLDocument
 * @external XMLDocument
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/XMLDocument XMLDocument}
 */

let dateNodeNamesRe = /(?:(?:(?:pub)|(?:cal)|(?:proc))date)|(?:metd)/;

/**
 * Converts a string to a valid class name.
 * @param {string} s - A string.
 * @returns {string} valid class name string
 */
function toValidClassName(s: string): string {
    if (s) {
        s = s.replace(/[^\-a-z0-9]+/i, "-");
    }
    return s;
}

let microFormats = {
    address: "p-street-address",
    city: "p-locality",
    state: "p-region",
    postal: "p-postal-code",
    country: "p-country-name",
    cntpos: "p-job-title",
    cntorg: "p-org",
    cntvoice: ["p-tel", "p-tel-voice", "p-tel-work"],
    cntinfo: "h-card",
    cntemail: "u-email"
};

/**
 * Parses a yyyyMMdd date string into a date object.
 * @param {string} yyyyMMdd - Date string - Parts can optionally be separated by dashes or slashes.
 * @param {string} [hhmmss] - Time string
 * @returns {Date} Returns a date object equivalent to the input date and time strings.
 * @throws {Error} Throws an error if yyyyMMdd is in an unexpected format.
 */
function parseDate(yyyyMMdd: string, hhmmss?: string): Date {

    //let date = new Date(...parts); // ES6 - doesn't work in IE.
    function createDate(a, b, c, d, e, f) {
        d = d || 0;
        e = e || 0;
        f = f || 0;
        return new Date(a, b, c, d, e, f);
    }

    let re = /(\d{4})[-\/]?(\d{2})[-\/]?(\d{2})/i;
    let match = yyyyMMdd.match(re);
    let date, timeMatch, parts;
    if (match) {
        // Remove the first element, which is the entire matched part of the string.
        // We only want the digit groups.
        match = match.slice(1);
        //match = match.map(function (s) { return parseInt(s, 10); });

        if (hhmmss) {
            // Match each occurance of a number
            re = /\d+/g;
            timeMatch = hhmmss.match(re);
            if (timeMatch) {
                match = match.concat(timeMatch);
            }
        }

        parts = match.map(function (p) {
            return parseInt(p, 10);
        });



        date = createDate.apply(null, parts);
    } else {
        throw new Error("Unexpected date format");
    }

    return date;
}

/**
 * Converts a Date into a <time> element
 * @param {string} dateString - A string representation of a date.
 * @param {string} [time] - An optional time string.
 * @return {HTMLTimeElement|HTMLUnknownElement} - If the browser supports it, an HTMLTimeElement will be returned. Otherwise an HTMLUnknownElement will be returned.
 * @throws {TypeError} Thrown if dateString is null, empty, undefined, or otherwise inproperly formatted.
 */
function toTimeNode(dateString: string, time?: string): HTMLElement | HTMLUnknownElement {
    let output, date;
    if (!dateString) {
        throw new TypeError("No date provided");
    }
    output = document.createElement("time");
    if (!(time && !/Unknown/i.test(time))) {
        date = parseDate(dateString);
        output.setAttribute("datetime", date.toISOString().replace(/T.+$/, ""));
        output.textContent = date.toLocaleDateString();
    } else {
        date = parseDate(dateString, time);
        output.setAttribute("datetime", date.toISOString());
        output.textContent = date.toLocaleString();
    }

    return output;
}

/**
 * Converts an XML element into an object.
 * @param {Element} node - XML Element
 * @returns {Object} - An object representation of the XML element.
 */
function toObject(node: Element): any {
    let output;
    let currentNode;

    if (node.childNodes && node.childNodes.length > 0) {
        output = {};
        for (let i = 0; i < node.childNodes.length; i++) {
            currentNode = node.childNodes[i];
            if (currentNode instanceof Text) {
                output = currentNode.textContent;
            } else {
                output[currentNode.nodeName] = toObject(currentNode);

            }

        }
    } else {
        output = node.textContent;
    }

    return output;
}

/**
 * Formats a single date element.
 * @param {Element} sngDateElement - A metadata element containing caldate and time elements.
 * @returns {HTMLElement} Returns an HTML element.
 */
function formatSngdate(sngDateElement: Element): HTMLElement {
    let calDateNode = sngDateElement.querySelector("caldate");
    let dateString, time, output;
    if (calDateNode) {
        dateString = sngDateElement.querySelector("caldate").textContent;
        time = sngDateElement.querySelector("time");
        time = time && time.textContent ? time.textContent : undefined;
        output = toTimeNode(dateString, time);
    } else {
        createErrorPreElement(sngDateElement);
    }
    return output;
}

/**
 * Formats the Contact Address (cntattr) node.
 * @param {XMLDocument|Element} node - A <cntattr> XML node
 * @returns {HTMLDocumentFragment} - Returns an HTML document fragment.
 * @throws {Error} Throws an error if node is not a cntaddr node.
 */
function formatAddress(node: XMLDocument | Element): HTMLElement {
    if (node.nodeName !== "cntaddr") {
        throw new Error("Expected cntaddr node");
    }

    // TODO: use different microformat for PO BOX vs. street address.

    let output = document.createElement("section");
    let addrtype: any = node.querySelector("addrtype");
    addrtype = addrtype.textContent || "";
    let addrClass = toValidClassName(addrtype);
    let label = document.createElement("h1");
    if (addrtype) {
        label.textContent = addrtype;
        output.appendChild(label);
    }

    let p = document.createElement("p");
    p.setAttribute("class", "h-addr address");
    if (addrClass) {
        p.classList.add(addrClass);
        p.classList.add("h-addr-" + addrClass);
    }



    ["address", "city", "state", "postal", "country"].forEach(function (propName) {
        let element = node.querySelector(propName);
        let span;
        if (element) {
            span = document.createElement("span");
            span.classList.add(propName);
            span.classList.add(microFormats[propName]);
            span.textContent = element.textContent;
            p.appendChild(span);
        }
    });
    let country: any = node.querySelector("country");
    if (country) {
        country = country.textContent;
        p.classList.add(["country", country].join("-").toLowerCase());
    }
    output.appendChild(p);
    return output;
}

/**
 * Creates a table of attributes
 * @param {XMLDocument|Element} node - An <eainfo> XML node.
 * @returns {HTMLTableElement} A table of the contents of the attributes.
 */
function createAttributesTable(node: Element): HTMLTableElement {
    let attrNodes = node.querySelectorAll("attr");
    let table = document.createElement("table");
    table.classList.add("attributes-table");
    table.createCaption().textContent = "Attributes for " + node.querySelector("detailed > enttyp > enttypl").textContent;
    let head = table.createTHead();
    head.innerHTML = "<tr><th>Label</th><th>Definition</th><th>Definition Source</th><th>Domain Values</th></tr>";
    let attrArray = Array.from(attrNodes, function (attrNode) {
        let row = table.insertRow(-1);
        let label = attrNode.querySelector("attrlabl");
        let def = attrNode.querySelector("attrdef");
        let attrdefs = attrNode.querySelector("attrdefs");
        let attrdomv = attrNode.querySelector("attrdomv");

        let cell = row.insertCell(-1);
        if (label && label.textContent) {
            cell.textContent = label.textContent || "";
        }

        cell = row.insertCell(-1);
        if (def && def.textContent) {
            cell.textContent = def.textContent || "";
        }

        cell = row.insertCell(-1);
        if (attrdefs) {
            cell.textContent = attrdefs.textContent;
        }

        cell = row.insertCell(-1);
        if (attrdomv) {
            cell.textContent = attrdomv.firstChild.textContent;
        }
    });

    return table;
}

/**
 * Converts a <keywords> XML element into a section containing lists.
 * @param {XMLDocument|Element} node - XML node: Either a <keywords> element or its parent.
 * @returns {HTMLSectionElement} Returns a <section> containing keyword lists.
 */
function createKeywordsLists(node: XMLDocument | Element): HTMLElement {
    if (node.nodeName !== "keywords") {
        node = node.querySelector("keywords");
    }

    let section = document.createElement("section");
    section.classList.add("keywords");
    let heading = document.createElement("h1");
    heading.textContent = "Keywords";
    section.appendChild(heading);
    /**
     *
     * @param {Element} keywordNode
     */
    Array.from(node.childNodes, function (keywordNode: any) {
        let frag, rootName, heading, keyword_thesaurus, list, keys;
        if (!(keywordNode.name instanceof Text)) {
            frag = document.createDocumentFragment();
            rootName = keywordNode.nodeName;
            heading = document.createElement("h2");
            keyword_thesaurus = keywordNode.querySelector(rootName + "kt");
            heading.textContent = rootName;
            frag.appendChild(heading);

            list = document.createElement("ul");
            keys = keywordNode.querySelectorAll(rootName + "key");
            Array.from(keys, function (keyNode: Element) {
                let item = document.createElement("li");
                item.textContent = keyNode.textContent;
                list.appendChild(item);
            });
            frag.appendChild(list);
            section.appendChild(frag);
        }
    });


    return section;
}

/**
 * Capitalizes the first character in a string.
 * @param {string} s - A string
 * @returns {string} - A copy of the input string, but with the first character capitalized.
 */
function capitalizeFirstCharacter(s: string): string {
    let output = Array.from(s, function (char, i) {
        if (i === 0) {
            return char.toUpperCase();
        } else {
            return char;
        }
    });
    return output.join("");
}

/**
 * Creates a document fragment from at text element, inserting <br> elements where there were newlines.
 * @param {string|Text} text - Either an XML text node or a string.
 * @returns {DocumentFragment} - An HTML document fragment.
 */
function insertBreaksAtNewlines(text: string): DocumentFragment | Text {
    let newLineRe = /[\r\n]+/g;
    let paragraphs = text.split(newLineRe);
    let docFrag = document.createDocumentFragment();
    if (paragraphs.length === 1) {
        return document.createTextNode(text);
    } else {
        paragraphs.forEach(function (s) {
            let p;
            // Filter out empty strings and strings with only space characters.
            if (s && s.length && /\S/.test(s)) {
                p = document.createElement("p");
                p.textContent = s;
                docFrag.appendChild(p);
            }
        });
    }
    return docFrag;
}

/**
 * Converts and email address into a link to an email address (with u-email microdata class).
 * @param {Node|string} email - An email address or an XML node containing an email address as its text content.
 * @returns {HTMLAnchorElement} An anchor element linking to an email address.
 */
function formatEmail(email: Element | string | any): HTMLAnchorElement {
    let a = document.createElement("a");
    email = email.textContent || email;
    a.href = "mailto:" + email;
    a.textContent = email;
    a.classList.add("u-email");
    return a;
}

/**
 * Converts a phone number string into an <a href="tel:..."> link.
 * @param {Element} phoneElement - A phone number.
 * @returns {HTMLAnchorElement} An anchor element with a link to the input phone number. Microdata class "p-tel" is also added.
 */
function formatPhoneNumber(phoneElement: Element): HTMLAnchorElement {
    let re = /\d+/g;
    let phone = phoneElement.textContent;
    let parts = phone.match(re);
    let unseparatedPhone = parts.join("");
    let isFax = /fax/i.test(phoneElement.nodeName);
    let url = isFax ? "fax:" : "tel:";
    if (unseparatedPhone.length === 10) {
        url += ["+1-", phone].join("");
    } else {
        url += phone;
    }
    let a = document.createElement("a");
    a.textContent = phone;
    a.href = url;
    a.classList.add(isFax ? "p-tel-fax" : "p-tel");
    return a;
}

function formatNumber(numberNode): HTMLElement {
    let dataElement = document.createElement("data");
    dataElement.classList.add(numberNode.name);
    dataElement.textContent = numberNode.textContent;
    return dataElement;
}



/**
 * Creates a list of an XML node's attributes. Attributes with names starting with "xmlns", and "codeList..." and "codeSpace" will be omitted.
 * @param {Node} node - XML node
 * @returns {HTMLDListElement} List of attributes. If there were no attributes, null will be returned.
 */
function createAttributeDL(node: Node): HTMLDListElement {
    var dl: HTMLDListElement;
    let ignoredAttributes = /(^xmlns(?:\:\w+)?)|(codeList(Value)?)|(codeSpace)/;
    if (node.attributes && node.attributes.length > 0) {
        dl = document.createElement("dl");
        for (let i = 0, l = node.attributes.length; i < l; i++) {
            let attr = node.attributes.item(i);
            if (attr.name.match(ignoredAttributes)) {
                continue;
            }
            let dt = document.createElement("dt");
            dt.textContent = attr.name;
            dl.appendChild(dt);
            let dd = document.createElement("dd");
            dd.textContent = attr.value;
            dl.appendChild(dd);
        }
        // Nullify the output list if it has no children.
        if (dl.childNodes.length <= 0) {
            dl = null;
        }
    }
    return dl || null;
}

/**
 * Gets the metadata tile from an XML geospatial metadata document.
 * @param {XMLDocument} doc - XML document
 * @returns {string} Returns the title. If title cannot be found, "Untitled" is returned.
 */
function getTitle(doc: XMLDocument | Element): string {
    let title = doc.querySelector("title,resTitle");
    return title ? title.textContent : "Untitled";
}

/**
 * Converts the base-64 encoded source metadata XML document from an ESRI format metadata XML document
 * and converts it into a data URI link.
 * @param {Element} enclosureNode - A Binary/Enclosure element.
 * @returns {HTMLAnchorElement} - An HTML link pointing to the data URI.
 */
function convertEnclosureToDataUriLink(enclosureNode: Element): HTMLAnchorElement {
    let dataNode = enclosureNode.querySelector("Data");
    let description = enclosureNode.querySelector("Descript").textContent;
    let propertyType = dataNode.getAttribute("EsriPropertyType"); // should be "Base64";
    let metadataSchema = dataNode.getAttribute("SourceMetadataSchema"); // e.g., "fgdc";
    // let sourceMetadata = dataNode.getAttribute("SourceMetadata");
    let originalFilename = dataNode.getAttribute("OriginalFileName");
    // sourceMetadata = /^yes$/i.test(sourceMetadata);
    let data = dataNode.textContent;
    // Remove newline characters.
    data = data.replace(/[\r\n]/g, "");
    // Create data URI (Assuming XML for now. Metadata may possibly have other enclosures besides source metadata XML document.)
    let uri = "data:text/xml;base64," + data;

    // Create the link.
    let a = document.createElement("a");
    a.href = uri;
    a.textContent = description;
    if (originalFilename) {
        a.textContent += [" (", originalFilename, ")"].join("");
    }
    a.target = "_blank";
    return a;
}

function convertThumbnailToImage(thumbnailNode: Element): HTMLImageElement {
    let dataElement = thumbnailNode.querySelector("Data");
    let propertyType = dataElement.getAttribute("EsriPropertyType");
    let data = dataElement.textContent;
    data = data.replace(/[\r\n]/g, "");
    let src = "data:image/png;base64," + data;
    let img = document.createElement("img");
    img.src = src;
    img.alt = "thumbnail";
    img.classList.add("thumbnail");
    return img;
}

/**
 * Creates a <pre class="error"> element with the contents of an XML node.
 * @param {Element} errorElement - An XML element that is to be displayed in a <pre> node.
 * @returns {HTMLPreElement} - A <pre> containing the XML markup of the input element.
 */
function createErrorPreElement(errorElement: any): HTMLPreElement {
    let pre, xmlSerializer;
    pre = document.createElement("pre");
    pre.classList.add("error");
    if (errorElement.outerHTML) {
        pre.textContent = errorElement.outerHTML;
    } else {
        xmlSerializer = new XMLSerializer();
        pre.textContent = xmlSerializer.serializeToString(errorElement);
    }
    return pre;
}

/**
 * Converts an XML comment into a paragraph element.
 * @param {Comment} comment - an XML commenet
 * @returns {HTMLParagraphElement} A paragraph containing the text of the comment.
 */
function commentToParagraph(comment: Comment): HTMLParagraphElement {
    let p = document.createElement("p");
    p.classList.add("comment");
    p.textContent = comment.textContent;
    return p;
}

// Create a mapping of node names to formatting functions.
let nodeNameToFunction = {
    "#comment": commentToParagraph,
    eainfo: createAttributesTable,
    cntaddr: formatAddress,
    keywords: createKeywordsLists,
    sngdate: formatSngdate,
    cntemail: formatEmail,
    cntvoice: formatPhoneNumber,
    cntfax: formatPhoneNumber,

    electronicMailAddress: formatEmail,
    voice: formatPhoneNumber,
    fax: formatPhoneNumber,
    "gco:Decimal": formatNumber,
    "gco:Integer": formatNumber,

    Enclosure: convertEnclosureToDataUriLink,
    Thumbnail: convertThumbnailToImage
};

/**
 * Converts an XML document or node into an HTML document fragment.
 * @param {XMLDocument|Element} node - Either an XML document or one of its children.
 * @returns {DocumentFragment} An HTML document fragment
 */
function toHtmlFragment(node: XMLDocument | Element): DocumentFragment {
    let output, currentNode, heading;
    let treatAsTextRE = /(CharacterString)|(LanguageCode)|(((CI)|(MD))_\w+Code)/;

    // Add page title if this is the root element.
    if (node.nodeName === "#document") {
        let title = getTitle(node);
        heading = document.createElement("header");
        heading.innerHTML = ["<h1>", title, "</h1>"].join("");
        document.body.appendChild(heading);
    }

    //if (!node || !node.attributes || !node.childNodes) {
    //    return;
    //}

    output = document.createDocumentFragment();

    let attrList = createAttributeDL(node);
    if (attrList) {
        output.appendChild(attrList);
    }

    if (node.childNodes && node.childNodes.length > 0) {


        for (let i = 0; i < node.childNodes.length; i++) {
            currentNode = node.childNodes[i];
            if (!currentNode) {
                continue;
            }
            if (nodeNameToFunction.hasOwnProperty(currentNode.nodeName)) {
                try {
                    output.appendChild(nodeNameToFunction[currentNode.nodeName](currentNode));
                } catch (err) {
                    output.appendChild(createErrorPreElement(currentNode));
                }
            } else if (currentNode instanceof Text || currentNode.nodeName.match(treatAsTextRE)) {
                output.appendChild(insertBreaksAtNewlines(currentNode.textContent));
            } else {
                // Create the section header if this is not the root element.
                if (currentNode.parentElement !== null) { // In IE, the parentElement property will be undefined.
                    heading = document.createElement("h1");
                    heading.textContent = csdgmAliases[currentNode.nodeName] || capitalizeFirstCharacter(currentNode.nodeName);
                } else {
                    heading = null;
                }

                let section = document.createElement("section");
                section.classList.add(currentNode.nodeName);
                if (heading) {
                    section.appendChild(heading);
                }

                // Handle date nodes
                if (dateNodeNamesRe.test(currentNode.nodeName)) {
                    try {
                        section.appendChild(toTimeNode(currentNode.textContent));
                    } catch (e) {
                        section.appendChild(createErrorPreElement(currentNode));
                    }
                } else if (currentNode) {
                    let frag = toHtmlFragment(currentNode);
                    if (frag) {
                        section.appendChild(frag);
                    }
                }
                output.appendChild(section);
            }

        }
    } else if (currentNode && currentNode.textContent) {
        output = document.createTextNode(currentNode.textContent);
    }

    return output;
}

export { toObject, toHtmlFragment }