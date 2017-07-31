<template>
    <div>
        <h1>First Component<transition name="fade"><sup class="sup" v-if="clicked" :class="{clicked: clicked}" @click="show = !show">1</sup></transition></h1>
        <second-component></second-component>

        <transition name="fade">
            <p v-if="show" @click="changeTime">Update Time<sup>(click me)</sup></p>
        </transition>

        <div>{{now}}</div>

        <input type="text" class="input" @keypress.a="keyPress($event)" @focus="inputFocus($event)" @blur="inputBlur($event)" placeholder="press key 'a'"></input>
    </div>
</template>

<script>
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';
import secondComponent from './secondComponent.vue';
import { EventBus } from '../event.bus';
import moment from 'moment';

var Velocity = require('velocity-animate/velocity');

Vue.config.keyCodes.a = 97;

export default {
    data() {
        return {
            clicked: false,
            show: true
        }
    },
    created() {
        console.log('%c Created.', 'color: #2888e5');

        EventBus.$on('clicked', clicked => {
            this.clicked = clicked
        });
    },
    mounted() {
        console.log('%c Mounted.', 'color: #2888e5');
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
    -webkit-appearance: none;
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


