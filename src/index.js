import Vue from 'vue';
import VueRouter from 'vue-router';

import store from './vuex';
import firstComponents from './components/firstComponent.vue';
import Diagram from './components/diagram.vue';
console.log(Diagram)

import plugins from './plugins/plugins';
import VueD3 from './plugins/vue-d3';

Vue.use(VueRouter);
Vue.use(plugins);
Vue.use(VueD3);

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