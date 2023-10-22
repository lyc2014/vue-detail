import { queueWatcher } from '../scheduler';
import Dep from './dep'
let uid = 0
export default class Watcher {
    vm;
    getter;
    id;
    value;
    depIds;
    cb;
    constructor(vm, expOrFn, cb) {
        this.vm = vm
        this.id = uid++
        this.depIds = new Set()
        this.cb = cb
        this.getter = parsePath(expOrFn)
        this.value = this.get()
    }
    get () {
        Dep.target = this
        let value
        const vm = this.vm
        try {
            value = this.getter.call(vm, vm)
        } finally {
            Dep.target = null
        }
        return value
    }
    addDep (dep) {
        const id = dep.id
        if (!this.depIds.has(id)) {
            this.depIds.add(id)
            dep.addSub(this)
        }
    }
    update () {
        queueWatcher(this)
    }
    run () {
        const value = this.get() // 这里不会重复添加addSub this.depIds负责拦截
        if (value !== this.value) {
            const oldValue = this.value
            this.cb.call(this.vm, value, oldValue)
        }
    }
}

function parsePath (path) {
    const segments = path.split('.')
    return function (obj) {
        for (let i = 0; i < segments.length; i++) {
            if (!obj) return
            obj = obj[segments[i]]
        }
        return obj
    }
}