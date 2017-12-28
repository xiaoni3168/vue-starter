<template>
    <div class="drag-drop">
        <p-drag-drop></p-drag-drop>
    </div>
</template>
<script>
import pDragDrop from './pDragDrop.vue';
export default {
    data () {
        return {}
    },
    components: {
        'pDragDrop': pDragDrop
    }
}
</script>
<style lang="scss" scoped>
.drag-drop {
    padding: 20px;
    box-sizing: border-box;
    height: 100%;
}
</style>
