var fs = require("fs");

module.exports = new Function(fs.readFileSync(__dirname + "/dsv.js", "utf8") + ";return dsv")();
