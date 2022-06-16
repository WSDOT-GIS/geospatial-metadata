import { parseDate } from "../src/dateUtils";

test("should be able to parse valid dates", () => {
    let yyyyMMdd = "20160608";
    let parsed = parseDate(yyyyMMdd);
    const expected = new Date(2016, 5, 8);
    expect(parsed).toEqual(expected);

    const hhMMss = "000000";
    parsed = parseDate(yyyyMMdd, hhMMss);
    expect(parsed).toEqual(expected);

    yyyyMMdd = "201606";
    parsed = parseDate(yyyyMMdd);
    expect(typeof parsed).toEqual("string");

    expect(() => {
        parseDate("19884242");
    }).toThrowError(Error);
});