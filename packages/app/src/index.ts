import { toHtmlFragment, toObject } from "@wsdot/geospatial-metadata";
const dataUrlRe = /^data\:([^;,]+)?(?:;(base64))?,([A-Za-z0-9+\/]+)/i; // [whole, MIME-type?, base64?, content]

/**
 * Reset the page content to the data from the data URI link.
 * @param {Event} e - Link click event
 */
function handleDataUrlLinkClick(e: Event) {
  const a = (e.target || e.currentTarget) as HTMLAnchorElement;
  const match = a.href.match(dataUrlRe);
  if (match && match.length > 3) {
    const xml = atob(match[3]);
    document.body.innerHTML = "";
    handleXml(xml);
    const stateTitle = "Embedded HTML";
    try {
      window.history.pushState(xml, stateTitle, `#${a.href}`);
    } catch (e) {
      window.history.pushState(xml, stateTitle, "#embedded");
    }
    window.scroll(0, 0); // scroll back to the top of the page.
    // Stop the navigation.
    e.stopPropagation();
  }
}

function handleXml(xml: string | Document) {
  if (typeof xml === "string") {
    xml = (() => {
      const parser = new DOMParser();
      return parser.parseFromString(xml, "text/xml");
    })();
  }
  const frag = toHtmlFragment(xml);
  document.body.appendChild(frag);
  const titleElement = document.body.querySelector("header > h1");
  const title = titleElement ? titleElement.textContent : null;

  document.title = title || "";

  const links = document.querySelectorAll("a[href]"); // document.querySelectorAll("a[href^='data:text/xml;base64']"); // doesn't work in IE 11, always returns 0 nodes.

  // Setup special click event handler for data URI links.
  Array.from(links, link => {
    if (link instanceof HTMLAnchorElement && dataUrlRe.test(link.href)) {
      link.onclick = handleDataUrlLinkClick;
    }
  });
}

/**
 * Creates a link to the source XML file.
 * @param xmlUrl URL of the XML metadata.
 * @returns Returns a paragraph containing an anchor.
 */
function createRawXmlLink(xmlUrl: string) {
  const className = "raw-metadata-link";
  const p = document.createElement("p");
  p.classList.add(className);
  const a = document.createElement("a");
  a.classList.add(`${className}__anchor`);
  a.href = xmlUrl;
  a.textContent = "view metadata XML";
  a.target = "wsdot-metadata-raw";
  p.appendChild(a);
  return p;
}

let url: string | RegExpMatchArray | null = null;

if (location.search) {
  url = location.search.match(/ur[li]=([^&]+)/i); // location.search.replace(/^\?/, "");
}

if (url) {
  url = decodeURIComponent(url[1]);

  document.body.classList.add("loading");

  try {
  fetch(url)
    .then((response: Response) => {
      document.body.classList.remove("loading");
      return response.text();
    })
    .then(text => {
      document.body.innerHTML = "";
      const link = createRawXmlLink(url as string);
      document.body.appendChild(link);
      document.body.classList.add("loaded");
      history.replaceState(text, "", location.href);
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "text/xml");
      handleXml(xml);
    })
    .catch(err => {
      console.error(`An error occured fetchcing ${url}.`, err);
    });
  } catch (error) {
    document.body.innerHTML = "";
    const p = document.createElement("p");
    const te = document.createTextNode("Unfortunately, this browser does not support features required to format the metadata. ");
    const a = document.createElement("a");
    a.href = url;
    a.textContent = "Go directly to metadata";
    p.appendChild(te);
    p.appendChild(a);
    document.body.appendChild(p);
  }
}

/**
 * Opens a local XML file and formats it into HTML.
 * @param {File} file
 */
function openFile(file: File) {
  const reader = new FileReader();
  reader.onloadend = function(progressEvent) {
    const xml = this.result;
    if (typeof xml === "string") {
      document.body.innerHTML = "";
      document.body.classList.add("loaded");
      handleXml(xml);
      history.pushState(xml, "", "#localfile");
    }
  };
  reader.readAsText(file);
}

if (document.forms.length > 0) {
  const form: any = document.forms[0];

  form.onsubmit = () => {
    const fileInput = form.querySelector("#fileInput");
    if (!form.url.value && !fileInput.value) {
      alert("No XML file specified.");
      return false;
    } else if (fileInput.files.length > 0) {
      openFile(fileInput.files[0]);
      return false;
    }
    // If none of the above conditions are true,
    // The page will reload with the URL parameter.
  };
}

/**
 * When the user clicks the back or next buttons on their browser, show the XML stored in the state.
 * @param {PopStateEvent} popStateEvent
 * @param {Object} popStateEvent.state
 */
window.onpopstate = (popStateEvent: PopStateEvent) => {
  if (popStateEvent.state) {
    document.body.innerHTML = "";
    handleXml(popStateEvent.state);
    window.scroll(0, 0); // scroll back to the top of the page.
  } else {
    // Reload the page if the state has no XML.
    window.open(window.location.href, "_self");
  }
};
