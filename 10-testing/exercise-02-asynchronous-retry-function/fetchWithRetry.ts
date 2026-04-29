export async function fetchWithRetry<T>(
  asyncFn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  if (maxRetries < 1) {
    throw new Error('maxRetries must be 1 or greater.')
  }

  let lastError: unknown
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await asyncFn()
    } catch (e) {
      lastError = e
    }
  }
  throw lastError
}
