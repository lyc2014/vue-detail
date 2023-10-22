import { Vue_OPTIONS } from "../.."
import Watcher from "../observer/watcher"
import { observe } from "../observer"
export function initMixin(Vue) {
    Vue.prototype._init = function (options: Vue_OPTIONS) {
        const vm = this
        vm.$options = options
        initState(vm)
        initWatch(vm, options.watch)
    }
}
function initWatch (vm, watch) {
    if (!watch) return
    let keys = Object.keys(watch)
    for(let i = 0; i < keys.length; i++) {
        let exp = keys[i]
        let cb = watch[exp]
        // 注入普通watcher 自定义watcher
        new Watcher(vm, exp, cb)
    }
}
function initState(vm) {
    // vm._watchers = {}
    const opts = vm.$options
    if (opts.data) {
        initData(vm, opts.data)
    }
}
function initData (vm, data) {
    data = vm._data = typeof data === 'function' ? data() : data || {}
    let keys = Object.keys(data)
    for(let i = 0 ; i < keys.length; i++) {
        let key = keys[i]
        proxy(vm, '_data', key)
    }
    // 监听data数据
    observe(data)
}

function proxy (target, sourceKey, key) {
    Object.defineProperty(target, key, {
        enumerable: true,
        configurable: true,
        get () {
            return this[sourceKey][key]
        },
        set (val) {
            this[sourceKey][key] = val
        }
    })
}