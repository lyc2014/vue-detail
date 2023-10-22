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
        function Watcher(vm, expOrFn, cb, isRenderWatcher) {
            this.vm = vm;
            this.id = uid++;
            this.depIds = new Set();
            this.cb = cb;
            if (isRenderWatcher) {
                vm._watcher = this;
            }
            if (typeof expOrFn === 'function') {
                this.getter = expOrFn;
            }
            else {
                this.getter = parsePath(expOrFn);
            }
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
        if (!watch)
            return;
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

    function vnode(sel, data, children, text) {
        var key = data ? data.key : undefined;
        return { sel: sel, data: data, children: children, text: text, key: key };
    }

    function h(sel, data, children) {
        // sel required
        // data required
        // children required
        var text;
        // case1: h('div', {}, 'this is text')
        if (typeof children === 'string') {
            text = children;
            children = undefined;
            // case2: h('div', {}, ['this text', h('span', {}, 'this is span')])
        }
        else if (Array.isArray(children)) {
            for (var i = 0; i < children.length; i++) {
                if (typeof children[i] === 'string') {
                    children[i] = vnode(undefined, undefined, undefined, children[i]);
                }
            }
            // case3: h('div', {}, h('span', {}, 'this is span'))
        }
        else {
            children = [children];
        }
        return vnode(sel, data, children, text);
    }

    function createELm(vnode) {
        var sel = vnode.sel, children = vnode.children, text = vnode.text;
        var tag = sel;
        // 生成的elm节点  后续会绑定到vnode上
        var elm;
        if (tag) {
            elm = document.createElement(tag);
            if (children) {
                for (var i = 0; i < children.length; i++) {
                    elm.appendChild(createELm(children[i]));
                }
            }
            else if (typeof text === 'string') {
                elm.appendChild(document.createTextNode(text));
            }
        }
        else {
            if (typeof text === 'string') {
                elm = document.createTextNode(text);
            }
        }
        vnode.elm = elm;
        return elm;
    }

    function patch(oldVnode, newVnode) {
        var elm;
        // 证明oldVnode是element 直接挂载newVnode
        if (oldVnode.nodeType === 1) {
            oldVnode.innerHTML = '';
            oldVnode.appendChild(createELm(newVnode));
            elm = newVnode.elm;
        }
        else {
            // 相同节点  进行 patchVNode 
            if (isSameVnode(oldVnode, newVnode)) {
                patchVnode(oldVnode, newVnode);
                elm = oldVnode.elm;
            }
            else {
                // 不同节点 直接移除 替换
                var parentElm = oldVnode.elm.parentNode;
                parentElm.insertBefore(oldVnode.elm, createELm(newVnode));
                parentElm.removeChild(oldVnode.elm);
                elm = newVnode.elm;
            }
        }
        return elm;
    }
    function isSameVnode(vnode1, vnode2) {
        var isSameTag = vnode1.sel === vnode1.sel;
        var isSameKey = vnode1.key === vnode2.key;
        var isSameText = !vnode1.sel && vnode2.sel === vnode1.sel ? vnode1.text === vnode2.text : true;
        return isSameTag && isSameKey && isSameText;
    }
    function patchVnode(oldVnode, newVnode) {
        // 已知条件这个两个节点相同了
        // 1、当它有tag,  new 有text 无children: ① old 有text无children  ② old 有children无text
        // 2、当它有tag,  new 有children 无text: ① old 有text无children  ② old 有children无text
        var oldChildren = oldVnode.children;
        var oldText = oldVnode.text;
        var newChildren = newVnode.children;
        var newText = newVnode.text;
        var elm = oldVnode.elm;
        if (newText) {
            if (oldText) {
                if (newText === oldText)
                    return;
            }
            else if (oldChildren) {
                for (var i = 0; i < oldChildren.length; i++) {
                    elm.removeChild(oldChildren[i].elm);
                }
            }
            elm.textContent = newText;
        }
        else if (newChildren) {
            if (oldText) {
                elm.textContent = '';
                for (var i = 0; i < newChildren.length; i++) {
                    elm.appendChild(createELm(newChildren[i]));
                }
            }
            else if (oldChildren) {
                updateChildren(elm, oldChildren, newChildren);
            }
        }
    }
    function updateChildren(parentElm, oldChildren, newChildren) {
        var oldStartIndex = 0;
        var oldEndIndex = oldChildren.length - 1;
        var oldStartVnode = oldChildren[oldStartIndex];
        var oldEndVnode = oldChildren[oldEndIndex];
        var newStartIndex = 0;
        var newEndIndex = newChildren.length - 1;
        var newStartVnode = newChildren[newStartIndex];
        var newEndVnode = newChildren[newEndIndex];
        var oldChKeyToIndex;
        while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
            if (oldStartVnode === undefined) {
                oldStartVnode = oldChildren[++oldStartIndex];
            }
            else if (oldEndVnode === undefined) {
                oldEndVnode = oldChildren[--oldEndIndex];
            }
            else if (isSameVnode(oldStartVnode, newStartVnode)) {
                patchVnode(oldStartVnode, newStartVnode);
                oldStartVnode = oldChildren[++oldStartIndex];
                newStartVnode = newChildren[++newStartIndex];
            }
            else if (isSameVnode(oldEndVnode, newEndVnode)) {
                patchVnode(oldEndVnode, newEndVnode);
                oldEndVnode = oldChildren[--oldEndIndex];
                newEndVnode = newChildren[--newEndIndex];
            }
            else if (isSameVnode(oldStartVnode, newEndVnode)) {
                patchVnode(oldStartVnode, newEndVnode);
                parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling);
                oldStartVnode = oldChildren[++oldStartIndex];
                newEndVnode = newChildren[--newEndIndex];
            }
            else if (isSameVnode(oldEndVnode, newStartVnode)) {
                patchVnode(oldEndVnode, newStartVnode);
                parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm);
                oldEndVnode = oldChildren[--oldEndIndex];
                newStartVnode = newChildren[++newStartIndex];
            }
            else {
                if (oldChKeyToIndex === undefined) {
                    oldChKeyToIndex = {};
                    for (var i = oldStartIndex; i <= oldEndIndex; i++) {
                        var key = oldChildren[i].key;
                        if (key) {
                            oldChKeyToIndex[key] = i;
                        }
                    }
                }
                if (oldChKeyToIndex[newStartVnode.key] === undefined) {
                    parentElm.insertBefore(createELm(newStartVnode), oldStartVnode.elm);
                }
                else {
                    var index = oldChKeyToIndex[newStartVnode.key];
                    var elmToMove = oldChildren[index];
                    patchVnode(elmToMove, newStartVnode);
                    oldChildren[index] = undefined;
                    parentElm.insertBefore(elmToMove.elm, oldStartVnode.elm);
                }
                newStartVnode = newChildren[++newStartIndex];
            }
        }
        if (newStartIndex <= newEndIndex) {
            var before = newChildren[newEndIndex + 1] === undefined ? null : newChildren[newEndIndex + 1].elm;
            for (; newStartIndex <= newEndIndex; newStartIndex++) {
                parentElm.insertBefore(createELm(newChildren[newStartIndex]), before);
            }
        }
        if (oldStartIndex <= oldEndIndex) {
            for (; oldStartIndex <= oldEndIndex; oldStartIndex++) {
                if (oldChildren[oldStartIndex] !== undefined) {
                    parentElm.removeChild(oldChildren[oldStartIndex].elm);
                }
            }
        }
    }

    function initMount(Vue) {
        Vue.prototype._update = function (vnode) {
            console.log('执行了update');
            var vm = this;
            var preVnode = vm._vnode;
            vm._vnode = vnode;
            // 第一次渲染
            if (!preVnode) {
                vm.$el = patch(vm.$el, vnode);
            }
            else { // 后面patch diff 更新
                vm.$el = patch(preVnode, vnode);
            }
        };
        Vue.prototype.$mount = function (el) {
            var vm = this;
            this.$el = el;
            var render = vm.$options.render;
            var updateComponent = function () {
                // render() 会生成vnode树
                vm._update(render.call(vm, h));
            };
            // true 代表是 renderWatcher
            new Watcher(vm, updateComponent, function () { }, true);
        };
    }

    function Vue(options) {
        this._init(options);
    }
    // 注入 Vue.prototype._init() 方法
    initMixin(Vue);
    // 注入 Vue.prototype._update Vue.prototype.mount方法
    initMount(Vue);

    return Vue;

}));
