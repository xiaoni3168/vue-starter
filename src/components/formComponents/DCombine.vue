<template>
    <div class="d-combine">
        <div v-if="check()">
            <div class="table-name">
                <div class="table-name_name">{{sourceTableB.selected.name}}</div>
                <div class="table-name_name">{{sourceTableA.selected.name}}</div>
            </div>
            <div class="table-conditions">
                <div>条件</div>
                <div class="table-conditions_fields">
                    <d-select :items="getSelectDatas(sourceTableA.selected.fields)" :placeholder="`选择表字段`"></d-select>
                    <div>=</div>
                    <d-select :items="getSelectDatas(sourceTableB.selected.fields)" :placeholder="`选择表字段`"></d-select>
                </div>
            </div>
            <div>
                <div>选择目标表字段</div>
                <d-checkbox :label="`字段A`"></d-checkbox>
            </div>
        </div>
    </div>
</template>
<script>
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
        sourceTableA: function () {
            return this.processDatas ? this.processDatas[0][0] : {};
        },
        sourceTableB: function () {
            return this.processDatas ? this.processDatas[0][1] : {};
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
            let result = true;
            if (this.processDatas) {
                this.processDatas.forEach(data => {
                    data.forEach(_data => {
                        if (!_data.selected) {
                            result = false;
                        }
                    });
                });
            } else {
                result = false;
            }
            return result;
        }
    },
    components: {
        'd-select': DSelect,
        'd-checkbox': DCheckbox
    }
}
</script>
<style lang="scss">
.d-combine {
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
        display: flex;
        &_fields {
            display: flex;
        }
    }
}
</style>
