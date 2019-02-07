export default function autoType(object) {
  for (var key in object) {
    var string = object[key].trim(), number;
    if (/^(|null|NULL)$/.test(string)) {
      object[key] = null;
    } else if (/^(undefined|UNDEFINED)$/.test(string)) {
      object[key] = undefined;
    } else if (/^(true|TRUE)$/.test(string)) {
      object[key] = true;
    } else if (/^(false|FALSE)$/.test(string)) {
      object[key] = false;
    } else if (/^(NaN|NA[N]?|na[n]?)$/.test(string)) {
      object[key] = NaN;
    } else if (!isNaN(number = +string)) {
      object[key] = number;
    } else if (/^\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/.test(string)) {
      object[key] = new Date(string);
    }
  }
  return object;
}
