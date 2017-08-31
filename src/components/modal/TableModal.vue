<template>
    <div class="table-modal">
        <div class="header">
            <div class="title">{{model.title}}</div>
        </div>
        <div class="body">
            <d-select v-if="model.type == 'source'" :by="'id'" :items="getSourceSelectTables()" :selected="selected" :placeholder="`选择源表数据`" @change="selectedChange"></d-select>
            <d-join v-if="model.type == 'target' && model.sub == 'join'" :context="element"></d-join>
            <div v-if="model.type == 'operation' && model.sub == 'join'" class="join-operation">
                <div v-if="checkProcessDatas()">
                    <div>选择联表字段</div>
                    <div class="join-operation_fields">
                        <div class="join-operation_fields--label">{{sourceTableALabel}}</div>
                        <d-select :by="'columnId'" :items="sourceTableAFields" :selected="operationSelectedA" :placeholder="`选择字段`" @change="fieldAChange"></d-select>
                    </div>
                    <div>=</div>
                    <div class="join-operation_fields">
                        <div class="join-operation_fields--label">{{sourceTableBLabel}}</div>
                        <d-select :by="'columnId'" :items="sourceTableBFields" :selected="operationSelectedB" :placeholder="`选择字段`" @change="fieldBChange"></d-select>
                    </div>
                </div>
                <div v-if="!checkProcessDatas()" class="no-source">
                    暂未选择源表数据
                </div>
            </div>
        </div>
        <div class="footer">
            <div class="btns">
                <div class="btn cancel" :class="{w_33: model.type == 'operation'}" @click="closeModal">
                    取消
                </div>
                <div v-if="model.type == 'operation'" class="btn delete">
                    删除节点
                </div>
                <div class="btn save" :class="{w_33: model.type == 'operation'}" @click="saveModal">
                    保存
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';

import DSelect from '../formComponents/DSelect.vue';
import DJoin from '../formComponents/DJoin.vue';

import * as Util from '../../utils';

export default {
    props: {
        element: {
            type: Object,
            default: {}
        }
    },
    data () {
        let { config } = this.element;

        let treeMap = this.element.config.$container.treeMap;
        let stepObject = treeMap[this.element.config.$parentUUID];
        return {
            selected: stepObject[this.element.config.uuid].tableId,
            model: config.model ? config.model : {},
            processDatas: null,

            operationSelectedA: stepObject[this.element.config.uuid].leftColumnId,
            operationSelectedB: stepObject[this.element.config.uuid].rightColumnId
        }
    },
    computed: {
        ...mapGetters('tables', ['tables', 'targetTables']),
        sourceTableA: function () {
            let tableA;
            let treeMap = this.element.config.$container.treeMap;
            let stepObject = treeMap[this.element.config.$parentUUID];
            for (let [key, value] of Object.entries(stepObject)) {
                console.log(value)
                if (value.type == 'source' && value.sub == 'leftTable') {
                    tableA = this.tables.find(table => {
                        if (table.id == value.tableId) {
                            return table;
                        }
                    });
                }
                if (value.nType == 'source' && value.nSub == 'leftTable' && value.stream == 'in') {
                    tableA = this.targetTables.find(table => {
                        if (table.id == value.tableId) {
                            return table;
                        }
                    });
                }
            }
            return tableA;
        },
        sourceTableALabel: function () {
            return this.sourceTableA.name + '.';
        },
        sourceTableAFields: function () {
            let fields = this.sourceTableA.fields;
            fields.forEach(field => {
                field.label = field.name;
            });
            return fields;
        },
        sourceTableB: function () {
            let tableB;
            let treeMap = this.element.config.$container.treeMap;
            let stepObject = treeMap[this.element.config.$parentUUID];
            for (let [key, value] of Object.entries(stepObject)) {
                if (value.type == 'source' && value.sub == 'rightTable') {
                    tableB = this.tables.find(table => {
                        if (table.id == value.tableId) {
                            return table;
                        }
                    });
                }
                if (value.nType == 'source' && value.nSub == 'rightTable' && value.stream == 'in') {
                    tableB = this.targetTables.find(table => {
                        if (table.id == value.tableId) {
                            return table;
                        }
                    });
                }
            }
            return tableB;
        },
        sourceTableBLabel: function () {
            return this.sourceTableB.name + '.';
        },
        sourceTableBFields: function () {
            let fields = this.sourceTableB.fields;
            fields.forEach(field => {
                field.label = field.name;
            });
            return fields;
        }
    },
    mounted () {
        this.processDatas = this.element.processDatas(hooks => {
            let datas = [];
            hooks.forEach(hook => {
                hook.type == 'in' && datas.push(hook.getInData());
            });
            return datas;
        });
    },
    methods: {
        getSourceSelectTables: function () {
            let array = Vue.util.extend(this.tables);
            array.forEach(a => {
                a.label = a.name;
            });
            return array;
        },
        selectedChange: function (payment) {
            this.selected = payment;
        },
        fieldAChange: function (payment) {
            this.operationSelectedA = payment;
        },
        fieldBChange: function (payment) {
            this.operationSelectedB = payment;
        },
        closeModal: function () {
            this.$emit('close');
        },
        saveModal: function () {
            let payment = null;
            if (this.model.type == 'source') {
                this.updateTreeMap({
                    tableId: this.selected
                });
            }
            if (this.model.type == 'operation' && this.model.sub == 'join') {
                this.updateTreeMap({
                    leftTableId: this.sourceTableA.id,
                    rightTableId: this.sourceTableB.id,
                    leftColumnId: this.operationSelectedA,
                    rightColumnId: this.operationSelectedB
                });
            }
            if (this.model.type == 'target' && this.model.sub == 'join') {
                let treeMap = this.element.config.$container.treeMap;
                let stepObject = treeMap[this.element.config.$parentUUID];

                let data = {
                    id: stepObject[this.element.config.uuid].id ? stepObject[this.element.config.uuid].id : Util.uuid(),
                    name: '临时表单',
                    fields: []
                }
                
                for (let [key, value] of Object.entries(stepObject)) {
                    if (value.type == 'operation' && value.sub == 'join') {
                        this.getTable(value.leftTableId).fields.forEach(f => {
                            if (f.checked) {
                                data.fields.push({
                                    columnId: Util.uuid(),
                                    name: `${this.getTable(value.leftTableId).name}.${f.name}`,
                                    sourceColumnId: f.columnId
                                });
                            }
                        })
                        this.getTable(value.rightTableId).fields.forEach(f => {
                            if (f.checked) {
                                data.fields.push({
                                    columnId: Util.uuid(),
                                    name: `${this.getTable(value.rightTableId).name}.${f.name}`,
                                    sourceColumnId: f.columnId
                                });
                            }
                        });
                    }
                }

                for (let [key, value] of Object.entries(treeMap)) {
                    if (value.hasOwnProperty(this.element.config.uuid)) {
                        value[this.element.config.uuid].tableId = data.id;
                    }
                }

                data.tableId = data.id;

                this.$store.dispatch('tables/addTargetTable', data);
                this.updateTreeMap(data);
            }
            this.$emit('save');
        },
        checkProcessDatas: function () {
            let treeMap = this.element.config.$container.treeMap;
            let stepObject = treeMap[this.element.config.$parentUUID];
            let result = true;
            for (let [key, value] of Object.entries(stepObject)) {
                if ((value.type == 'source' || (value.nType == 'source' && value.stream == 'in')) && (value.sub == 'leftTable' || value.nSub == 'leftTable') && !value.tableId) {
                    result = false;
                }
                if ((value.type == 'source' || (value.nType == 'source' && value.stream == 'in')) && (value.sub == 'rightTable' || value.nSub == 'rightTable') && !value.tableId) {
                    result = false;
                }
            }
            return result;
        },
        updateTreeMap: function (obj) {
            let treeMap = this.element.config.$container.treeMap;
            let stepObject = treeMap[this.element.config.$parentUUID];
            stepObject[this.element.config.uuid] = Object.assign(stepObject[this.element.config.uuid], obj);
        },
        getTable: function (id) {
            return [].concat(this.tables).concat(this.targetTables).find(t => {
                if (t.id == id) {
                    return t;
                }
            });
        }
    },
    components: {
        'd-select': DSelect,
        'd-join': DJoin
    }
}
</script>
<style lang="scss">
.table-modal {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    .body {
        font-size: 12px;
        padding: 5px 10px;
        margin-bottom: 30px;
        overflow: scroll;
        flex-grow: 1;
        .join-operation {
            &_fields {
                display: flex;
                align-items: baseline;
                &--label {
                    white-space: nowrap;
                }
            }
        }
        .no-source {
            height: 200px;
            line-height: 200px;
            text-align: center;
            color: #999999;
        }
    }
    .footer {
        position: absolute;
        width: 100%;
        bottom: 0;
        .btns {
            display: flex;
            .btn {
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
                width: 50%;
                text-align: center;
                height: 30px;
                line-height: 30px;
                background-color: #3f3f3f;
                &.w_33 {
                    width: 33%;
                }
                &.cancel {
                    color: #e43c3c;
                    border-radius: 0 0 0 5px;
                    border-right: 1px solid #555555;
                }
                &.save {
                    color: #30e052;
                    border-radius: 0 0 5px 0;
                }
                &.delete {
                    width: 33%;
                    color: #e43c3c;
                    border-right: 1px solid #555555;
                }
                &:hover {
                    opacity: .8;
                }
            }
        }
    }
}
</style>


