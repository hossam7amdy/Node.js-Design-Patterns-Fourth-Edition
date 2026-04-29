import { Parser } from 'htmlparser2'

export async function getInternalLinks(pageUrl: string): Promise<Set<string>> {
  const url = new URL(pageUrl)
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch ${pageUrl}: ${response.statusText}`)
  }
  if (!response.headers.get('content-type')?.includes('text/html')) {
    throw new Error('The current URL is not a HTML page')
  }

  const internalLinks = new Set<string>()
  const parser = new Parser({
    onopentag: (name, attribs): void => {
      if (name === 'a' && attribs.href) {
        const curUrl = new URL(attribs.href, url)
        if (url.hostname === curUrl.hostname) {
          internalLinks.add(curUrl.toString())
        }
      }
    },
  })

  const body = await response.text()
  parser.end(body)
  return internalLinks
}
