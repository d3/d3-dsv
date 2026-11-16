import assert from "node:assert";
import {execFileSync} from "node:child_process";
import {mkdtempSync, readFileSync, rmSync} from "node:fs";
import {EOL} from "node:os";
import {join} from "node:path";
import process from "node:process";
import {rollup} from "rollup";
import {afterAll, beforeAll, it} from "vitest";

const cli = join(process.cwd(), "bin/dsv2dsv.js");
const input = "name,value\nhello,42\n";
const output = "name\tvalue\nhello\t42" + EOL;
let directory;

beforeAll(async () => {
  directory = mkdtempSync(join(process.cwd(), "test/.dsv2dsv-"));
  const bundle = await rollup({input: "src/index.js"});
  try {
    await bundle.write({file: "dist/d3-dsv.mjs", format: "es"});
  } finally {
    await bundle.close();
  }
});

afterAll(() => {
  if (directory) rmSync(directory, {recursive: true, force: true});
});

for (const flag of ["-o", "--out"]) {
  it(`dsv2dsv ${flag} writes to the specified file instead of stdout`, () => {
    const file = join(directory, `output with spaces ${flag}.tsv`);
    assert.strictEqual(execFileSync(process.execPath, [cli, "-w", "\t", flag, file], {input, encoding: "utf8"}), "");
    assert.strictEqual(readFileSync(file, "utf8"), output);
  });
}

it("dsv2dsv writes to stdout by default", () => {
  assert.strictEqual(execFileSync(process.execPath, [cli, "-w", "\t"], {input, encoding: "utf8"}), output);
});

it("dsv2dsv --out - writes to stdout", () => {
  assert.strictEqual(execFileSync(process.execPath, [cli, "-w", "\t", "--out", "-"], {input, encoding: "utf8"}), output);
});

it("dsv2dsv preserves the output encoding when writing to a file", () => {
  const file = join(directory, "encoded.tsv");
  assert.strictEqual(execFileSync(process.execPath, [cli, "-w", "\t", "-o", file, "--output-encoding", "utf16le"], {input, encoding: "utf8"}), "");
  assert.strictEqual(readFileSync(file, "utf16le"), output);
});
