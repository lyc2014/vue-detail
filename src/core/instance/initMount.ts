import Watcher from "../observer/watcher"
import { h } from "../vnode/h"
import { patch } from "../vnode/patch"
export function initMount (Vue) {
    Vue.prototype._update = function (vnode) {
        console.log('执行了update')
        let vm = this
        const preVnode = vm._vnode
        vm._vnode = vnode
        // 第一次渲染
        if (!preVnode) {
            vm.$el = patch(vm.$el, vnode)
        } else {  // 后面patch diff 更新
            vm.$el = patch(preVnode, vnode)
        }
    }
    Vue.prototype.$mount = function (el) {
        let vm = this
        this.$el = el
        let render = vm.$options.render
        const updateComponent = () => {
            // render() 会生成vnode树
            vm._update(render.call(vm, h))
        }
        // true 代表是 renderWatcher
        new Watcher(vm, updateComponent, () => {}, true)
    }
}