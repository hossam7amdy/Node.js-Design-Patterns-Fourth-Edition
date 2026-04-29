import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { isHotIn } from './is-hot-in.ts'
import type { CityTemperature } from './is-hot-in.ts'

describe('isHotIn', { concurrency: true, timeout: 500 }, () => {
  it('Should be called with the expected URL query', async t => {
    const fetchMock = t.mock.fn(_url => ({
      ok: true,
      json: (): Promise<CityTemperature> =>
        Promise.resolve({
          temp_c: 30,
          last_updated: new Date().toISOString(),
        }),
    }))
    t.mock.method(global, 'fetch', fetchMock)

    const city = 'Cairo'
    await isHotIn(city)

    assert.ok(fetchMock.mock.calls[0]?.arguments[0]?.includes(city))
  })

  it('Should return true when the temperature is greater than 30°C', async t => {
    t.mock.method(global, 'fetch', (_url: string) => ({
      ok: true,
      json: (): Promise<CityTemperature> =>
        Promise.resolve({
          temp_c: 31,
          last_updated: new Date().toISOString(),
        }),
    }))

    const isHot = await isHotIn('Cairo')

    assert.equal(isHot, true)
  })

  it('Should return false when the temperature is less than 30°C', async t => {
    t.mock.method(global, 'fetch', (_url: string) => ({
      ok: true,
      json: (): Promise<CityTemperature> =>
        Promise.resolve({
          temp_c: 29,
          last_updated: new Date().toISOString(),
        }),
    }))

    const isHot = await isHotIn('Cairo')

    assert.equal(isHot, false)
  })
})
