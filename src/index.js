import Vue from 'vue';
import VueRouter from 'vue-router';

import store from './vuex';
import firstComponents from './components/firstComponent.vue';
import Diagram from './components/diagram.vue';
import DiagramCanvas from './components/DiagramCanvas.vue';
import Etl from './components/etl.vue';
import calculation from './components/calculation.vue';
import s3component from './components/s3.vue';
import newd3 from './components/newd3.vue';
import DragDrop from './components/dragdrop/Dragdrop.vue';

import plugins from './plugins/plugins';
import VueD3 from './plugins/vue-d3';
import S3 from './plugins/s3';

Vue.use(VueRouter);
Vue.use(plugins);
Vue.use(VueD3);
Vue.use(S3);

const routes = [{
    name: 'home',
    path: '/home',
    component: firstComponents,
    beforeEnter: (from, to, next) => {
        console.log('before enter');
        next();
    }
}, {
    name: 'diagram',
    path: '/diagram',
    component: Diagram
}, {
    name: 'diagramCanvas',
    path: '/DiagramCanvas',
    component: DiagramCanvas
}, {
    name: 'etl',
    path: '/etl',
    component: Etl
}, {
    name: 'calculation',
    path: '/calculation',
    component: calculation
}, {
    name: 's3',
    path: '/s3',
    component: s3component
}, {
    name: 'newd3',
    path: '/newd3',
    component: newd3
}, {
    name: 'dragdrop',
    path: '/dragdrop',
    component: DragDrop
}, {
    path: '*',
    redirect: '/home'
}];

const router = new VueRouter({
    routes
});

new Vue({
    router,
    store
}).$mount('#app');
