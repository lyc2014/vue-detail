export function vnode(sel, data, children, text) {
    let key = data ? data.key : undefined
    return { sel, data, children, text, key }
}