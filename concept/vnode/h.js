import { vnode } from "./vnode.js";

export function h(sel, data, children) {
    // sel required
    // data required
    // children required
    let text
    // case1: h('div', {}, 'this is text')
    if (typeof children === 'string') {
        text = children
        children = undefined
    // case2: h('div', {}, ['this text', h('span', {}, 'this is span')])
    } else if (Array.isArray(children)) {
        for(let i = 0; i < children.length; i++) {
            if(typeof children[i] === 'string') {
                children[i] = vnode(undefined, undefined, undefined, children[i])
            }
        }
    // case3: h('div', {}, h('span', {}, 'this is span'))
    } else {
        children = [children]
    }
    return vnode(sel, data, children, text)
}