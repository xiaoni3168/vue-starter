<template>
    <div>
        <h1>First Component<transition name="fade"><sup class="sup" v-if="clicked" :class="{clicked: clicked}" @click="show = !show">1</sup></transition></h1>
        <second-component></second-component>

        <transition name="fade">
            <p v-if="show" @click="changeTime">Transition</p>
        </transition>

        <div>{{now}}</div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import secondComponent from './secondComponent.vue';
import { EventBus } from '../event.bus';
import moment from 'moment';

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

.fade-enter-active,
.fade-leave-active {
    transition: opacity .5s;
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>


