import { watcher1, watcher2, watcher3 } from './watchers.js'

const queue = []
let waiting = false

function flushSchedulerQueue () {
    queue.sort((a, b) => a.id - b.id)

    for (let i = 0; i < queue.length; i++) {
        let watcher = queue[i]
        watcher.run()
    }
    resetSchedulerState()
}

function resetSchedulerState () {
    queue.length = 0
    waiting = false
}

export function queueWatcher (watcher) {
    queue.push(watcher)
    if (!waiting) {
        waiting = true
        nextTick(flushSchedulerQueue)
    }
}

function nextTick (cb) {
    Promise.resolve().then(() => {cb()})
}

// test
// console.log('pushing watcher3 into queue', queueWatcher(watcher3))
// console.log('ending3')
// console.log('pushing watcher1 into queue', queueWatcher(watcher1))
// console.log('ending1')
// console.log('pushing watcher2 into queue', queueWatcher(watcher2))
// console.log('ending2')