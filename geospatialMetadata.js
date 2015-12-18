/**
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
    var dateNodeNamesRe = /(?:(?:(?:pub)|(?:cal))date)|(?:metd)/;

    /**
     * Parses a yyyyMMdd date string into a date object.
     * @param {string} yyyyMMdd - Date string
     * @returns {(Date|string)} Returns the date if successful, the original input string otherwise.
     */
    function parseDate(yyyyMMdd) {
        var re = /(\d{4})(\d{2})(\d{2})/i;
        var match = yyyyMMdd.match(re);
        if (match) {
            //match = match.slice(1).map(parseInt);
            match = match.slice(1);
            //match = match.map(function (s) { return parseInt(s, 10); });
        }
        return match.join("-"); //match ? new Date(match[0], match[1], match[2]) : yyyyMMdd;
    }

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
     * Formats the Contact Address (cntattr) node.
     * @param {XMLDocument|Element} node
     * @returns {HTMLDocumentFragment}
     */
    function formatAddress(node) {
        var output = document.createElement("section");
        if (node.nodeName !== "cntaddr") {
            throw new Error("Expected cntaddr node");
        }
        var addrtype = node.querySelector("addrtype");
        addrtype = addrtype.textContent || "";
        var label = document.createElement("h1");
        if (addrtype) {
            label.textContent = [addrtype, "address"].join(" ");
            output.appendChild(label);
        }
        
        var parts = {};
        ["address", "city", "state", "postal", "country"].forEach(function (propName) {
            var element = node.querySelector(propName);
            if (element) {
                parts[propName] = element.textContent;
            }
        });
        var p = document.createElement("p");
        p.innerHTML = [parts.address, "<br />", parts.city, ", ", parts.state, "&nbsp;&nbsp", parts.postal, "<br />", parts.country].join("");
        output.appendChild(p);
        return output;
    }

    /**
     * 
     * @param {XMLDocument|Element} node
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
     * 
     * @param {XMLDocument|Element} node - XML node
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
                } else if (currentNode instanceof Text) {
                    output.appendChild(document.createTextNode(currentNode.textContent));
                } else {
                    // Create the section header if this is not the root element.
                    if (currentNode.parentElement) {
                        heading = document.createElement("h1");
                        heading.textContent = fgdcAliases[currentNode.nodeName] || currentNode.nodeName;
                    } else {
                        heading = null;
                    }

                    section = document.createElement("section");
                    section.classList.add(currentNode.nodeName);
                    if (heading) {
                        section.appendChild(heading);
                    }

                    if (dateNodeNamesRe.test(currentNode.nodeName)) {
                        date = parseDate(currentNode.textContent);
                        section.appendChild(document.createTextNode(date));
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