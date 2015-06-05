# DSV Parser and Formatter

To use in Node.js, `npm install d3-dsv`, and then:

```js
var dsv = require("d3-dsv");

console.log(dsv.csv.parse("foo,bar\n1,2")); // [{foo: "1", bar: "2"}]
```

To use in the browser:

```html
<script src="dsv.js"></script>
<script>

console.log(dsv.csv.parse("foo,bar\n1,2")); // [{foo: "1", bar: "2"}]

</script>
```

For more usage, see [D3's wiki page](https://github.com/mbostock/d3/wiki/CSV).
