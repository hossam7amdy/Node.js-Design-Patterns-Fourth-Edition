import { suite, test, mock, afterEach, after } from "node:test";
import assert from "node:assert/strict";
import { setImmediate } from "node:timers/promises";

const sampleVouchers: Voucher[] = [
  {
    id: 1,
    userId: "user1",
    balance: 10,
    expiresAt: new Date(Date.now() + 1000),
  },
  {
    id: 2,
    userId: "user1",
    balance: 5,
    expiresAt: new Date(Date.now() + 1000),
  },
  {
    id: 3,
    userId: "user1",
    balance: 3,
    expiresAt: new Date(Date.now() + 1000),
  },
];

const mockDbQuery = mock.fn(async (_sql: string, _args: unknown[]) => {
  await setImmediate();
  return sampleVouchers;
});
mock.module("./db-client.ts", {
  cache: false,
  namedExports: {
    DbClient: class {
      query = mockDbQuery;
    },
  },
});

type Voucher = import("./payments.ts").Voucher;
const { canPayWithVouchers } = await import("./payments.ts");

suite("canPayWithVouchers", { concurrency: false, timeout: 500 }, () => {
  afterEach(() => {
    mockDbQuery.mock.resetCalls();
  });
  after(() => {
    mockDbQuery.mock.restore();
  });

  test("Returns true if balance is enough", async () => {
    const result = await canPayWithVouchers("user1", 18);

    assert.equal(result, true);
    assert.equal(mockDbQuery.mock.callCount(), 1);
  });

  test("Returns false if balance is not enough", async () => {
    const result = await canPayWithVouchers("user1", 19);

    assert.equal(result, false);
    assert.equal(mockDbQuery.mock.callCount(), 1);
  });
});
