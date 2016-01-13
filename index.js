/// <reference path="gisMetadata.js" />
(function () {
    "use strict";

    function handleXml(xml) {
        var frag = gisMetadata.toHtmlFragment(xml);
        document.body.appendChild(frag);
    }

    var url, request, dataUrlRe, match, xml;

    dataUrlRe = /^data\:([^;,]+)?(?:;(base64))?,([A-Za-z0-9+\/]+)/i;

    if (location.search) {
        url = location.search.replace(/^\?/, "");

        match = url.match(dataUrlRe);

        if (match && match.length > 3) {
            // Handle data URIs. Most likely, though, the server will refuse the request with such a URL and this code won't be reached.
            xml = atob(match[3]);
            console.log(xml);
            handleXml(xml);
        } else {
            request = new XMLHttpRequest();
            request.open("get", url);

            request.onloadend = function (e) {
                xml = (e.target || e.currentTarget || e.originalTarget).responseXML;
                handleXml(xml);
            };

            request.send();
        }
    }
}());