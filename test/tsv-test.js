var tape = require("tape"),
    dsv = require("../"),
    fs = require("fs");

tape("tsv.parse(string) returns the expected objects", function(test) {
  test.deepEqual(dsv.tsv.parse("a\tb\tc\n1\t2\t3\n"), [{a: "1", b: "2", c: "3"}]);
  test.deepEqual(dsv.tsv.parse(fs.readFileSync("test/data/sample.tsv", "utf-8")), [{Hello: "42", World: "\"fish\""}]);
  test.end();
});

tape("tsv.parse(string) does not strip whitespace", function(test) {
  test.deepEqual(dsv.tsv.parse("a\tb\tc\n 1\t 2\t3\n"), [{a: " 1", b: " 2", c: "3"}]);
  test.end();
});

tape("tsv.parse(string) parses quoted values", function(test) {
  test.deepEqual(dsv.tsv.parse("a\tb\tc\n\"1\"\t2\t3"), [{a: "1", b: "2", c: "3"}]);
  test.deepEqual(dsv.tsv.parse("a\tb\tc\n\"1\"\t2\t3\n"), [{a: "1", b: "2", c: "3"}]);
  test.end();
});

tape("tsv.parse(string) parses quoted values with quotes", function(test) {
  test.deepEqual(dsv.tsv.parse("a\n\"\"\"hello\"\"\""), [{a: "\"hello\""}]);
  test.end();
});

tape("tsv.parse(string) parses quoted values with newlines", function(test) {
  test.deepEqual(dsv.tsv.parse("a\n\"new\nline\""), [{a: "new\nline"}]);
  test.deepEqual(dsv.tsv.parse("a\n\"new\rline\""), [{a: "new\rline"}]);
  test.deepEqual(dsv.tsv.parse("a\n\"new\r\nline\""), [{a: "new\r\nline"}]);
  test.end();
});

tape("tsv.parse(string) observes Unix, Mac and DOS newlines", function(test) {
  test.deepEqual(dsv.tsv.parse("a\tb\tc\n1\t2\t3\n4\t5\t\"6\"\n7\t8\t9"), [{a: "1", b: "2", c: "3"}, {a: "4", b: "5", c: "6"}, {a: "7", b: "8", c: "9"}]);
  test.deepEqual(dsv.tsv.parse("a\tb\tc\r1\t2\t3\r4\t5\t\"6\"\r7\t8\t9"), [{a: "1", b: "2", c: "3"}, {a: "4", b: "5", c: "6"}, {a: "7", b: "8", c: "9"}]);
  test.deepEqual(dsv.tsv.parse("a\tb\tc\r\n1\t2\t3\r\n4\t5\t\"6\"\r\n7\t8\t9"), [{a: "1", b: "2", c: "3"}, {a: "4", b: "5", c: "6"}, {a: "7", b: "8", c: "9"}]);
  test.end();
});

tape("tsv.parse(string, row) returns the expected converted objects", function(test) {
  function row(d) { d.Hello = -d.Hello; return d; }
  test.deepEqual(dsv.tsv.parse(fs.readFileSync("test/data/sample.tsv", "utf-8"), row), [{Hello: -42, World: "\"fish\""}]);
  test.deepEqual(dsv.tsv.parse("a\tb\tc\n1\t2\t3\n", function(d) { return d; }), [{a: "1", b: "2", c: "3"}]);
  test.end();
});

tape("tsv.parse(string, row) skips rows if row returns null or undefined", function(test) {
  function row(d, i) { return [d, null, undefined, false][i]; }
  test.deepEqual(dsv.tsv.parse("field\n42\n\n\n\n", row), [{field: "42"}, false]);
  test.deepEqual(dsv.tsv.parse("a\tb\tc\n1\t2\t3\n2\t3\t4", function(d) { return d.a & 1 ? null : d; }), [{a: "2", b: "3", c: "4"}]);
  test.deepEqual(dsv.tsv.parse("a\tb\tc\n1\t2\t3\n2\t3\t4", function(d) { return d.a & 1 ? undefined : d; }), [{a: "2", b: "3", c: "4"}]);
  test.end();
});

tape("tsv.parse(string, row) invokes row(d, i) for each row d, in order", function(test) {
  var rows = [];
  dsv.tsv.parse("a\n1\n2\n3\n4", function(d, i) { rows.push({d: d, i: i}); });
  test.deepEqual(rows, [{d: {a: "1"}, i: 0}, {d: {a: "2"}, i: 1}, {d: {a: "3"}, i: 2}, {d: {a: "4"}, i: 3}]);
  test.end();
});

tape("tsv.parseRows(string) returns the expected array of array of string", function(test) {
  test.deepEqual(dsv.tsv.parseRows("a\tb\tc\n"), [["a", "b", "c"]]);
  test.end();
});

tape("tsv.parseRows(string) parses quoted values", function(test) {
  test.deepEqual(dsv.tsv.parseRows("\"1\"\t2\t3\n"), [["1", "2", "3"]]);
  test.deepEqual(dsv.tsv.parseRows("\"hello\""), [["hello"]]);
  test.end();
});

tape("tsv.parseRows(string) parses quoted values with quotes", function(test) {
  test.deepEqual(dsv.tsv.parseRows("\"\"\"hello\"\"\""), [["\"hello\""]]);
  test.end();
});

tape("tsv.parseRows(string) parses quoted values with newlines", function(test) {
  test.deepEqual(dsv.tsv.parseRows("\"new\nline\""), [["new\nline"]]);
  test.deepEqual(dsv.tsv.parseRows("\"new\rline\""), [["new\rline"]]);
  test.deepEqual(dsv.tsv.parseRows("\"new\r\nline\""), [["new\r\nline"]]);
  test.end();
});

tape("tsv.parseRows(string) parses Unix, Mac and DOS newlines", function(test) {
  test.deepEqual(dsv.tsv.parseRows("a\tb\tc\n1\t2\t3\n4\t5\t\"6\"\n7\t8\t9"), [["a", "b", "c"], ["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"]]);
  test.deepEqual(dsv.tsv.parseRows("a\tb\tc\r1\t2\t3\r4\t5\t\"6\"\r7\t8\t9"), [["a", "b", "c"], ["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"]]);
  test.deepEqual(dsv.tsv.parseRows("a\tb\tc\r\n1\t2\t3\r\n4\t5\t\"6\"\r\n7\t8\t9"), [["a", "b", "c"], ["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"]]);
  test.end();
});

tape("tsv.parseRows(string, row) returns the expected converted array of array of string", function(test) {
  function row(d, i) { if (i) d[0] = -d[0]; return d; }
  test.deepEqual(dsv.tsv.parseRows(fs.readFileSync("test/data/sample.tsv", "utf-8"), row), [["Hello", "World"], [-42, "\"fish\""]]);
  test.deepEqual(dsv.tsv.parseRows("a\tb\tc\n1\t2\t3\n", function(d) { return d; }), [["a", "b", "c"], ["1", "2", "3"]]);
  test.end();
});

tape("tsv.parseRows(string, row) skips rows if row returns null or undefined", function(test) {
  function row(d, i) { return [d, null, undefined, false][i]; }
  test.deepEqual(dsv.tsv.parseRows("field\n42\n\n\n", row), [["field"], false]);
  test.deepEqual(dsv.tsv.parseRows("a\tb\tc\n1\t2\t3\n2\t3\t4", function(d, i) { return i & 1 ? null : d; }), [["a", "b", "c"], ["2", "3", "4"]]);
  test.deepEqual(dsv.tsv.parseRows("a\tb\tc\n1\t2\t3\n2\t3\t4", function(d, i) { return i & 1 ? undefined : d; }), [["a", "b", "c"], ["2", "3", "4"]]);
  test.end();
});

tape("tsv.parseRows(string, row) invokes row(d, i) for each row d, in order", function(test) {
  var rows = [];
  dsv.tsv.parseRows("a\n1\n2\n3\n4", function(d, i) { rows.push({d: d, i: i}); });
  test.deepEqual(rows, [{d: ["a"], i: 0}, {d: ["1"], i: 1}, {d: ["2"], i: 2}, {d: ["3"], i: 3}, {d: ["4"], i: 4}]);
  test.end();
});

tape("tsv.format(array) takes an array of objects as input", function(test) {
  test.deepEqual(dsv.tsv.format([{a: 1, b: 2, c: 3}]), "a\tb\tc\n1\t2\t3");
  test.end();
});

tape("tsv.format(array) escapes field names and values containing delimiters", function(test) {
  test.deepEqual(dsv.tsv.format([{"foo\tbar": true}]), "\"foo\tbar\"\ntrue");
  test.deepEqual(dsv.tsv.format([{field: "foo\tbar"}]), "field\n\"foo\tbar\"");
  test.end();
});

tape("tsv.format(array) computes the union of all fields", function(test) {
  test.deepEqual(dsv.tsv.format([{a: 1}, {a: 1, b: 2}, {a: 1, b: 2, c: 3}, {b: 1, c: 2}, {c: 1}]), "a\tb\tc\n1\t\t\n1\t2\t\n1\t2\t3\n\t1\t2\n\t\t1");
  test.end();
});

tape("tsv.format(array) orders fields by first-seen", function(test) {
  test.deepEqual(dsv.tsv.format([{a: 1, b: 2}, {c: 3, b: 4}, {c: 5, a: 1, b: 2}]), "a\tb\tc\n1\t2\t\n\t4\t3\n1\t2\t5");
  test.end();
});

tape("tsv.formatRows(array) takes an array of array of string as input", function(test) {
  test.deepEqual(dsv.tsv.formatRows([["a", "b", "c"], ["1", "2", "3"]]), "a\tb\tc\n1\t2\t3");
  test.end();
});

tape("tsv.formatRows(array) separates lines using Unix newline", function(test) {
  test.deepEqual(dsv.tsv.formatRows([[], []]), "\n");
  test.end();
});

tape("tsv.formatRows(array) does not strip whitespace", function(test) {
  test.deepEqual(dsv.tsv.formatRows([["a ", " b", "c"], ["1", "2", "3 "]]), "a \t b\tc\n1\t2\t3 ");
  test.end();
});

tape("tsv.formatRows(array) does not quote simple values", function(test) {
  test.deepEqual(dsv.tsv.formatRows([["a"], [1]]), "a\n1");
  test.end();
});

tape("tsv.formatRows(array) escapes double quotes", function(test) {
  test.deepEqual(dsv.tsv.formatRows([["\"fish\""]]), "\"\"\"fish\"\"\"");
  test.end();
});

tape("tsv.formatRows(array) escapes Unix newlines", function(test) {
  test.deepEqual(dsv.tsv.formatRows([["new\nline"]]), "\"new\nline\"");
  test.end();
});

tape("tsv.formatRows(array) escapes values containing delimiters", function(test) {
  test.deepEqual(dsv.tsv.formatRows([["oxford\ttab"]]), "\"oxford\ttab\"");
  test.end();
});
