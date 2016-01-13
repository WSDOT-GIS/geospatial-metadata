/// <reference path="gisMetadata.js" />
(function () {
    "use strict";
    var url, request, dataUrlRe, match, xml;

    dataUrlRe = /^data\:([^;,]+)?(?:;(base64))?,([A-Za-z0-9+\/]+)/i; // [whole, MIME-type?, base64?, content]

    /**
     * Reset the page content to the data from the data URI link.
     * @param {Event} e - Link click event
     * @returns {Boolean|undefined}
     */
    function handleDataUrlLinkClick(e) {
        var a = e.target || e.currentTarget;
        var match = a.href.match(dataUrlRe);
        var xml;
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

    function handleXml(xml) {
        var frag, title;
        if (typeof xml == "string") {
            xml = (function () {
                var parser = new DOMParser();
                return parser.parseFromString(xml, "text/xml");
            }());
        }
        frag = gisMetadata.toHtmlFragment(xml);
        document.body.appendChild(frag);
        title = document.body.querySelector("header > h1");
        title = title ? title.textContent : null;

        document.title = title;

        var links = document.querySelectorAll("a[href]"); // document.querySelectorAll("a[href^='data:text/xml;base64']"); // doesn't work in IE 11, always returns 0 nodes.

        // Setup special click event handler for data URI links.
        Array.from(links, function (link) {
            if (dataUrlRe.test(link.href)) {
                link.onclick = handleDataUrlLinkClick;
            }
        });
    }



    if (location.search) {
        url = location.search.replace(/^\?/, "");

        request = new XMLHttpRequest();
        request.open("get", url);

        request.onloadend = function (e) {
            xml = (e.target || e.currentTarget || e.originalTarget).responseXML;
            history.replaceState(e.target.responseText, null, location.href);
            handleXml(xml);
        };

        request.send();
    }

    /**
     * When the user clicks the back or next buttons on their browser, show the XML stored in the state.
     * @param {PopStateEvent} popStateEvent
     * @param {Object} popStateEvent.state
     */
    window.onpopstate = function (popStateEvent) {
        console.log("pop state", popStateEvent.state);
        document.body.innerHTML = "";
        handleXml(popStateEvent.state);
        window.scroll(0, 0); // scroll back to the top of the page.
    }
}());