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
        },
        diagram: {
            namespaced: true,
            state: {
                containerX: 0,
                containerY: 0
            },
            mutations: {
                UPDATE_CONT_X (state, payload) {
                    state.containerX = payload;
                },
                UPDATE_CONT_Y (state, payload) {
                    state.containerY = payload;
                }
            },
            actions: {
                updateContX ({ commit }, payload) {
                    commit('UPDATE_CONT_X', payload);
                },
                updateContY ({ commit }, payload) {
                    commit('UPDATE_CONT_Y', payload);
                }
            },
            getters: {
                containerX: state => state.containerX,
                containerY: state => state.containerY
            }
        }
    }
});