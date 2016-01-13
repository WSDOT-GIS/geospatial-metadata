Geospatial Metadata
===================

A JavaScript library for parsing and converting [Geospatial Metadata].

Features
--------

* Convert XML document into JSON.
* Convert XML document into HTML.
    * Contact information uses [microformats] classes.

Resources
---------
* [FGDC Geospatial Metadata Standards](http://www.fgdc.gov/metadata/geospatial-metadata-standards)
* [NOAA Metadata Standards site](http://www.ncddc.noaa.gov/metadata-standards/)

TODO
-----

### Replace incomplete csdgmAliases with module parsed from complete text file ###

Parse the `reference/csdgm.txt` file into JSON to get complete list of elements. This can be used to replace the `csdgmAliases.js` file.

1. Read text line by line.
2. Use the regular expression see if the current line is the first line of an element definition.
    ```javascript
    // Matches first line of element definition
    var firstLine = /^\s*([\d\.]+)\s+(.+)\s-+\s(.+)/;
    /* [
        entire match, 
        element index number, 
        element long name, 
        description (until line break)
       ]
    */
    ```
3. Lines after the first line of an element definition are a continuation of the description from the first line.
4. The description stops when a line starting with (not including spaces) `Type: ` is encountered.
5. The `Short Name:` line indicates what the XML nodes name will be.
6. Keep reading lines until another "first line" is encountered, which indicates a new element definition.

### Add handling for the newer FGDC ISO Metadata standards ###

The code currently only has special handiling for [CSDGM] metadata XML. Newer standards have since been adopted by the [FGDC] since [CSDGM] was created. While basic HTML formatting should still work, the element names in headings will not be replaced with their long name equivalents.

### Add handling for ArcGIS Metadata XML format ###

Add code for handling [ArcGIS metadata format] XML elements. Only `Binary/Enclosure` elements are currently handled.

[ArcGIS metadata format]:http://desktop.arcgis.com/en/desktop/latest/manage-data/metadata/the-arcgis-metadata-format.htm
[CSDGM]:http://www.fgdc.gov/metadata/geospatial-metadata-standards#csdgm
[FGDC]:http://www.fgdc.gov/metadata
[Geospatial Metadata]:http://www.fgdc.gov/metadata/geospatial-metadata-standards
[microformats]:http://microformats.org/