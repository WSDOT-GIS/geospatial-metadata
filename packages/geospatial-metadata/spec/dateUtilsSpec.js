let dateUtils = require("../dist/dateUtils.js");
parseDate = dateUtils.parseDate;

describe("dateUtils test", () => {
    it("should be able to parse valid dates", () => {
        let yyyyMMdd = "20160608";
        let parsed = parseDate(yyyyMMdd);
        let expected = new Date(2016, 5, 8);
        expect(parsed).toEqual(expected);

        let hhMMss = "000000";
        parsed = dateUtils.parseDate(yyyyMMdd, hhMMss);
        expect(parsed).toEqual(expected);

        yyyyMMdd = "201606";
        parsed = parseDate(yyyyMMdd);
        expect(typeof parsed).toEqual("string");

        expect(() => {
            parseDate("19884242");
        }).toThrowError(Error);
    });
});