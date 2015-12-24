Geospatial Metadata
===================

A JavaScript library for parsing and converting [Geospatial Metadata].

TODO
-----

Parse the `reference/fgdc.txt` file into JSON to get complete list of elements. This can be used to replace the `fgdcAliases.js` file.

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


[Geospatial Metadata]:http://www.fgdc.gov/metadata/geospatial-metadata-standards