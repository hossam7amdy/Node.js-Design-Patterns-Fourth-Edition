import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { promiseAll } from './promise-all.ts'

describe('promiseAll', { concurrency: true, timeout: 500 }, () => {
  test('resolves with an array of values when all promises resolve', async () => {
    const p1 = Promise.resolve(1)
    const p2 = Promise.resolve(2)
    const p3 = Promise.resolve(3)

    const result = await promiseAll([p1, p2, p3])

    assert.deepEqual(result, [1, 2, 3])
  })

  test('maintains the order of the original iterable, not the order of resolution', async () => {
    const p1 = new Promise(resolve => setTimeout(() => resolve(1), 50))
    const p2 = new Promise(resolve => setTimeout(() => resolve(2), 10))
    const p3 = Promise.resolve(3)

    const result = await promiseAll([p1, p2, p3])

    assert.deepEqual(result, [1, 2, 3])
  })

  test('rejects immediately if any of the promises reject', async () => {
    const p1 = Promise.resolve(1)
    const p2 = Promise.reject(new Error('Failed at p2'))
    const p3 = new Promise(resolve => setTimeout(() => resolve(3), 50))

    await assert.rejects(
      () => promiseAll([p1, p2, p3]),
      (err: Error) => {
        assert.strictEqual(err.message, 'Failed at p2')
        return true
      }
    )
  })

  test('accepts an iterable mixed with promises and non-promises', async () => {
    const p1 = Promise.resolve(1)
    const p2 = 2 // non-promise
    const p3 = new Promise(resolve => setTimeout(() => resolve(3), 10))

    const result = await promiseAll([p1, p2, p3])

    assert.deepEqual(result, [1, 2, 3])
  })

  test('resolves immediately with an empty array if an empty iterable is provided', async () => {
    const result = await promiseAll([])

    assert.deepEqual(result, [])
  })

  test('accepts non-array iterables like Set or String', async () => {
    const set = new Set([Promise.resolve(1), 2, Promise.resolve(3)])
    const setResult = await promiseAll(set)
    assert.deepEqual(setResult, [1, 2, 3])

    const stringResult = await promiseAll('abc')
    assert.deepEqual(stringResult, ['a', 'b', 'c'])
  })

  test('rejects with the reason of the first promise that rejects, even if others reject later', async () => {
    // Note: wrapping in an unhandled rejection catcher implies the second promise will trigger an unhandled rejection.
    // To avoid this, we can catch it.
    const p1 = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('First rejection')), 10)
    )
    const p2 = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Second rejection')), 50)
    )

    p2.catch(() => {}) // prevent UnhandledPromiseRejectionWarning

    await assert.rejects(
      () => promiseAll([p1, p2]),
      (err: Error) => {
        assert.strictEqual(err.message, 'First rejection')
        return true
      }
    )
  })

  test('returns a rejected promise with TypeError when passed a non-iterable', async () => {
    await assert.rejects(
      // @ts-expect-error Testing invalid runtime input
      promiseAll(null),
      TypeError
    )

    await assert.rejects(
      // @ts-expect-error Testing invalid runtime input
      promiseAll(undefined),
      TypeError
    )

    await assert.rejects(
      // @ts-expect-error Testing invalid runtime input
      promiseAll({}),
      TypeError
    )
  })
})
