<template>
    <div class="canvas">
        185-1017-4409
        <div id="canvas">

        </div>
    </div>
</template>

<script>
import * as d3 from 'd3';
export default {
    data () {
        return {
            co: null
        }
    },
    mounted () {
        this.co = d3.select('#canvas').append('canvas');

        this.co.attr('height', d3.select('#canvas').node().offsetHeight).attr('width', d3.select('#canvas').node().offsetWidth);

        let cxt = this.co.node().getContext('2d');

        cxt.fillStyle = '#2888e5';
        cxt.beginPath();
        cxt.fillRect(10, 10, 100, 100);
        cxt.stroke();

        this.co.on('mousemove', function () {
            const mouse = d3.mouse(this);
            const x = mouse[0];
            const y = mouse[1];

            console.log(cxt.isPointInPath(x, y));
        });
    }
}
</script>

<style lang="scss">
.canvas {
    height: 100%;
    width: 100%;
    #canvas {
        height: 100%;
        width: 100%;
    }
}
</style>
