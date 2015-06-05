# d3-dsv

A parser and formatter for delimiter-separated values, most commonly comma-separated values (CSV) or tab-separated values (TSV).

To parse CSV in the browser:

```html
<script src="dsv.js"></script>
<script>

console.log(dsv.csv.parse("foo,bar\n1,2")); // [{foo: "1", bar: "2"}]

</script>
```

To parse CSV in Node.js, `npm install d3-dsv`, and then:

```js
var dsv = require("d3-dsv");

console.log(dsv.csv.parse("foo,bar\n1,2")); // [{foo: "1", bar: "2"}]
```

To define a new delimiter, use the dsv constructor:

```js
var psv = dsv.dsv("|");

console.log(psv.parse("foo|bar\n1|2")); // [{foo: "1", bar: "2"}]
```

For more usage, see [D3’s wiki page](https://github.com/mbostock/d3/wiki/CSV).
