<template>
    <div class="table-modal">
        <div class="header">
            <div class="title">{{modal.title}}</div>
        </div>
        <div class="body">
            <d-select :items="modal.tables"></d-select>
        </div>
        <div class="footer">
            <div class="btns">
                <div class="btn cancel">
                    <svg height="20" width="20">
                        <path d="M 5 5 L 15 15 M 5 15 L 15 5" stroke-width="3" stroke="#fff" stroke-linecap="round"></path>
                    </svg>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import DSelect from '../formComponents/DSelect.vue'
export default {
    props: {
        modal: {
            type: Object,
            default: {}
        }
    },
    data () {
        return {

        }
    },
    components: {
        'd-select': DSelect
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
                &.cancel {
                    path {
                       stroke: #2888e5; 
                    }
                }
            }
        }
    }
}
</style>


