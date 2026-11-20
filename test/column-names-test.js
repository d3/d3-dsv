import assert from "assert";
import {dsvFormat} from "../src/index.js";

for (const delimiter of [",", "\t", "|"]) {
  const dsv = dsvFormat(delimiter);

  it(`parse preserves literal prototype-property column names with ${JSON.stringify(delimiter)}`, () => {
    const source = ["__proto__", "constructor", "toString", ""].join(delimiter) + "\n" + ["value", "ctor", "text", "empty"].join(delimiter);
    const rows = dsv.parse(source);
    assert.strictEqual(Object.prototype.hasOwnProperty.call(rows[0], "__proto__"), true);
    assert.strictEqual(rows[0].__proto__, "value");
    assert.strictEqual(rows[0].constructor, "ctor");
    assert.strictEqual(rows[0].toString, "text");
    assert.strictEqual(rows[0][""], "empty");
    assert.strictEqual(Object.getPrototypeOf(rows[0]), Object.prototype);
    assert.strictEqual(dsv.format(rows), source);
  });

  it(`parse passes the literal __proto__ column to row converters with ${JSON.stringify(delimiter)}`, () => {
    const rows = dsv.parse("__proto__\nvalue", row => ({value: row.__proto__}));
    assert.deepStrictEqual(rows[0], {value: "value"});
  });

  it(`parse fills a missing __proto__ cell with an empty string with ${JSON.stringify(delimiter)}`, () => {
    const row = dsv.parse("name" + delimiter + "__proto__\nvalue")[0];
    assert.strictEqual(Object.prototype.hasOwnProperty.call(row, "__proto__"), true);
    assert.strictEqual(row.__proto__, "");
    assert.strictEqual(row.name, "value");
  });

  it(`parse keeps the last duplicate __proto__ column with ${JSON.stringify(delimiter)}`, () => {
    const rows = dsv.parse("__proto__" + delimiter + "__proto__\nfirst" + delimiter + "last");
    assert.strictEqual(rows[0].__proto__, "last");
    assert.deepStrictEqual(rows.columns, ["__proto__", "__proto__"]);
    assert.strictEqual(Object.getPrototypeOf(rows[0]), Object.prototype);
  });
}
