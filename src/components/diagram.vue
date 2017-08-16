<template>
    <div class="diagram" @mousemove="moveNode" @mouseup="dropNode">
        <div class="nodes">
            <div v-for="node in nodes" 
                 class="node" 
                 :key="node.id" 
                 :class="node.icon"
                 @mousedown="selectNode"></div>
        </div>
        <div class="content">
        </div>
        <transition name="fade">
            <div v-show="openSetting" class="setting-modal" :style="settingStyle"></div>
        </transition>
    </div>
</template>
<script>
import SvgComponent from './svgComponent.vue';
import CombineComponent from './d3components/CombineComponent';
export default {
    data () {
        return {
            nodes: [
                {
                    name: 'combineTable',
                    icon: 'add',
                    id: 1
                }
            ],
            nodeClone: null,
            prepareDrop: false,
            container: null,
            prepareMove: false,

            combineComponent: null,
            movedContext: null,
            openSetting: null,
            settingStyle: ''
        }
    },
    mounted () {
        this.container = this.$d3.select('.content').append('svg').attr('height', 500).attr('width', 500);
        this.container.on('mousemove', this.setNode).on('click', () => { this.openSetting = false });
    },
    methods: {
        selectNode: function (event) {
            let node = event.target;
            this.nodeClone = node.cloneNode(true);
            this.nodeClone.className += ' moved';

            this.nodeClone.style.transform = `translate(${event.x - 25}px, ${event.y - 25}px)`;
            
            this.$nextTick(() => {
                document.querySelector('.diagram').appendChild(this.nodeClone);
            });
        },
        moveNode: function (event) {
            if (this.nodeClone) {
                this.nodeClone.style.transform = `translate(${event.x - 25}px, ${event.y - 25}px)`;
            }
        },
        setNode: function () {
            if (this.prepareMove) {
                this.movedContext.repaint(this.$d3.event);
                this.movedContext.hooks.forEach(hook => {
                    if (hook.type == 'in') {
                        hook.connector.setOut(hook).repaint();
                    } else {
                        hook.connector.setIn(hook).repaint();
                    }
                });
                // if (this.movedContext.hooks[0].type == 'in') {
                //     this.movedContext.hooks[0].connector.setOut(this.movedContext.hooks[0]).repaint();
                // } else {
                //     this.movedContext.hooks[0].connector.setIn(this.movedContext.hooks[0]).repaint();
                // }
                
            }
            if (!this.nodeClone) {
                return;
            } else {
                this.prepareDrop = true;
            }
        },
        dropNode: function (event) {
            if (this.nodeClone) {
                if (this.prepareDrop) {
                    const _this = this;
                    this.combineComponent = new CombineComponent(this.container, {
                        d3Circle: {
                            cx: event.offsetX,
                            cy: event.offsetY,
                            r: 25,
                            fill: 'none',
                            strokeWidth: 2,
                            hooks: [
                                {
                                    point: [event.offsetX - Math.sqrt(Math.pow(25, 2) / 2), event.offsetY - Math.sqrt(Math.pow(25, 2) / 2)],
                                    updater: (config, uEvent) => {
                                        return [uEvent.x - Math.sqrt(Math.pow(config.r, 2) / 2), uEvent.y - Math.sqrt(Math.pow(config.r, 2) / 2)];
                                    },
                                    connected: true,
                                    type: 'in'
                                },
                                {
                                    point: [event.offsetX - Math.sqrt(Math.pow(25, 2) / 2), event.offsetY + Math.sqrt(Math.pow(25, 2) / 2)],
                                    updater: (config, uEvent) => {
                                        return [uEvent.x - Math.sqrt(Math.pow(config.r, 2) / 2), uEvent.y + Math.sqrt(Math.pow(config.r, 2) / 2)];
                                    },
                                    connected: true,
                                    type: 'in'
                                },
                                {
                                    point: [event.offsetX + 25, event.offsetY],
                                    updater: (config, uEvent) => {
                                        return [uEvent.x + 25, uEvent.y];
                                    },
                                    connected: true,
                                    type: 'out'
                                }
                            ],
                            onDrag: function () {
                                this.repaint(_this.$d3.event);
                                this.hooks.forEach(hook => {
                                    if (hook.type == 'in') {
                                        hook.connector.setOut(hook).repaint();
                                    } else {
                                        hook.connector.setIn(hook).repaint();
                                    }
                                });
                            },
                            onMouseDown: function () {
                                _this.prepareMove = true;
                                _this.movedContext = this;
                            },
                            onMouseUp: function () {
                                _this.prepareMove = false;
                                _this.movedContext = null;
                            }
                        },
                        d3Rect1: {
                            x: event.offsetX - Math.sqrt(Math.pow(25, 2) / 2) - 40 - 50,
                            y: event.offsetY - Math.sqrt(Math.pow(25, 2) / 2) - 40 - 100,
                            rx: 10,
                            ry: 10,
                            width: 100,
                            height: 100,
                            strokeWidth: 1,
                            stroke: '#666666',
                            strokeDassarray: '5,3',
                            hooks: [
                                {
                                    point: [event.offsetX - Math.sqrt(Math.pow(25, 2) / 2) - 40, event.offsetY - Math.sqrt(Math.pow(25, 2) / 2) - 40],
                                    updater: (config, uEvent) => {
                                        return [uEvent.x, uEvent.y + config.height / 2];
                                    },
                                    connected: true,
                                    type: 'out'
                                }
                            ],
                            onDbClick: function () {
                                _this.$d3.event.stopPropagation();
                                _this.openSetting = true;
                                _this.settingStyle = {
                                    transform: `translate(${_this.$d3.event.clientX}px, ${_this.$d3.event.clientY}px)`
                                };
                            },
                            onDrag: function () {
                                this.repaint(_this.$d3.event);
                                this.hooks.forEach(hook => {
                                    if (hook.type == 'in') {
                                        hook.connector.setOut(hook).repaint();
                                    } else {
                                        hook.connector.setIn(hook).repaint();
                                    }
                                });
                            }
                        },
                        d3Rect2: {
                            x: event.offsetX - Math.sqrt(Math.pow(25, 2) / 2) - 40 - 50,
                            y: event.offsetY + Math.sqrt(Math.pow(25, 2) / 2) + 40,
                            rx: 10,
                            ry: 10,
                            width: 100,
                            height: 100,
                            strokeWidth: 1,
                            stroke: '#666666',
                            strokeDassarray: '5,3',
                            hooks: [
                                {
                                    point: [event.offsetX - Math.sqrt(Math.pow(25, 2) / 2) - 40, event.offsetY + Math.sqrt(Math.pow(25, 2) / 2) + 40],
                                    updater: (config, uEvent) => {
                                        return [uEvent.x, uEvent.y - config.height / 2];
                                    },
                                    connected: true,
                                    type: 'out'
                                }
                            ],
                            onDrag: function () {
                                this.repaint(_this.$d3.event);
                                this.hooks.forEach(hook => {
                                    if (hook.type == 'in') {
                                        hook.connector.setOut(hook).repaint();
                                    } else {
                                        hook.connector.setIn(hook).repaint();
                                    }
                                });
                            }
                        },
                        d3Rect3: {
                            x: event.offsetX + 75,
                            y: event.offsetY - 50,
                            rx: 10,
                            ry: 10,
                            width: 100,
                            height: 100,
                            strokeWidth: 1,
                            stroke: '#666666',
                            strokeDassarray: '5,3',
                            hooks: [
                                {
                                    point: [event.offsetX + 75, event.offsetY],
                                    updater: (config, uEvent) => {
                                        return [uEvent.x - config.width / 2, uEvent.y];
                                    },
                                    connected: true,
                                    type: 'in'
                                }
                            ],
                            onDrag: function () {
                                this.repaint(_this.$d3.event);
                                this.hooks.forEach(hook => {
                                    if (hook.type == 'in') {
                                        hook.connector.setOut(hook).repaint();
                                    } else {
                                        hook.connector.setIn(hook).repaint();
                                    }
                                });
                            }
                        }
                    }).draw();
                    this.prepareDrop = false;
                }
                this.nodeClone.remove();
                this.nodeClone = null;
            }
        }
    }
}
</script>
<style lang="sass">
.diagram {
    height: 100%;
    width: 100%;
    display: flex;
    background-color: #eee;
    -webkit-user-select: none;
    .nodes {
        max-width: 150px;
        min-width: 120px;
        height: 60%;
        /* float: left; */
        flex-grow: 1;
        margin: 30px 0;
        box-shadow: 2px 2px 2px 0px rgba(0, 0, 0, 0.3);
        background-color: #f5f5f5;
        border-radius: 0 3px 3px 0;
    }
    .node {
        height: 50px;
        width: 50px;
        margin: auto;
        border-radius: 100%;
        border: 2px solid;
        cursor: move;
        &.moved {
            position: absolute;
            pointer-events: none;
            left: 0;
            top: 0;
            opacity: 0.3;
        }
        &.add {
            background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAbFJREFUeAHt2sFtAkEUREHslMg/BGKyM/gcumnLUnEdqQfqicNK+3j4ECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgEBT4Ks59hdbz+fz57r39Xr9q9/4ff0YZ3sBQfbm542CnDz7Q0H25ueNgpw8+0NB9ubnjYKcPPtDQfbm542CnDz7Q0H25ueNgpw8+0NB9ubnjYKcPPtDQfbm542CnDz7Q0H25ueNgpw8+0NB9ubnjYKcPPtDQfbm542CnDz7Q0H25ueNgpw8+8OPv7P07r2p/U/u3th+78s/pNsnXhMkJuwOCNL1jNcEiQm7A4J0PeM1QWLC7oAgXc947ePPIfE3fDPw7jmn/Zzw5uvEx/4hMWF3QJCuZ7wmSEzYHRCk6xmvCRITdgcE6XrGa4LEhN0BQbqe8ZogMWF3QJCuZ7wmSEzYHRCk6xmvCRITdgcE6XrGa4LEhN0BQbqe8ZogMWF3QJCuZ7wmSEzYHRCk6xmvCRITdgcE6XrGa4LEhAYIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBhcAvaWQMbpMu3CsAAAAASUVORK5CYII=);
            background-size: 50px;
        }
    }
    .content {
        flex-grow: 5;
        height: 80%;
        min-width: 500px;
        border: 1px solid #ccc;
        margin: 30px 10px;
        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAE5JREFUOBFjYBgFAx8CjLiccPPmTU+g3CyofJq6uvp2bGqZsAlCxWb9//9fBoSBfJhBGMrxGYChGJsAPgPSGBkZn4AwUGMaNs2jYoMlBABmhg8ILwXjzQAAAABJRU5ErkJggg==);
        background-size: 8px;
    }
    
    .setting-modal {
        position: absolute;
        height: 260px;
        width: 200px;
        background-color: #f5f5f5;
        border-radius: 5px;
        box-shadow: 0 0 2px 0px rgba(51,51,51,0.2);
        top: 0;
        left: 0;
    }

    svg {
        circle,rect {
            cursor: move;
            pointer-events: all;
            &:focus {
                stroke: '#2888e5';
            }
        }
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity .3s;
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>


