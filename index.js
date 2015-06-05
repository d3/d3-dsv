import dsv from "./src/dsv";

var csv = dsv(",");
var tsv = dsv("\t");

export {
  csv,
  tsv,
  dsv
};
