<template>
    <div>
        <h1>First Component<transition name="fade"><sup class="sup" v-if="clicked" :class="{clicked: clicked}" @click="show = !show">1</sup></transition></h1>
        <second-component>
            <span>(Slot Content)</span>
        </second-component>

        <transition name="fade">
            <p v-if="show" @click="changeTime">Update Time<sup>(click me)</sup></p>
        </transition>

        <div class="tip-container" v-tooltip="{text: 'Cover Me'}">{{now}}</div>

        <input type="text" class="input" @keypress.a="keyPress($event)" @focus="inputFocus($event)" @blur="inputBlur($event)" placeholder="press key 'a'"></input>

        <div class="tip-container" v-tooltip="{text: 'Cover Me'}">Hover Me</div>

        <div style="font-weight: bold;color: #3a009a;" v-change-color>This will text will change color after 3 seconds</div>
    
        <svg-component></svg-component>
    </div>
</template>

<script>
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';
import secondComponent from './secondComponent.vue';
import { EventBus } from '../event.bus';
import moment from 'moment';
import throttle from 'throttle-debounce/throttle';

const Velocity = require('velocity-animate/velocity');

Vue.config.keyCodes.a = 97;

export default {
    data() {
        return {
            clicked: false,
            show: true
        }
    },
    created() {
        EventBus.$on('clicked', clicked => {
            this.clicked = clicked
        });
    },
    mounted() {
    },
    computed: {
        ...mapGetters('starter', ['now'])
    },
    methods: {
        changeTime() {
            this.$store.dispatch('starter/updateNow', +moment())
        },

        keyPress(e) {
            Velocity(e.target, {
                borderColor: '#2888e5'
            }, 500);
        },

        inputFocus(e) {
            Velocity(e.target, {
                borderColor: '#66a033'
            }, 500);
        },

        inputBlur(e) {
            Velocity(e.target, {
                borderColor: '#999999'
            }, 500);
        }
    },
    directives: {
        tooltip: {
            bind: function (el, binding, vnode) {
                let tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.innerHTML = binding.value.text;
                el.appendChild(tooltip);
            }
        },
        changeColor: {
            bind: function (el, binding, vnode) {
                Velocity(el, {
                    color: '#cc6310'
                }, {
                    delay: 3000,
                    duration: 700
                });
            }
        }
    },
    components: {
        secondComponent
    }
}
</script>

<style lang="sass">
.sup {
    height: 24px;
    width: 24px;
    color: #ffffff;
    font-size: 16px;
    line-height: 24px;
    text-align: center;
    border-radius: 100%;
    display: inline-block;
    background-color: #fa0011;
    
    &.clicked {
        background-color: #66a033;
    }
}

.input {
    outline: none;
    border: 2px solid #999999;
    transform: translateX(50%);
    -webkit-appearance: none;
}

.tip-container {
    position: relative;
    &:hover .tooltip {
        opacity: 1;
    }
}

.tooltip {
    position: absolute;
    transition: opacity .5s;
    opacity: 0;
    height: 30px;
    width: 120px;
    background-color: #333;
    color: #fff;
    text-align: center;
    line-height: 30px;
    border-radius: 13px;
    top: 30px;
    z-index: 100;
    &:before {
        content: '';
        height: 0;
        width: 0;
        background-color: #333;
        position: absolute;
        border-bottom: 7px solid #333;
        border-left: 7px solid #fff;
        border-right: 7px solid #fff;
        top: -7px;
        left: 20px;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity .5s;
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>


