export default function autoType(object) {
  for (var key in object) {
    var value = object[key].trim(), number;
    if (/^(|null|NULL)$/.test(value)) value = null;
    else if (/^(undefined|UNDEFINED)$/.test(value)) value = undefined;
    else if (/^(true|TRUE)$/.test(value)) value = true;
    else if (/^(false|FALSE)$/.test(value)) value = false;
    else if (/^(NaN|NA[N]?|na[n]?)$/.test(value)) value = NaN;
    else if (!isNaN(number = +value)) value = number;
    else if (/^([-+]\d{2})?\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/.test(value)) value = new Date(value);
    else continue;
    object[key] = value;
  }
  return object;
}
