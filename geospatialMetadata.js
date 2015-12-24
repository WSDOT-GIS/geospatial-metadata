﻿/**
 * XMLDocument
 * @external XMLDocument
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/XMLDocument XMLDocument}
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(["./fgdcAliases"], factory);
    } else {
        // Browser globals
        root.gisMetadata = factory(root.fgdcAliases);
    }
}(this, function (fgdcAliases) {
    "use strict";
    var dateNodeNamesRe = /(?:(?:(?:pub)|(?:cal)|(?:proc))date)|(?:metd)/;

    var microFormats = {
        address: "p-street-address",
        city: "p-locality",
        state: "p-region",
        postal: "p-postal-code",
        country: "p-country-name",
        cntvoice: "p-tel",
        cntpos: "p-job-title",
        cntorg: "p-org",
        cntvoice: ["p-tel", "p-tel-voice", "p-tel-work"],
        cntinfo: "h-card",
        cntemail: "u-email",
    };

    /**
     * Parses a yyyyMMdd date string into a date object.
     * @param {string} yyyyMMdd - Date string - Parts can optionally be separated by dashes or slashes.
     * @param {string} [hhmmss] - Time string
     * @returns {Date} Returns a date object equivalent to the input date and time strings.
     */
    function parseDate(yyyyMMdd, hhmmss) {
        var re = /(\d{4})[-\/]?(\d{2})[-\/]?(\d{2})/i;
        var match = yyyyMMdd.match(re);
        if (match) {
            // Remove the first element, which is the entire matched part of the string.
            // We only want the digit groups.
            match = match.slice(1);
            //match = match.map(function (s) { return parseInt(s, 10); });
        }
        var timeMatch;
        if (hhmmss) {
            // Match each occurance of a number
            re = /\d+/g;
            timeMatch = hhmmss.match(re);
            if (timeMatch) {
                match = match.concat(timeMatch);
            }
        }

        //var parts = match.map(parseInt);
        var parts = match.map(function (p) {
            return parseInt(p, 10);
        });


        //var date = new Date(...parts); // ES6 - doesn't work in IE.
        function createDate(a, b, c, d, e, f) {
            d = d || 0;
            e = e || 0;
            f = f || 0;
            return new Date(a, b, c, d, e, f);
        }
        var date = createDate.apply(null, parts);

        return date;
    }

    /**
     * Converts a Date into a <time> element
     * @param {string} dateString - A Date object
     * @param {string} [time] - An optional time string.
     * @return {HTMLTimeElement|HTMLUnknownElement} - If the browser supports it, an HTMLTimeElement will be returned. Otherwise an HTMLUnknownElement will be returned.
     */
    function toTimeNode(dateString, time) {
        var output = document.createElement("time");
        var date;
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
    function toObject(node) {
        var output;
        var currentNode;

        if (node.childNodes && node.childNodes.length > 0) {
            output = {};
            for (var i = 0; i < node.childNodes.length; i++) {
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
    function formatSngdate(sngDateElement) {
        var dateString = sngDateElement.querySelector("caldate").textContent;
        var time = sngDateElement.querySelector("time");
        time = time && time.textContent ? time.textContent : undefined;
        return toTimeNode(dateString, time);
        //var output = document.createElement("time");
        //var date;
        //if (/Unknown/i.test(time.textContent)) {
        //    date = parseDate(dateString);
        //    output.setAttribute("datetime", date.toISOString().replace(/T.+$/, ""));
        //    output.textContent = date.toLocaleDateString();
        //} else {
        //    date = parseDate(dateString, time.textContent);
        //    output.setAttribute("datetime", date.toISOString());
        //    output.textContent = date.toLocaleString();
        //}
        //return output;
    }

    /**
     * Formats the Contact Address (cntattr) node.
     * @param {XMLDocument|Element} node - A <cntattr> XML node
     * @returns {HTMLDocumentFragment} - Returns an HTML document fragment.
     * @throws {Error} Throws an error if node is not a cntaddr node.
     */
    function formatAddress(node) {
        if (node.nodeName !== "cntaddr") {
            throw new Error("Expected cntaddr node");
        }

        // TODO: use different microformat for PO BOX vs. street address.

        var output = document.createElement("section");
        var addrtype = node.querySelector("addrtype");
        addrtype = addrtype.textContent || "";
        var label = document.createElement("h1");
        if (addrtype) {
            label.textContent = [addrtype, "address"].join(" ");
            output.appendChild(label);
        }
        
        var p = document.createElement("p");
        p.setAttribute("class", "h-addr address");
        p.classList.add(addrtype);
        p.classList.add("h-addr-" + addrtype);



        ["address", "city", "state", "postal", "country"].forEach(function (propName) {
            var element = node.querySelector(propName);
            var span;
            if (element) {
                span = document.createElement("span");
                span.classList.add(propName);
                span.classList.add(microFormats[propName]);
                span.textContent = element.textContent;
                p.appendChild(span);
            }
        });
        var country = node.querySelector("country");
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
    function createAttributesTable(node) {
        var attrNodes = node.querySelectorAll("attr");
        var table = document.createElement("table");
        table.classList.add("attributes-table");
        table.createCaption().textContent = "Attributes for " + node.querySelector("detailed > enttyp > enttypl").textContent;
        var head = table.createTHead();
        head.innerHTML = "<tr><th>Label</th><th>Definition</th><th>Definition Source</th><th>Domain Values</th></tr>";
        var attrArray = Array.from(attrNodes, function (attrNode) {
            var row = table.insertRow(-1);
            var label = attrNode.querySelector("attrlabl");
            var def = attrNode.querySelector("attrdef");
            var attrdefs = attrNode.querySelector("attrdefs");
            var attrdomv = attrNode.querySelector("attrdomv");

            var cell = row.insertCell(-1);
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
    function createKeywordsLists(node) {
        if (node.nodeName !== "keywords") {
            node = node.querySelector("keywords");
        }

        var section = document.createElement("section");
        section.classList.add("keywords");
        var heading = document.createElement("h1");
        heading.textContent = "Keywords";
        section.appendChild(heading);
        /**
         * 
         * @param {Element} keywordNode
         */
        Array.from(node.childNodes, function (keywordNode) {
            var frag = document.createDocumentFragment();
            var rootName = keywordNode.nodeName;
            var heading = document.createElement("h2");
            var keyword_thesaurus = keywordNode.querySelector(rootName + "kt");
            heading.textContent = rootName;
            frag.appendChild(heading);

            var list = document.createElement("ul");
            var keys = keywordNode.querySelectorAll(rootName + "key");
            Array.from(keys, function (keyNode) {
                var item = document.createElement("li");
                item.textContent = keyNode.textContent;
                list.appendChild(item);
            });
            frag.appendChild(list);
            section.appendChild(frag);
        });


        return section;
    }

    /**
     * Capitalizes the first character in a string.
     * @param {string} s - A string
     * @returns {string} - A copy of the input string, but with the first character capitalized.
     */
    function capitalizeFirstCharacter(s) {
        var output = Array.from(s, function (char, i) {
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
    function insertBreaksAtNewlines(text) {
        var newLineRe = /[\r\n]+/g;
        var paragraphs = text.split(newLineRe);
        var docFrag = document.createDocumentFragment();
        if (paragraphs.length === 1) {
            return document.createTextNode(text);
        } else {
            paragraphs.forEach(function (s) {
                var p = document.createElement("p");
                p.textContent = s;
                docFrag.appendChild(p);
            });
        }
        return docFrag;
    }

    function formatEmail(email) {
        var a = document.createElement("a");
        var email = email.textContent || email;
        a.href = "mailto:" + email;
        a.textContent = email;
        a.classList.add("u-email");
        return a;
    }

    /**
     * Converts a phone number string into an <a href="tel:..."> link.
     * @param {string} phone - A phone number.
     * @returns {HTMLAnchorElement} An anchor element with a link to the input phone number.
     */
    function formatPhoneNumber(phone) {
        var re = /\d+/g;
        var phone = phone.textContent || phone;
        var parts = phone.match(re);
        var unseparatedPhone = parts.join("");
        var url;
        if (unseparatedPhone.length === 10) {
            url = ["tel:+1", phone].join("");
        } else {
            url = ["tel:", phone].join("");
        }
        var a = document.createElement("a");
        a.textContent = phone;
        a.href = url;
        a.classList.add("p-tel");
        return a;
    }

    /**
     * Converts an XML document or node into an HTML document fragment.
     * @param {XMLDocument|Element} node - Either an XML document or one of its children.
     * @returns {DocumentFragment} An HTML document fragment
     */
    function toHtmlFragment(node) {
        var output;
        var currentNode;

        var heading, section, title, date, attributesTable;


        // Add page title if this is the root element.
        if (node.nodeName === "#document") {
            title = node.querySelector("title").textContent || "Untitled";
            heading = document.createElement("header");
            heading.innerHTML = ["<h1>", title, "</h1>"].join("");
            document.body.appendChild(heading);
        }

        if (node.childNodes && node.childNodes.length > 0) {
            output = document.createDocumentFragment();


            for (var i = 0; i < node.childNodes.length; i++) {
                currentNode = node.childNodes[i];
                if (currentNode.nodeName === "eainfo") {
                    output.appendChild(createAttributesTable(currentNode));
                } else if (currentNode.nodeName === "cntaddr") {
                    output.appendChild(formatAddress(currentNode));
                } else if (currentNode.nodeName === "keywords") {
                    output.appendChild(createKeywordsLists(currentNode));
                } else if (currentNode.nodeName === "sngdate") {
                    (function () {
                        var timeNode = formatSngdate(currentNode);
                        output.appendChild(timeNode);
                    }())
                } else if (currentNode.nodeName === "cntemail") {
                    output.appendChild(formatEmail(currentNode));
                } else if (currentNode.nodeName === "cntvoice") {
                    output.appendChild(formatPhoneNumber(currentNode));
                } else if (currentNode instanceof Text) {
                    output.appendChild(insertBreaksAtNewlines(currentNode.textContent));
                } else {
                    // Create the section header if this is not the root element.
                    if (currentNode.parentElement !== null) { // In IE, the parentElement property will be undefined.
                        heading = document.createElement("h1");
                        heading.textContent = fgdcAliases[currentNode.nodeName] || capitalizeFirstCharacter(currentNode.nodeName);
                    } else {
                        heading = null;
                    }

                    section = document.createElement("section");
                    section.classList.add(currentNode.nodeName);
                    if (heading) {
                        section.appendChild(heading);
                    }

                    // Handle date nodes
                    if (dateNodeNamesRe.test(currentNode.nodeName)) {
                        section.appendChild(toTimeNode(currentNode.textContent));
                    } else {
                        section.appendChild(toHtmlFragment(currentNode));
                    }
                    output.appendChild(section);
                }

            }
        } else {
            output = document.createTextNode(currentNode.textContent);
        }

        return output;
    }

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return {
        toObject: toObject,
        toHtmlFragment: toHtmlFragment
    };
}));