var tape = require("tape"),
    dsv = require("../"),
    fs = require("fs"),
    table = require("./table");

tape("csv is an instanceof dsv", function(test) {
  test.ok(dsv.csv instanceof dsv.dsv);
  test.end();
});

tape("csv.parse(string) returns the expected objects", function(test) {
  test.deepEqual(dsv.csv.parse("a,b,c\n1,2,3\n"), table([{a: "1", b: "2", c: "3"}], ["a", "b", "c"]));
  test.deepEqual(dsv.csv.parse(fs.readFileSync("test/data/sample.csv", "utf-8")), table([{Hello: "42", World: "\"fish\""}], ["Hello", "World"]));
  test.end();
});

tape("csv.parse(string) does not strip whitespace", function(test) {
  test.deepEqual(dsv.csv.parse("a,b,c\n 1, 2,3\n"), table([{a: " 1", b: " 2", c: "3"}], ["a", "b", "c"]));
  test.end();
});

tape("csv.parse(string) parses quoted values", function(test) {
  test.deepEqual(dsv.csv.parse("a,b,c\n\"1\",2,3"), table([{a: "1", b: "2", c: "3"}], ["a", "b", "c"]));
  test.deepEqual(dsv.csv.parse("a,b,c\n\"1\",2,3\n"), table([{a: "1", b: "2", c: "3"}], ["a", "b", "c"]));
  test.end();
});

tape("csv.parse(string) parses quoted values with quotes", function(test) {
  test.deepEqual(dsv.csv.parse("a\n\"\"\"hello\"\"\""), table([{a: "\"hello\""}], ["a"]));
  test.end();
});

tape("csv.parse(string) parses quoted values with newlines", function(test) {
  test.deepEqual(dsv.csv.parse("a\n\"new\nline\""), table([{a: "new\nline"}], ["a"]));
  test.deepEqual(dsv.csv.parse("a\n\"new\rline\""), table([{a: "new\rline"}], ["a"]));
  test.deepEqual(dsv.csv.parse("a\n\"new\r\nline\""), table([{a: "new\r\nline"}], ["a"]));
  test.end();
});

tape("csv.parse(string) observes Unix, Mac and DOS newlines", function(test) {
  test.deepEqual(dsv.csv.parse("a,b,c\n1,2,3\n4,5,\"6\"\n7,8,9"), table([{a: "1", b: "2", c: "3"}, {a: "4", b: "5", c: "6"}, {a: "7", b: "8", c: "9"}], ["a", "b", "c"]));
  test.deepEqual(dsv.csv.parse("a,b,c\r1,2,3\r4,5,\"6\"\r7,8,9"), table([{a: "1", b: "2", c: "3"}, {a: "4", b: "5", c: "6"}, {a: "7", b: "8", c: "9"}], ["a", "b", "c"]));
  test.deepEqual(dsv.csv.parse("a,b,c\r\n1,2,3\r\n4,5,\"6\"\r\n7,8,9"), table([{a: "1", b: "2", c: "3"}, {a: "4", b: "5", c: "6"}, {a: "7", b: "8", c: "9"}], ["a", "b", "c"]));
  test.end();
});

tape("csv.parse(string) returns columns in the input order", function(test) {
  test.deepEqual(dsv.csv.parse("a,b,c\n").columns, ["a", "b", "c"]);
  test.deepEqual(dsv.csv.parse("a,c,b\n").columns, ["a", "c", "b"]);
  test.deepEqual(dsv.csv.parse("a,0,1\n").columns, ["a", "0", "1"]);
  test.deepEqual(dsv.csv.parse("1,0,a\n").columns, ["1", "0", "a"]);
  test.end();
});

tape("csv.parse(string, row) returns the expected converted objects", function(test) {
  function row(d) { d.Hello = -d.Hello; return d; }
  test.deepEqual(dsv.csv.parse(fs.readFileSync("test/data/sample.csv", "utf-8"), row), table([{Hello: -42, World: "\"fish\""}], ["Hello", "World"]));
  test.deepEqual(dsv.csv.parse("a,b,c\n1,2,3\n", function(d) { return d; }), table([{a: "1", b: "2", c: "3"}], ["a", "b", "c"]));
  test.end();
});

tape("csv.parse(string, row) skips rows if row returns null or undefined", function(test) {
  function row(d, i) { return [d, null, undefined, false][i]; }
  test.deepEqual(dsv.csv.parse("field\n42\n\n\n\n", row), table([{field: "42"}, false], ["field"]));
  test.deepEqual(dsv.csv.parse("a,b,c\n1,2,3\n2,3,4", function(d) { return d.a & 1 ? null : d; }), table([{a: "2", b: "3", c: "4"}], ["a", "b", "c"]));
  test.deepEqual(dsv.csv.parse("a,b,c\n1,2,3\n2,3,4", function(d) { return d.a & 1 ? undefined : d; }), table([{a: "2", b: "3", c: "4"}], ["a", "b", "c"]));
  test.end();
});

tape("csv.parse(string, row) calls row(d, i) for each row d, in order", function(test) {
  var rows = [];
  dsv.csv.parse("a\n1\n2\n3\n4", function(d, i) { rows.push({d: d, i: i}); });
  test.deepEqual(rows, [{d: {a: "1"}, i: 0}, {d: {a: "2"}, i: 1}, {d: {a: "3"}, i: 2}, {d: {a: "4"}, i: 3}]);;
  test.end();
});

tape("csv.parseRows(string) returns the expected array of array of string", function(test) {
  test.deepEqual(dsv.csv.parseRows("a,b,c\n"), [["a", "b", "c"]]);
  test.end();
});

tape("csv.parseRows(string) parses quoted values", function(test) {
  test.deepEqual(dsv.csv.parseRows("\"1\",2,3\n"), [["1", "2", "3"]]);
  test.deepEqual(dsv.csv.parseRows("\"hello\""), [["hello"]]);
  test.end();
});

tape("csv.parseRows(string) parses quoted values with quotes", function(test) {
  test.deepEqual(dsv.csv.parseRows("\"\"\"hello\"\"\""), [["\"hello\""]]);
  test.end();
});

tape("csv.parseRows(string) parses quoted values with newlines", function(test) {
  test.deepEqual(dsv.csv.parseRows("\"new\nline\""), [["new\nline"]]);
  test.deepEqual(dsv.csv.parseRows("\"new\rline\""), [["new\rline"]]);
  test.deepEqual(dsv.csv.parseRows("\"new\r\nline\""), [["new\r\nline"]]);
  test.end();
});

tape("csv.parseRows(string) parses Unix, Mac and DOS newlines", function(test) {
  test.deepEqual(dsv.csv.parseRows("a,b,c\n1,2,3\n4,5,\"6\"\n7,8,9"), [["a", "b", "c"], ["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"]]);
  test.deepEqual(dsv.csv.parseRows("a,b,c\r1,2,3\r4,5,\"6\"\r7,8,9"), [["a", "b", "c"], ["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"]]);
  test.deepEqual(dsv.csv.parseRows("a,b,c\r\n1,2,3\r\n4,5,\"6\"\r\n7,8,9"), [["a", "b", "c"], ["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"]]);
  test.end();
});

tape("csv.parseRows(string, row) returns the expected converted array of array of string", function(test) {
  function row(d, i) { if (i) d[0] = -d[0]; return d; }
  test.deepEqual(dsv.csv.parseRows(fs.readFileSync("test/data/sample.csv", "utf-8"), row), [["Hello", "World"], [-42, "\"fish\""]]);
  test.deepEqual(dsv.csv.parseRows("a,b,c\n1,2,3\n", function(d) { return d; }), [["a", "b", "c"], ["1", "2", "3"]]);
  test.end();
});

tape("csv.parseRows(string, row) skips rows if row returns null or undefined", function(test) {
  function row(d, i) { return [d, null, undefined, false][i]; }
  test.deepEqual(dsv.csv.parseRows("field\n42\n\n\n", row), [["field"], false]);
  test.deepEqual(dsv.csv.parseRows("a,b,c\n1,2,3\n2,3,4", function(d, i) { return i & 1 ? null : d; }), [["a", "b", "c"], ["2", "3", "4"]]);
  test.deepEqual(dsv.csv.parseRows("a,b,c\n1,2,3\n2,3,4", function(d, i) { return i & 1 ? undefined : d; }), [["a", "b", "c"], ["2", "3", "4"]]);
  test.end();
});

tape("csv.parseRows(string, row) invokes row(d, i) for each row d, in order", function(test) {
  var rows = [];
  dsv.csv.parseRows("a\n1\n2\n3\n4", function(d, i) { rows.push({d: d, i: i}); });
  test.deepEqual(rows, [{d: ["a"], i: 0}, {d: ["1"], i: 1}, {d: ["2"], i: 2}, {d: ["3"], i: 3}, {d: ["4"], i: 4}]);
  test.end();
});

tape("csv.format(array) takes an array of objects as input", function(test) {
  test.deepEqual(dsv.csv.format([{a: 1, b: 2, c: 3}]), "a,b,c\n1,2,3");
  test.end();
});

tape("csv.format(array) escapes field names and values containing delimiters", function(test) {
  test.deepEqual(dsv.csv.format([{"foo,bar": true}]), "\"foo,bar\"\ntrue");
  test.deepEqual(dsv.csv.format([{field: "foo,bar"}]), "field\n\"foo,bar\"");
  test.end();
});

tape("csv.format(array) computes the union of all fields", function(test) {
  test.deepEqual(dsv.csv.format([{a: 1}, {a: 1, b: 2}, {a: 1, b: 2, c: 3}, {b: 1, c: 2}, {c: 1}]), "a,b,c\n1,,\n1,2,\n1,2,3\n,1,2\n,,1");
  test.end();
});

tape("csv.format(array) orders fields by first-seen", function(test) {
  test.deepEqual(dsv.csv.format([{a: 1, b: 2}, {c: 3, b: 4}, {c: 5, a: 1, b: 2}]), "a,b,c\n1,2,\n,4,3\n1,2,5");
  test.end();
});

tape("csv(\"|\").format(array, columns) observes the specified array of column names", function(test) {
  test.deepEqual(dsv.csv.format([{a: 1, b: 2, c: 3}], ["c", "b", "a"]), "c,b,a\n3,2,1");
  test.deepEqual(dsv.csv.format([{a: 1, b: 2, c: 3}], ["c", "a"]), "c,a\n3,1");
  test.deepEqual(dsv.csv.format([{a: 1, b: 2, c: 3}], []), "\n");
  test.deepEqual(dsv.csv.format([{a: 1, b: 2, c: 3}], ["d"]), "d\n");
  test.end();
});

tape("csv.formatRows(array) takes an array of array of string as input", function(test) {
  test.deepEqual(dsv.csv.formatRows([["a", "b", "c"], ["1", "2", "3"]]), "a,b,c\n1,2,3");
  test.end();
});

tape("csv.formatRows(array) separates lines using Unix newline", function(test) {
  test.deepEqual(dsv.csv.formatRows([[], []]), "\n");
  test.end();
});

tape("csv.formatRows(array) does not strip whitespace", function(test) {
  test.deepEqual(dsv.csv.formatRows([["a ", " b", "c"], ["1", "2", "3 "]]), "a , b,c\n1,2,3 ");
  test.end();
});

tape("csv.formatRows(array) does not quote simple values", function(test) {
  test.deepEqual(dsv.csv.formatRows([["a"], [1]]), "a\n1");
  test.end();
});

tape("csv.formatRows(array) escapes double quotes", function(test) {
  test.deepEqual(dsv.csv.formatRows([["\"fish\""]]), "\"\"\"fish\"\"\"");
  test.end();
});

tape("csv.formatRows(array) escapes Unix newlines", function(test) {
  test.deepEqual(dsv.csv.formatRows([["new\nline"]]), "\"new\nline\"");
  test.end();
});

tape("csv.formatRows(array) escapes values containing delimiters", function(test) {
  test.deepEqual(dsv.csv.formatRows([["oxford,comma"]]), "\"oxford,comma\"");
  test.end();
});
