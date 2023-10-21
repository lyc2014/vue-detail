import { initMixin } from "./core/instance/init"
export type Vue_OPTIONS = {
    data: () => {}
}
function Vue (options:Vue_OPTIONS) {
    this._init(options)
}
// 注入 Vue.prototype._init() 方法
initMixin(Vue)

export default Vue
