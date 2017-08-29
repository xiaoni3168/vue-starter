import Vue from 'vue';

import D3G from './d3G';
import D3Circle from './d3Circle';
import D3Line from './d3Line';
import D3Rect from './d3Rect';
import D3Path from './d3Path';
import D3Shape from './d3Shape';

import CloseComponent from './CloseComponent';
import D3Hook from './d3Hook';
import * as Util from '../../utils';

import { EventBus } from '../../event.bus';

export default class JoinComponent extends D3Shape {
    constructor (container, config) {
        super(container, config);
        this.container = container;
        this.config = config;

        this.container.map = this.container.map ? this.container.map : {};
        this.container.treeMap[this.config.uuid] = {
            type: 'join'
        }

        this.activatedContextUUID;

        this.g = new D3G(this.container, {
            uuid: this.config.uuid
        });
        this.gContext = this.g.draw();

        this.container.connectLine = [null];

        this.componentConfig = {
            circle: {
                r: 20
            },
            rect: {
                height: 80,
                width: 80,
                radius: 10
            },
            arrow: {
                height: 5
            }
        }
    }

    draw () {
        const _this = this;
        let gCircle = new D3G(this.gContext, {}).draw();
        let close = new CloseComponent(gCircle, {
            cx: this.config.d3Circle.cx + 30,
            cy: this.config.d3Circle.cy - 30,
            r: 10,
            fill: '#333333',
            onClick: () => {
                this.destroy();
            }
        }).draw();
        this.container
            .on('click', () => {
                if (this.activatedContextUUID) {
                    EventBus.$emit('clearPlugin');
                }
                EventBus.$emit('openSetting', false);
            });
        
        let circle = new D3Circle(gCircle, {
            $container: this.container,
            $parentUUID: this.config.uuid,
            uuid: this.config.d3Circle.uuid,
            cx: this.config.d3Circle.cx,
            cy: this.config.d3Circle.cy,
            r: this.componentConfig.circle.r,
            fill: 'none',
            strokeWidth: 1,
            model: {
                title: '联表操作',
                type: 'operation',
                sub: 'join'
            },
            hooks: [
                new D3Hook({
                    point: [this.config.d3Circle.cx, this.config.d3Circle.cy - this.componentConfig.circle.r],
                    updater: (config, uEvent) => {
                        return [uEvent.x, uEvent.y - this.componentConfig.circle.r];
                    },
                    connected: true,
                    type: 'in',
                    position: 'top'
                }),
                new D3Hook({
                    point: [this.config.d3Circle.cx, this.config.d3Circle.cy + this.componentConfig.circle.r],
                    updater: (config, uEvent) => {
                        return [uEvent.x, uEvent.y + this.componentConfig.circle.r];
                    },
                    connected: true,
                    type: 'in',
                    position: 'bottom'
                }),
                new D3Hook({
                    point: [this.config.d3Circle.cx + this.componentConfig.circle.r, this.config.d3Circle.cy],
                    updater: (config, uEvent) => {
                        return [uEvent.x + this.componentConfig.circle.r, uEvent.y];
                    },
                    connected: true,
                    type: 'out',
                    position: 'right'
                })
            ],
            onDrag: function () {
                this.repaint(window.d3.event);
                this.hooks.forEach(hook => {
                    if (hook.type == 'in') {
                        hook.connector.setOut(hook).repaint();
                    } else {
                        hook.connector.setIn(hook).repaint();
                    }
                });
            },
            onMouseDown: function () {
                EventBus.$emit('prepareMove', true);
                EventBus.$emit('movedContext', this);
            },
            onMouseUp: function () {
                EventBus.$emit('prepareMove', false);
                EventBus.$emit('movedContext', null);
            },
            onClick: function () {
                window.d3.event.stopPropagation();
                EventBus.$emit('settingElement', this);
                EventBus.$emit('openSetting', true);
                EventBus.$emit('settingStyle', {
                    transform: `translate(${window.d3.event.clientX + 20}px, ${window.d3.event.clientY - 17}px)`
                });
            }
        });
        this.container.treeMap[this.config.uuid][this.config.d3Circle.uuid] = {
            type: 'operation',
            sub: 'join'
        };
        this.container.map[this.config.d3Circle.uuid] = circle;

        circle.plugins = close;
        
        let context = [];
        this.config.d3Rect.forEach(rect => {
            let gRect = new D3G(this.gContext, {}).draw();
            let rectContext = new D3Rect(gRect, {
                $container: this.container,
                $parentUUID: this.config.uuid,
                uuid: rect.uuid,
                name: rect.uuid,
                x: rect.x,
                y: rect.y,
                rx: this.componentConfig.rect.radius,
                ry: this.componentConfig.rect.radius,
                width: this.componentConfig.rect.width,
                height: this.componentConfig.rect.height,
                strokeWidth: 1,
                fill: '#f5f5f5',
                stroke: '#cccccc',
                strokeDassarray: '5,3',
                boundary: this.container.boundary,
                model: rect.model,
                hooks: [
                    ...(a => {
                        rect.hooks.forEach(hook => {
                            a.push(new D3Hook({
                                connected: true,
                                type: hook.type,
                                position: hook.position,
                                connector: hook.connector,
                                updater: (config, uEvent) => {
                                    switch(hook.position) {
                                        case 'bottom':
                                            return [uEvent.x, uEvent.y + config.height / 2];
                                        case 'top':
                                            return [uEvent.x, uEvent.y - config.height / 2];
                                        case 'left':
                                            return [uEvent.x - config.width / 2, uEvent.y];
                                    }
                                }
                            }));
                        });
                        return a;
                    })([])
                ],
                onClick: function () {
                    window.d3.event.stopPropagation();
                    EventBus.$emit('settingElement', this);
                    EventBus.$emit('openSetting', true);
                    EventBus.$emit('settingStyle', {
                        transform: `translate(${window.d3.event.clientX + 20}px, ${window.d3.event.clientY - 17}px)`
                    });
                },
                onDrag: function () {
                    this.repaint(window.d3.event);
                    this.hooks.forEach(hook => {
                        if (hook.type == 'in') {
                            hook.connector.setOut(hook).repaint();
                        } else {
                            hook.connector.setIn(hook).repaint();
                        }
                    });
                },
                onMouseOver: function () {
                    if (rect.model.type == 'source') {
                        EventBus.$emit('dragElementTarget', this);
                    }
                },
                onMouseLeave: function () {
                    if (rect.model.type == 'source') {
                        EventBus.$emit('dragElementTarget', null);
                    }
                },
                ...(() => {
                    return rect.model.type == 'target' ?  {
                        onDragStart: function () {
                            window.d3.select(`g[uuid="${this.config.$parentUUID}"]`).raise();
                            this.context.attr('style', 'pointer-events: none;');
                            EventBus.$emit('dragElement', this);
                        },
                        onDrag: function () {
                            this.repaint(window.d3.event);
                            this.hooks.forEach(hook => {
                                if (hook.type == 'in') {
                                    hook.connector.setOut(hook).repaint();
                                } else {
                                    hook.connector.setIn(hook).repaint();
                                }
                            });
                        },
                        onDragEnd: function () {
                            this.context.attr('style', '');
                            if (_this.container.dragElementTarget) {
                                this.hooks.push(new D3Hook({
                                    $parent: this,
                                    connected: true,
                                    connector: _this.container.dragElementTarget.hooks[0].connector,
                                    point: ((poi) => {
                                        let point;
                                        this.plugins.forEach(plugin => {
                                            if (plugin.config.name == poi) {
                                                point = plugin.position;
                                            }
                                        });
                                        return point;
                                    })(_this.container.dragElementTarget.hooks[0].position),
                                    position: _this.container.dragElementTarget.hooks[0].position,
                                    type: 'out',
                                    updater: Vue.util.extend(_this.container.dragElementTarget.hooks[0].updater)
                                }));
                                
                                _this.container.treeMap[this.config.$parentUUID][this.config.uuid].nType = _this.container.dragElementTarget.config.model.type;
                                _this.container.treeMap[this.config.$parentUUID][this.config.uuid].nSub = _this.container.dragElementTarget.config.model.sub;

                                _this.container.treeMap[_this.container.dragElementTarget.config.$parentUUID][this.config.uuid] = Object.assign({}, _this.container.treeMap[this.config.$parentUUID][this.config.uuid]);
                                _this.container.treeMap[_this.container.dragElementTarget.config.$parentUUID][this.config.uuid].stream = 'in';
                                delete _this.container.treeMap[_this.container.dragElementTarget.config.$parentUUID][_this.container.dragElementTarget.config.uuid];

                                this.hooks[this.hooks.length - 1].connector.setIn(this.hooks[this.hooks.length - 1]).repaint();
                                _this.container.dragElementTarget.container.remove();
                                _this.container.dragElementTarget = null;
                            }
                        }
                    } : {};
                })()
            });

            this.container.treeMap[this.config.uuid][rect.uuid] = {
                type: rect.model.type,
                sub: rect.model.sub,
                nType: rect.model.nType,
                nSub: rect.model.nSub,
                stream: rect.model.stream
            };
            if (rect.model.stream != 'in') {
                this.container.map[rect.uuid] = rectContext;
            }

            rectContext.plugins = [
                new D3Rect(gRect, {
                    name: 'right',
                    type: 'plugin',
                    x: rect.x + this.componentConfig.rect.width - 5,
                    y: rect.y + this.componentConfig.rect.height / 2 - 5,
                    boundary: this.container.boundary,
                    width: 10,
                    height: 10,
                    fill: '#999999',
                    updater: (uEvent, config) => {
                        return [uEvent.x + this.componentConfig.rect.width / 2 - 5, uEvent.y - 5];
                    }
                }),
                new D3Rect(gRect, {
                    name: 'left',
                    type: 'plugin',
                    x: rect.x - 5,
                    y: rect.y + this.componentConfig.rect.width / 2 - 5,
                    boundary: this.container.boundary,
                    width: 10,
                    height: 10,
                    fill: '#999999',
                    style: 'z-index: 100',
                    updater: (uEvent, config) => {
                        return [uEvent.x - this.componentConfig.rect.width / 2 - 5, uEvent.y - 5];
                    }
                }),
                new D3Rect(gRect, {
                    name: 'top',
                    type: 'plugin',
                    x: rect.x + this.componentConfig.rect.width / 2 - 5,
                    boundary: this.container.boundary,
                    y: rect.y - 5,
                    width: 10,
                    height: 10,
                    fill: '#999999',
                    updater: (uEvent, config) => {
                        return [uEvent.x - 5, uEvent.y - this.componentConfig.rect.height / 2 - 5];
                    }
                }),
                new D3Rect(gRect, {
                    name: 'bottom',
                    type: 'plugin',
                    x: rect.x + this.componentConfig.rect.width / 2 - 5,
                    y: rect.y + this.componentConfig.rect.height - 5,
                    boundary: this.container.boundary,
                    width: 10,
                    height: 10,
                    fill: '#999999',
                    updater: (uEvent, config) => {
                        return [uEvent.x - 5, uEvent.y + this.componentConfig.rect.height / 2 - 5];
                    }
                })
            ];
            context.push(rectContext);
        });

        this.drawLine(context, circle, this.gContext);

        circle.draw();

        context.forEach(rect => {
            if (rect.config.model.stream != 'in') {
                rect.draw();

                rect.plugins.forEach(plugin => {
                    plugin.$parent = rect;
                    plugin.draw().style('opacity', 0);
                });
            }
        });
    }

    drawLine (shapes, core, container) {
        shapes.forEach((shape, $i) => {
            let hooks = shape.config.hooks;

            shape.config.model.stream != 'in' && hooks.forEach(hook => {
                switch (hook.position) {
                    case 'top':
                        hook.point = [shape.config.x + shape.config.width / 2, shape.config.y];break;
                    case 'bottom':
                        hook.point = [shape.config.x + shape.config.width / 2, shape.config.y + shape.config.height];break;
                    case 'left':
                        hook.point = [shape.config.x, shape.config.y + shape.config.height / 2];break;
                    case 'right':
                        hook.point = [shape.config.x + shape.config.width, shape.config.y + shape.config.height / 2];break;
                    default:
                        break;
                }

                let line;

                if (hook.connector) {
                    setTimeout(() => {
                        console.log(this.container.map['dc4fd082-2d1b-4d40-e999-36ccdce77b43'])
                        let [_key, _value] = Object.entries(hook.connector)[0];
                        let _core = this.container.map[_key];
                        line = new D3Line(container, {
                            x1: hook.type === 'out' ? hook.point[0] : _core.config.hooks[_value].point[0],
                            y1: hook.type === 'out' ? hook.point[1] : _core.config.hooks[_value].point[1],
                            x2: hook.type !== 'out' ? hook.point[0] : _core.config.hooks[_value].point[0],
                            y2: hook.type !== 'out' ? hook.point[1] : _core.config.hooks[_value].point[1],
                            stroke: '#333333',
                            strokeWidth: 1,
                            height: this.componentConfig.arrow.height
                        });

                        line.setIn(hook.type === 'out' ? hook : _core.config.hooks[_value]);
                        line.setOut(hook.type !== 'out' ? hook : _core.config.hooks[_value]);
        
                        _core.config.hooks[_value].connector = line;
    
                        hook.connector = line;
                        
                        line.draw();
                    });
                } else {
                    line = new D3Line(container, {
                        x1: hook.type === 'out' ? hook.point[0] : core.config.hooks[$i].point[0],
                        y1: hook.type === 'out' ? hook.point[1] : core.config.hooks[$i].point[1],
                        x2: hook.type !== 'out' ? hook.point[0] : core.config.hooks[$i].point[0],
                        y2: hook.type !== 'out' ? hook.point[1] : core.config.hooks[$i].point[1],
                        stroke: '#333333',
                        strokeWidth: 1,
                        height: this.componentConfig.arrow.height
                    });
                    
                    line.setIn(hook.type === 'out' ? hook : core.config.hooks[$i]);
                    line.setOut(hook.type !== 'out' ? hook : core.config.hooks[$i]);
    
                    core.config.hooks[$i].connector = line;

                    hook.connector = line;
                    
                    line.draw();
                }
            });
        });
    }

    destroy () {
        this.gContext.remove();
    }

    generateUUID () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x7|0x8)).toString(16);
        });
        return uuid;
    };
}