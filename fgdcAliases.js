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
        cntinfo: "Contact Info",
        direct: "Direct Spatial Reference Method",
        distinfo: "Distribution Information",
        distliab: "Distribution Liability",
        distrib: "Distributor",
        descript: "Description",
        metainfo: "Metadata Reference Information",
        metc: "Metadata Contact",
        metd: "Metadata Date",
        metstdn: "Metadata Standard Name",
        metstdv: "Metadata Standard Version",
        mettc: "Metadata Time Convention",
        ptcontac: "Point of Contact",
        pubdate: "Publication Date",
        ptvctcnt: "Point and Vector Object Count",
        ptvctinf: "Point and Vector Object Information",
        sdtsterm: "SDTS Terms Description",
        sdtstype: "SDTS Point and Vector Object Type",
        spdoinfo: "Spatial Data Organization Information",
        spdom: "Spatial Domain",
        supplinf: "Supplemental Information",
        timeperd: "Time Period",
        useconst: "Use Constraints"
    }
}));