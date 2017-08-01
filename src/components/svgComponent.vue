<template>
    <svg :height="svgHeight" :width="svgWidth">
        <polyline :points="points" fill="none" stroke="#388" stroke-width="2"></polyline>
        <polyline :points="points2" fill="none" stroke="#501" stroke-width="2"></polyline>
    </svg>
</template>
<script>
export default {
    data: function () {
        let ary = this.generatePoints(0);
        let ary2 = this.generatePoints(0);
        return {
            svgHeight: 100,
            svgWidth: 100,
            increase: 0,
            interval: null,
            ary: ary,
            ary2: ary2,
            points: ary.join(' '),
            points2: ary2.join(' ')
        }
    },
    mounted() {
        this.wave();
    },
    watch: {
        ary: function (n) {
            TweenLite.to(
                this.$data,
                0.1,
                {
                    points: n.join(' ')
                }
            )
        },
        ary2: function (n) {
            TweenLite.to(
                this.$data,
                0.1,
                {
                    points2: n.join(' ')
                }
            )
        }
    },
    methods: {
        generatePoints: function (increase) {
            let poi = [];
            for (let i = 0; i <= 2*Math.PI; i+=Math.PI/100) {
                poi.push(`${i*15},${10*Math.sin(i+increase)+30}`);
            }
            return poi;
        },
        wave: function () {
            clearInterval(this.interval);
            this.interval = setInterval(() => {
                this.increase+=Math.PI/12;
                this.ary = this.generatePoints(this.increase);
                this.ary2 = this.generatePoints(this.increase + Math.PI/2);
            }, 100);
        }
    }
}
</script>
<style lang="sass" scoped>

</style>


