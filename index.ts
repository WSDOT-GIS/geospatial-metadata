import { toObject, toHtmlFragment} from "./geospatialMetadata";

(function(){

let url, request, dataUrlRe, match, xml;

dataUrlRe = /^data\:([^;,]+)?(?:;(base64))?,([A-Za-z0-9+\/]+)/i; // [whole, MIME-type?, base64?, content]

/**
 * Reset the page content to the data from the data URI link.
 * @param {Event} e - Link click event
 * @returns {Boolean|undefined}
 */
function handleDataUrlLinkClick(e) {
    let a = e.target || e.currentTarget;
    let match = a.href.match(dataUrlRe);
    let xml;
    if (match && match.length > 3) {
        xml = atob(match[3]);
        document.body.innerHTML = "";
        handleXml(xml);
        try {
            window.history.pushState(xml, "Embedded HTML", "#" + a.href);
        } catch (e) {
            window.history.pushState(xml, "Embedded HTML", "#embedded");
        }
        window.scroll(0, 0); // scroll back to the top of the page.
        // Stop the navigation.
        return false;
    }

}

function disableBootstrapStylesheets() {
    let i, l, ss, toDisable = /bootstrap/;
    for (i = 0, l = document.styleSheets.length; i < l; i++) {
        ss = document.styleSheets[i];
        if (toDisable.test(ss.href)) {
            ss.disabled = true;
        }
    }
}

function handleXml(xml) {
    let frag, title;
    if (typeof xml == "string") {
        xml = (function () {
            let parser = new DOMParser();
            return parser.parseFromString(xml, "text/xml");
        }());
    }
    frag = toHtmlFragment(xml);
    document.body.appendChild(frag);
    title = document.body.querySelector("header > h1");
    title = title ? title.textContent : null;

    document.title = title;

    let links = document.querySelectorAll("a[href]"); // document.querySelectorAll("a[href^='data:text/xml;base64']"); // doesn't work in IE 11, always returns 0 nodes.

    // Setup special click event handler for data URI links.
    Array.from(links, function (link) {
        if (dataUrlRe.test(link.href)) {
            link.onclick = handleDataUrlLinkClick;
        }
    });

    disableBootstrapStylesheets();
}



if (location.search) {
    url = location.search.match(/ur[li]=([^&]+)/i); //location.search.replace(/^\?/, "");
}

if (url) {

    url = decodeURIComponent(url[1]);

    request = new XMLHttpRequest();
    request.open("get", url);

    document.body.classList.add("loading");

    request.onloadend = function (e) {
        let target = e.target || e.currentTarget || e.originalTarget;
        document.body.classList.remove("loading");
        if (target.status === 200) {
            document.body.innerHTML = "";
            document.body.classList.add("loaded");
            xml = target.responseXML;
            history.replaceState(e.target.responseText, null, location.href);
            handleXml(xml);
        }
    };

    request.send();
} else {
    // Add bootstrap stylesheets
    (function () {
        let template = document.getElementById("bootstrapStylesheetsTemplate");
        document.head.appendChild(template.content);
    }());
}

/**
 * Opens a local XML file and formats it into HTML.
 * @param {File} file
 */
function openFile(file) {
    let reader = new FileReader();
    reader.onloadend = function (progressEvent) {
        let xml = this.result;
        document.body.innerHTML = "";
        document.body.classList.add("loaded");
        handleXml(xml);
        history.pushState(xml, null, "#localfile");
    };
    reader.readAsText(file);
}

if (document.forms.length > 0) {
    let form = document.forms[0];

    form.onsubmit = function () {
        let fileInput = form.querySelector("#fileInput");
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
window.onpopstate = function (popStateEvent) {
    if (popStateEvent.state) {
        document.body.innerHTML = "";
        handleXml(popStateEvent.state);
        window.scroll(0, 0); // scroll back to the top of the page.
    } else {
        // Reload the page if the state has no XML.
        window.open(window.location, "_self");
    }
}
}());