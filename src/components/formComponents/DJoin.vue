<template>
    <div class="d-join">
        <div v-if="check()">
            <div class="table-conditions">
                <div>条件</div>
                <div class="table-conditions_fields">
                    {{`${sourceTableA.name}.${selectedFieldA.description} = ${sourceTableB.name}.${selectedFieldB.description}`}}
                </div>
            </div>
            <div>
                <div>选择目标表字段</div>
                <div v-for="field in sourceTableA.fields" :key="field.columnId">
                    <d-checkbox :label="sourceTableA.name + '.' + field.description" :checked="field" @change="checkTableAField"></d-checkbox>
                </div>
                <div v-for="field in sourceTableB.fields" :key="field.columnId">
                    <d-checkbox :label="sourceTableB.name + '.' + field.description" :checked="field" @change="checkTableBField"></d-checkbox>
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

export default {
    props: {
        context: {
            type: Object,
            default: () => {}
        }
    },
    data () {
        return {
            processDatas: null
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
                a.label = a.description;
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
            this.sourceTableA.fields.forEach(f => {
                if (f.columnId == value.field.columnId) {
                    f.checked = value.checked;
                }
            });
        },
        checkTableBField: function (value) {
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
        'd-checkbox': DCheckbox
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
}
</style>
