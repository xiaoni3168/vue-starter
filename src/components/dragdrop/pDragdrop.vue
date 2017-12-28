<template>
    <div class="p-drag-drop">
        <div class="p-drag-drop__container">
            <grid :items="items"></grid>
        </div>
    </div>
</template>
<script>
import Vue from 'vue';
import _ from 'lodash';
import Grid from './grid.vue';
export default {
    name: 'pDragDrop',
    data () {
        return {
            items: [
                {
                    id: 1,
                    type: 1,
                    x: 0,
                    y: 0,
                    h: 300,
                    w: 300
                },
                {
                    id: 2,
                    type: 2,
                    x: 1,
                    y: 0,
                    h: 300,
                    w: 300
                },
                {
                    id: 3,
                    type: 3,
                    x: 0,
                    y: 1,
                    h: 300,
                    w: 300
                }
            ]
        }
    },
    mounted () {

    },
    methods: {
        
    },
    components: {
        'grid': Grid
    }
}
</script>
<style lang="scss" scoped>
.p-drag-drop {
    height: 100%;
    &__container {
        height: 100%;
        &-backdrop {
            background-color: #666666;
            transition-delay: .2s;
            transition: transform .1s;
            z-index: 10;
        }
        .ct {
            height: 100%;
        }
    }
}
</style>
