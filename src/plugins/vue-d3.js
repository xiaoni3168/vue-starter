import * as d3 from 'd3';

export default function install (Vue) {
    Vue.prototype.$d3 = d3;
    window.d3 = d3;
}