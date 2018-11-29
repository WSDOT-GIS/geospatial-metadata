/**
 * @fileoverview Copies README.md from root to package subdirectory for NPM published package.
 */

const fs = require("fs");

console.log("copying README to package subdirectory...")
fs.copyFile("./README.md", "./packages/geospatial-metadata/README.md", (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log("copy successful")
    }
})