# DSV Parser and Formatter

Extracted from [D3](http://d3js.org).

To use in Node.js, `npm install dsv`, and then:

```js
var dsv = require("dsv"),
    csv = dsv(",");

console.log(csv.parse("foo\n1")); // [{foo: 1}]
```

To use in the browser:

```html
<script src="dsv.js"></script>
<script>

var csv = dsv(",");

console.log(csv.parse("foo\n1"));

</script>
```

For more usage, see [D3's wiki page](https://github.com/mbostock/d3/wiki/CSV).
