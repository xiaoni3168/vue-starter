<template>
    <div class="table-modal">
        <div class="header">
            <div class="title">{{model.title}}</div>
        </div>
        <div class="body">
            <d-select v-if="model.type == 'source'" :items="getSelectDatas(model.tables)" :selected="selected" :placeholder="`选择源表数据`" @change="selectedChange"></d-select>
            <d-combine v-if="model.type == 'target' && model.sub == 'combine'" :context="element"></d-combine>
        </div>
        <div class="footer">
            <div class="btns">
                <div class="btn save" @click="saveModal">
                    保存
                </div>
                <div class="btn cancel" @click="closeModal">
                    取消
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
            selected: config.model.selected ? config.model.selected : {},
            model: config.model ? config.model : {}
        }
    },
    mounted () {
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
        closeModal: function () {
            this.$emit('close');
        },
        saveModal: function () {
            this.$emit('save', this.selected);
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
    .footer {
        position: absolute;
        width: 100%;
        bottom: 0;
        .btns {
            .btn {
                float: right;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
                margin: 5px;
                &.cancel {
                    color: #ff1919;
                }
                &.save {
                    color: #10ea3a;
                }
                &:hover {
                    opacity: .8;
                }
            }
        }
    }
}
</style>


