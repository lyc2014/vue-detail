(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    var queue = [];
    var waiting = false;
    var has = {};
    function queueWatcher(watcher) {
        var id = watcher.id;
        if (has[id] !== true) {
            has[id] = true;
            queue.push(watcher);
            if (!waiting) {
                waiting = true;
                // promise微任务时  执行flushSchedulerQueue的内容
                nextTick(flushSchedulerQueue);
            }
        }
    }
    function nextTick(cb) {
        Promise.resolve().then(function () { cb(); });
    }
    function flushSchedulerQueue() {
        // id从小到大顺序排序
        queue.sort(function (a, b) { return a.id - b.id; });
        for (var i = 0; i < queue.length; i++) {
            var watcher = queue[i];
            watcher.run();
            queue.length = 0;
            waiting = false;
        }
    }

    var uid$1 = 0;
    var Dep = /** @class */ (function () {
        function Dep() {
            this.id = uid$1++;
            this.subs = [];
        }
        Dep.prototype.addSub = function (sub) {
            this.subs.push(sub);
        };
        Dep.prototype.removeSub = function (sub) {
            if (this.subs.length) {
                var index = this.subs.indexOf(sub);
                if (index > -1) {
                    return this.subs.splice();
                }
            }
        };
        Dep.prototype.depend = function () {
            if (Dep.target) {
                Dep.target.addDep(this);
            }
        };
        Dep.prototype.notify = function () {
            var subs = this.subs.slice();
            for (var i = 0, l = subs.length; i < l; i++) {
                subs[i].update();
            }
        };
        return Dep;
    }());
    Dep.target = null;

    var uid = 0;
    var Watcher = /** @class */ (function () {
        function Watcher(vm, expOrFn, cb) {
            this.vm = vm;
            this.id = uid++;
            this.depIds = new Set();
            this.cb = cb;
            this.getter = parsePath(expOrFn);
            this.value = this.get();
        }
        Watcher.prototype.get = function () {
            Dep.target = this;
            var value;
            var vm = this.vm;
            try {
                value = this.getter.call(vm, vm);
            }
            finally {
                Dep.target = null;
            }
            return value;
        };
        Watcher.prototype.addDep = function (dep) {
            var id = dep.id;
            if (!this.depIds.has(id)) {
                this.depIds.add(id);
                dep.addSub(this);
            }
        };
        Watcher.prototype.update = function () {
            queueWatcher(this);
        };
        Watcher.prototype.run = function () {
            var value = this.get(); // 这里不会重复添加addSub this.depIds负责拦截
            if (value !== this.value) {
                var oldValue = this.value;
                this.cb.call(this.vm, value, oldValue);
            }
        };
        return Watcher;
    }());
    function parsePath(path) {
        var segments = path.split('.');
        return function (obj) {
            for (var i = 0; i < segments.length; i++) {
                if (!obj)
                    return;
                obj = obj[segments[i]];
            }
            return obj;
        };
    }

    function observe(value) {
        if (Object.prototype.toString.call(value) !== '[object Object]') {
            return;
        }
        return new Observer(value);
    }
    var Observer = /** @class */ (function () {
        function Observer(value) {
            this.value = value;
            this.dep = new Dep();
            this.walk(value);
        }
        Observer.prototype.walk = function (obj) {
            var keys = Object.keys(obj);
            for (var i = 0; i < keys.length; i++) {
                defineReactive(obj, keys[i]);
            }
        };
        return Observer;
    }());
    function defineReactive(obj, key) {
        // 通过一个闭包 dep 将 observer (监听的属性) 和 watchers 绑定在一起
        var dep = new Dep();
        var val = obj[key];
        observe(val); //如果val不是对象 会return undefined
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get: function reactiveGetter() {
                var value = val;
                if (Dep.target) {
                    // Dep.target 指向一个watcher   dep.depend()里面会使用到这个watcher
                    dep.depend();
                }
                return value;
            },
            set: function reactiveSetter(newVal) {
                var value = val;
                if (newVal === value)
                    return;
                val = newVal;
                dep.notify();
            }
        });
    }

    function initMixin(Vue) {
        Vue.prototype._init = function (options) {
            var vm = this;
            vm.$options = options;
            initState(vm);
            initWatch(vm, options.watch);
        };
    }
    function initWatch(vm, watch) {
        var keys = Object.keys(watch);
        for (var i = 0; i < keys.length; i++) {
            var exp = keys[i];
            var cb = watch[exp];
            // 注入普通watcher 自定义watcher
            new Watcher(vm, exp, cb);
        }
    }
    function initState(vm) {
        // vm._watchers = {}
        var opts = vm.$options;
        if (opts.data) {
            initData(vm, opts.data);
        }
    }
    function initData(vm, data) {
        data = vm._data = typeof data === 'function' ? data() : data || {};
        var keys = Object.keys(data);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            proxy(vm, '_data', key);
        }
        // 监听data数据
        observe(data);
    }
    function proxy(target, sourceKey, key) {
        Object.defineProperty(target, key, {
            enumerable: true,
            configurable: true,
            get: function () {
                return this[sourceKey][key];
            },
            set: function (val) {
                this[sourceKey][key] = val;
            }
        });
    }

    function Vue(options) {
        this._init(options);
    }
    // 注入 Vue.prototype._init() 方法
    initMixin(Vue);

    return Vue;

}));
