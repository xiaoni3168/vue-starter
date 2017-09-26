import * as d3 from 'd3';
import D3Diagram from './d3Diagram';

export default function install (Vue) {
    Vue.prototype.$d3 = d3;
    Vue.prototype.D3Diagram = new D3Diagram(d3);
    window.d3 = d3;

    window.Dispatch = window.d3.dispatch('bus');
}
