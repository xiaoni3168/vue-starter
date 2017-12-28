<template>
    <div class="ct" ref="ct"></div>
</template>

<script>
import Vue from 'vue';
import Grid from '../../utils/grid';
export default {
    props: {
        items: Array
    },
    data () {
        return {
            res: null
        }
    },
    mounted () {
        let myGrid = new Grid(this.items, {
            direction: 'vertical'
        });
        let content = myGrid.generate(this.$refs.ct, function (item, i) {
            return `<span>${item.type}</span>`;
        });
    }
}
</script>
