/// <reference path="gisMetadata.js" />
(function () {
    "use strict";

    var url;
    var request;


    if (location.search) {
        url = location.search.replace(/^\?/, "");

        request = new XMLHttpRequest();
        request.open("get", url);

        request.onloadend = function (e) {
            var xml = (e.target || e.currentTarget || e.originalTarget).responseXML;
            var frag = gisMetadata.toHtmlFragment(xml);
            document.body.appendChild(frag);
        };

        request.send();
    }
}());