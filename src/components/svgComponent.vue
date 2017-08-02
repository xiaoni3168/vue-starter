<template>
    <svg :height="svgHeight" :width="svgWidth" @mouseenter="hoverd = !hoverd" @mouseleave="hoverd = !hoverd">
        <polyline :points="points" fill="none" stroke="#388" stroke-width="2"></polyline>
        <polyline :points="points2" fill="none" :stroke="tweenCSSColor" stroke-width="2" ref="co"></polyline>
    </svg>
</template>
<script>
import Color from 'color-js';
import TWEEN from '@tweenjs/tween.js';

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
            hoverd: true,
            points: ary.join(' '),
            points2: ary2.join(' '),
            tweenColor: {
                alpha: 1,
                blue: 0.06666666666666667,
                green: 0,
                red: 0.3333333333333333
            }
        }
    },
    mounted() {
        this.wave();
    },
    computed: {
        tweenCSSColor: function () {
            console.log('color:',new Color(this.tweenColor))
            return new Color(this.tweenColor).toCSS();
        }
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
        },
        hoverd: function (n) {
            let tweenColor = new Color(n ? '#501' : '#289bf0');
            function animate () {
                if (TWEEN.update()) {
                    requestAnimationFrame(animate);
                }
            }

            new TWEEN.Tween(this.tweenColor)
                .to(tweenColor, 500)
                .start();
            
            animate();
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


