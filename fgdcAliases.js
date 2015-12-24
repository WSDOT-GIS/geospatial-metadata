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
        accconst: "Access Constraints",

        attracc: "Attribute Accuracy",
        attraccr: "Attribute Accuracy Report",

        bounding: "Bounding Coordinates",
            westbc: "West Bounding Coordinate",
            eastbc: "East Bounding Coordinate",
            northbc: "North Bounding Coordinate",
            southbc: "South Bounding Coordinate",

        citeinfo: "Citation Information",
        cntinfo: "Contact Info",
        cntorg: "Contact Organization",
        cntorgp: "Contact Organization Primary",
        cntper: "Contact Person",
        cntpos: "Contact Position",
        cntvoice: "Contact Voice Telephone",
        cntemail: "Contact Email",
        current: "Currentness Reference",
        datacred: "Data Set Credit",
        dataqual: "Data Quality Information",
        direct: "Direct Spatial Reference Method",
        distinfo: "Distribution Information",
        distliab: "Distribution Liability",
        distrib: "Distributor",
        descript: "Description",
        geoform: "Geospatial Data Presentation Form",
        idinfo:"Identification Information",
        metainfo: "Metadata Reference Information",
        metc: "Metadata Contact",
        metd: "Metadata Date",
        metstdn: "Metadata Standard Name",
        metstdv: "Metadata Standard Version",
        mettc: "Metadata Time Convention",
        native: "Native Data Set Environment",
        origin: "Originator",
        posacc: "Positional Accuracy",
            horizpa: "Horizontal Positional Accuracy",
            horizpar: "Horizontal Positional Accuracy Report",
        ptcontac: "Point of Contact",
        proccont: "Process Contact",
        procdate: "Process Date",
        procdesc: "Process Description",
        procstep: "Process Step",
        proctime: "Process Time",
        pubdate: "Publication Date",
        ptvctcnt: "Point and Vector Object Count",
        ptvctinf: "Point and Vector Object Information",
        sdtsterm: "SDTS Terms Description",
        sdtstype: "SDTS Point and Vector Object Type",
        spdoinfo: "Spatial Data Organization Information",
        spdom: "Spatial Domain",
        supplinf: "Supplemental Information",
        timeinfo: "Time Period Information",
        timeperd: "Time Period",
        update: "Maintenance and Update Frequency",
        useconst: "Use Constraints",


        horizsys: "Horizontal Coordinate System Definition",
            spref: "Spatial Reference Information",
            mapproj: "Map Projection",
            lambertc: "Lambert Conformal Conic",
            stdparll: "Standard Parallel",
            longcm: "Longitude of Central Meridian",
            latprjo: "Latitude of Projection Origin",
            feast: "False Easting",
            fnorth: "False Northing",

        planci: "Planar Coordinate Information",
            plance: "Planar Coordinate Encoding Method",
            coordrep: "Coordinate Representation",
            absres: "Abscissa Resolution",
            ordres: "Ordinate Resolution",
            plandu: "Planar Distance Unit",

        geodedic: "Geodedic Model",
            horizdn: "Horizontal Datum Name",
            ellips: "Ellipsoid Name",
            semiaxis: "Semi-major Axis",
            denflat: "Denominator of Flattening Ratio"



    }
}));