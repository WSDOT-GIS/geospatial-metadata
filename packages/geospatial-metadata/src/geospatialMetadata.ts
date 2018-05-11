import csdgmAliases from "./csdgm/aliases";
import { formatElementAsTable } from "./csdgm/attributeTables";
import { parseDate } from "./dateUtils";
import { capitalizeFirstCharacter, toValidClassName } from "./stringUtils";

/**
 * XMLDocument
 * @external XMLDocument
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/XMLDocument XMLDocument}
 */

const dateNodeNamesRe = /(?:(?:(?:pub)|(?:cal)|(?:proc))date)|(?:metd)/;

const microFormats: any = {
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
 * Converts a Date into a <time> element
 * @param {string} dateString - A string representation of a date.
 * @param {string} [time] - An optional time string.
 * @return {HTMLTimeElement|HTMLUnknownElement} - If the browser supports it, an HTMLTimeElement will be returned. Otherwise an HTMLUnknownElement will be returned.
 * @throws {TypeError} Thrown if dateString is null, empty, undefined, or otherwise inproperly formatted.
 */
function toTimeNode(
  dateString: string,
  time?: string
): HTMLElement | HTMLUnknownElement {
  if (!dateString) {
    throw new TypeError("No date provided");
  }
  const output = document.createElement("time");
  if (!(time && !/Unknown/i.test(time))) {
    const date = parseDate(dateString);
    if (date instanceof Date) {
      output.setAttribute("datetime", date.toISOString().replace(/T.+$/, ""));
      output.textContent = date.toLocaleDateString();
    }
  } else {
    const date = parseDate(dateString, time);
    if (date instanceof Date) {
      output.setAttribute("datetime", date.toISOString());
      output.textContent = date.toLocaleString();
    }
  }

  return output;
}

/**
 * Converts an XML element into an object.
 * @param {Element} node - XML Element
 * @returns {Object} - An object representation of the XML element.
 */
function toObject(node: Node) {
  if (node.childNodes && node.childNodes.length > 0) {
    const output: { [key: string]: any } = {};
    for (const currentNode of Array.from(node.childNodes)) {
      output[currentNode.nodeName] =
        currentNode instanceof Text
          ? currentNode.textContent
          : toObject(currentNode);
    }
    return output;
  }
  return node.textContent;
}

/**
 * Formats a single date element.
 * @param {Element} sngDateElement - A metadata element containing caldate and time elements.
 * @returns {HTMLElement} Returns an HTML element.
 */
function formatSngdate(sngDateElement: Element) {
  const calDateNode = sngDateElement.querySelector("caldate");
  if (calDateNode) {
    const dateString = calDateNode.textContent;
    if (dateString) {
      const timeElement = sngDateElement.querySelector("time");
      let time: string | undefined;
      if (timeElement) {
        time =
          timeElement && timeElement.textContent
            ? timeElement.textContent
            : undefined;
      }
      return toTimeNode(dateString, time);
    }
  }
  return createErrorPreElement(sngDateElement);
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

  const output = document.createElement("section");
  let addrtype: any = node.querySelector("addrtype");
  addrtype = addrtype.textContent || "";
  const addrClass = toValidClassName(addrtype);
  const label = document.createElement("h1");
  if (addrtype) {
    label.textContent = addrtype;
    output.appendChild(label);
  }

  const p = document.createElement("p");
  p.setAttribute("class", "h-addr address");
  if (addrClass) {
    p.classList.add(addrClass);
    p.classList.add("h-addr-" + addrClass);
  }

  ["address", "city", "state", "postal", "country"].forEach(propName => {
    const element = node.querySelector(propName);
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
  const attrNodes = node.querySelectorAll("attr");
  const table = document.createElement("table");
  table.classList.add("attributes-table");
  const entityTypeLabel = node.querySelector("detailed > enttyp > enttypl");
  if (entityTypeLabel) {
    table.createCaption().textContent = `Attributes for ${entityTypeLabel}`;
  }
  const head = table.createTHead();
  head.innerHTML =
    "<tr><th>Label</th><th>Definition</th><th>Definition Source</th><th>Domain Values</th></tr>";
  const attrArray = Array.from(attrNodes, attrNode => {
    const row = table.insertRow(-1);
    const label = attrNode.querySelector("attrlabl");
    const def = attrNode.querySelector("attrdef");
    const attrdefs = attrNode.querySelector("attrdefs");
    const attrdomv = attrNode.querySelector("attrdomv");

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
      cell.appendChild(formatElementAsTable(attrdomv));
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
    node = node.querySelector("keywords") as Element;
  }

  const section = document.createElement("section");
  section.classList.add("keywords");
  let heading = document.createElement("h1");
  heading.textContent = "Keywords";
  section.appendChild(heading);

  interface INamedElement extends Element {
    name: Text;
  }

  for (const keywordNode of Array.from(node.childNodes) as INamedElement[]) {
    if (!(keywordNode.name instanceof Text)) {
      const frag = document.createDocumentFragment();
      const rootName = keywordNode.nodeName;
      heading = document.createElement("h2");
      // TODO: Keyword Thesaurus // const keyword_thesaurus = keywordNode.querySelector(`${rootName}kt`);
      heading.textContent = rootName;
      frag.appendChild(heading);

      const list = document.createElement("ul");
      const keys = keywordNode.querySelectorAll(`${rootName}key`);

      for (const keyNode of Array.from(keys)) {
        const item = document.createElement("li");
        item.textContent = keyNode.textContent;
        list.appendChild(item);
      }
      frag.appendChild(list);
      section.appendChild(frag);
    }
  }

  return section;
}

/**
 * Creates a document fragment from at text element, inserting <br> elements where there were newlines.
 * @param {string|Text} text - Either an XML text node or a string.
 * @returns {Text | DocumentFragment} - An HTML document fragment or a Text node.
 */
function insertBreaksAtNewlines(text: string | Text) {
  const newLineRe = /[\r\n]+/g;
  const textContent: string =
    text instanceof Text ? text.textContent || "" : text;
  const paragraphs = textContent.split(newLineRe);
  const docFrag = document.createDocumentFragment();
  if (paragraphs.length === 1) {
    return document.createTextNode(textContent);
  } else {
    // Filter out empty strings and strings with only space characters.
    paragraphs.filter(s => s && s.length && /\S/.test(s)).forEach(s => {
      const p = document.createElement("p");
      p.textContent = s;
      docFrag.appendChild(p);
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
  const a = document.createElement("a");
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
  const re = /\d+/g;
  const phone = phoneElement.textContent;
  if (!phone) {
    throw TypeError("Element does not contain text content.");
  }
  const parts = phone.match(re);
  if (!parts) {
    throw Error(`Expected a phone number, instead got "${phone}".`);
  }
  const unseparatedPhone = parts.join("");
  const isFax = /fax/i.test(phoneElement.nodeName);
  let url = isFax ? "fax:" : "tel:";
  if (unseparatedPhone.length === 10) {
    url += ["+1-", phone].join("");
  } else {
    url += phone;
  }
  const a = document.createElement("a");
  a.textContent = phone;
  a.href = url;
  a.classList.add(isFax ? "p-tel-fax" : "p-tel");
  return a;
}

function formatNumber(numberNode: Node): HTMLElement {
  const dataElement = document.createElement("data");
  dataElement.classList.add((numberNode as any).name);
  dataElement.textContent = numberNode.textContent;
  return dataElement;
}

/**
 * Creates a list of an XML node's attributes. Attributes with names starting with "xmlns", and "codeList..." and "codeSpace" will be omitted.
 * @param {Node} node - XML node
 * @returns {HTMLDListElement} List of attributes. If there were no attributes, null will be returned.
 */
function createAttributeDL(node: Element) {
  let dl: HTMLDListElement | null = null;
  const ignoredAttributes = /(^xmlns(?:\:\w+)?)|(codeList(Value)?)|(codeSpace)/;
  if (node.attributes && node.attributes.length > 0) {
    dl = document.createElement("dl");
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes.item(i)!;
      if (attr.name.match(ignoredAttributes)) {
        continue;
      }
      const dt = document.createElement("dt");
      dt.textContent = attr.name;
      dl.appendChild(dt);
      const dd = document.createElement("dd");
      dd.textContent = attr.value;
      dl.appendChild(dd);
    }
    // Nullify the output list if it has no children.
    if (dl.childNodes.length <= 0) {
      dl = null;
    }
  }
  return dl;
}

/**
 * Gets the metadata tile from an XML geospatial metadata document.
 * @param {XMLDocument} doc - XML document
 * @returns {string} Returns the title. If title cannot be found, "Untitled" is returned.
 */
function getTitle(doc: XMLDocument | Element) {
  const title = doc.querySelector("title,resTitle");
  if (title && title.textContent) {
    return title.textContent;
  }
  return "Untitled";
}

/**
 * Converts the base-64 encoded source metadata XML document from an ESRI format metadata XML document
 * and converts it into a data URI link.
 * @param {Element} enclosureNode - A Binary/Enclosure element.
 * @returns {HTMLAnchorElement} - An HTML link pointing to the data URI.
 */
function convertEnclosureToDataUriLink(enclosureNode: Element) {
  const dataNode = enclosureNode.querySelector("Data");
  if (!dataNode) {
    throw new Error("Data node not found");
  }
  const descriptNode = enclosureNode.querySelector("Descript");
  if (!descriptNode) {
    throw new Error('"Descript" node not found');
  }
  const description = descriptNode.textContent;
  const propertyType = dataNode.getAttribute("EsriPropertyType"); // should be "Base64";
  const metadataSchema = dataNode.getAttribute("SourceMetadataSchema"); // e.g., "fgdc";
  // let sourceMetadata = dataNode.getAttribute("SourceMetadata");
  const originalFilename = dataNode.getAttribute("OriginalFileName");
  // sourceMetadata = /^yes$/i.test(sourceMetadata);
  let data = dataNode.textContent;
  if (data) {
    // Remove newline characters.
    data = data.replace(/[\r\n]/g, "");
  }
  // Create data URI (Assuming XML for now. Metadata may possibly have other enclosures besides source metadata XML document.)
  const uri = "data:text/xml;base64," + data;

  // Create the link.
  const a = document.createElement("a");
  a.href = uri;
  a.textContent = description;
  if (originalFilename) {
    a.textContent += ` (${originalFilename})`;
  }
  a.target = "_blank";
  return a;
}

/**
 * Converts a thumbnail image to an <img>.
 * @param {Element} thumbnailNode
 * @returns {HTMLImageElement}
 */
function convertThumbnailToImage(thumbnailNode: Element): HTMLImageElement {
  const dataElement = thumbnailNode.querySelector("Data");
  if (!dataElement) {
    throw new TypeError("'Data' element not found");
  }
  const propertyType = dataElement.getAttribute("EsriPropertyType");
  let data = dataElement.textContent;
  if (!data) {
    throw new TypeError("No data present in Data element.");
  }
  data = data.replace(/[\r\n]/g, "");
  const src = "data:image/png;base64," + data;
  const img = document.createElement("img");
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
  const pre = document.createElement("pre");
  pre.classList.add("error");
  if (errorElement.outerHTML) {
    pre.textContent = errorElement.outerHTML;
  } else {
    const xmlSerializer = new XMLSerializer();
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
  const p = document.createElement("p");
  p.classList.add("comment");
  p.textContent = comment.textContent;
  return p;
}

// Create a mapping of node names to formatting functions.
const nodeNameToFunction: any = {
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
function toHtmlFragment(node: XMLDocument | Element) {
  let heading: HTMLElement | null;
  const treatAsTextRE = /(CharacterString)|(LanguageCode)|(((CI)|(MD))_\w+Code)/;

  // Add page title if this is the root element.
  if (node.nodeName === "#document") {
    const title = getTitle(node);
    heading = document.createElement("header");
    heading.innerHTML = `<h1>${title}</h1>`;
    document.body.appendChild(heading);
  }

  // if (!node || !node.attributes || !node.childNodes) {
  //    return;
  // }

  const output = document.createDocumentFragment();

  const attrList = createAttributeDL(node as Element);
  if (attrList) {
    output.appendChild(attrList);
  }

  if (node.childNodes && node.childNodes.length > 0) {
    for (const currentNode of Array.from(node.childNodes)) {
      if (!currentNode) {
        continue;
      }
      if (nodeNameToFunction.hasOwnProperty(currentNode.nodeName)) {
        try {
          output.appendChild(
            nodeNameToFunction[currentNode.nodeName](currentNode)
          );
        } catch (err) {
          output.appendChild(createErrorPreElement(currentNode));
        }
      } else if (
        currentNode instanceof Text ||
        currentNode.nodeName.match(treatAsTextRE)
      ) {
        output.appendChild(
          insertBreaksAtNewlines(currentNode.textContent || "")
        );
      } else {
        // Create the section header if this is not the root element.
        if (currentNode.parentElement !== null) {
          // In IE, the parentElement property will be undefined.
          heading = document.createElement("h1");
          heading.textContent =
            (csdgmAliases as any)[currentNode.nodeName] ||
            capitalizeFirstCharacter(currentNode.nodeName);
        } else {
          heading = null;
        }

        const section = document.createElement("section");
        section.classList.add(currentNode.nodeName);
        if (heading) {
          section.appendChild(heading);
        }

        // Handle date nodes
        if (dateNodeNamesRe.test(currentNode.nodeName)) {
          try {
            section.appendChild(toTimeNode(currentNode.textContent as string));
          } catch (e) {
            section.appendChild(createErrorPreElement(currentNode));
          }
        } else if (currentNode) {
          const frag = toHtmlFragment(currentNode as Element);
          if (frag) {
            section.appendChild(frag);
          }
        }
        output.appendChild(section);
      }
    }
  } else if (node && node.textContent) {
    output.appendChild(document.createTextNode(node.textContent));
  }
  return output;
}

export { toObject, toHtmlFragment };
