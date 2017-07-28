import Vue from 'vue';
import Vuex from 'vuex';
import moment from 'moment';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        starter: {
            namespaced: true,
            state: {
                now: +moment()
            },
            mutations: {
                UPDATE_NOW(state, payload) {
                    state.now = payload;
                }
            },
            actions: {
                updateNow({ commit }, payload) {
                    commit('UPDATE_NOW', payload);
                }
            },
            getters: {
                now: state => moment(state.now).format('Y-M-D HH:mm:ss')
            }
        }
    }
});