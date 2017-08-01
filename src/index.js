import Vue from 'vue';
import VueRouter from 'vue-router';

import store from './vuex';
import firstComponents from './components/firstComponent.vue';

import plugins from './plugins/plugins';

Vue.use(VueRouter);
Vue.use(plugins);

const routes = [{
    name: 'home',
    path: '/home',
    component: firstComponents,
    beforeEnter: (from, to, next) => {
        console.log('before enter');
        next();
    }
}];

const router = new VueRouter({
    routes
});

new Vue({
    router,
    store
}).$mount('#app');