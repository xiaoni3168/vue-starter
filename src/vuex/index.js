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
        },
        tables: {
            namespaced: true,
            state: {
                tables: [],
                targetTables: []
            },
            mutations: {
                SET_TABLES (state, payload) {
                    state.tables = payload;
                },
                SET_TARGET_TABLES (state, payload) {
                    state.tables = payload;
                },
                ADD_TABLE (state, payload) {
                    let $i;
                    let table = state.tables.find((t, i) => {
                        if (t.id == payload.id) {
                            $i = i;
                            return t;
                        }
                    });
                    state.tables = table ? (state.tables.splice($i, 1), state.tables.concat(payload)) : state.tables.concat(payload);
                },
                ADD_TARGET_TABLE (state, payload) {
                    let $i;
                    let table = state.targetTables.find((t, i) => {
                        if (t.id == payload.id) {
                            $i = i;
                            return t;
                        }
                    });
                    state.targetTables = table ? (state.targetTables.splice($i, 1), state.targetTables.concat(payload)) : state.targetTables.concat(payload);
                }
            },
            actions: {
                setTables ({ commit }, payload) {
                    commit('SET_TABLES', payload);
                },
                setTargetTables ({ commit }, payload) {
                    commit('SET_TARGET_TABLES', payload);
                },
                addTable ({ commit }, payload) {
                    commit('ADD_TABLE', payload);
                },
                addTargetTable ({ commit }, payload) {
                    commit('ADD_TARGET_TABLE', payload);
                }
            },
            getters: {
                tables: state => state.tables,
                targetTables: state => state.targetTables
            }
        }
    }
});