import assert from 'node:assert/strict'
import { once } from 'node:events'
import { suite, test } from 'node:test'
import { setImmediate } from 'node:timers/promises'
import { TaskQueue } from './TaskQueue.ts'

suite('TaskQueue', { concurrency: true, timeout: 500 }, () => {
  test('All tasks are executed and empty is emitted', async () => {
    const queue = new TaskQueue(2)
    const task1Status = Promise.withResolvers()
    let task1Completed = false
    const task2Status = Promise.withResolvers()
    let task2Completed = false
    async function task1(): Promise<void> {
      await setImmediate()
      task1Completed = true
      task1Status.resolve(true)
    }
    async function task2(): Promise<void> {
      await setImmediate()
      task2Completed = true
      task2Status.resolve(true)
    }

    queue.pushTask(task1).pushTask(task2)
    await Promise.allSettled([task1Status.promise, task2Status.promise])

    assert.ok(task1Completed, 'Task 1 completed')
    assert.ok(task2Completed, 'Task 2 completed')
    await once(queue, 'empty')
  })

  test('Respect the concurrency limit', async () => {
    const queue = new TaskQueue(4)
    let runningTasks = 0
    let maxRunningTasks = 0
    let completedTasks = 0
    async function task(): Promise<void> {
      runningTasks++
      maxRunningTasks = Math.max(maxRunningTasks, runningTasks)
      await setImmediate()
      runningTasks--
      completedTasks++
    }
    queue
      .pushTask(task)
      .pushTask(task)
      .pushTask(task)
      .pushTask(task)
      .pushTask(task)

    await once(queue, 'empty')

    assert.equal(maxRunningTasks, 4)
    assert.equal(completedTasks, 5)
  })

  test('Emits "taskError" on task failure', async () => {
    const queue = new TaskQueue(1)
    const errors: Error[] = []
    queue.on('taskError', e => {
      errors.push(e)
    })
    queue.pushTask(async () => {
      await setImmediate()
      throw new Error('error1')
    })
    queue.pushTask(async () => {
      await setImmediate()
      throw new Error('error2')
    })

    await once(queue, 'empty')

    assert.equal(errors.length, 2)
    assert.equal(errors[0]?.message, 'error1')
    assert.equal(errors[1]?.message, 'error2')
  })

  test('stats() returns correct counts', async () => {
    const queue = new TaskQueue(1)
    async function task1(): Promise<void> {
      await setImmediate()
    }

    queue.pushTask(task1)
    await setImmediate()

    assert.deepEqual(queue.stats(), { running: 1, scheduled: 0 })
    await once(queue, 'empty')
    assert.deepEqual(queue.stats(), { running: 0, scheduled: 0 })
  })
})
