<template>
    <div class="d-combine">
        <div v-if="check()">
            <!-- <div class="table-name">
                <div class="table-name_name">{{sourceTableB.selected.name}}</div>
                <div class="table-name_name">{{sourceTableA.selected.name}}</div>
            </div> -->
            <div class="table-conditions">
                <div>条件</div>
                <div class="table-conditions_fields">
                    {{`${sourceTableA.name}.${selectedFieldA.description} = ${sourceTableB.name}.${selectedFieldB.description}`}}
                </div>
            </div>
            <div>
                <div>选择目标表字段</div>
                <div v-for="field in sourceTableA.fields" :key="field.name">
                    <d-checkbox :label="sourceTableA.name + '.' + field.description" :checked="field.checked"></d-checkbox>
                </div>
                <div v-for="field in sourceTableB.fields" :key="field.name">
                    <d-checkbox :label="sourceTableB.name + '.' + field.description" :checked="field.checked"></d-checkbox>
                </div>
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
            return this.processDatas ? this.processDatas[0].data.tables[0].data : {};
        },
        selectedFieldA: function () {
            return this.processDatas ? this.processDatas[0].data.sourceA : {};
        },
        sourceTableB: function () {
            return this.processDatas ? this.processDatas[0].data.tables[1].data : {};
        },
        selectedFieldB: function () {
            return this.processDatas ? this.processDatas[0].data.sourceB : {};
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
            let result = this.processDatas && this.processDatas[0].data;
            return !!result;
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
        &_fields {
            display: flex;
        }
    }
}
</style>
