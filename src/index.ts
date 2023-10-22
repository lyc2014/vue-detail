import { initMixin } from "./core/instance/init"
import { initMount } from "./core/instance/initMount"
export type Vue_OPTIONS = {
    data: () => {},
    watch?: {
        [key: string]: () => {}
    }
}
function Vue (options:Vue_OPTIONS) {
    this._init(options)
}
// 注入 Vue.prototype._init() 方法
initMixin(Vue)
// 注入 Vue.prototype._update Vue.prototype.mount方法
initMount(Vue)

export default Vue
