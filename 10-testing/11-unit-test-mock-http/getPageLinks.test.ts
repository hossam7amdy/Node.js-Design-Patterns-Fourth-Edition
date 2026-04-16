import assert from 'node:assert/strict'
import { afterEach, beforeEach, suite, test } from 'node:test'
import { MockAgent, getGlobalDispatcher, setGlobalDispatcher } from 'undici'
import { getInternalLinks } from './getPageLinks.ts'

suite('getPageLinks', { concurrency: true, timeout: 500 }, () => {
  // naive implementation (real HTTP request)
  test.skip('It fetches all the internal links from a page', async () => {
    const links = await getInternalLinks('https://loige.co')
    assert.deepEqual(
      links,
      new Set([
        'https://loige.co/blog',
        'https://loige.co/speaking',
        'https://loige.co/about',
      ])
    )
  })

  test('It fetches all the internal links from a page', async t => {
    const mockHtml = `
    <html>
      <body>
        <a href="https://loige.co/blog">Blog</a>
        <a href="/speaking">Speaking</a>
        <a href="/about">About</a>
        <a href="https://www.linkedin.com/in/lucianomammino/">My LinkedIn profile</a>
        <a href="/about">About</a>
      </body>
    </html>
  `

    t.mock.method(global, 'fetch', async (_url: string) => ({
      ok: true,
      status: 200,
      headers: {
        get: (key: string): string | null =>
          key === 'content-type' ? 'text/html; charset=utf-8' : null,
      },
      text: async (): Promise<string> => mockHtml,
    }))

    const links = await getInternalLinks('https://loige.co')

    assert.deepEqual(
      links,
      new Set([
        'https://loige.co/blog',
        'https://loige.co/speaking',
        'https://loige.co/about',
      ])
    )
  })

  test('It fetches all the internal links from a page (with undici)', async _t => {
    const agent = new MockAgent()
    agent.disableNetConnect()
    setGlobalDispatcher(agent)

    const mockHtml = `
    <html>
      <body>
        <a href="https://loige.co/blog">Blog</a>
        <a href="/speaking">Speaking</a>
        <a href="/about">About</a>
        <a href="https://www.linkedin.com/in/lucianomammino/">My LinkedIn profile</a>
        <a href="/about">About</a>
      </body>
    </html>
  `

    agent
      .get('https://loige.co')
      .intercept({
        path: '/',
        method: 'GET',
      })
      .reply(200, mockHtml, {
        headers: {
          'content-type': 'text/html; charset=utf-8',
        },
      })

    const links = await getInternalLinks('https://loige.co')

    assert.deepEqual(
      links,
      new Set([
        'https://loige.co/blog',
        'https://loige.co/speaking',
        'https://loige.co/about',
      ])
    )
  })
})

suite('example with undici and beforeEach + afterEach', () => {
  let agent: MockAgent
  const originalGlobalDispatcher = getGlobalDispatcher()

  beforeEach(() => {
    agent = new MockAgent()
    agent.disableNetConnect()
    setGlobalDispatcher(agent)
  })

  afterEach(() => {
    setGlobalDispatcher(originalGlobalDispatcher)
  })

  test('a test...', () => {
    /* ... */
  })
  test('another test...', () => {
    /* ... */
  })
})
