import { Vue_OPTIONS } from "../.."
export function initMixin(Vue) {
    Vue.prototype._init = function (options: Vue_OPTIONS) {
        const vm = this
        vm.$options = options
        initState(vm)
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