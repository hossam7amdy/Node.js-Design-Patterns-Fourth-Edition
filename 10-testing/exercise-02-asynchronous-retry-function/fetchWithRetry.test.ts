import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { setImmediate } from "node:timers/promises";
import { fetchWithRetry } from "./fetchWithRetry.ts";

describe("fetchWithRetry", { concurrency: true, timeout: 500 }, () => {
  it("should fail twice and succeed on the third attempt", async () => {
    let counter = 1;
    const mockAsyncFn = mock.fn(async () => {
      await setImmediate();
      if (counter++ === 3) {
        return true;
      }
      throw new Error("Async Error");
    });

    await fetchWithRetry(mockAsyncFn, 3);

    assert.equal(mockAsyncFn.mock.callCount(), 3);
  });

  it("should return the expected value and call asyncFn exactly three times", async () => {
    let counter = 1;
    const mockAsyncFn = mock.fn(async () => {
      await setImmediate();
      if (counter++ === 3) {
        return true;
      }
      throw new Error("Async Error");
    });

    const result = await fetchWithRetry(mockAsyncFn, 3);

    assert.equal(result, true);
    assert.equal(mockAsyncFn.mock.callCount(), 3);
  });

  it("should reject and call asyncFn exactly maxRetries times", async () => {
    const mockAsyncFn = mock.fn(async () => {
      await setImmediate();
      throw new Error("Async Error");
    });

    await assert.rejects(fetchWithRetry(mockAsyncFn, 3), {
      message: "Async Error",
    });
    assert.equal(mockAsyncFn.mock.callCount(), 3);
  });
});
