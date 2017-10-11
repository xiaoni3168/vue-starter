none<template>
    <div class="diagram-content">
        <div class="diagram-content-canvas" id="canvas">
            <div class="diagram-content-toolbox">
                <div class="diagram-content-toolbox_head"></div>
                <div class="diagram-content-toolbox_elements">
                    <div class="diagram-content-toolbox_elements--element"
                         v-for="element in elements"
                         :key="element.id"
                         :e-type="element.type"
                         :e-name="element.name">
                        <span class="element-icon">
                            <svg>
                                <use :xlink:href="element.icon"></use>
                            </svg>
                        </span>
                        <span class="element-label">{{element.name}}</span>
                    </div>
                </div>
            </div>
        </div>
        <button type="button" name="button" @click="save()">Save</button>
    </div>
</template>
<script type="text/javascript">
import * as Utils from '../utils';

export default {
    data () {
        return {
            container: null,

            initialData:{"rect":[{"uid":"6b44fbb3-7573-47ee-bd0c-a0ef73e92e6e","x":218,"y":105,"width":80,"height":80,"rx":10,"ry":10,"stroke":"#b0b0b0","fill":"#f5f5f5","type":"dataset","name":"Dataset","source":"postgre"},{"uid":"4a9036e7-cef8-43ed-9e16-589b8d5067c4","x":218,"y":-6.600000381469727,"width":80,"height":80,"rx":10,"ry":10,"stroke":"#b0b0b0","fill":"#f5f5f5","type":"dataset","name":"Dataset","source":"googleanalysis"},{"uid":"3fccd53e-34bf-4835-d706-d85bc260f591","x":488,"y":50,"width":80,"height":80,"rx":10,"ry":10,"stroke":"#b0b0b0","fill":"#f5f5f5","type":"operation","name":"Join"},{"uid":"fd7b2063-5ee5-4448-e41e-b93b4440a9a3","x":488,"y":173.40000915527344,"width":80,"height":80,"rx":10,"ry":10,"stroke":"#b0b0b0","fill":"#f5f5f5","type":"dataset","name":"Dataset","source":"excel"},{"uid":"a4c83a34-2fe1-4611-b671-ef8214f32dd7","x":749,"y":110,"width":80,"height":80,"rx":10,"ry":10,"stroke":"#b0b0b0","fill":"#f5f5f5","type":"operation","name":"Join"},{"uid":"f253b1e0-bc3b-48d1-fc7e-f33ea2dbc184","x":217,"y":235.7999725341797,"width":80,"height":80,"rx":10,"ry":10,"stroke":"#b0b0b0","fill":"#f5f5f5","type":"dataset","name":"Dataset","source":"mailchimp"},{"uid":"3964b2ee-8d77-43cf-80f5-cf02bab37978","x":217,"y":348,"width":80,"height":80,"rx":10,"ry":10,"stroke":"#b0b0b0","fill":"#f5f5f5","type":"dataset","name":"Dataset","source":"googledrive"},{"uid":"0f584ccb-46db-48e3-cae5-08edd5c16fc8","x":487,"y":293,"width":80,"height":80,"rx":10,"ry":10,"stroke":"#b0b0b0","fill":"#f5f5f5","type":"operation","name":"AppendRow"},{"uid":"d7e56c34-e68c-48d9-eeb4-3f0e00b1fc1d","x":752,"y":293,"width":80,"height":80,"rx":10,"ry":10,"stroke":"#b0b0b0","fill":"#f5f5f5","type":"operation","name":"Join"},{"uid":"de224007-4486-42b4-af4c-bafb6f6fe305","x":487,"y":418,"width":80,"height":80,"rx":10,"ry":10,"stroke":"#b0b0b0","fill":"#f5f5f5","type":"dataset","name":"Dataset","source":"s3"},{"uid":"7920199e-ef99-4a90-e947-92005d7ca4f2","x":1023,"y":199,"width":80,"height":80,"rx":10,"ry":10,"stroke":"#b0b0b0","fill":"#f5f5f5","type":"operation","name":"Join"},{"uid":"6e6d8a65-dbd8-4208-f804-172314f5a50f","x":1248,"y":199,"width":80,"height":80,"rx":10,"ry":10,"stroke":"#b0b0b0","fill":"#f5f5f5","type":"operation","name":"AppendRow"},{"uid":"47d2d14d-87bb-4a0d-b6b7-1525f527082a","x":1023,"y":324,"width":80,"height":80,"rx":10,"ry":10,"stroke":"#b0b0b0","fill":"#f5f5f5","type":"dataset","name":"Dataset","source":"mysql"}],"line":[{"x1":298,"y1":33.39999961853027,"x2":488,"y2":90,"strokeDasharray":"none","inUID":"4a9036e7-cef8-43ed-9e16-589b8d5067c4","outUID":"3fccd53e-34bf-4835-d706-d85bc260f591"},{"x1":298,"y1":145,"x2":488,"y2":90,"strokeDasharray":"none","inUID":"6b44fbb3-7573-47ee-bd0c-a0ef73e92e6e","outUID":"3fccd53e-34bf-4835-d706-d85bc260f591"},{"x1":568,"y1":90,"x2":749,"y2":150,"strokeDasharray":"3,5","inUID":"3fccd53e-34bf-4835-d706-d85bc260f591","outUID":"a4c83a34-2fe1-4611-b671-ef8214f32dd7"},{"x1":568,"y1":213.40000915527344,"x2":749,"y2":150,"strokeDasharray":"none","inUID":"fd7b2063-5ee5-4448-e41e-b93b4440a9a3","outUID":"a4c83a34-2fe1-4611-b671-ef8214f32dd7"},{"x1":297,"y1":275.7999725341797,"x2":487,"y2":333,"strokeDasharray":"none","inUID":"f253b1e0-bc3b-48d1-fc7e-f33ea2dbc184","outUID":"0f584ccb-46db-48e3-cae5-08edd5c16fc8"},{"x1":297,"y1":388,"x2":487,"y2":333,"strokeDasharray":"none","inUID":"3964b2ee-8d77-43cf-80f5-cf02bab37978","outUID":"0f584ccb-46db-48e3-cae5-08edd5c16fc8"},{"x1":567,"y1":333,"x2":752,"y2":333,"strokeDasharray":"3,5","inUID":"0f584ccb-46db-48e3-cae5-08edd5c16fc8","outUID":"d7e56c34-e68c-48d9-eeb4-3f0e00b1fc1d"},{"x1":567,"y1":458,"x2":752,"y2":333,"strokeDasharray":"none","inUID":"de224007-4486-42b4-af4c-bafb6f6fe305","outUID":"d7e56c34-e68c-48d9-eeb4-3f0e00b1fc1d"},{"x1":829,"y1":150,"x2":1023,"y2":239,"strokeDasharray":"3,5","inUID":"a4c83a34-2fe1-4611-b671-ef8214f32dd7","outUID":"7920199e-ef99-4a90-e947-92005d7ca4f2"},{"x1":832,"y1":333,"x2":1023,"y2":239,"strokeDasharray":"3,5","inUID":"d7e56c34-e68c-48d9-eeb4-3f0e00b1fc1d","outUID":"7920199e-ef99-4a90-e947-92005d7ca4f2"},{"x1":1103,"y1":239,"x2":1248,"y2":239,"strokeDasharray":"3,5","inUID":"7920199e-ef99-4a90-e947-92005d7ca4f2","outUID":"6e6d8a65-dbd8-4208-f804-172314f5a50f"},{"x1":1103,"y1":364,"x2":1248,"y2":239,"strokeDasharray":"none","inUID":"47d2d14d-87bb-4a0d-b6b7-1525f527082a","outUID":"6e6d8a65-dbd8-4208-f804-172314f5a50f"}]},

            toolboxPosition: {
                x: 1000,
                y: 20
            },

            elements: [
                {
                    id:   1,
                    name: 'Dataset',
                    type: 'dataset',
                    icon: '#icon-add-dataset'
                },
                {
                    id:   2,
                    name: 'Join',
                    type: 'operation',
                    icon: '#icon-duplicate'
                },
                {
                    id:   3,
                    name: 'AppendRow',
                    type: 'operation',
                    icon: '#icon-nav'
                }
            ]
        }
    },

    mounted () {
        this.D3Diagram.on('onload', function (d) {
            console.log(d)
        })
        /** 初始化画布 */
        this.D3Diagram.init({
            dom: '#canvas',
            config: {
                "height": 600,
                "width": '100%'
            }
        });
        /** 初始化toolbox（拖拽） */
        this.initToolboxHeader();

        window.D3Diagram = this.D3Diagram;

        this.D3Diagram.on('rect_click', function ({data, event}) {
            if (data.type == 'dataset') {
                let p = window.prompt();
                if (p) {
                    this.repaintRect(Object.assign(data, {source: p}))
                }
            }
        });

        this.D3Diagram.on('line_click', function ({data, event}) {
            if (window.confirm('Do you want to delete this line ?')) {
                this.deleteLine(data);
            }
        });

        this.D3Diagram.rect(this.initialData.rect);
        this.D3Diagram.line(this.initialData.line);
    },

    methods: {
        click: function () {
            let arr = [];
            this.D3Diagram.getInstance().selectAll('rect').each(r => {
                arr.push(r);
            });

            this.D3Diagram.rect(arr.concat({
                "uid": Utils.uuid(),
                "x": 0,
                "y": 0,
                "width": 80,
                "height": 80,
                "rx": 10,
                "ry": 10,
                "stroke": '#cccccc',
                "fill": '#f5f5f5',
                "type": 'dataset'
            }));
        },

        save: function () {
            console.log(JSON.stringify(this.D3Diagram.save()))
        },

        addRect: function (rects = []) {
            let arr = [];
            this.D3Diagram.getInstance().selectAll('rect').each(r => {
                arr.push(r);
            });

            this.D3Diagram.rect(arr.concat(rects));
        },

        initToolboxHeader () {
            const _d3       = this.D3Diagram.$d3,
                _this       = this;
            let dx          = 0,
                dy          = 0,
                lastX       = this.toolboxPosition.x,
                lastY       = this.toolboxPosition.y,
                cloneNode   = null;

            _d3.select('.diagram-content-toolbox').style('transform', `translate(${lastX}px, ${lastY}px)`);

            /** toolbox拖拽 */
            _d3.select('.diagram-content-toolbox_head')
                .call(
                    _d3.drag()
                        .on('start', function () {
                            dx = _d3.event.sourceEvent.clientX;
                            dy = _d3.event.sourceEvent.clientY;
                        })
                        .on('drag', function () {
                            _d3.select('.diagram-content-toolbox').style('transform', `translate(${_d3.event.sourceEvent.clientX - dx + lastX}px, ${_d3.event.sourceEvent.clientY - dy + lastY}px)`)
                        })
                        .on('end', function () {
                            let targetStyleTransform = _d3.select('.diagram-content-toolbox').node().style.transform;
                            let reg = new RegExp(/(-?\d+)/g);
                            lastX = +targetStyleTransform.match(reg)[0];
                            lastY = +targetStyleTransform.match(reg)[1];
                        })
                );
            _d3.selectAll('.diagram-content-toolbox_elements--element')
                .each(function () {
                    _d3.select(this)
                        .on('mousedown', function () {
                            cloneNode = this.cloneNode(true);

                            // 屏蔽toolbox鼠标事件，方便拖动元素
                            _d3.select('.diagram-content-toolbox').style('pointer-events', 'none');

                            cloneNode.className += ' dragging';
                            cloneNode.style.transform = `translate(${_d3.event.x - 85}px, ${_d3.event.y - 20}px)`;
                            document.querySelector('#canvas').appendChild(cloneNode);
                        })
                });

            this.D3Diagram.setMouseMoveFunc(function () {
                if (cloneNode) {
                    _d3.select(cloneNode).style('transform', `translate(${_d3.event.x - 85}px, ${_d3.event.y - 20}px)`);
                }
            });
            this.D3Diagram.setMouseUpFuncs(function () {
                if (cloneNode) {
                    _d3.select('.diagram-content-toolbox').style('pointer-events', 'all');

                    _this.addRect([
                        {
                            "uid": Utils.uuid(),
                            "x": _this.D3Diagram.getCoords(_d3.event).x - 40,
                            "y": _this.D3Diagram.getCoords(_d3.event).y - 40,
                            "width": 80,
                            "height": 80,
                            "rx": 10,
                            "ry": 10,
                            "stroke": '#b0b0b0',
                            "fill": '#f5f5f5',
                            "type": _d3.select(cloneNode).attr('e-type'),
                            "name": _d3.select(cloneNode).attr('e-name')
                        }
                    ]);

                    _d3.select(cloneNode).remove();
                    cloneNode = null;
                }
            });
        }
    }
}
</script>
<style type="scss">
.diagram-content {
    user-select: none;

    &-canvas {
        height: 500px;
        width: calc(100% - 40px);
        margin: auto;
        overflow: hidden;
        position: relative;
    }

    svg {
        background-color: #ffffff;
        position: absolute;
        cursor: grab;
        &:focus {
            outline: none;
        }
        rect {
            transition: stroke, stroke-width .17s;
            cursor: grab;
            &:hover {
                stroke: #5abeff;
                stroke-width: 2;
            }
            &.dragging {
                cursor: grabbing;
            }
            &.focused {
                stroke: #a9c714;
                stroke-width: 2;
            }
            &.connecting-unabled {
                stroke: #ff4747;
                stroke-width: 2;
            }
        }

        circle {
            cursor: pointer;
            transition: fill .17s;
            &:hover {
                fill: #5abeff;
            }
            &.connecting {
                fill: #5abeff;
            }
        }

        path {
            cursor: pointer;
            transition: fill .17s;
            &:hover {
                fill: #5abeff;
            }
            &[data-type]:hover {
                fill: none;
            }
            &[data-type="connector"] {
                pointer-events: none;
            }
            &[data-type="connector_cover"]:hover {
                & + path {
                    stroke-dasharray: none;
                    stroke-width: 2;
                    stroke: #5abeff;
                    & + use {
                        display: block !important;
                    }
                }
            }
        }
    }

    .icon-close {
        fill: #ccc;
        cursor: pointer;
        transition: fill 0.17s;
        &:hover {
            fill: #ff4747;
        }
    }
    .icon-dataset {
        pointer-events: none;
    }
    .diagram-content-canvas {
        .diagram-content-toolbox {
            position: absolute;
            background-color: #f4f4f4;
            border-radius: 4px;
            height: 370px;
            width: 170px;
            box-shadow: 0px 2px 0 1px #e4e4e4;
            z-index: 100;
            &_head {
                height: 18px;
                width: 100%;
                background-color: #e4e4e4;
                cursor: move;
                border-radius: 4px 4px 0 0;
                box-shadow: 0px 1px 0 1px #e4e4e4;
            }
            &_elements {
                &--element {
                    height: 40px;
                    line-height: 40px;
                    display: flex;
                    &.dragging {
                        width: 170px;
                        position: absolute;
                        pointer-events: none;
                        left: 0;
                        top: 0;
                        z-index: 9999;
                        background-color: #f5f5f5;
                    }
                    .element-icon {
                        width: 40px;
                        svg {
                            height: 40px;
                            width: 40px;
                            background-color: transparent;
                            fill: #999999;
                        }
                    }
                    .element-label {
                        font-size: 12px;
                    }
                }
            }
        }

        .resize-wrapper {
            position: absolute;
            bottom: 20px;
            right: 50px;
            display: flex;
            height: 28px;
            line-height: 28px;
            text-align: center;
            border-radius: 3px;
            font-size: 12px;
            box-shadow: 0 -1px 1px 0 rgba(0,0,0,.05), 0 1px 2px 0 rgba(0,0,0,.2);
            background-color: #ffffff;
            &_increase {
                width: 28px;
                border-left: 1px solid #e2e5eb;
                cursor: pointer;
                &:hover {
                    background-color: #eeeeee;
                }
            }
            &_decrease {
                width: 28px;
                border-right: 1px solid #e2e5eb;
                cursor: pointer;
                &:hover {
                    background-color: #eeeeee;
                }
            }
            &_reset {
                width: 50px;
            }
        }
    }
}

/** animation */
.animated {
  animation-duration: 1s;
  animation-fill-mode: both;
}

@keyframes jelly {
    0% {
          -webkit-transform: matrix3d(0.2, 0, 0, 0, 0, 0.2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.2, 0, 0, 0, 0, 0.2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      3.4% {
          -webkit-transform: matrix3d(0.452, 0, 0, 0, 0, 0.526, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.452, 0, 0, 0, 0, 0.526, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      4.7% {
          -webkit-transform: matrix3d(0.56, 0, 0, 0, 0, 0.679, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.56, 0, 0, 0, 0, 0.679, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      6.81% {
          -webkit-transform: matrix3d(0.727, 0, 0, 0, 0, 0.914, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.727, 0, 0, 0, 0, 0.914, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      9.41% {
          -webkit-transform: matrix3d(0.907, 0, 0, 0, 0, 1.134, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.907, 0, 0, 0, 0, 1.134, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      10.21% {
          -webkit-transform: matrix3d(0.953, 0, 0, 0, 0, 1.181, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.953, 0, 0, 0, 0, 1.181, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      13.61% {
          -webkit-transform: matrix3d(1.098, 0, 0, 0, 0, 1.266, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.098, 0, 0, 0, 0, 1.266, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      14.11% {
          -webkit-transform: matrix3d(1.113, 0, 0, 0, 0, 1.265, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.113, 0, 0, 0, 0, 1.265, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      17.52% {
          -webkit-transform: matrix3d(1.166, 0, 0, 0, 0, 1.192, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.166, 0, 0, 0, 0, 1.192, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      18.72% {
          -webkit-transform: matrix3d(1.17, 0, 0, 0, 0, 1.15, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.17, 0, 0, 0, 0, 1.15, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      21.32% {
          -webkit-transform: matrix3d(1.157, 0, 0, 0, 0, 1.056, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.157, 0, 0, 0, 0, 1.056, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      24.32% {
          -webkit-transform: matrix3d(1.12, 0, 0, 0, 0, 0.968, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.12, 0, 0, 0, 0, 0.968, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      25.23% {
          -webkit-transform: matrix3d(1.107, 0, 0, 0, 0, 0.95, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.107, 0, 0, 0, 0, 0.95, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      29.03% {
          -webkit-transform: matrix3d(1.05, 0, 0, 0, 0, 0.917, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.05, 0, 0, 0, 0, 0.917, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      29.93% {
          -webkit-transform: matrix3d(1.038, 0, 0, 0, 0, 0.919, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.038, 0, 0, 0, 0, 0.919, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      35.54% {
          -webkit-transform: matrix3d(0.984, 0, 0, 0, 0, 0.97, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.984, 0, 0, 0, 0, 0.97, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      36.74% {
          -webkit-transform: matrix3d(0.977, 0, 0, 0, 0, 0.983, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.977, 0, 0, 0, 0, 0.983, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      41.04% {
          -webkit-transform: matrix3d(0.969, 0, 0, 0, 0, 1.018, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.969, 0, 0, 0, 0, 1.018, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      44.44% {
          -webkit-transform: matrix3d(0.973, 0, 0, 0, 0, 1.026, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.973, 0, 0, 0, 0, 1.026, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      52.15% {
          -webkit-transform: matrix3d(0.993, 0, 0, 0, 0, 1.005, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.993, 0, 0, 0, 0, 1.005, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      59.86% {
          -webkit-transform: matrix3d(1.005, 0, 0, 0, 0, 0.992, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.005, 0, 0, 0, 0, 0.992, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      63.26% {
          -webkit-transform: matrix3d(1.006, 0, 0, 0, 0, 0.994, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.006, 0, 0, 0, 0, 0.994, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      75.28% {
          -webkit-transform: matrix3d(1.001, 0, 0, 0, 0, 1.002, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.001, 0, 0, 0, 0, 1.002, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      85.49% {
          -webkit-transform: matrix3d(0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      90.69% {
          -webkit-transform: matrix3d(0.999, 0, 0, 0, 0, 0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.999, 0, 0, 0, 0, 0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      100% {
          -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
}

.jelly {
  animation-name: jelly;
}
</style>
