<template>
    <div class="d-select"
         v-on-clickaway="handleClickOutside">
        <div class="d-select__input">
            <input type="text"
                   readonly="readonly"
                   autocomplete="off"
                   :placeholder="placeholder"
                   :class="{actived: dropdown}"
                   :value="model.label"
                   @click="toggleDropdown">
        </div>
        <transition name="d-select--transition-fade">
            <div class="d-select__dropdown"
                 v-if="dropdown">
                <div class="d-select__dropdown-wrap">
                    <ul class="d-select__dropdown-list">
                        <li v-for="item in items"
                            class="d-select__dropdown-item"
                            @click="selectItem(item)"
                            :key="item[by]"
                            :class="{selected: selectedItem === item[by]}">
                            <span>{{item.label}}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </transition>
    </div>
</template>
<script>
import { directive as onClickaway } from 'vue-clickaway';
export default {
    props: {
        by: String,
        items: Array,
        placeholder: String,
        selected: String
    },
    data () {
        return {
            selectedItem: this.selected,
            dropdown: false
        }
    },
    mounted () {
    },
    computed: {
        model: function () {
            let table = this.items.find(item => {
                if (item[this.by] == this.selectedItem) {
                    return item;
                }
            });
            return table || {};
        }
    },
    directives: {
        onClickaway: onClickaway
    },
    methods: {
        toggleDropdown: function () {
            this.dropdown = !this.dropdown;
        },
        handleClickOutside: function () {
            this.closeDropdown();
        },
        closeDropdown: function () {
            this.dropdown = false;
        },
        selectItem: function (item) {
            this.closeDropdown();

            this.selectedItem = item[this.by];
            this.$emit('change', this.selectedItem);
        }
    }
}
</script>
<style lang="scss">
.d-select {
    position: relative;
    &__input {
        width: 100%;
        margin: auto;
        input {
            width: 100%;
            padding: 0 10px;
            border: none;
            height: 30px;
            border-radius: 6px;
            background-color: #333;
            box-sizing: border-box;
            color: #eeeeee;
            transition: background-color ease .2s;
        }
    }
    &__dropdown {
        width: 100%;
        min-height: 50px;
        max-height: 150px;
        background-color: #f5f5f5;
        position: absolute;
        border-radius: 6px;
        padding: 10px 0;
        box-sizing: border-box;
        top: -5px;
        z-index: 1;
        &-wrap {
            margin: 0 10px;
        }
        &-list {
            list-style: none;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            position: relative;
        }
        &-item {
            height: 26px;
            list-style: none;
            line-height: 26px;
            font-size: 12px;
            color: #999999;
            cursor: pointer;
            &:hover {
                color: #666666;
            }
            &.selected {
                color: #289bf0;
                &:hover {
                    color: #289bf0;
                }
            }
        }
    }
}

.d-select--transition-fade-enter-active,
.d-select--transition-fade-leave-active {
    transform-origin: left top 0px;
    transition: transform ease .2s, opacity ease .2s;
}
.d-select--transition-fade-enter,
.d-select--transition-fade-leave-active {
    opacity: 0;
    transform: scaleY(0);
}
</style>


