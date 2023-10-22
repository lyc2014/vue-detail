const queue = []
let waiting = false
type HAS_ID = {
    [key: number]: boolean
}
let has: HAS_ID = {}

export function queueWatcher (watcher) {
    const id = watcher.id
    if (has[id] !== true) {
        has[id] = true
        queue.push(watcher)
        if (!waiting) {
            waiting = true
            // promise微任务时  执行flushSchedulerQueue的内容
            nextTick(flushSchedulerQueue)
        }
    }
}
function nextTick (cb) {
    Promise.resolve().then(() => {cb()})
}
function flushSchedulerQueue () {
    // id从小到大顺序排序
    queue.sort((a, b) => a.id - b.id)

    for(let i = 0; i < queue.length; i++) {
        let watcher = queue[i]
        watcher.run()
        queue.length = 0
        waiting = false
    }
}