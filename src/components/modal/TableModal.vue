<template>
    <div class="table-modal">
        <div class="header">
            <div class="title">{{model.title}}</div>
        </div>
        <div class="body">
            <d-select v-if="model.type == 'source'" :by="'id'" :items="getSelectDatas(model.tables)" :selected="selected" :placeholder="`选择源表数据`" @change="selectedChange"></d-select>
            <d-combine v-if="model.type == 'target' && model.sub == 'combine'" :context="element"></d-combine>
            <div v-if="model.type == 'operation' && model.sub == 'combine'" class="combine-operation">
                <div v-show="checkProcessDatas()">
                    <div>选择联表字段</div>
                    <div class="combine-operation_fields">
                        <div class="combine-operation_fields--label">{{sourceTableALabel}}</div>
                        <d-select :by="'name'" :items="sourceTableAFields" :selected="operationSelectedA" :placeholder="`选择字段`" @change="fieldAChange"></d-select>
                    </div>
                    <div>=</div>
                    <div class="combine-operation_fields">
                        <div class="combine-operation_fields--label">{{sourceTableBLabel}}</div>
                        <d-select :by="'name'" :items="sourceTableBFields" :selected="operationSelectedB" :placeholder="`选择字段`" @change="fieldBChange"></d-select>
                    </div>
                </div>
                <div v-show="!checkProcessDatas()" class="no-source">
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
import DSelect from '../formComponents/DSelect.vue';
import DCombine from '../formComponents/DCombine.vue';

export default {
    props: {
        element: {
            type: Object,
            default: {}
        }
    },
    data () {
        let { config } = this.element;
        return {
            selected: config.model.data ? config.model.data : {},
            model: config.model ? config.model : {},
            processDatas: null,

            operationSelectedA: config.model.data ? config.model.data.sourceA : {},
            operationSelectedB: config.model.data ? config.model.data.sourceB : {}
        }
    },
    computed: {
        sourceTableA: function () {
            return this.processDatas ? this.processDatas[0] : {};
        },
        sourceTableALabel: function () {
            return this.sourceTableA.data ? this.sourceTableA.data.name + '.' : '';
        },
        sourceTableAFields: function () {
            let fields = this.sourceTableA.data ? this.sourceTableA.data.fields : [];
            fields.forEach(field => {
                field.label = field.description;
            });
            return fields;
        },
        sourceTableB: function () {
            return this.processDatas ? this.processDatas[1] : {};
        },
        sourceTableBLabel: function () {
            return this.sourceTableB.data ? this.sourceTableB.data.name + '.' : '';
        },
        sourceTableBFields: function () {
            let fields = this.sourceTableB.data ? this.sourceTableB.data.fields : [];
            fields.forEach(field => {
                field.label = field.description;
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
    watch: {
        element: function (n) {
            
        }
    },
    methods: {
        getSelectDatas: function (array) {
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
                payment = this.selected;
            }
            if (this.model.type == 'operation' && this.model.sub == 'combine') {
                payment = {
                    tables: [
                        this.sourceTableA,
                        this.sourceTableB
                    ],
                    sourceA: this.operationSelectedA,
                    sourceB: this.operationSelectedB
                }
            }
            if (this.model.type == 'target' && this.model.sub == 'combine') {
                payment = {
                }
            }
            this.$emit('save', payment);
        },
        checkProcessDatas: function () {
            let result = this.processDatas && this.sourceTableA.data && this.sourceTableB.data;
            return !!result;
        }
    },
    components: {
        'd-select': DSelect,
        'd-combine': DCombine
    }
}
</script>
<style lang="scss">
.table-modal {
    position: relative;
    height: 100%;
    .body {
        font-size: 12px;
        padding: 5px 10px;
        .combine-operation {
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


