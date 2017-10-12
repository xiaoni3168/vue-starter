<template>
    <div class="etl">
        <div class="etl-content">
            <div class="etl-content_header">
                - create data model -
            </div>
            <div class="etl-content_main">
                <diagram-canvas></diagram-canvas>
            </div>
        </div>
    </div>
</template>

<script type="text/javascript">
import diagramCanvas from './DiagramCanvas.vue';

export default {
    components: {
        diagramCanvas
    }
}
</script>

<style type="scss">
.etl {
    position: fixed;
    height: 100%;
    width: 100%;
    background-color: #cccccc;

    &-content {
        position: fixed;
        height: 100%;
        width: 100%;
        background-color: #ffffff;
        padding: 30px;
        left: 0;
        top: 0;
        box-sizing: border-box;
        margin: auto;

        &_header {
            width: 100%;
            height: 35px;
            line-height: 35px;
            text-align: center;
        }
    }
}
</style>
