(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals
        root.fgdcAliases = factory();
    }
}(this, function () {
    return {
        pubdate: "Publication Date",
        descript: "Description",
        supplinf: "Supplemental Information",
        timeperd: "Time Period"
    }
}));