import assert from "assert";
import {execFile} from "child_process";

it("dsv2json --auto-type infers types", (done) => {
  execFile("node", ["bin/dsv2json.js", "--auto-type", "test/data/sample.csv"], {encoding: "utf8"}, (error, stdout) => {
    if (error) return done(error);
    try {
      assert.deepStrictEqual(JSON.parse(stdout), [{Hello: 42, World: "\"fish\""}]);
      done();
    } catch (e) {
      done(e);
    }
  });
});
