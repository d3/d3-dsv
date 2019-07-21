export default function autoType(object) {
  for (var key in object) {
    var value = object[key].trim(), number, m;
    if (!value) value = null;
    else if (value === "true") value = true;
    else if (value === "false") value = false;
    else if (value === "NaN") value = NaN;
    else if (!isNaN(number = +value)) value = number;
    else if (m = value.match(/^([-+]\d{2})?(\d{4}(-\d{2}(-\d{2})?)?)(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/)) {
      if (fixtz && !!m[5] && !m[8]) value += tzoffset(m[2]);
      value = new Date(value);
    }
    else continue;
    object[key] = value;
  }
  return object;
}

// https://github.com/d3/d3-dsv/issues/45
var fixtz = new Date("2019-01-01T00:00").getHours() || new Date("2019-07-01T00:00").getHours();

function tzoffset(day) {
  var offset = -new Date(day).getTimezoneOffset() / 60;
  return (
      offset < -9 ? "-" + -offset
    : offset < 0 ? "-0" + -offset
    : offset < 10 ? "+0" + offset
    : "+" + offset
  ) + ":00";
}
