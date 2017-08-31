<template>
    <div class="d-input">
        <input class="d-input__input"
               :value="value"
               :class="{'d-input__input-has-value': this.value}"
               :placeholder="placeholder"
               :disabled="disabled"
               @change="onChange($event)">
    </div>
</template>
<script>
export default {
    props: {
        model: String,
        placeholder: String,
        disabled: Boolean
    },
    data () {
        return {
            value: this.model
        }
    },
    methods: {
        onChange: function (event) {
            this.value = event.target.value;
            this.$emit('change', event.target.value)
        }
    }
}
</script>
<style lang="sass">
.d-input {
    &__input {
        border: 0;
        outline: 0;
        padding: 5px 12px;
        border-radius: 13px;
        box-sizing: border-box;
        transition: all .3s linear;
        background-color: #f5f5f5;
        width: 100%;
        &:focus {
            background-color: #f5f5f5;
            color: #333333;
        }
        &::-webkit-input-placeholder {
            color: #cccccc;
        }
        &-has-value {
            background-color: #000000;
            color: #f5f5f5;
        }
    }
}
</style>


