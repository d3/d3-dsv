var tape = require("tape"),
    dsv = require("../");

tape("autoType(object) mutates in-place", function(test) {
  var object = {foo: "4.2"};
  test.strictEqual(dsv.autoType(object), object);
  test.deepEqual(object, {foo: 4.2});
  test.end();
});

tape("autoType(object) detects numbers", function(test) {
  test.deepEqual(dsv.autoType({foo: "4.2"}), {foo: 4.2});
  test.deepEqual(dsv.autoType({foo: "04.2"}), {foo: 4.2});
  test.deepEqual(dsv.autoType({foo: "-4.2"}), {foo: -4.2});
  test.deepEqual(dsv.autoType({foo: "1e4"}), {foo: 10000});
  test.end();
});

tape("autoType(object) detects NaN", function(test) {
  test.equal(Number.isNaN(dsv.autoType({foo: "NaN"}).foo), true);
  test.end();
});

// https://www.ecma-international.org/ecma-262/9.0/index.html#sec-date-time-string-format
// When the time zone offset is absent, date-only forms are interpreted as a UTC time and date-time forms are interpreted as a local time.
// YYYY is ambiguous with number, so the number takes priority.
tape("autoType(object) detects dates", function(test) {
  test.deepEqual(dsv.autoType({foo: "2018-01"}), {foo: new Date("2018-01-01T00:00:00.000Z")});
  test.deepEqual(dsv.autoType({foo: "2018-01-01"}), {foo: new Date("2018-01-01T00:00:00.000Z")});
  test.end();
});

tape("autoType(object) detects extended years", function(test) {
  test.deepEqual(dsv.autoType({foo: "-010001-01-01T00:00:00Z"}), {foo: new Date("-010001-01-01T00:00:00Z")});
  test.deepEqual(dsv.autoType({foo: "+010001-01-01T00:00:00Z"}), {foo: new Date("+010001-01-01T00:00:00Z")});
  test.end();
});

tape("autoType(object) detects date-times", function(test) {
  test.deepEqual(dsv.autoType({foo: "2018T00:00Z"}), {foo: new Date("2018-01-01T00:00:00.000Z")});
  test.deepEqual(dsv.autoType({foo: "2018T00:00+08:00"}), {foo: new Date("2017-12-31T16:00:00.000Z")});
  test.deepEqual(dsv.autoType({foo: "2018-01T12:23"}), {foo: new Date("2018-01-01T12:23:00.000")});
  test.deepEqual(dsv.autoType({foo: "2018-01T12:23Z"}), {foo: new Date("2018-01-01T12:23:00.000Z")});
  test.deepEqual(dsv.autoType({foo: "2018-01T12:23+00:00"}), {foo: new Date("2018-01-01T12:23:00.000Z")});
  test.deepEqual(dsv.autoType({foo: "2018-01-01T00:00"}), {foo: new Date("2018-01-01T00:00:00.000")});
  test.deepEqual(dsv.autoType({foo: "2018-01-01T00:00+00:00"}), {foo: new Date("2018-01-01T00:00:00.000Z")});
  test.deepEqual(dsv.autoType({foo: "2018-01-01T00:00-00:00"}), {foo: new Date("2018-01-01T00:00:00.000Z")});
  test.end();
});

tape("autoType(object) detects booleans", function(test) {
  test.deepEqual(dsv.autoType({foo: "true"}), {foo: true});
  test.deepEqual(dsv.autoType({foo: "false"}), {foo: false});
  test.end();
});

tape("autoType(object) detects null", function(test) {
  test.deepEqual(dsv.autoType({foo: ""}), {foo: null});
  test.end();
});

tape("autoType(object) detects strings", function(test) {
  test.deepEqual(dsv.autoType({foo: "yes"}), {foo: "yes"});
  test.deepEqual(dsv.autoType({foo: "no"}), {foo: "no"});
  test.deepEqual(dsv.autoType({foo: "01/01/2018"}), {foo: "01/01/2018"});
  test.deepEqual(dsv.autoType({foo: "January 1, 2018"}), {foo: "January 1, 2018"});
  test.deepEqual(dsv.autoType({foo: "1,431"}), {foo: "1,431"});
  test.deepEqual(dsv.autoType({foo: "$1.00"}), {foo: "$1.00"});
  test.deepEqual(dsv.autoType({foo: "(1.00)"}), {foo: "(1.00)"});
  test.deepEqual(dsv.autoType({foo: "Nan"}), {foo: "Nan"});
  test.deepEqual(dsv.autoType({foo: "True"}), {foo: "True"});
  test.deepEqual(dsv.autoType({foo: "False"}), {foo: "False"});
  test.deepEqual(dsv.autoType({foo: "TRUE"}), {foo: "TRUE"});
  test.deepEqual(dsv.autoType({foo: "FALSE"}), {foo: "FALSE"});
  test.deepEqual(dsv.autoType({foo: "NAN"}), {foo: "NAN"});
  test.deepEqual(dsv.autoType({foo: "nan"}), {foo: "nan"});
  test.deepEqual(dsv.autoType({foo: "NA"}), {foo: "NA"});
  test.deepEqual(dsv.autoType({foo: "na"}), {foo: "na"});
  test.end();
});

tape("autoType(object) ignores leading and trailing whitespace", function(test) {
  test.deepEqual(dsv.autoType({foo: " 4.2 "}), {foo: 4.2});
  test.deepEqual(dsv.autoType({foo: " -4.2 "}), {foo: -4.2});
  test.deepEqual(dsv.autoType({foo: " 1e4 "}), {foo: 10000});
  test.deepEqual(dsv.autoType({foo: " 2018-01 "}), {foo: new Date("2018-01-01T00:00:00.000Z")});
  test.deepEqual(dsv.autoType({foo: " 2018T00:00Z "}), {foo: new Date("2018-01-01T00:00:00.000Z")});
  test.equal(Number.isNaN(dsv.autoType({foo: " NaN "}).foo), true);
  test.deepEqual(dsv.autoType({foo: " true "}), {foo: true});
  test.deepEqual(dsv.autoType({foo: " "}), {foo: null});
  test.end();
});

tape("autoType(array) mutates in-place", function(test) {
  var array = ["4.2"];
  test.strictEqual(dsv.autoType(array), array);
  test.deepEqual(array, [4.2]);
  test.end();
});

tape("autoType(array) can take an array", function(test) {
  test.deepEqual(dsv.autoType(["4.2", " 2018-01 "]), [4.2, new Date("2018-01-01T00:00:00.000Z")]);
  test.end();
});
