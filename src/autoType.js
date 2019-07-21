export default function autoType(object) {
  var m,
    tzFix = (new Date("2019-01-01T00:00").getHours() || new Date("2019-07-01T00:00").getHours())
      ? new Date().getTimezoneOffset() * 60000
      : false;
  for (var key in object) {
    var value = object[key].trim(), number;
    if (!value) value = null;
    else if (value === "true") value = true;
    else if (value === "false") value = false;
    else if (value === "NaN") value = NaN;
    else if (!isNaN(number = +value)) value = number;
    else if (m = value.match(/^([-+]\d{2})?\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/)) {
      value = new Date(value);
      if (tzFix && !m[7]) value = new Date(+value + tzFix);
    }
    else continue;
    object[key] = value;
  }
  return object;
}
