export function createELm (vnode) {
    let { sel, children, text } = vnode
    let tag = sel
    // 生成的elm节点  后续会绑定到vnode上
    let elm
    if (tag) {
        elm = document.createElement(tag)
        if (children) {
            for(let i = 0; i < children.length; i++) {
                elm.appendChild(createELm(children[i]))
            }
        } else if (typeof text === 'string') {
            elm.appendChild(document.createTextNode(text))
        }
    } else {
        if (typeof text === 'string') {
            elm = document.createTextNode(text)
        }
    }
    vnode.elm = elm
    return elm
}