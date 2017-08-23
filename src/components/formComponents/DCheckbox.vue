<template>
    <label class="d-checkbox">
        <svg xmlns="http://www.w3.org/2000/svg" style="position: absolute;width: 0;height: 0;">
            <symbol viewBox="0 0 18 18" id="checkbox">
                <path fill="none" d="M0 0h18v18H0z"></path>
                <path d="M7.12 14.26L1.9 9a.9.9 0 0 1 1.27-1.24l4 4L14.83 4a.9.9 0 0 1 1.27 1.28z"></path>
            </symbol>
        </svg>
        <input class="d-checkbox_input" type="checkbox" :checked="itemChecked" @change="onChange">
        <span class="d-checkbox_marker">
            <svg>
                <use xlink:href="#checkbox"></use>
            </svg>
        </span>
        <span class="d-checkbox_label">{{label}}</span>
    </label>
</template>
<script>
export default {
    props: {
        label: String,
        checked: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            itemChecked: this.checked
        }
    },
    methods: {
        onChange: function () {
            this.itemChecked = !this.itemChecked;
            this.$emit('change', this.itemChecked);
        }
    }
}
</script>
<style lang="scss">
$root: '.d-checkbox';

.d-checkbox {
    cursor: pointer;
    &_input {
        position: absolute;
        visibility: hidden;
        &:checked ~ #{$root}_marker {
            background-color: #0ead13;
            & svg {
                fill: #ffffff;
                opacity: 1;
            }
            & ~ #{$root}_label {
                color: #0ead13;
            }
        }
    }
    &_marker {
        display: inline-block;
        background-color: #ffffff;
        height: 14px;
        width: 14px;
        vertical-align: middle;
        border-radius: 2px;
        & svg {
            height: 14px;
            width: 14px;
            opacity: 0;
        }
    }
    &_label {
        display: inline-block;
        vertical-align: middle;
    }
}
</style>

