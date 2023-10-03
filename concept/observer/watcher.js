import Dep from "./dep.js";
import { queueWatcher } from '../scheduler/index.js'

let uid = 0

export default class Watcher {
    constructor (vm, exp, cb) {
        this.id = ++uid
        this.exp = exp
        this.vm = vm
        this.cb = cb
        this.getter = parsePath(vm, exp)
        this.get()
    }
    get () {
        Dep.target = this
        this.getter()
        Dep.target = null
    }
    run () {
        this.cb()
    }
    update () {
        queueWatcher(this)
    }
    addDep (dep) {
        dep.addSub(this)
    }
}
function parsePath (vm, exp) {
    return () => {
        let keys = exp.split('.')
        let obj = vm
        for(let i = 0; i < keys.length; i++) {
            obj = obj[keys[i]] 
        }
        return obj
    }
}