import Dep from './dep.js'
import Watcher from './watcher.js'
function observe (value) {
    // only consider the type of plain Object
    if (!Object.prototype.toString.call(value) === '[object Object]') {
        return
    }
    return new Observer(value)
}
class Observer {
    constructor (value) {
        this.value = value
        this.walk(value)
    }
    walk (obj) {
        let keys = Object.keys(obj)
        for(let i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i])
        }
    }
}
function defineReactive (obj, key) {
    let val = obj[key]
    let dep = new Dep()
    let child = observe(val)
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get () {
            if (Dep.target) {
                Dep.target.addDep(dep)
            }
            return val
        },
        set (newVal) {
            if (val !== newVal) {
                val = newVal
                dep.notify()
            }
        }
    })
}

let vm = {
    a: 1,
    b: 2,
    c: {
        d: 3
    }
}
observe(vm)
new Watcher(vm, 'a', function () {
    console.log('vm.a is changed')
})
new Watcher(vm, 'c.d', function () {
    console.log('vm.c.d is changed')
})
vm.a = 3
console.log(1)
vm.c.d = 5
console.log(2)
