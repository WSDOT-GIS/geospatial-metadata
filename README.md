geospatial-metadata
===================

A JavaScript library for parsing and converting [Geospatial Metadata].

[Try me!](http://wsdot-gis.github.io/geospatial-metadata/)

[![GitHub](https://img.shields.io/github/issues/WSDOT-GIS/geospatial-metadata.svg?style=flat-square)](https://github.com/WSDOT-GIS/geospatial-metadata/issues)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

Features
--------

* Convert XML document into JSON.
* Convert XML document into HTML.
    * Contact information uses [microformats] classes.

Installation
------------

```console
npm install geospatial-metadata
```

Use
---

```javascript
import { toHtmlFragment } from "@wsdot/geospatial-metadata";

/**
 * Gets a metadata XML document, converts it to an HTMLDocumentFragment,
 * then appends the fragment to the document body.
 * @param {string} url - Metadata URL.
 * @returns {Promise}
 */
async function getMetadataHtml(url) {
    const response = await fetch(url);
    const xml = await response.text();
    const frag = toHtmlFragment(xml);
    document.body.append(frag);
}

const url = "https://data.wsdot.wa.gov/arcgis/rest/services/Shared/CityLimits/MapServer/exts/LayerMetadata/metadata/0?f=xml";

getMetadataHtml(url).then(() => {
    console.log(`Successfully added metadata from ${url}.`);
}, error => {
    console.error(`Error adding metadata from ${url}`, error);
});


```

Resources
---------
* [FGDC Geospatial Metadata Standards](http://www.fgdc.gov/metadata/geospatial-metadata-standards)
* [NOAA Metadata Standards site](https://www.ncddc.noaa.gov/metadata-standards/)

[ArcGIS metadata format]:https://desktop.arcgis.com/en/desktop/latest/manage-data/metadata/the-arcgis-metadata-format.htm
[CSDGM]:https://www.fgdc.gov/metadata/geospatial-metadata-standards#csdgm
[FGDC]:https://www.fgdc.gov/metadata
[Geospatial Metadata]:https://www.fgdc.gov/metadata/geospatial-metadata-standards
[microformats]:http://microformats.org/
