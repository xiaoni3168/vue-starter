<template>
    <div class="d-join">
        <div v-if="check()">
            <div class="table-conditions">
                <d-input :placeholder="`表单名称`"></d-input>
                <div>条件</div>
                <div class="table-conditions_fields">
                    {{`${sourceTableA.name}.${selectedFieldA.name} = ${sourceTableB.name}.${selectedFieldB.name}`}}
                </div>
            </div>
            <div>
                <div>选择目标表字段</div>
                <div v-for="(field, $index) in sourceTableA.fields" :key="field.columnId" class="fields-wrap">
                    <d-checkbox :label="sourceTableA.name + '.' + field.name" :checked="field" @change="checkTableAField"></d-checkbox>
                    <d-input :disabled="tableACheck ? !tableACheck.fields[$index].checked : true" :placeholder="sourceTableA.name + '.' + field.name"></d-input>
                </div>
                <div v-for="(field, $index) in sourceTableB.fields" :key="field.columnId" class="fields-wrap">
                    <d-checkbox :label="sourceTableB.name + '.' + field.name" :checked="field" @change="checkTableBField"></d-checkbox>
                    <d-input :disabled="tableBCheck ? !tableBCheck.fields[$index].checked : true" :placeholder="sourceTableB.name + '.' + field.name"></d-input>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import Vue from 'vue';
import { mapGetters } from 'vuex';

import DSelect from './DSelect.vue';
import DCheckbox from './DCheckbox.vue';
import DInput from './DInput.vue';

export default {
    props: {
        context: {
            type: Object,
            default: () => {}
        }
    },
    data () {
        return {
            processDatas: null,
            tableACheck: null,
            tableBCheck: null
        }
    },
    computed: {
        ...mapGetters('tables', ['tables', 'targetTables']),
        sourceTableA: function () {
            let table;
            let operationData = this.getOperationData();
            let model = this.getModel();

            table = [].concat(this.tables).concat(this.targetTables).find(t => {
                if (t.id == operationData.leftTableId) {
                    return t;
                }
            });

            if (model) {
                table.fields.forEach(f => {
                    if (model.fields.find(field => {
                        if (field.sourceColumnId == f.columnId) {
                            return field;
                        }
                    })) {
                        f.checked = true;
                    } else {
                        f.checked = false;
                    }
                });
            } else {
                table.fields.forEach(f => {
                    f.checked = false;
                });
            }

            this.tableACheck = Object.assign({}, table);

            return Object.assign({}, table || {});
        },
        selectedFieldA: function () {
            let field;
            let operationData = this.getOperationData();
            
            field = this.sourceTableA.fields.find(f => {
                if (f.columnId == operationData.leftColumnId) {
                    return f;
                }
            });

            return field || {};
        },
        sourceTableB: function () {
            let table;
            let operationData = this.getOperationData();
            let model = this.getModel();

            table = [].concat(this.tables).concat(this.targetTables).find(t => {
                if (t.id == operationData.rightTableId) {
                    return t;
                }
            });

            if (model) {
                table.fields.forEach(f => {
                    if (model.fields.find(field => {
                        if (field.sourceColumnId == f.columnId) {
                            return field;
                        }
                    })) {
                        f.checked = true;
                    } else {
                        f.checked = false;
                    }
                });
            } else {
                table.fields.forEach(f => {
                    f.checked = false;
                });
            }

            this.tableBCheck = Object.assign({}, table);

            return Object.assign({}, table || {});
        },
        selectedFieldB: function () {
            let field;
            let operationData = this.getOperationData();

            field = this.sourceTableB.fields.find(f => {
                if (f.columnId == operationData.rightColumnId) {
                    return f;
                }
            });
            
            return field || {};
        }
    },
    mounted () {
        this.processDatas = this.context.processDatas(this.handler);
    },
    methods: {
        getSelectDatas: function (array) {
            array.forEach(a => {
                a.label = a.name;
            });
            return array;
        },
        handler: function (hooks) {
            let datas = [];
            hooks.forEach(hook => {
                datas.push(hook.getInData());
            });
            return datas;
        },
        check: function () {
            return !!(this.sourceTableA.id && this.sourceTableB.id);
        },
        getOperationData: function () {
            let treeMap = this.context.config.$container.treeMap;
            let stepObject = treeMap[this.context.config.$parentUUID];
            for (let [key, value] of Object.entries(stepObject)) {
                if (value.type == 'operation' && value.sub == 'join') {
                    return value;
                }
            }
            return null;
        },
        checkTableAField: function (value) {
            this.tableACheck = Object.assign({}, this.sourceTableA, {
                fields: this.sourceTableA.fields.map(field => {
                    if (field.columnId == value.field.columnId) {
                        return Object.assign({}, field, {
                            checked: value.checked
                        })
                    }
                    return field
                })
            });
            this.sourceTableA.fields.forEach(f => {
                if (f.columnId == value.field.columnId) {
                    f.checked = value.checked;
                }
            });
        },
        checkTableBField: function (value) {
            this.tableBCheck = Object.assign({}, this.sourceTableB, {
                fields: this.sourceTableB.fields.map(field => {
                    if (field.columnId == value.field.columnId) {
                        return Object.assign({}, field, {
                            checked: value.checked
                        })
                    }
                    return field
                })
            });
            this.sourceTableB.fields.forEach(f => {
                if (f.columnId == value.field.columnId) {
                    f.checked = value.checked;
                }
            });
        },
        getModel: function () {
            let treeMap = this.context.config.$container.treeMap;
            let stepObject = treeMap[this.context.config.$parentUUID];
            let table = this.targetTables.find(t => {
                if (t.id == stepObject[this.context.config.uuid].id) {
                    return t;
                }
            });

            return table;
        }
    },
    components: {
        'd-select': DSelect,
        'd-checkbox': DCheckbox,
        'd-input': DInput
    }
}
</script>
<style lang="scss">
.d-join {
    padding: 2px 4px;
    font-size: 12px;
    .table-name {
        display: flex;
        flex-direction: row-reverse;
        &_name {
            width: 40%;
            text-align: center;
        }
    }
    .table-conditions {
        &_fields {
            display: flex;
        }
    }
    .fields-wrap {
        display: flex;
        align-items: baseline;
        margin: 10px 0;
        width: 100%;
        justify-content: space-between;
    }
}
</style>
