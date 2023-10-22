import { createELm } from "./element"

export function patch (oldVnode, newVnode) {
    let elm
    // 证明oldVnode是element 直接挂载newVnode
    if (oldVnode.nodeType === 1) {
        oldVnode.innerHTML = ''
        oldVnode.appendChild(createELm(newVnode))

        elm = newVnode.elm
    } else {
        // 相同节点  进行 patchVNode 
        if (isSameVnode(oldVnode, newVnode)) {
            patchVnode(oldVnode, newVnode)

            elm = oldVnode.elm
        } else {
            // 不同节点 直接移除 替换
            let parentElm = oldVnode.elm.parentNode
            parentElm.insertBefore(oldVnode.elm, createELm(newVnode))
            parentElm.removeChild(oldVnode.elm)

            elm = newVnode.elm
        }
    }
    return elm
}
function isSameVnode(vnode1, vnode2) {
    let isSameTag = vnode1.sel === vnode1.sel
    let isSameKey = vnode1.key === vnode2.key
    let isSameText = !vnode1.sel && vnode2.sel === vnode1.sel ? vnode1.text === vnode2.text : true
    return isSameTag && isSameKey && isSameText
}
function patchVnode (oldVnode, newVnode) {
    // 已知条件这个两个节点相同了
    // 1、当它有tag,  new 有text 无children: ① old 有text无children  ② old 有children无text
    // 2、当它有tag,  new 有children 无text: ① old 有text无children  ② old 有children无text
    let oldChildren = oldVnode.children
    let oldText = oldVnode.text
    let newChildren = newVnode.children
    let newText = newVnode.text
    let elm = oldVnode.elm
    if (newText) {
        if (oldText) {
            if (newText === oldText) return
        } else if (oldChildren) {
            for(let i = 0; i < oldChildren.length; i++) {
                elm.removeChild(oldChildren[i].elm)
            }
        }
        elm.textContent = newText
    } else if (newChildren) {
        if (oldText) {
            elm.textContent = ''
            for(let i = 0; i < newChildren.length; i++) {
                elm.appendChild(createELm(newChildren[i]))
            }
        } else if (oldChildren) {
            updateChildren(elm, oldChildren, newChildren)
        }
    }
}

function updateChildren (parentElm, oldChildren, newChildren) {
    let oldStartIndex = 0
    let oldEndIndex = oldChildren.length - 1
    let oldStartVnode = oldChildren[oldStartIndex]
    let oldEndVnode = oldChildren[oldEndIndex]
    let newStartIndex = 0
    let newEndIndex = newChildren.length - 1
    let newStartVnode = newChildren[newStartIndex]
    let newEndVnode = newChildren[newEndIndex]
    let oldChKeyToIndex

    while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        if (oldStartVnode === undefined) {
            oldStartVnode = oldChildren[++oldStartIndex]
        } else if (oldEndVnode === undefined) {
            oldEndVnode = oldChildren[--oldEndIndex]
        } else if (isSameVnode(oldStartVnode, newStartVnode)) {
            patchVnode(oldStartVnode, newStartVnode)
            oldStartVnode = oldChildren[++oldStartIndex]
            newStartVnode = newChildren[++newStartIndex]
        } else if (isSameVnode(oldEndVnode, newEndVnode)) {
            patchVnode(oldEndVnode, newEndVnode)
            oldEndVnode = oldChildren[--oldEndIndex]
            newEndVnode = newChildren[--newEndIndex]
        } else if (isSameVnode(oldStartVnode, newEndVnode)) {
            patchVnode(oldStartVnode, newEndVnode)
            parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling)
            oldStartVnode = oldChildren[++oldStartIndex]
            newEndVnode = newChildren[--newEndIndex]
        } else if (isSameVnode(oldEndVnode, newStartVnode)) {
            patchVnode(oldEndVnode, newStartVnode)
            parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm)
            oldEndVnode = oldChildren[--oldEndIndex]
            newStartVnode = newChildren[++newStartIndex]
        } else {
            if (oldChKeyToIndex === undefined) {
                oldChKeyToIndex = {}
                for(let i = oldStartIndex; i <= oldEndIndex; i++) {
                    let key = oldChildren[i].key
                    if (key) {
                        oldChKeyToIndex[key] = i
                    }
                }
            }
            if(oldChKeyToIndex[newStartVnode.key] === undefined) {
                parentElm.insertBefore(createELm(newStartVnode), oldStartVnode.elm)
            } else {
                let index = oldChKeyToIndex[newStartVnode.key]
                let elmToMove = oldChildren[index]
                patchVnode(elmToMove, newStartVnode)
                oldChildren[index] = undefined
                parentElm.insertBefore(elmToMove.elm, oldStartVnode.elm)
            }
            newStartVnode = newChildren[++newStartIndex]
        }
    }
    if (newStartIndex <= newEndIndex) {
        let before = newChildren[newEndIndex + 1] === undefined ? null : newChildren[newEndIndex + 1].elm
        for(; newStartIndex <= newEndIndex; newStartIndex++) {
            parentElm.insertBefore(createELm(newChildren[newStartIndex]), before)
        }
    }

    if (oldStartIndex <= oldEndIndex) {
        for(; oldStartIndex <= oldEndIndex; oldStartIndex++) {
            if(oldChildren[oldStartIndex] !== undefined) {
                parentElm.removeChild(oldChildren[oldStartIndex].elm)
            }
        }
    }
}