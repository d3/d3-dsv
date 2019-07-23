var tape = require("tape"),
    dsv = require("../"),
    fs = require("fs"),
    table = require("./table"),
    spectrum = require("csv-spectrum");

function identity(x) { return x; }

tape("csvParse(string, identity) returns the expected objects", function(test) {
  test.deepEqual(dsv.csvParse("a,b,c\n1,2,3\n", identity), table([{a: "1", b: "2", c: "3"}], ["a", "b", "c"]));
  test.deepEqual(dsv.csvParse(fs.readFileSync("test/data/sample.csv", "utf-8", identity), identity), table([{Hello: "42", World: "\"fish\""}], ["Hello", "World"]));
  test.end();
});

tape("csvParse(string, identity) does not strip whitespace", function(test) {
  test.deepEqual(dsv.csvParse("a,b,c\n 1, 2 ,3 ", identity), table([{a: " 1", b: " 2 ", c: "3 "}], ["a", "b", "c"]));
  test.end();
});

tape("csvParse(string, identity) treats empty fields as the empty string", function(test) {
  test.deepEqual(dsv.csvParse("a,b,c\n1,,3", identity), table([{a: "1", b: "", c: "3"}], ["a", "b", "c"]));
  test.end();
});

tape("csvParse(string, identity) treats a trailing empty field as the empty string", function(test) {
  test.deepEqual(dsv.csvParse("a,b,c\n1,2,\n1,2,\n", identity), table([{a: "1", b: "2", c: ""}, {a: "1", b: "2", c: ""}], ["a", "b", "c"]));
  test.end();
});

tape("csvParse(string, identity) treats a trailing empty field on the last line as the empty string", function(test) {
  test.deepEqual(dsv.csvParse("a,b,c\n1,2,\n1,2,", identity), table([{a: "1", b: "2", c: ""}, {a: "1", b: "2", c: ""}], ["a", "b", "c"]));
  test.end();
});

tape("csvParse(string, identity) treats quoted empty strings as the empty string", function(test) {
  test.deepEqual(dsv.csvParse("a,b,c\n1,\"\",3", identity), table([{a: "1", b: "", c: "3"}], ["a", "b", "c"]));
  test.end();
});

tape("csvParse(string, identity) allows the last field to have unterminated quotes", function(test) {
  test.deepEqual(dsv.csvParse("a,b,c\n1,2,\"3", identity), table([{a: "1", b: "2", c: "3"}], ["a", "b", "c"]));
  test.deepEqual(dsv.csvParse("a,b,c\n1,2,\"", identity), table([{a: "1", b: "2", c: ""}], ["a", "b", "c"]));
  test.end();
});

tape("csvParse(string, identity) ignores a blank last line", function(test) {
  test.deepEqual(dsv.csvParse("a,b,c\n1,2,3\n", identity), table([{a: "1", b: "2", c: "3"}], ["a", "b", "c"]));
  test.end();
});

tape("csvParse(string, identity) treats a blank non-last line as a single-column empty string", function(test) {
  test.deepEqual(dsv.csvParse("a,b,c\n1,2,3\n\n", identity), table([{a: "1", b: "2", c: "3"}, {a: "", b: "", c: ""}], ["a", "b", "c"]));
  test.end();
});

tape("csvParse(string, identity) returns empty strings for missing columns", function(test) {
  test.deepEqual(dsv.csvParse("a,b,c\n1\n1,2", identity), table([{a: "1", b: "", c: ""}, {a: "1", b: "2", c: ""}], ["a", "b", "c"]));
  test.end();
});

tape("csvParse(string, identity) does not ignore a whitespace-only last line", function(test) {
  test.deepEqual(dsv.csvParse("a,b,c\n1,2,3\n ", identity), table([{a: "1", b: "2", c: "3"}, {a: " ", b: "", c: ""}], ["a", "b", "c"]));
  test.end();
});

tape("csvParse(string, identity) parses quoted values", function(test) {
  test.deepEqual(dsv.csvParse("a,b,c\n\"1\",2,3", identity), table([{a: "1", b: "2", c: "3"}], ["a", "b", "c"]));
  test.deepEqual(dsv.csvParse("a,b,c\n\"1\",2,3\n", identity), table([{a: "1", b: "2", c: "3"}], ["a", "b", "c"]));
  test.end();
});

tape("csvParse(string, identity) parses quoted values with quotes", function(test) {
  test.deepEqual(dsv.csvParse("a\n\"\"\"hello\"\"\"", identity), table([{a: "\"hello\""}], ["a"]));
  test.end();
});

tape("csvParse(string, identity) parses quoted values with newlines", function(test) {
  test.deepEqual(dsv.csvParse("a\n\"new\nline\"", identity), table([{a: "new\nline"}], ["a"]));
  test.deepEqual(dsv.csvParse("a\n\"new\rline\"", identity), table([{a: "new\rline"}], ["a"]));
  test.deepEqual(dsv.csvParse("a\n\"new\r\nline\"", identity), table([{a: "new\r\nline"}], ["a"]));
  test.end();
});

tape("csvParse(string, identity) observes Unix, Mac and DOS newlines", function(test) {
  test.deepEqual(dsv.csvParse("a,b,c\n1,2,3\n4,5,\"6\"\n7,8,9", identity), table([{a: "1", b: "2", c: "3"}, {a: "4", b: "5", c: "6"}, {a: "7", b: "8", c: "9"}], ["a", "b", "c"]));
  test.deepEqual(dsv.csvParse("a,b,c\r1,2,3\r4,5,\"6\"\r7,8,9", identity), table([{a: "1", b: "2", c: "3"}, {a: "4", b: "5", c: "6"}, {a: "7", b: "8", c: "9"}], ["a", "b", "c"]));
  test.deepEqual(dsv.csvParse("a,b,c\r\n1,2,3\r\n4,5,\"6\"\r\n7,8,9", identity), table([{a: "1", b: "2", c: "3"}, {a: "4", b: "5", c: "6"}, {a: "7", b: "8", c: "9"}], ["a", "b", "c"]));
  test.end();
});

tape("csvParse(string, identity) returns columns in the input order", function(test) {
  test.deepEqual(dsv.csvParse("a,b,c\n", identity).columns, ["a", "b", "c"]);
  test.deepEqual(dsv.csvParse("a,c,b\n", identity).columns, ["a", "c", "b"]);
  test.deepEqual(dsv.csvParse("a,0,1\n", identity).columns, ["a", "0", "1"]);
  test.deepEqual(dsv.csvParse("1,0,a\n", identity).columns, ["1", "0", "a"]);
  test.end();
});

tape("csvParse(string, identity) passes the csv-spectrum test suite", function(test) {
  spectrum(function(error, samples) {
    samples.forEach(function(sample) {
      var actual = dsv.csvParse(sample.csv.toString(), identity),
          expected = JSON.parse(sample.json.toString());
      delete actual.columns;
      test.deepEqual(actual, expected);
    });
    test.end();
  });
});

tape("csvParse(string, row) returns the expected converted objects", function(test) {
  function row(d) { d.Hello = -d.Hello; return d; }
  test.deepEqual(dsv.csvParse(fs.readFileSync("test/data/sample.csv", "utf-8", identity), row), table([{Hello: -42, World: "\"fish\""}], ["Hello", "World"]));
  test.deepEqual(dsv.csvParse("a,b,c\n1,2,3\n", function(d) { return d; }), table([{a: "1", b: "2", c: "3"}], ["a", "b", "c"]));
  test.end();
});

tape("csvParse(string, row) skips rows if row returns null or undefined", function(test) {
  function row(d, i) { return [d, null, undefined, false][i]; }
  test.deepEqual(dsv.csvParse("field\n42\n\n\n\n", row), table([{field: "42"}, false], ["field"]));
  test.deepEqual(dsv.csvParse("a,b,c\n1,2,3\n2,3,4", function(d) { return d.a & 1 ? null : d; }), table([{a: "2", b: "3", c: "4"}], ["a", "b", "c"]));
  test.deepEqual(dsv.csvParse("a,b,c\n1,2,3\n2,3,4", function(d) { return d.a & 1 ? undefined : d; }), table([{a: "2", b: "3", c: "4"}], ["a", "b", "c"]));
  test.end();
});

tape("csvParse(string, row) calls row(d, i) for each row d, in order", function(test) {
  var rows = [];
  dsv.csvParse("a\n1\n2\n3\n4", function(d, i) { rows.push({d: d, i: i}); });
  test.deepEqual(rows, [{d: {a: "1"}, i: 0}, {d: {a: "2"}, i: 1}, {d: {a: "3"}, i: 2}, {d: {a: "4"}, i: 3}]);
  test.end();
});

tape("csvParseRows(string, identity) returns the expected array of array of string", function(test) {
  test.deepEqual(dsv.csvParseRows("a,b,c", identity), [["a", "b", "c"]]);
  test.deepEqual(dsv.csvParseRows("a,b,c\n1,2,3", identity), [["a", "b", "c"], ["1", "2", "3"]]);
  test.end();
});

tape("csvParseRows(string, identity) does not strip whitespace", function(test) {
  test.deepEqual(dsv.csvParseRows(" 1, 2 ,3 ", identity), [[" 1", " 2 ", "3 "]]);
  test.end();
});

tape("csvParseRows(string, identity) treats empty fields as the empty string", function(test) {
  test.deepEqual(dsv.csvParseRows("1,,3", identity), [["1", "", "3"]]);
  test.end();
});

tape("csvParseRows(string, identity) treats a trailing empty field as the empty string", function(test) {
  test.deepEqual(dsv.csvParseRows("1,2,\n1,2,3", identity), [["1", "2", ""], ["1", "2", "3"]]);
  test.end();
});

tape("csvParseRows(string, identity) treats a trailing empty field on the last line as the empty string", function(test) {
  test.deepEqual(dsv.csvParseRows("1,2,\n", identity), [["1", "2", ""]]);
  test.deepEqual(dsv.csvParseRows("1,2,", identity), [["1", "2", ""]]);
  test.end();
});

tape("csvParseRows(string, identity) treats quoted empty strings as the empty string", function(test) {
  test.deepEqual(dsv.csvParseRows("\"\",2,3", identity), [["", "2", "3"]]);
  test.deepEqual(dsv.csvParseRows("1,\"\",3", identity), [["1", "", "3"]]);
  test.deepEqual(dsv.csvParseRows("1,2,\"\"", identity), [["1", "2", ""]]);
  test.end();
});

tape("csvParseRows(string, identity) allows the last field to have unterminated quotes", function(test) {
  test.deepEqual(dsv.csvParseRows("1,2,\"3", identity), [["1", "2", "3"]]);
  test.deepEqual(dsv.csvParseRows("1,2,\"", identity), [["1", "2", ""]]);
  test.end();
});

tape("csvParseRows(string, identity) ignores a blank last line", function(test) {
  test.deepEqual(dsv.csvParseRows("1,2,3\n", identity), [["1", "2", "3"]]);
  test.end();
});

tape("csvParseRows(string, identity) treats a blank non-last line as a single-column empty string", function(test) {
  test.deepEqual(dsv.csvParseRows("1,2,3\n\n", identity), [["1", "2", "3"], [""]]);
  test.deepEqual(dsv.csvParseRows("1,2,3\n\"\"\n", identity), [["1", "2", "3"], [""]]);
  test.end();
});

tape("csvParseRows(string, identity) can return rows of varying length", function(test) {
  test.deepEqual(dsv.csvParseRows("1\n1,2\n1,2,3", identity), [["1"], ["1", "2"], ["1", "2", "3"]]);
  test.end();
});

tape("csvParseRows(string, identity) does not ignore a whitespace-only last line", function(test) {
  test.deepEqual(dsv.csvParseRows("1,2,3\n ", identity), [["1", "2", "3"], [" "]]);
  test.end();
});

tape("csvParseRows(string, identity) parses quoted values", function(test) {
  test.deepEqual(dsv.csvParseRows("\"1\",2,3\n", identity), [["1", "2", "3"]]);
  test.deepEqual(dsv.csvParseRows("\"hello\"", identity), [["hello"]]);
  test.end();
});

tape("csvParseRows(string, identity) parses quoted values with quotes", function(test) {
  test.deepEqual(dsv.csvParseRows("\"\"\"hello\"\"\"", identity), [["\"hello\""]]);
  test.end();
});

tape("csvParseRows(string, identity) parses quoted values with newlines", function(test) {
  test.deepEqual(dsv.csvParseRows("\"new\nline\"", identity), [["new\nline"]]);
  test.deepEqual(dsv.csvParseRows("\"new\rline\"", identity), [["new\rline"]]);
  test.deepEqual(dsv.csvParseRows("\"new\r\nline\"", identity), [["new\r\nline"]]);
  test.end();
});

tape("csvParseRows(string, identity) parses Unix, Mac and DOS newlines", function(test) {
  test.deepEqual(dsv.csvParseRows("a,b,c\n1,2,3\n4,5,\"6\"\n7,8,9", identity), [["a", "b", "c"], ["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"]]);
  test.deepEqual(dsv.csvParseRows("a,b,c\r1,2,3\r4,5,\"6\"\r7,8,9", identity), [["a", "b", "c"], ["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"]]);
  test.deepEqual(dsv.csvParseRows("a,b,c\r\n1,2,3\r\n4,5,\"6\"\r\n7,8,9", identity), [["a", "b", "c"], ["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"]]);
  test.end();
});

tape("csvParseRows(\"\", identity) returns the empty array", function(test) {
  test.deepEqual(dsv.csvParseRows("", identity), []);
  test.end();
});

tape("csvParseRows(\"\n\", identity) returns an array of one empty string", function(test) {
  test.deepEqual(dsv.csvParseRows("\n", identity), [[""]]);
  test.deepEqual(dsv.csvParseRows("\r", identity), [[""]]);
  test.deepEqual(dsv.csvParseRows("\r\n", identity), [[""]]);
  test.end();
});

tape("csvParseRows(\"\n\n\", identity) returns an array of two empty strings", function(test) {
  test.deepEqual(dsv.csvParseRows("\n\n", identity), [[""], [""]]);
  test.end();
});

tape("csvParseRows(string, row) returns the expected converted array of array of string", function(test) {
  function row(d, i) { if (i) d[0] = -d[0]; return d; }
  test.deepEqual(dsv.csvParseRows(fs.readFileSync("test/data/sample.csv", "utf-8", identity), row), [["Hello", "World"], [-42, "\"fish\""]]);
  test.deepEqual(dsv.csvParseRows("a,b,c\n1,2,3\n", function(d) { return d; }), [["a", "b", "c"], ["1", "2", "3"]]);
  test.end();
});

tape("csvParseRows(string, row) skips rows if row returns null or undefined", function(test) {
  function row(d, i) { return [d, null, undefined, false][i]; }
  test.deepEqual(dsv.csvParseRows("field\n42\n\n\n", row), [["field"], false]);
  test.deepEqual(dsv.csvParseRows("a,b,c\n1,2,3\n2,3,4", function(d, i) { return i & 1 ? null : d; }), [["a", "b", "c"], ["2", "3", "4"]]);
  test.deepEqual(dsv.csvParseRows("a,b,c\n1,2,3\n2,3,4", function(d, i) { return i & 1 ? undefined : d; }), [["a", "b", "c"], ["2", "3", "4"]]);
  test.end();
});

tape("csvParseRows(string, row) invokes row(d, i) for each row d, in order", function(test) {
  var rows = [];
  dsv.csvParseRows("a\n1\n2\n3\n4", function(d, i) { rows.push({d: d, i: i}); });
  test.deepEqual(rows, [{d: ["a"], i: 0}, {d: ["1"], i: 1}, {d: ["2"], i: 2}, {d: ["3"], i: 3}, {d: ["4"], i: 4}]);
  test.end();
});

tape("csvFormat(array) takes an array of objects as input", function(test) {
  test.deepEqual(dsv.csvFormat([{a: 1, b: 2, c: 3}]), "a,b,c\n1,2,3");
  test.end();
});

tape("csvFormat(array) converts dates to ISO 8601", function(test) {
  test.deepEqual(dsv.csvFormat([{date: new Date(Date.UTC(2018, 0, 1))}]), "date\n2018-01-01");
  test.deepEqual(dsv.csvFormat([{date: new Date(2018, 0, 1)}]), "date\n2018-01-01T08:00Z");
  test.end();
});

tape("csvFormat(array) escapes field names and values containing delimiters", function(test) {
  test.deepEqual(dsv.csvFormat([{"foo,bar": true}]), "\"foo,bar\"\ntrue");
  test.deepEqual(dsv.csvFormat([{field: "foo,bar"}]), "field\n\"foo,bar\"");
  test.end();
});

tape("csvFormat(array) computes the union of all fields", function(test) {
  test.deepEqual(dsv.csvFormat([{a: 1}, {a: 1, b: 2}, {a: 1, b: 2, c: 3}, {b: 1, c: 2}, {c: 1}]), "a,b,c\n1,,\n1,2,\n1,2,3\n,1,2\n,,1");
  test.end();
});

tape("csvFormat(array) orders fields by first-seen", function(test) {
  test.deepEqual(dsv.csvFormat([{a: 1, b: 2}, {c: 3, b: 4}, {c: 5, a: 1, b: 2}]), "a,b,c\n1,2,\n,4,3\n1,2,5");
  test.end();
});

tape("csvFormat(array, columns) observes the specified array of column names", function(test) {
  test.deepEqual(dsv.csvFormat([{a: 1, b: 2, c: 3}], ["c", "b", "a"]), "c,b,a\n3,2,1");
  test.deepEqual(dsv.csvFormat([{a: 1, b: 2, c: 3}], ["c", "a"]), "c,a\n3,1");
  test.deepEqual(dsv.csvFormat([{a: 1, b: 2, c: 3}], []), "\n");
  test.deepEqual(dsv.csvFormat([{a: 1, b: 2, c: 3}], ["d"]), "d\n");
  test.end();
});

tape("csvFormat(array, columns) coerces column names to strings", function(test) {
  test.deepEqual(dsv.csvFormat([{a: 1, b: 2, "\"fish\"": 3}], [{toString: function() { return "\"fish\""; }}]), "\"\"\"fish\"\"\"\n3");
  test.deepEqual(dsv.csvFormat([{a: 1, b: 2, c: 3}], ["a", null, "b", undefined, "c"]), "a,,b,,c\n1,,2,,3");
  test.end();
});

tape("csvFormat(array, columns) coerces field values to strings", function(test) {
  test.deepEqual(dsv.csvFormat([{a: {toString: function() { return "\"fish\""; }}}]), "a\n\"\"\"fish\"\"\"");
  test.deepEqual(dsv.csvFormat([{a: null, b: undefined, c: 3}]), "a,b,c\n,,3");
  test.end();
});

tape("csvFormatBody(array) omits the header row", function(test) {
  test.deepEqual(dsv.csvFormatBody([{a: 1, b: 2}, {c: 3, b: 4}, {c: 5, a: 1, b: 2}]), "1,2,\n,4,3\n1,2,5");
  test.end();
});

tape("csvFormatBody(array, columns) omits the header row", function(test) {
  test.deepEqual(dsv.csvFormatBody([{a: 1, b: 2}, {c: 3, b: 4}, {c: 5, a: 1, b: 2}], ["a", "b"]), "1,2\n,4\n1,2");
  test.end();
});

tape("csvFormatRows(array) takes an array of array of string as input", function(test) {
  test.deepEqual(dsv.csvFormatRows([["a", "b", "c"], ["1", "2", "3"]]), "a,b,c\n1,2,3");
  test.end();
});

tape("csvFormatRows(array) separates lines using Unix newline", function(test) {
  test.deepEqual(dsv.csvFormatRows([[], []]), "\n");
  test.end();
});

tape("csvFormatRows(array) converts dates to ISO 8601", function(test) {
  test.deepEqual(dsv.csvFormatRows([[new Date(Date.UTC(2018, 0, 1))]]), "2018-01-01");
  test.deepEqual(dsv.csvFormatRows([[new Date(2018, 0, 1)]]), "2018-01-01T08:00Z");
  test.end();
});

tape("csvFormatRows(array) does not strip whitespace", function(test) {
  test.deepEqual(dsv.csvFormatRows([["a ", " b", "c"], ["1", "2", "3 "]]), "a , b,c\n1,2,3 ");
  test.end();
});

tape("csvFormatRows(array) does not quote simple values", function(test) {
  test.deepEqual(dsv.csvFormatRows([["a"], [1]]), "a\n1");
  test.end();
});

tape("csvFormatRows(array) escapes double quotes", function(test) {
  test.deepEqual(dsv.csvFormatRows([["\"fish\""]]), "\"\"\"fish\"\"\"");
  test.end();
});

tape("csvFormatRows(array) escapes Unix newlines", function(test) {
  test.deepEqual(dsv.csvFormatRows([["new\nline"]]), "\"new\nline\"");
  test.end();
});

tape("csvFormatRows(array) escapes Windows newlines", function(test) {
  test.deepEqual(dsv.csvFormatRows([["new\rline"]]), "\"new\rline\"");
  test.end();
});

tape("csvFormatRows(array) escapes values containing delimiters", function(test) {
  test.deepEqual(dsv.csvFormatRows([["oxford,comma"]]), "\"oxford,comma\"");
  test.end();
});
