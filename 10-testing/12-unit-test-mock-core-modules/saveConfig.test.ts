import { mock, suite, test } from "node:test";
import assert from "node:assert/strict";
import { setImmediate } from "node:timers/promises";

suite("saveConfig", { concurrency: false, timeout: 500 }, () => {
  test("Creates folder (if needed)", async (t) => {
    const mockMkdir = mock.fn();
    t.mock.module("node:fs/promises", {
      cache: false,
      namedExports: {
        access: mock.fn(async (_path) => {
          await setImmediate();
          throw new Error("ENOENT");
        }),
        mkdir: mockMkdir,
        writeFile: mock.fn(),
      },
    });

    const { saveConfig } = await import("./saveConfig.ts");
    await saveConfig("path/to/config/file.json", { port: 3000 });

    assert.equal(mockMkdir.mock.callCount(), 1);
  });

  test("Does not create folder (if exists)", async (t) => {
    const mockMkdir = mock.fn();
    t.mock.module("node:fs/promises", {
      cache: false,
      namedExports: {
        access: mock.fn(async (_path) => {
          await setImmediate();
        }),
        mkdir: mockMkdir,
        writeFile: mock.fn(),
      },
    });

    const { saveConfig } = await import("./saveConfig.ts");
    await saveConfig("path/to/config/file.json", { port: 3000 });

    assert.equal(mockMkdir.mock.callCount(), 0);
  });

  test("Saves config successfully", async (t) => {
    const mockWriteFile = mock.fn();
    t.mock.module("node:fs/promises", {
      cache: false,
      namedExports: {
        access: mock.fn(async (_path) => {
          await setImmediate();
        }),
        mkdir: mock.fn(),
        writeFile: mockWriteFile,
      },
    });

    // Node.js caches ES Modules the very first time they are imported.
    const { saveConfig } = await import(
      `./saveConfig.ts?cacheBust=${Date.now()}`
    );
    await saveConfig("path/to/config/file.json", { port: 3000 });

    assert.equal(mockWriteFile.mock.callCount(), 1);
  });
});
