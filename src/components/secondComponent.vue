<template>
    <div class="second_comp" :class="{actived: clicked}" @click="clickComponent">{{computedTitle}}</div>
</template>

<script>
import { EventBus } from '../event.bus';

export default {
    data() {
        return {
            title: 'Second Component',
            clicked: false
        }
    },
    computed: {
        computedTitle: function () {
            return 'Second Component computed';
        }
    },
    methods: {
        clickComponent: function() {
            this.clicked = !this.clicked;

            EventBus.$emit('clicked', this.clicked);
        }
    }
}
</script>

<style lang="sass" scoped>
.second_comp {
    color: #8aa900;
    &.actived {
        color: #aa907a;
    }
}
</style>



