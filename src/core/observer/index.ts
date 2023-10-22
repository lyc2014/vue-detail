import Dep from './dep'
export function observe(value) {
    if (Object.prototype.toString.call(value) !== '[object Object]') {
        return
    }
    return new Observer(value)
}
export class Observer {
    value: any;
    dep;
    constructor (value) {
        this.value = value
        this.dep = new Dep()
        this.walk(value)
    }
    walk (obj) {
        const keys = Object.keys(obj)
        for(let i = 0; i <keys.length; i++) {
            defineReactive(obj, keys[i])
        }
    }
}
export function defineReactive(obj, key) {
    // 通过一个闭包 dep 将 observer (监听的属性) 和 watchers 绑定在一起
    const dep = new Dep()
    let val = obj[key]
    let childOb = observe(val) //如果val不是对象 会return undefined
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter () {
            const value = val
            if (Dep.target) {
                // Dep.target 指向一个watcher   dep.depend()里面会使用到这个watcher
                dep.depend()
            }
            return value
        },
        set: function reactiveSetter (newVal) {
            const value = val
            if (newVal === value) return
            val = newVal
            dep.notify()
        }
    })
}