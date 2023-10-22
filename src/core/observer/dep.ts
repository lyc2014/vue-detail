let uid = 0
export default class Dep {
    static target;
    id;
    subs;
    constructor () {
        this.id = uid++
        this.subs = []
    }
    addSub (sub) {
        this.subs.push(sub)
    }
    removeSub (sub) {
        if (this.subs.length) {
            const index = this.subs.indexOf(sub)
            if (index > -1) {
                return this.subs.splice()
            }
        }
    }
    depend () {
        if (Dep.target) {
            Dep.target.addDep(this)
        }
    }
    notify () {
        const subs = this.subs.slice()
        for (let i = 0, l = subs.length; i < l; i++ ) {
            subs[i].update()
        }
    }
}
Dep.target = null