import * as jsPlumb from 'jsplumb';

export default function install (Vue) {
    Vue.prototype.$jsPlumb = jsPlumb;
}
