export function promiseAll<T>(
  promises: Iterable<T | PromiseLike<T>>
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    let totalItems = 0
    let completedCount = 0
    const results: T[] = []

    for (const promise of promises) {
      const index = totalItems++
      Promise.resolve(promise)
        .then(value => {
          completedCount++
          results[index] = value
          if (completedCount === totalItems) {
            resolve(results)
          }
        })
        .catch(reject)
    }

    if (totalItems === 0) {
      resolve(results)
    }
  })
}
