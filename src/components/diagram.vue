<template>
    <div class="diagram" @mousemove="moveNode" @mouseup="dropNode">
        <div class="nodes">
            <div v-for="node in nodes" 
                 class="node" 
                 :key="node.id" 
                 :class="node.icon"
                 @mousedown="selectNode(node, $event)"></div>
        </div>
        <div class="content">
            <div class="zoom-btn">
                <div class="zoomout" @click="zoomout">+</div>
                <div class="zoomin" @click="zoomin">-</div>
                <div class="reset" @click="resetview">&reg;</div>
                <div class="save" @click="save">save</div>
            </div>
        </div>
        <transition name="fade" @before-enter="beforeModalEnter">
            <div v-if="openSetting" class="setting-modal" :style="settingStyle">
                <table-modal :element="settingElement" @close="closeModal" @save="saveModal"></table-modal>
            </div>
        </transition>
    </div>
</template>
<script>
/**
 * 流程图入口文件
 * 
 * @author Ani
 * @description Vue2.0 + D3.js 流程图
 * 
 */
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';
import axios from 'axios';
import * as Util from '../utils';

/**逻辑组件 和表 */
import JoinComponent from './d3components/JoinComponent';
import AggregationComponent from './d3components/AggregationComponent';
import D3Hook from './d3components/d3Hook';

/**点击节点弹出选择modal */
import TableModal from './modal/TableModal.vue';

/**事件总线 */
import { EventBus } from '../event.bus';

export default {
    data () {
        return {
            /**逻辑组件列表（左侧拖拽的组件） */
            nodes: [
                {
                    name: 'joinTable',
                    icon: 'add',
                    id: 1
                },
                {
                    name: 'aggregationTable',
                    icon: 'aggre',
                    id: 2
                }
            ],
            /**拖拽生成的临时复制节点 */
            nodeClone: null,
            /**当临时复制的节点在画布内时，标记为待放置节点 */
            prepareDrop: false,
            /**画布 */
            container: null,
            /**标记画布中准备移动的节点 */
            // TODO: 该移动方式将修改为Drag
            prepareMove: false,

            /**拖拽放置的逻辑组件 */
            joinComponent: null,
            /**画布中正在移动的节点 */
            // TODO: 同上
            movedContext: null,

            /**是否打开节点上的设置modal */
            openSetting: false,
            /**打开设置modal时，通过style设置其位置 */
            settingStyle: '',
            /**设置时选中的元素 */
            settingElement: {},

            /**画布当前大小 */
            boundary: [2000, 1000],
            /**画布原始大小 */
            oBoundary: [2000, 1000],

            /**画布中节点元素基础设置 */
            shape: {
                circle: {
                    r: 20
                },
                rect: {
                    height: 80,
                    width: 80
                },
                arrow: {
                    height: 5
                }
            },

            dragElement: null,

            initDiagram: null,

            ray: [0, 0],

            // mock data
            // settingModal: {
            //     title: '源表选择',
            //     tables: [
            //         {
            //             id: '1',
            //             name: '用户信息表',
            //             fields: [
            //                 {
            //                     columnId: '1',
            //                     name: 'id',
            //                     description: '用户ID',
            //                     type: 'String'
            //                 },
            //                 {
            //                     columnId: '2',
            //                     name: 'name',
            //                     description: '用户名',
            //                     type: 'String'
            //                 },
            //                 {
            //                     columnId: '3',
            //                     name: 'phone',
            //                     description: '电话',
            //                     type: 'String'
            //                 },
            //                 {
            //                     columnId: '4',
            //                     name: 'age',
            //                     description: '年龄',
            //                     type: 'Number'
            //                 }
            //             ]
            //         },
            //         {
            //             id: '2',
            //             name: '购物登记表',
            //             fields: [
            //                 {
            //                     columnId: '1',
            //                     name: 'id',
            //                     description: '主键ID',
            //                     type: 'String'
            //                 },
            //                 {
            //                     columnId: '2',
            //                     name: 'uid',
            //                     description: '用户ID',
            //                     type: 'String'
            //                 },
            //                 {
            //                     columnId: '3',
            //                     name: 'product',
            //                     description: '商品名称',
            //                     type: 'String'
            //                 },
            //                 {
            //                     columnId: '4',
            //                     name: 'price',
            //                     description: '商品单价',
            //                     type: 'Number'
            //                 },
            //                 {
            //                     columnId: '5',
            //                     name: 'counts',
            //                     description: '购买数量',
            //                     type: 'Number'
            //                 }
            //             ]
            //         }
            //     ]
            // },
        }
    },
    mounted () {
        /**初始化画布 */
        this.container = this.$d3.select('.content')
                                .append('svg')
                                .attr('id', 'diagram')
                                .attr('width', this.boundary[0])
                                .attr('height', this.boundary[1])
                                .attr('viewBox', `0 0 ${this.boundary[0]} ${this.boundary[1]}`);
        this.container.treeMap = {};
        this.container.flow = {};
        this.container.$store = this.$store;
        this.container.boundary = this.boundary;
        this.container
            .on('mousemove', this.setNode)
            .call(
                this.$d3.drag()
                    .on('start', () => {
                        this.container.attr('class', 'grabbing');
                    })
                    .on('drag', () => {
                        this.container.attr('style', `transform: translate(${this.containerX}px, ${this.containerY}px)`);
                        this.$store.dispatch('diagram/updateContX', this.containerX + this.$d3.event.dx);
                        this.$store.dispatch('diagram/updateContY', this.containerY + this.$d3.event.dy);
                    })
                    .on('end', () => {
                        this.container.attr('class', '');
                    })
            );
        
        // this.$store.dispatch('tables/setTables', this.settingModal.tables);

        /************************画布监听事件***************************/
        EventBus.$on('prepareMove', payload => this.prepareMove = payload);
        EventBus.$on('movedContext', payload => this.movedContext = payload);
        EventBus.$on('settingElement', payload => this.settingElement = payload);
        EventBus.$on('openSetting', payload => this.openSetting = payload);
        EventBus.$on('settingStyle', payload => this.settingStyle = payload);
        EventBus.$on('dragElement', payload => this.dragElement = payload);
        EventBus.$on('dragElementTarget', payload => this.container.dragElementTarget = payload);
        /*************************************************************/


        //------------------------------------------------------------/
        axios.post('http://localhost:10001/diagram/uuid/generate', { num: 30 }).then(res => {
            this.container.uuids = res.data;
        }).catch(err => {
            console.log(err);
        });

        axios.get('http://localhost:10001/diagram/tables').then(res => {
            this.$nextTick(() => {
                this.$store.dispatch('tables/setTables', res.data);
            });
        }).catch(err => {
            console.log(err);
        });
        //------------------------------------------------------------/

        // this.initDiagram = [
        //     {
        //         uuid: '2715c496-1556-4344-be9a-7e28f85e1afc',
        //         type: 'join',
        //         d3Circle: {
        //             uuid: 'dd137d73-cfc4-44f5-dfc3-f9f5111f94d9',
        //             cx: 120,
        //             cy: 200
        //         },
        //         d3Rect: [
        //             {
        //                 uuid: '54db5d89-bf8c-4318-9e6e-daeeea383483',
        //                 x: 50,
        //                 y: 50,
        //                 model: {
        //                     title: '源表选择',
        //                     type: 'source',
        //                     sub: 'leftTable',
        //                     selected: {}
        //                 },
        //                 hooks: [
        //                     {
        //                         type: 'out',
        //                         position: 'bottom'
        //                     }
        //                 ],
        //             },
        //             {
        //                 uuid: '751ed11f-2a2f-4af6-c817-74a7f25055e1',
        //                 x: 50,
        //                 y: 275,
        //                 model: {
        //                     title: '源表选择',
        //                     type: 'source',
        //                     sub: 'rightTable',
        //                     selected: {}
        //                 },
        //                 hooks: [
        //                     {
        //                         type: 'out',
        //                         position: 'top'
        //                     }
        //                 ]
        //             },
        //             {
        //                 uuid: 'dcc785a9-d7dc-4200-aa80-6f0c75f698e0',
        //                 x: 160,
        //                 y: 50,
        //                 model: {
        //                     title: '联表配置',
        //                     type: 'target',
        //                     sub: 'join'
        //                 },
        //                 hooks: [
        //                     {
        //                         type: 'in',
        //                         position: 'left'
        //                     },
        //                     {
        //                         type: 'out',
        //                         position: 'bottom',
        //                         connector: {
        //                             'dc4fd082-2d1b-4d40-e999-36ccdce77b43': 0
        //                         }
        //                     }
        //                 ]
        //             }
        //         ]
        //     },
        //     {
        //         uuid: 'e32709de-dcf9-4e6e-ca01-29a3544366e6',
        //         type: 'join',
        //         d3Circle: {
        //             uuid: 'dc4fd082-2d1b-4d40-e999-36ccdce77b43',
        //             cx: 220,
        //             cy: 200
        //         },
        //         d3Rect: [
        //             {
        //                 uuid: 'dcc785a9-d7dc-4200-aa80-6f0c75f698e0',
        //                 x: 100,
        //                 y: 200,
        //                 model: {
        //                     title: '联表配置',
        //                     type: 'target',
        //                     sub: 'join',
        //                     nType: 'source',
        //                     nSub: 'leftTable',
        //                     stream: 'in'
        //                 },
        //                 hooks: [
        //                     {
        //                         type: 'in',
        //                         position: 'left'
        //                     },
        //                     {
        //                         type: 'out',
        //                         position: 'bottom'
        //                     }
        //                 ]
        //             },
        //             {
        //                 uuid: 'da63a765-260a-421b-a200-6222baaefe4d',
        //                 x: 160,
        //                 y: 275,
        //                 model: {
        //                     title: '源表选择',
        //                     type: 'source',
        //                     sub: 'rightTable',
        //                     selected: {}
        //                 },
        //                 hooks: [
        //                     {
        //                         type: 'out',
        //                         position: 'top'
        //                     }
        //                 ]
        //             },
        //             {
        //                 uuid: '2b6c0480-e08c-48ac-f4cc-254c8d2de9b4',
        //                 x: 280,
        //                 y: 160,
        //                 model: {
        //                     title: '联表配置',
        //                     type: 'target',
        //                     sub: 'join'
        //                 },
        //                 hooks: [
        //                     {
        //                         type: 'in',
        //                         position: 'left'
        //                     },
        //                     {
        //                         type: 'out',
        //                         position: 'right',
        //                         connector: {
        //                             '7c23bdd7-6c8f-40c8-f406-abe20e37b4b5': 0
        //                         }
        //                     }
        //                 ]
        //             }
        //         ]
        //     },
        //     {
        //         uuid: '2300419c-31dc-462a-e16d-fcf9b8bde34c',
        //         type: 'aggregation',
        //         d3Circle: {
        //             uuid: '7c23bdd7-6c8f-40c8-f406-abe20e37b4b5',
        //             cx: 420,
        //             cy: 200
        //         },
        //         d3Rect: [
        //             {
        //                 uuid: '2b6c0480-e08c-48ac-f4cc-254c8d2de9b4',
        //                 x: 100,
        //                 y: 200,
        //                 model: {
        //                     title: '联表配置',
        //                     type: 'target',
        //                     sub: 'join',
        //                     nType: 'source',
        //                     nSub: 'leftTable',
        //                     stream: 'in'
        //                 },
        //                 hooks: [
        //                     {
        //                         type: 'in',
        //                         position: 'left'
        //                     },
        //                     {
        //                         type: 'out',
        //                         position: 'right'
        //                     }
        //                 ]
        //             },
        //             {
        //                 uuid: '17518eca-6074-4a25-d1c0-e645f90aa8d7',
        //                 x: 480,
        //                 y: 160,
        //                 model: {
        //                     title: '联表配置',
        //                     type: 'target',
        //                     sub: 'aggregation'
        //                 },
        //                 hooks: [
        //                     {
        //                         type: 'in',
        //                         position: 'left'
        //                     }
        //                 ]
        //             }
        //         ]
        //     }
        // ];
    },
    computed: {
        ...mapGetters('diagram', ['containerX', 'containerY']),
        ...mapGetters('tables', ['tables']),
        settingConfig: function () {
            return Object.assign({}, this.settingElement.config.model);
        }
    },
    methods: {
        /**
         * 放大画布
         */
        zoomout: function () {
            this.container.attr('viewBox', `0 0 ${this.boundary[0] -= 100} ${this.boundary[1] -= 100}`);
        },

        /**
         * 缩小画布
         */
        zoomin: function () {
            this.container.attr('viewBox', `0 0 ${this.boundary[0] += 100} ${this.boundary[1] += 100}`);
        },

        /**
         * 重置画布大小
         */
        resetview: function () {
            this.container.attr('viewBox', `0 0 ${this.oBoundary[0]} ${this.oBoundary[1]}`);
            Vue.util.extend(this.boundary, this.oBoundary);
        },

        save: function () {
            let pipline = [];
            for (let [key, value] of Object.entries(this.container.treeMap)) {
                let step = {};

                step.stepId = key;
                step.type = value.type;

                for (let [k, v] of Object.entries(value)) {
                    /**join joinColumnPairs */
                    if (step.type == 'join') {
                        if (v.type == 'operation') {
                            console.log(v);
                            step.leftSourceTableId = v.leftTableId;
                            step.rightSourceTableId = v.rightTableId;
                            step.joinColumnPair = v.joinColumnPair.map(x => {
                                return {
                                    leftKeyId: x.leftColumnId,
                                    rightKeyId: x.rightColumnId
                                }
                            });
                        }
                        if (v.type == 'target' && !v.stream) {
                            step.targetTableId = v.tableId;
                            step.mappingColumnPairs = [];
                            v.fields.forEach(field => {
                                step.mappingColumnPairs.push({
                                    targetTableId: field.targetTableId,
                                    sourceColumnId: field.sourceColumnId,
                                    columnId: field.columnId
                                });
                            });
                        }
                    }
                }

                pipline.push(step);
            }
            console.log(pipline);
        },

        /**
         * 关闭设置modal
         */
        closeModal: function () {
            this.openSetting = false;
        },

        saveModal: function (settings) {
            this.closeModal();
            this.settingElement.config.model.data = settings;
            this.settingElement.repaint();
        },

        beforeModalEnter: function () {
        },

        /**
         * 左侧栏中鼠标按下设置临时拖拽的节点
         * 
         * @param {Event} event
         */
        selectNode: function (node, $event) {
            let nodeEl = event.target;
            this.nodeClone = nodeEl.cloneNode(true);
            this.nodeClone.className += ' moved';

            this.nodeClone.style.transform = `translate(${event.x - 25}px, ${event.y - 25}px)`;
            this.nodeClone.node = node;
            
            this.$nextTick(() => {
                document.querySelector('.diagram').appendChild(this.nodeClone);
            });
        },

        /**
         * 移动临时节点
         * 
         * @param {Event} event
         */
        moveNode: function (event) {
            if (this.nodeClone) {
                this.nodeClone.style.transform = `translate(${event.x - 25}px, ${event.y - 25}px)`;
            }
        },

        /**
         * 鼠标在画布中抬起时，标记临时节点为待放置或者绘制移动后的节点
         */
        setNode: function () {
            if (this.prepareMove) {
                /**重绘拖动的元素 */
                this.movedContext.repaint(this.$d3.event);
                /**元素重绘后，更新该锚点上的连接器的入口出口值并重回连接器 */
                this.movedContext.hooks.forEach(hook => {
                    if (hook.type == 'in') {
                        hook.connector.setOut(hook).repaint();
                    } else {
                        hook.connector.setIn(hook).repaint();
                    }
                });
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
                    
                    this.nodeClone.node.id == 1 && (this.joinComponent = new JoinComponent(this.container, {
                        uuid: Util.uuid(),
                        d3Circle: {
                            uuid: Util.uuid(),
                            cx: event.offsetX,
                            cy: event.offsetY
                        },
                        d3Rect: [
                            {
                                uuid: Util.uuid(),
                                x: event.offsetX - this.shape.rect.width,
                                y: event.offsetY - this.shape.rect.height * 1.5,
                                hooks: [
                                    {
                                        type: 'out',
                                        position: 'bottom'
                                    }
                                ],
                                model: {
                                    title: '源表选择',
                                    type: 'source',
                                    sub: 'leftTable',
                                    selected: {}
                                }
                            },
                            {
                                uuid: Util.uuid(),
                                x: event.offsetX - this.shape.rect.width,
                                y: event.offsetY + this.shape.rect.height * 0.5,
                                model: {
                                    title: '源表选择',
                                    type: 'source',
                                    sub: 'rightTable',
                                    selected: {}
                                },
                                hooks: [
                                    {
                                        type: 'out',
                                        position: 'top'
                                    }
                                ]
                            },
                            {
                                uuid: Util.uuid(),
                                x: event.offsetX + this.shape.rect.height * 0.5,
                                y: event.offsetY - this.shape.rect.height * 0.5,
                                model: {
                                    title: '联表配置',
                                    type: 'target',
                                    sub: 'join'
                                },
                                hooks: [
                                    {
                                        type: 'in',
                                        position: 'left'
                                    }
                                ]
                            }
                        ]
                    }).draw());

                    this.nodeClone.node.id == 2 && (this.aggregationComponent = new AggregationComponent(this.container, {
                        uuid: Util.uuid(),
                        d3Circle: {
                            uuid: Util.uuid(),
                            cx: event.offsetX,
                            cy: event.offsetY
                        },
                        d3Rect: [
                            {
                                uuid: Util.uuid(),
                                x: event.offsetX - this.shape.rect.width * 1.8,
                                y: event.offsetY - this.shape.rect.height / 2,
                                hooks: [
                                    {
                                        type: 'out',
                                        position: 'right'
                                    }
                                ],
                                model: {
                                    title: '源表选择',
                                    type: 'source',
                                    sub: 'leftTable',
                                    selected: {}
                                }
                            },
                            {
                                uuid: Util.uuid(),
                                x: event.offsetX + this.shape.rect.height * 0.8,
                                y: event.offsetY - this.shape.rect.height / 2,
                                model: {
                                    title: '联表配置',
                                    type: 'target',
                                    sub: 'aggregation'
                                },
                                hooks: [
                                    {
                                        type: 'in',
                                        position: 'left'
                                    }
                                ]
                            }
                        ]
                    }).draw());

                    this.prepareDrop = false;
                }
                this.nodeClone.remove();
                this.nodeClone = null;
            }
        }
    },
    watch: {
        initDiagram: function (n) {
            n.forEach(step => {
                if (step.type == 'join') {
                    new JoinComponent(this.container, step).draw();
                }
                if (step.type == 'aggregation') {
                    new AggregationComponent(this.container, step).draw();
                }
            });
        }
    },
    components: {
        'table-modal': TableModal
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
        position: relative;
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
        &.aggre {
            &:after {
                content: '聚';
                position: absolute;
                font-size: 24px;
                text-align: center;
                line-height: 50px;
                width: 100%;
                height: 100%;
            }
        }
    }
    .content {
        flex-grow: 5;
        height: 80%;
        min-width: 500px;
        border: 1px solid #ccc;
        margin: 30px 10px;
        overflow: scroll;
        position: relative;

        .zoom-btn {
            width: 200px;
            height: 30px;
            position: absolute;
            border: 1px solid #999999;
            border-radius: 3px;
            .zoomout {
                float: left;
                width: 25%;
                height: 100%;
                text-align: center;
                line-height: 30px;
                cursor: pointer;
                border-right: 1px solid #999999;
                box-sizing: border-box;
            }
            .zoomin {
                float: left;
                width: 25%;
                height: 100%;
                text-align: center;
                line-height: 30px;
                cursor: pointer;
                border-right: 1px solid #999999;
                box-sizing: border-box;
            }
            .reset {
                float: left;
                width: 25%;
                height: 100%;
                text-align: center;
                line-height: 30px;
                cursor: pointer;
                border-right: 1px solid #999999;
                box-sizing: border-box;
            }
            .save {
                float: left;
                width: 25%;
                height: 100%;
                text-align: center;
                line-height: 30px;
                cursor: pointer;
                box-sizing: border-box;
            }
        }

    }

    .setting-modal {
        position: absolute;
        color: #f0f0f0;
        height: 300px;
        width: 300px;
        background-color: #333333;
        border-radius: 5px;
        box-shadow: 1px 1px 2px 1px rgba(51, 51, 51, 0.2);
        top: 0;
        left: 0;
        &:before {
            content: ' ';
            position: absolute;
            height: 0;
            width: 0;
            border-right: 10px solid #333333;
            border-bottom: 10px solid transparent;
            border-top: 10px solid transparent;
            left: -10px;
            top: 10px;
        }

        .header {
            .title {
                font-size: 14px;
                text-align: center;
                height: 30px;
                line-height: 30px;
            }
        }
    }

    svg#diagram {
        cursor: -webkit-grab;
        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAE5JREFUOBFjYBgFAx8CjLiccPPmTU+g3CyofJq6uvp2bGqZsAlCxWb9//9fBoSBfJhBGMrxGYChGJsAPgPSGBkZn4AwUGMaNs2jYoMlBABmhg8ILwXjzQAAAABJRU5ErkJggg==);
        background-size: 8px;
        margin: 10px;
        &.grabbing {
            cursor: -webkit-grabbing;
        }
        circle,rect {
            cursor: move;
            pointer-events: all;
            &:focus {
                stroke: #feb663;
                outline: none;
            }
        }
        text {
            pointer-events: none;
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


