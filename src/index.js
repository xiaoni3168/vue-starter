import Vue from 'vue';
import VueRouter from 'vue-router';

import firstComponents from './components/firstComponent.vue';

Vue.use(VueRouter);

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
    router
}).$mount('#app');